import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { collection, doc, getDocs, onSnapshot, setDoc, writeBatch } from 'firebase/firestore'
import { db, entrar, guardarSenha, USER_ID } from './firebase'
import vagasBase from './data/vagas.json'
import { calcStats, CONQUISTAS, mensagem } from './lib/gamify'
import { hojeISO, somarDias } from './lib/format'

const LS = `swipe-vagas:v1:${USER_ID}`
const VAZIO = { decisoes: {}, candidaturas: {}, eventos: [], conquistas: {} }

const carregarLocal = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(LS) || 'null')
    return raw ? { ...VAZIO, ...raw } : VAZIO
  } catch {
    return VAZIO
  }
}
const guardarLocal = (s) => {
  try {
    localStorage.setItem(LS, JSON.stringify(s))
  } catch {
    /* sem armazenamento local */
  }
}

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

const userCol = (nome) => collection(db, 'users', USER_ID, nome)
const userDoc = (nome, id) => doc(db, 'users', USER_ID, nome, String(id))

/** Junta duas coleções por id, ficando com o registo mais recente. */
function juntar(local, remoto) {
  const out = { ...local }
  for (const [id, r] of Object.entries(remoto)) {
    if (!out[id] || (r.ts ?? 0) >= (out[id].ts ?? 0)) out[id] = r
  }
  return out
}

