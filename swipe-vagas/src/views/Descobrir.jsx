import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Deck from '../components/Deck'
import Folha from '../components/Folha'
import Detalhe from '../components/Detalhe'
import Filtros from '../components/Filtros'
import Icon from '../components/Icons'
import { Anel, Contador } from '../components/Pecas'
import Shortlist from './Shortlist'
import { useStore } from '../store'
import { META_DIARIA } from '../lib/gamify'
import { aplicarFiltros, FILTROS_INICIAIS, paisesDe } from '../lib/filtros'

const LS_F = 'swipe-vagas:filtros'
const lerFiltros = () => {
  try { return { ...FILTROS_INICIAIS, ...JSON.parse(localStorage.getItem(LS_F) || '{}') } } catch { return FILTROS_INICIAIS }
}

export default function Descobrir({ irPara }) {
  const { s, vagas, stats, decidir, desfazerUltima, toast } = useStore()
  const [f, setF] = useState(lerFiltros)
  const [filtrosAbertos, setFA] = useState(false)
  const [detalhe, setDetalhe] = useState(null)
  const ref = useRef(null)

  useEffect(() => { try { localStorage.setItem(LS_F, JSON.stringify(f)) } catch { /* ok */ } }, [f])

  const base = useMemo(() => aplicarFiltros(vagas, f), [vagas, f])
  const fila = useMemo(
    () => base.filter((v) => { const d = s.decisoes[v.id]; return !d || d.estado === 'none' }),
    [base, s.decisoes],
  )
  const decididasNoFiltro = base.length - fila.length

  const onDecidir = useCallback((v, d) => {
    if (d === 'star') decidir(v.id, 'like', { star: true })
    else decidir(v.id, d)
  }, [decidir])

  useEffect(() => {
    const k = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || detalhe || filtrosAbertos) return
      if (e.key === 'ArrowRight') ref.current?.like()
      else if (e.key === 'ArrowLeft') ref.current?.pass()
      else if (e.key === 'ArrowUp') { e.preventDefault(); ref.current?.star() }
      else if ((e.key === 'Backspace' || e.key.toLowerCase() === 'z')) desfazerUltima()
      else if ((e.key === ' ' || e.key === 'Enter') && fila[0]) { e.preventDefault(); setDetalhe(fila[0]) }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [detalhe, filtrosAbertos, fila, desfazerUltima])

  const fimAvisado = useRef(false)
  useEffect(() => {
    if (fila.length === 0 && base.length > 0 && stats.decididas > 0 && !fimAvisado.current) {
      fimAvisado.current = true
      toast('Baralho terminado. Resta o passo que ninguém dá por ti: candidatar.')
    }
    if (fila.length > 0) fimAvisado.current = false
  }, [fila.length, base.length, stats.decididas, toast])

  const ativosFiltro = Object.entries(f).filter(([k, v]) => v !== FILTROS_INICIAIS[k]).length

  return (
    <div className="descobrir">
      <header className="topo-vista">
        <div>
          <h1>Descobrir</h1>
          <p className="sub">{fila.length > 0 ? `${fila.length} por decidir${decididasNoFiltro ? ` · ${decididasNoFiltro} já decididas` : ''}` : 'Sem vagas por decidir com estes filtros'}</p>
        </div>
        <div className="topo-acoes">
          <Anel valor={Math.min(stats.decisoesHoje, META_DIARIA)} max={META_DIARIA} tam={46} grosso={5} cor="var(--tinta)" legenda="Meta de hoje">
            <span className="mini"><Contador valor={stats.decisoesHoje} /></span>
          </Anel>
          <button className="icone-btn" onClick={() => setFA(true)} aria-label="Filtros">
            <Icon nome="filter" />{ativosFiltro > 0 && <i className="ponto-n">{ativosFiltro}</i>}
          </button>
        </div>
      </header>

      {fila.length > 0 ? (
        <>
          <Deck ref={ref} fila={fila} onDecidir={onDecidir} onDetalhes={setDetalhe} />
          <div className="botoes-deck">
            <button className="rb pequeno" onClick={desfazerUltima} aria-label="Desfazer" title="Desfazer (Z)"><Icon nome="undo" tam={20} /></button>
            <button className="rb grande pass" onClick={() => ref.current?.pass()} aria-label="Passo" title="Passo (←)"><Icon nome="x" tam={30} fino={2.4} /></button>
            <button className="rb pequeno prio" onClick={() => ref.current?.star()} aria-label="Prioridade" title="Prioridade (↑)"><Icon nome="star" tam={20} /></button>
            <button className="rb grande like" onClick={() => ref.current?.like()} aria-label="Gosto" title="Gosto (→)"><Icon nome="check" tam={30} fino={2.4} /></button>
            <button className="rb pequeno" onClick={() => setDetalhe(fila[0])} aria-label="Ver tudo" title="Ver tudo (espaço)"><Icon nome="info" tam={20} /></button>
          </div>
          <p className="dica-teclas">← passo · → gosto · ↑ prioridade · Z desfaz · espaço abre os detalhes</p>
        </>
      ) : (
        <div className="fim">
          <h2>{base.length === 0 ? 'Nenhuma vaga com estes filtros' : 'Baralho terminado'}</h2>
          {base.length === 0 ? (
            <button className="btn" onClick={() => setF(FILTROS_INICIAIS)}>Limpar filtros</button>
          ) : (
            <>
              <p className="sub">{stats.likes} gostos e {stats.passes} passes. Estas são as vagas de que gostaste, com o detalhe todo e uma sugestão de por onde começar.</p>
              <Shortlist embutido irPara={irPara} />
            </>
          )}
        </div>
      )}

      <Filtros aberta={filtrosAbertos} onFechar={() => setFA(false)} f={f} setF={setF} paises={paisesDe(vagas)} total={base.length} onLimpar={() => setF(FILTROS_INICIAIS)} />
      <Folha aberta={!!detalhe} onFechar={() => setDetalhe(null)} titulo="Detalhe da vaga">
        {detalhe && (
          <>
            <Detalhe v={detalhe} comCandidatura={false} />
            <div className="det-decisao">
              <button className="btn" onClick={() => { decidir(detalhe.id, 'pass'); setDetalhe(null) }}><Icon nome="x" tam={16} /> Passo</button>
              <button className="btn primario" onClick={() => { decidir(detalhe.id, 'like'); setDetalhe(null) }}><Icon nome="check" tam={16} /> Gosto</button>
            </div>
          </>
        )}
      </Folha>
    </div>
  )
}
