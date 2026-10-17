import { useMemo, useState } from 'react'
import { Segmentos, Vazio } from '../components/Pecas'
import Folha from '../components/Folha'
import Detalhe from '../components/Detalhe'
import Icon from '../components/Icons'
import { useStore } from '../store'
import { dataCurta, diaChave, horaCurta } from '../lib/format'

const NOME = { like: 'Gosto', pass: 'Passo' }

export default function Historico() {
  const { s, vagasPorId, decidir, stats } = useStore()
  const [filtro, setFiltro] = useState('todas')
  const [texto, setTexto] = useState('')
  const [det, setDet] = useState(null)

  const itens = useMemo(
    () => Object.values(s.decisoes)
      .filter((d) => d.estado === 'like' || d.estado === 'pass')
      .map((d) => ({ ...d, v: vagasPorId[d.id] }))
      .filter((d) => d.v)
      .filter((d) => (filtro === 'todas' ? true : filtro === 'prio' ? d.star : d.estado === filtro))
      .filter((d) => !texto || `${d.v.empresa} ${d.v.role}`.toLowerCase().includes(texto.toLowerCase()))
      .sort((a, b) => b.ts - a.ts),
    [s.decisoes, vagasPorId, filtro, texto],
  )
  const grupos = useMemo(() => {
    const g = []
    itens.forEach((it) => {
      const k = diaChave(it.ts)
      const ult = g[g.length - 1]
      if (ult && ult.k === k) ult.itens.push(it)
      else g.push({ k, ts: it.ts, itens: [it] })
    })
    return g
  }, [itens])

  return (
    <div className="pagina">
      <header className="topo-vista">
        <div><h1>Histórico</h1><p className="sub">{stats.decididas} decisões · {stats.mudancas} revistas. Podes mudar qualquer uma.</p></div>
      </header>
      <div className="barra-ferr">
        <Segmentos valor={filtro} onChange={setFiltro} opcoes={[['todas', 'Todas'], ['like', 'Gostei'], ['pass', 'Passei'], ['prio', 'Prioridade']]} />
        <input className="pesquisa" placeholder="Pesquisar empresa ou função" value={texto} onChange={(e) => setTexto(e.target.value)} />
      </div>

      {grupos.length === 0 && <Vazio titulo="Sem decisões para mostrar" texto="Quando decidires vagas no baralho, o registo aparece aqui." />}

      {grupos.map((g) => (
        <section key={g.k} className="grupo">
          <h4>{new Date(g.ts).toDateString() === new Date().toDateString() ? 'Hoje' : dataCurta(g.ts)}</h4>
          <ul className="hist">
            {g.itens.map(({ v, estado, star, ts }) => (
              <li key={v.id}>
                <button className="hist-info" onClick={() => setDet(v)}>
                  <span className={`pilula ${estado}`}>{estado === 'like' ? (star ? 'Prioridade' : 'Gosto') : 'Passo'}</span>
                  <span className="hist-txt"><b>{v.empresa}</b><small>{v.role} · {horaCurta(ts)}</small></span>
                </button>
                <div className="hist-acoes">
                  {estado === 'pass' ? (
                    <button className="btn pequeno" onClick={() => decidir(v.id, 'like')}><Icon nome="check" tam={14} /> Passar a gosto</button>
                  ) : (
                    <button className="btn pequeno" onClick={() => decidir(v.id, 'pass')}><Icon nome="x" tam={14} /> Passar a passo</button>
                  )}
                  <button className="btn pequeno leve" onClick={() => decidir(v.id, 'none')}>Voltar ao baralho</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Folha aberta={!!det} onFechar={() => setDet(null)} titulo="Detalhe da vaga">{det && <Detalhe v={det} comCandidatura={s.decisoes[det.id]?.estado === 'like'} />}</Folha>
    </div>
  )
}