export function StoreProvider({ children }) {
  const [s, setS] = useState(carregarLocal)
  const sRef = useRef(s)
  const [vagasRemotas, setVagasRemotas] = useState({})
  const [toasts, setToasts] = useState([])
  const [estado, setEstado] = useState('a ligar') // a ligar | sincronizado | offline
  const [auth, setAuth] = useState('a ligar')
  const [tentativa, setTentativa] = useState(0)
  const sequencia = useRef({ tipo: null, n: 0 })

  const commit = useCallback((fn) => {
    const next = fn(sRef.current)
    sRef.current = next
    setS(next)
    guardarLocal(next)
    return next
  }, [])

  // Vagas: base local + eventuais alterações guardadas no Firestore.
  const vagas = useMemo(
    () => vagasBase.map((v) => ({ ...v, ...(vagasRemotas[v.id] || {}) })),
    [vagasRemotas],
  )
  const vagasPorId = useMemo(() => Object.fromEntries(vagas.map((v) => [v.id, v])), [vagas])
  const vagasRef = useRef(vagasPorId)
  vagasRef.current = vagasPorId

  const stats = useMemo(() => calcStats(s, vagasPorId), [s, vagasPorId])

  const toast = useCallback((texto, tom = 'normal') => {
    if (!texto) return
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t.slice(-1), { id, texto, tom }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5200)
  }, [])

  // ---- escrita no Firestore (nunca bloqueia a interface) ----
  const escrever = useCallback((colecao, id, dados) => {
    setDoc(userDoc(colecao, id), dados, { merge: true }).catch(() => setEstado('offline'))
  }, [])

  const registarEvento = useCallback(
    (tipo, id) => {
      const ev = { tipo, id, ts: Date.now() }
      commit((st) => ({ ...st, eventos: [...st.eventos, ev] }))
      escrever('eventos', `${ev.ts}_${id}_${tipo}`, ev)
    },
    [commit, escrever],
  )

  // ---- conquistas: desbloqueia e avisa uma só vez ----
  const verificarConquistas = useCallback(
    (st) => {
      const stt = calcStats(st, vagasRef.current)
      const novas = CONQUISTAS.filter((c) => c.ok(stt) && !st.conquistas[c.id])
      if (!novas.length) return
      const ts = Date.now()
      commit((x) => ({
        ...x,
        conquistas: { ...x.conquistas, ...Object.fromEntries(novas.map((c) => [c.id, { id: c.id, ts }])) },
      }))
      novas.forEach((c) => escrever('conquistas', c.id, { id: c.id, ts }))
      toast(`Conquista: ${novas[0].titulo}`, 'conquista')
    },
    [commit, escrever, toast],
  )

  // ---- ações ----
  const decidir = useCallback(
    (id, escolha, { star = false } = {}) => {
      const antes = sRef.current.decisoes[id]
      const ts = Date.now()
      const dados = { id, estado: escolha, star: escolha === 'like' && star, ts }
      const mudou = antes && (antes.estado === 'like' || antes.estado === 'pass') && escolha !== antes.estado && escolha !== 'none'
      commit((st) => ({ ...st, decisoes: { ...st.decisoes, [id]: dados } }))
      escrever('decisoes', id, dados)
      const tipoEvento = escolha === 'none' ? 'desfez' : mudou ? 'mudou' : escolha
      registarEvento(tipoEvento, id)

      const seq = sequencia.current
      if (escolha === 'like' || escolha === 'pass') {
        sequencia.current = { tipo: escolha, n: seq.tipo === escolha ? seq.n + 1 : 1 }
      }
      const st = calcStats(sRef.current, vagasRef.current)
      const msg =
        (mudou && mensagem('mudou', st)) ||
        (dados.star && mensagem('star', st)) ||
        (escolha !== 'none' && mensagem(escolha, st, { sequencia: sequencia.current.n })) ||
        null
      if (msg) toast(msg)
      verificarConquistas(sRef.current)
    },
    [commit, escrever, registarEvento, toast, verificarConquistas],
  )

  const atualizarCandidatura = useCallback(
    (id, patch) => {
      const antes = sRef.current.candidaturas[id] || { id, estado: 'por-enviar' }
      let dados = { ...antes, ...patch, id, ts: Date.now() }
      let tipo = null
      if (patch.estado && patch.estado !== antes.estado) {
        if (patch.estado === 'enviada') {
          dados.dataEnvio = dados.dataEnvio || hojeISO()
          dados.seguimento = dados.seguimento || somarDias(dados.dataEnvio, 8)
          tipo = 'candidatou'
        } else if (patch.estado === 'entrevista') tipo = 'entrevista'
        else if (patch.estado === 'oferta') tipo = 'oferta'
      }
      if (patch.seguimentoEnviado && !antes.seguimentoEnviado) tipo = 'seguimento'
      commit((st) => ({ ...st, candidaturas: { ...st.candidaturas, [id]: dados } }))
      escrever('candidaturas', id, dados)
      if (tipo) {
        registarEvento(tipo, id)
        const v = vagasRef.current[id]
        const st = calcStats(sRef.current, vagasRef.current)
        toast(
          mensagem(tipo, st, { arriscada: v?.chance === 'Baixa', p: v?.pEfetiva ?? v?.prob }),
          tipo === 'candidatou' || tipo === 'oferta' ? 'forte' : 'normal',
        )
        const sstreak = mensagem('streak', st)
        if (sstreak) toast(sstreak)
        verificarConquistas(sRef.current)
      }
    },
    [commit, escrever, registarEvento, toast, verificarConquistas],
  )

  const desfazerUltima = useCallback(() => {
    const evs = sRef.current.eventos.filter((e) => e.tipo === 'like' || e.tipo === 'pass' || e.tipo === 'mudou')
    for (let i = evs.length - 1; i >= 0; i--) {
      const dec = sRef.current.decisoes[evs[i].id]
      if (dec && (dec.estado === 'like' || dec.estado === 'pass')) {
        decidir(evs[i].id, 'none')
        return evs[i].id
      }
    }
    return null
  }, [decidir])

  // ---- ligação ao Firestore ----
  useEffect(() => {
    let cancel = false
    const cancelar = []
    let semeado = false

    const ouvir = (nome, aplicar) => {
      const un = onSnapshot(
        userCol(nome),
        (snap) => {
          if (cancel) return
          if (!snap.metadata.fromCache) setEstado('sincronizado')
          const remoto = {}
          snap.forEach((d) => (remoto[d.id] = d.data()))
          aplicar(remoto, snap.metadata.fromCache)
        },
        () => setEstado('offline'),
      )
      cancelar.push(un)
    }

    entrar().then((r) => {
      if (cancel) return
      setAuth(r)
      ouvir('decisoes', (remoto, cache) => {
        commit((st) => ({ ...st, decisoes: juntar(st.decisoes, remoto) }))
        if (!cache) {
          // reenvia o que só existe localmente
          Object.values(sRef.current.decisoes).forEach((d) => {
            if (!remoto[d.id] || (remoto[d.id].ts ?? 0) < d.ts) escrever('decisoes', d.id, d)
          })
        }
      })
      ouvir('candidaturas', (remoto, cache) => {
        commit((st) => ({ ...st, candidaturas: juntar(st.candidaturas, remoto) }))
        if (!cache) {
          Object.values(sRef.current.candidaturas).forEach((d) => {
            if (!remoto[d.id] || (remoto[d.id].ts ?? 0) < d.ts) escrever('candidaturas', d.id, d)
          })
        }
      })
      ouvir('conquistas', (remoto) => commit((st) => ({ ...st, conquistas: { ...remoto, ...st.conquistas } })))
      ouvir('eventos', (remoto) =>
        commit((st) => {
          const ja = new Set(st.eventos.map((e) => `${e.ts}_${e.id}_${e.tipo}`))
          const novos = Object.values(remoto).filter((e) => !ja.has(`${e.ts}_${e.id}_${e.tipo}`))
          return novos.length ? { ...st, eventos: [...st.eventos, ...novos].sort((a, b) => a.ts - b.ts) } : st
        }),
      )
      // vagas guardadas no Firestore (semeia na primeira vez)
      const unV = onSnapshot(
        collection(db, 'vagas'),
        (snap) => {
          if (cancel) return
          const remoto = {}
          snap.forEach((d) => (remoto[d.id] = d.data()))
          setVagasRemotas(remoto)
          if (!snap.metadata.fromCache && snap.empty && !semeado) {
            semeado = true
            semearVagas()
          }
        },
        () => {},
      )
      cancelar.push(unV)
    })

    const t = setTimeout(() => setEstado((e) => (e === 'a ligar' ? 'offline' : e)), 8000)
    return () => {
      cancel = true
      clearTimeout(t)
      cancelar.forEach((f) => f())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tentativa])

  const entrarComSenha = useCallback((senha) => {
    guardarSenha(senha)
    setAuth('a ligar')
    setTentativa((n) => n + 1)
  }, [])

  const semearVagas = useCallback(async () => {
    try {
      for (let i = 0; i < vagasBase.length; i += 400) {
        const lote = writeBatch(db)
        vagasBase.slice(i, i + 400).forEach((v) => lote.set(doc(db, 'vagas', String(v.id)), v))
        await lote.commit()
      }
      toast('Vagas guardadas no Firestore.')
      return true
    } catch {
      toast('Não consegui escrever no Firestore. Confirma as regras e a ligação.')
      return false
    }
  }, [toast])

  // Só usado no perfil de teste: apaga tudo o que está guardado para este utilizador.
  const limparTudo = useCallback(async () => {
    try {
      for (const nome of ['decisoes', 'candidaturas', 'eventos', 'conquistas']) {
        const snap = await getDocs(userCol(nome))
        for (let i = 0; i < snap.docs.length; i += 400) {
          const lote = writeBatch(db)
          snap.docs.slice(i, i + 400).forEach((d) => lote.delete(d.ref))
          await lote.commit()
        }
      }
    } catch {
      /* sem ligação: apaga só o local */
    }
    sRef.current = VAZIO
    setS(VAZIO)
    guardarLocal(VAZIO)
    toast('Dados de teste apagados.')
  }, [toast])

  const reiniciar = useCallback(() => {
    const ts = Date.now()
    Object.keys(sRef.current.decisoes).forEach((id) => {
      const d = { id: Number(id), estado: 'none', star: false, ts }
      escrever('decisoes', id, d)
    })
    commit((st) => ({
      ...st,
      decisoes: Object.fromEntries(Object.keys(st.decisoes).map((id) => [id, { id: Number(id), estado: 'none', star: false, ts }])),
    }))
    toast('Baralho reposto. As candidaturas e o histórico mantêm-se.')
  }, [commit, escrever, toast])

  const valor = {
    s, vagas, vagasPorId, stats, toasts, estado, auth, entrarComSenha,
    decidir, atualizarCandidatura, desfazerUltima, semearVagas, reiniciar, limparTudo, toast,
    dispensarToast: (id) => setToasts((t) => t.filter((x) => x.id !== id)),
  }
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}
