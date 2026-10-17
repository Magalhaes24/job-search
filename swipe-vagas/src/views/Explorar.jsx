import { useMemo, useState } from 'react'
import Detalhe from '../components/Detalhe'
import Filtros from '../components/Filtros'
import Folha from '../components/Folha'
import Icon from '../components/Icons'
import { ChanceTag } from '../components/Pecas'
import { useStore } from '../store'
import { aplicarFiltros, FILTROS_INICIAIS, paisesDe } from '../lib/filtros'
import { fmtEuro, fmtPct } from '../lib/format'

export default function Explorar() {
  const { s, vagas, decidir } = useStore()
  const [f, setF] = useState({ ...FILTROS_INICIAIS, incluirInativas: true })
  const [fa, setFA] = useState(false)
  const [det, setDet] = useState(null)
  const [max, setMax] = useState(40)
  const lista = useMemo(() => aplicarFiltros(vagas, f), [vagas, f])

  return (
    <div className="pagina">
      <header className="topo-vista">
        <div><h1>Todas as vagas</h1><p className="sub">{lista.length} de {vagas.length}. A tabela do Excel, em versão para pesquisar e decidir.</p></div>
        <button className="icone-btn" onClick={() => setFA(true)} aria-label="Filtros"><Icon nome="filter" /></button>
      </header>
      <input className="pesquisa larga" placeholder="Pesquisar empresa, função, cidade ou área" value={f.texto} onChange={(e) => setF({ ...f, texto: e.target.value })} />

      <ul className="tabela">
        {lista.slice(0, max).map((v) => {
          const d = s.decisoes[v.id]?.estado
          return (
            <li key={v.id}>
              <button className="tab-lin" onClick={() => setDet(v)}>
                <span className="tab-nome"><b>{v.empresa}</b><span>{v.role}</span><small>{v.cidade}, {v.pais} · {v.area}</small></span>
                <span className="tab-n"><b>{fmtPct(v.pEfetiva ?? v.prob)}</b><small>{v.salMed ? fmtEuro(v.salMed) : '—'}</small></span>
              </button>
              <div className="tab-dec">
                {v.ativa !== 1 && <span className="tag cinza">Não ativa</span>}
                <ChanceTag chance={v.chance} prob={v.pEfetiva ?? v.prob} />
                <button className={`mini-b like ${d === 'like' ? 'on' : ''}`} onClick={() => decidir(v.id, d === 'like' ? 'none' : 'like')} aria-label="Gosto"><Icon nome="check" tam={15} fino={2.4} /></button>
                <button className={`mini-b pass ${d === 'pass' ? 'on' : ''}`} onClick={() => decidir(v.id, d === 'pass' ? 'none' : 'pass')} aria-label="Passo"><Icon nome="x" tam={15} fino={2.4} /></button>
              </div>
            </li>
          )
        })}
      </ul>
      {max < lista.length && <button className="btn centro-btn" onClick={() => setMax(max + 40)}>Mostrar mais ({lista.length - max})</button>}

      <Filtros aberta={fa} onFechar={() => setFA(false)} f={f} setF={setF} paises={paisesDe(vagas)} total={lista.length} onLimpar={() => setF({ ...FILTROS_INICIAIS, incluirInativas: true })} />
      <Folha aberta={!!det} onFechar={() => setDet(null)} titulo="Detalhe da vaga">{det && <Detalhe v={det} comCandidatura={s.decisoes[det.id]?.estado === 'like'} />}</Folha>
    </div>
  )
}
