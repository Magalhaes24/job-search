import { useEffect, useState } from 'react'
import Icon from './Icons'
import { useStore } from '../store'
import { dataPT, prazoLegivel } from '../lib/format'

const ESTADOS = [
  ['enviada', 'Enviada'],
  ['entrevista', 'Entrevista'],
  ['oferta', 'Oferta'],
  ['recusada', 'Recusada'],
]

export default function Candidatura({ v, compacto = false }) {
  const { s, atualizarCandidatura, toast } = useStore()
  const c = s.candidaturas[v.id]
  const enviada = c && c.estado && c.estado !== 'por-enviar'
  const [aConfirmar, setAConfirmar] = useState(false)
  const [nota, setNota] = useState(c?.nota || '')

  useEffect(() => setNota(c?.nota || ''), [c?.nota, v.id])
  useEffect(() => {
    if (nota === (c?.nota || '')) return
    const t = setTimeout(() => atualizarCandidatura(v.id, { nota }), 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nota])

  const abrir = () => {
    window.open(v.link, '_blank', 'noopener')
    if (!enviada) setAConfirmar(true)
  }
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`python gerar.py gerar --id ${v.id}`)
      toast('Comando copiado. Corre-o na pasta gerar-candidaturas.')
    } catch {
      toast(`python gerar.py gerar --id ${v.id}`)
    }
  }

  return (
    <div className={`candidatura ${compacto ? 'compacto' : ''}`}>
      {!enviada ? (
        <>
          <div className="cand-acoes">
            <button className="btn primario" onClick={abrir}>
              <Icon nome="link" tam={16} /> Candidatar-me
            </button>
            <button className="btn" onClick={() => atualizarCandidatura(v.id, { estado: 'enviada' })}>Já enviei</button>
            <button className="btn leve" onClick={copiar} title="Gera carta, emails e ficha de entrevista desta vaga">
              <Icon nome="copy" tam={16} /> Comando dos textos
            </button>
          </div>
          {aConfirmar && (
            <div className="confirma">
              <span>Enviaste a candidatura?</span>
              <button className="btn primario pequeno" onClick={() => { atualizarCandidatura(v.id, { estado: 'enviada' }); setAConfirmar(false) }}>Sim, enviei</button>
              <button className="btn pequeno" onClick={() => setAConfirmar(false)}>Ainda não</button>
            </div>
          )}
          <p className="nota-peq">{prazoLegivel(v.deadline)}. {v.qualidade !== 'Verificada na página' ? 'Confirma no link se a vaga continua aberta.' : 'Vaga verificada na página da empresa.'}</p>
        </>
      ) : (
        <>
          <div className="segmentos pequenos">
            {ESTADOS.map(([k, n]) => (
              <button key={k} className={c.estado === k ? 'on' : ''} onClick={() => atualizarCandidatura(v.id, { estado: k })}>{n}</button>
            ))}
          </div>
          <div className="cand-linha">
            <span>Enviada a {dataPT(c.dataEnvio)}</span>
            {c.seguimentoEnviado ? (
              <span className="ok"><Icon nome="check" tam={14} /> Seguimento enviado</span>
            ) : (
              <button className="btn pequeno" onClick={() => atualizarCandidatura(v.id, { seguimentoEnviado: true })}>
                Seguimento a {dataPT(c.seguimento)} · marcar enviado
              </button>
            )}
          </div>
          <button className="btn leve" onClick={copiar}><Icon nome="copy" tam={16} /> Comando dos textos</button>
        </>
      )}
      <textarea className="nota-campo" placeholder="Notas sobre esta vaga (contactos, ideias, dúvidas)" value={nota} onChange={(e) => setNota(e.target.value)} rows={2} />
    </div>
  )
}
