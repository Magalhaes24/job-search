import { useMemo } from 'react'
import Icon from '../components/Icons'
import { Anel, Contador, Explicacao, Seccao } from '../components/Pecas'
import { useStore } from '../store'
import { EM_TESTE, USER_ID } from '../firebase'
import { CONQUISTAS, META_DIARIA, nivelDe } from '../lib/gamify'
import { diaChave, dataCurta, fmtPct } from '../lib/format'

function Calor({ eventos }) {
  const dias = useMemo(() => {
    const cont = {}
    eventos.forEach((e) => { const k = diaChave(e.ts); cont[k] = (cont[k] || 0) + 1 })
    const out = []
    const hoje = new Date()
    for (let i = 83; i >= 0; i--) {
      const d = new Date(hoje)
      d.setDate(hoje.getDate() - i)
      const k = diaChave(d)
      out.push({ k, n: cont[k] || 0, d })
    }
    return out
  }, [eventos])
  const nivel = (n) => (n === 0 ? 0 : n < 4 ? 1 : n < 10 ? 2 : n < 20 ? 3 : 4)
  return (
    <div className="calor">
      {dias.map((x) => <i key={x.k} className={`n${nivel(x.n)}`} title={`${dataCurta(x.d)}: ${x.n} ações`} />)}
    </div>
  )
}

export default function Progresso() {
  const { s, stats, estado, auth, semearVagas, reiniciar, limparTudo, vagas } = useStore()
  const nv = nivelDe(stats.xp)
  const desbloq = CONQUISTAS.filter((c) => s.conquistas[c.id])

  const exportar = () => {
    const blob = new Blob([JSON.stringify({ decisoes: s.decisoes, candidaturas: s.candidaturas, eventos: s.eventos }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'decisoes-vagas.json'
    a.click()
  }

  return (
    <div className="pagina">
      <header className="topo-vista"><div><h1>Progresso</h1><p className="sub">O que já fizeste, sem comparações com ninguém.</p></div></header>

      <div className="heroi">
        <Anel valor={nv.pct} max={1} tam={132} grosso={12} cor="var(--tinta)" legenda="Progresso no nível">
          <span className="nivel-n">{nv.nivel}</span><small>nível</small>
        </Anel>
        <div>
          <p className="etq">Pontos</p>
          <h2><Contador valor={stats.xp} /></h2>
          <p className="sub">{nv.prox ? `Faltam ${nv.prox - stats.xp} para o nível ${nv.nivel + 1}` : 'Nível máximo'}</p>
          <p className="nota-peq">1 ponto por decisão, 10 por candidatura, 3 por seguimento, 20 por entrevista e 50 por oferta.</p>
        </div>
      </div>

      <div className="kpis">
        <div><b><Contador valor={stats.decididas} /></b><small>vagas decididas</small></div>
        <div><b><Contador valor={stats.candidaturas} /></b><small>candidaturas</small></div>
        <div><b><Contador valor={stats.streak} /></b><small>{stats.streak === 1 ? 'dia seguido' : 'dias seguidos'}</small></div>
        <div><b>{stats.decisoesHoje}/{META_DIARIA}</b><small>decisões hoje</small></div>
        <div><b>{stats.candidaturas ? fmtPct(stats.pAlguma) : '—'}</b><small>hipótese de pelo menos uma oferta</small></div>
        <div><b>{stats.likes ? Math.round((stats.likes / Math.max(stats.decididas, 1)) * 100) + '%' : '—'}</b><small>vagas de que gostaste</small></div>
      </div>
      <Explicacao titulo="Como contam os números">
        A sequência de dias conta qualquer ação (decidir, candidatar, seguir). A hipótese de pelo menos uma oferta usa as candidaturas que marcaste como enviadas e a mesma fórmula da página de análise.
      </Explicacao>

      <Seccao titulo="Atividade" sub="Últimas 12 semanas">
        <Calor eventos={s.eventos} />
      </Seccao>

      <Seccao titulo={`Conquistas · ${desbloq.length}/${CONQUISTAS.length}`}>
        <ul className="conquistas">
          {CONQUISTAS.map((c) => {
            const ok = !!s.conquistas[c.id]
            return (
              <li key={c.id} className={ok ? 'ok' : ''}>
                <span className="ci"><Icon nome={ok ? c.icone : 'lock'} tam={20} /></span>
                <b>{c.titulo}</b>
                <small>{c.desc}</small>
              </li>
            )
          })}
        </ul>
      </Seccao>

      <Seccao titulo="Dados e sincronização">
        <ul className="def">
          <li><span>Estado</span><b className={`estado ${estado}`}>{estado === 'sincronizado' ? 'Sincronizado com o Firestore' : estado === 'offline' ? 'Sem ligação, a guardar neste dispositivo' : 'A ligar'}</b></li>
          <li><span>Utilizador</span><b>{USER_ID} {auth === 'ok' ? '(autenticado)' : auth === 'sem-auth' ? '(sem autenticação ativa)' : ''}</b></li>
          <li><span>Vagas na aplicação</span><b>{vagas.length}</b></li>
        </ul>
        <div className="def-acoes">
          <button className="btn" onClick={semearVagas}>Guardar vagas no Firestore</button>
          <button className="btn" onClick={exportar}>Exportar decisões</button>
          {EM_TESTE && <button className="btn leve" onClick={() => { if (window.confirm('Apagar todos os dados do perfil de teste?')) limparTudo() }}>Apagar dados de teste</button>}
          <button className="btn leve" onClick={() => { if (window.confirm('Repor o baralho? As candidaturas e o histórico mantêm-se.')) reiniciar() }}>Repor o baralho</button>
        </div>
      </Seccao>
    </div>
  )
}
