import { useEffect, useRef, useState } from 'react'
import Icon from './Icons'
import { chanceCor, fmtPct } from '../lib/format'

/** Anel de progresso, no estilo dos widgets da Apple. */
export function Anel({ valor, max = 100, tam = 88, grosso = 9, cor = 'var(--tinta)', children, legenda }) {
  const r = (tam - grosso) / 2
  const c = 2 * Math.PI * r
  const f = Math.max(0, Math.min(1, valor / max))
  return (
    <div className="anel" style={{ width: tam, height: tam }} aria-label={legenda}>
      <svg width={tam} height={tam} viewBox={`0 0 ${tam} ${tam}`}>
        <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke="var(--linha)" strokeWidth={grosso} />
        <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke={cor} strokeWidth={grosso} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - f)} transform={`rotate(-90 ${tam / 2} ${tam / 2})`}
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div className="anel-centro">{children}</div>
    </div>
  )
}

export function Pontos({ valor, max = 5 }) {
  return (
    <span className="pontos" title={`${valor} em ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className={i < Math.round(valor) ? 'on' : ''} />
      ))}
    </span>
  )
}

export function ChanceTag({ chance, prob }) {
  if (!chance || chance === '—') return <span className="tag cinza">Não ativa</span>
  return (
    <span className="tag" style={{ '--c': chanceCor(chance) }}>
      <b />
      Chance {chance.toLowerCase()} · {fmtPct(prob)}
    </span>
  )
}

/** Número que sobe até ao valor. */
export function Contador({ valor, casas = 0, sufixo = '' }) {
  const [v, setV] = useState(valor)
  const ant = useRef(valor)
  useEffect(() => {
    const de = ant.current
    const para = valor
    ant.current = valor
    if (de === para) return
    const t0 = performance.now()
    let raf
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / 600)
      const e = 1 - Math.pow(1 - k, 3)
      setV(de + (para - de) * e)
      if (k < 1) raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [valor])
  return <>{v.toLocaleString('pt-PT', { maximumFractionDigits: casas, minimumFractionDigits: casas })}{sufixo}</>
}

export function Explicacao({ titulo = 'O que isto mostra', children }) {
  return (
    <div className="explica">
      <Icon nome="info" tam={16} />
      <p>
        <strong>{titulo}. </strong>
        {children}
      </p>
    </div>
  )
}

export function Seccao({ titulo, sub, children, acao }) {
  return (
    <section className="seccao">
      <header>
        <div>
          <h2>{titulo}</h2>
          {sub && <p className="sub">{sub}</p>}
        </div>
        {acao}
      </header>
      {children}
    </section>
  )
}

export function Vazio({ titulo, texto, children }) {
  return (
    <div className="vazio">
      <h3>{titulo}</h3>
      <p>{texto}</p>
      {children}
    </div>
  )
}

export function Segmentos({ opcoes, valor, onChange }) {
  return (
    <div className="segmentos" role="tablist">
      {opcoes.map(([k, nome]) => (
        <button key={k} role="tab" aria-selected={valor === k} className={valor === k ? 'on' : ''} onClick={() => onChange(k)}>
          {nome}
        </button>
      ))}
    </div>
  )
}

export function Toasts({ toasts, fechar }) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <button key={t.id} className={`toast ${t.tom}`} onClick={() => fechar(t.id)}>
          {t.tom === 'conquista' && <Icon nome="trofeu" tam={18} />}
          <span>{t.texto}</span>
        </button>
      ))}
    </div>
  )
}

/** Partículas discretas para marcos importantes. */
export function Rajada({ ativa }) {
  if (!ativa) return null
  return (
    <div className="rajada" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <i key={i} style={{ '--a': `${(360 / 16) * i}deg`, '--d': `${60 + (i % 4) * 22}px` }} />
      ))}
    </div>
  )
}
