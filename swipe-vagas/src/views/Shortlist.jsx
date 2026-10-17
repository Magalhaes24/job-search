import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Detalhe from '../components/Detalhe'
import Icon from '../components/Icons'
import { ChanceTag, Contador, Segmentos, Vazio } from '../components/Pecas'
import { useStore } from '../store'
import { pAlgumaOferta, recomendar } from '../lib/model'
import { fmtPct } from '../lib/format'

export default function Shortlist({ embutido = false, irPara }) {
  const { s, vagasPorId, decidir, gosto } = useStore()
  const [aberta, setAberta0] = useState(null)
  const setAberta = (id) => {
    setAberta0(id)
    if (id) setTimeout(() => document.getElementById(`v-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }
  const [vista, setVista] = useState('todas')

  const likes = useMemo(
    () => Object.values(s.decisoes).filter((d) => d.estado === 'like').map((d) => ({ ...vagasPorId[d.id], star: d.star })).filter((v) => v.id),
    [s.decisoes, vagasPorId],
  )
  const rec = useMemo(() => {
    const r = recomendar(likes)
    if (!gosto.pronto) return r
    // a sugestão de por onde começar tem em conta o que ela costuma preferir
    return r.map((x) => ({ ...x, score: x.score > 0 ? x.score * (0.75 + 0.5 * gosto.afinidade(x.v.id)) : x.score })).sort((a, b) => b.score - a.score)
  }, [likes, gosto])
  const enviada = (id) => { const c = s.candidaturas[id]; return c && c.estado && c.estado !== 'por-enviar' }
  const porEnviar = rec.filter((r) => !enviada(r.v.id) && r.ativa)
  const topo = porEnviar[0]
  const lista = rec.filter((r) => (vista === 'todas' ? true : vista === 'por' ? !enviada(r.v.id) : enviada(r.v.id)))
  const todasP = pAlgumaOferta(porEnviar.map((r) => r.v.pEfetiva ?? r.v.prob))
  const jaEnviadas = rec.filter((r) => enviada(r.v.id))
  const pJa = pAlgumaOferta(jaEnviadas.map((r) => r.v.pEfetiva ?? r.v.prob))
  const pTodas = pAlgumaOferta(rec.filter((r) => r.ativa || enviada(r.v.id)).map((r) => r.v.pEfetiva ?? r.v.prob))

  if (!likes.length) {
    return (
      <div className={embutido ? '' : 'pagina'}>
        {!embutido && <header className="topo-vista"><div><h1>Gostei</h1></div></header>}
        <Vazio titulo="Ainda não gostaste de nenhuma vaga" texto="Faz swipe para a direita (ou carrega em →) nas vagas que queres considerar. Aparecem aqui, com o detalhe todo.">
          {irPara && <button className="btn primario" onClick={() => irPara('descobrir')}>Ir ao baralho</button>}
        </Vazio>
      </div>
    )
  }

  return (
    <div className={embutido ? 'shortlist embutido' : 'pagina shortlist'}>
      {!embutido && (
        <header className="topo-vista">
          <div><h1>Gostei</h1><p className="sub">{likes.length} vagas na tua lista · {jaEnviadas.length} candidaturas enviadas</p></div>
        </header>
      )}

      {topo && (
        <motion.div className="sugestao" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="etq">Sugestão</p>
          <h3>Candidata-te primeiro à {topo.v.empresa}</h3>
          <p className="sug-role">{topo.v.role} · {topo.v.cidade}</p>
          <p className="sug-razao">
            {topo.razoes.length
              ? `Porque ${topo.razoes.slice(0, 2).join(' e ')}.`
              : 'Combina melhor probabilidade e interesse entre as que ainda não enviaste.'}
          </p>
          <div className="sug-acoes">
            <button className="btn primario" onClick={() => setAberta(topo.v.id)}>Ver e candidatar-me</button>
            <ChanceTag chance={topo.v.chance} prob={topo.v.pEfetiva ?? topo.v.prob} />
          </div>
        </motion.div>
      )}

      <div className="resumo-p">
        <div><b><Contador valor={porEnviar.length} /></b><small>por candidatar</small></div>
        <div><b><Contador valor={jaEnviadas.length} /></b><small>enviadas</small></div>
        <div><b>{fmtPct(pTodas)}</b><small>hipótese de pelo menos uma oferta se enviares todas</small></div>
      </div>
      {jaEnviadas.length > 0 && <p className="nota-peq centro">Só com as {jaEnviadas.length} já enviadas: {fmtPct(pJa)}. Se enviares também as restantes, sobe para {fmtPct(pTodas)}.</p>}

      <Segmentos valor={vista} onChange={setVista} opcoes={[['todas', 'Todas'], ['por', 'Por candidatar'], ['env', 'Enviadas']]} />

      <ul className="lista-vagas">
        {lista.map(({ v, ativa, dias }, i) => (
          <li key={v.id} id={`v-${v.id}`} className={aberta === v.id ? 'aberta' : ''}>
            <button className="lv-cab" onClick={() => setAberta(aberta === v.id ? null : v.id)} aria-expanded={aberta === v.id}>
              <span className="lv-n">{i + 1}</span>
              <span className="lv-txt">
                <b>{v.empresa}{v.star && <Icon nome="star" tam={14} preencher cor="var(--ambar)" />}</b>
                <span>{v.role}</span>
                <small>{v.cidade} · {enviada(v.id) ? `Candidatura ${s.candidaturas[v.id].estado}` : !ativa ? 'Não ativa' : dias != null && dias >= 0 && dias <= 21 ? `Termina em ${dias} dias` : v.veredicto}</small>
              </span>
              <span className="lv-p">{fmtPct(v.pEfetiva ?? v.prob)}</span>
              <Icon nome="chevron" tam={18} />
            </button>
            <AnimatePresence initial={false}>
              {aberta === v.id && (
                <motion.div className="lv-corpo" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <Detalhe v={v} />
                  <button className="btn leve" onClick={() => decidir(v.id, 'pass')}>Afinal passo (tira da lista)</button>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </div>
  )
}
