import { useState } from 'react'

export function Rosca({ dados, tam = 180, centro }) {
  const total = dados.reduce((a, d) => a + d.valor, 0) || 1
  const r = tam / 2 - 14
  const c = 2 * Math.PI * r
  let acc = 0
  return (
    <div className="rosca">
      <svg width={tam} height={tam} viewBox={`0 0 ${tam} ${tam}`} role="img">
        <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke="var(--linha)" strokeWidth="18" />
        {dados.map((d) => {
          const f = d.valor / total
          const el = (
            <circle key={d.nome} cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke={d.cor} strokeWidth="18"
              strokeDasharray={`${Math.max(0, f * c - 2)} ${c}`} strokeDashoffset={-acc * c}
              transform={`rotate(-90 ${tam / 2} ${tam / 2})`} />
          )
          acc += f
          return el
        })}
      </svg>
      <div className="rosca-centro">{centro}</div>
      <ul className="legenda">
        {dados.map((d) => (
          <li key={d.nome}><i style={{ background: d.cor }} />{d.nome}<b>{d.valor}</b></li>
        ))}
      </ul>
    </div>
  )
}

export function BarrasH({ dados, formato = (v) => v, max, destaque }) {
  const m = max ?? Math.max(...dados.map((d) => d.valor), 1)
  return (
    <ul className="barras-h">
      {dados.map((d) => (
        <li key={d.nome} className={destaque === d.nome ? 'dest' : ''}>
          <span className="bh-nome" title={d.nome}>{d.nome}</span>
          <div className="bh-pista"><i style={{ width: `${(d.valor / m) * 100}%` }} /></div>
          <b>{formato(d.valor)}</b>
        </li>
      ))}
    </ul>
  )
}

export function Dispersao({ pontos }) {
  const [h, setH] = useState(null)
  const W = 640, H = 300, L = 44, B = 34, T = 12, R = 12
  const ymin = Math.log(0.005), ymax = Math.log(0.5)
  const X = (m) => L + (m / 100) * (W - L - R)
  const Y = (p) => T + (1 - (Math.log(Math.max(p, 0.005)) - ymin) / (ymax - ymin)) * (H - T - B)
  const cor = { Boa: 'var(--verde)', Média: 'var(--ambar)', Baixa: 'var(--cinza)' }
  return (
    <div className="dispersao">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Match contra probabilidade">
        {[0.01, 0.03, 0.1, 0.3].map((p) => (
          <g key={p}>
            <line x1={L} x2={W - R} y1={Y(p)} y2={Y(p)} stroke="var(--linha)" />
            <text x={L - 8} y={Y(p) + 4} textAnchor="end" className="eixo">{Math.round(p * 100)}%</text>
          </g>
        ))}
        {[0, 25, 50, 75, 100].map((m) => (
          <text key={m} x={X(m)} y={H - 12} textAnchor="middle" className="eixo">{m}</text>
        ))}
        <text x={W / 2} y={H} textAnchor="middle" className="eixo">Match com o CV (0 a 100)</text>
        {pontos.map((p) => (
          <circle key={p.id} cx={X(p.match)} cy={Y(p.prob)} r={h?.id === p.id ? 7 : 4.5} fill={cor[p.chance] || 'var(--cinza)'} fillOpacity=".78"
            onMouseEnter={() => setH(p)} onMouseLeave={() => setH(null)} onClick={() => setH(p)} style={{ cursor: 'pointer', transition: 'r .15s' }} />
        ))}
      </svg>
      <div className="tip">{h ? <><b>{h.empresa}</b> · {h.role}<br />Match {Math.round(h.match)} · probabilidade {(h.prob * 100).toFixed(1).replace('.', ',')}%</> : 'Passa o rato (ou toca) num ponto para ver a vaga.'}</div>
    </div>
  )
}

export function Curva({ series, marca, xmax }) {
  const W = 640, H = 260, L = 44, B = 32, T = 12, R = 16
  const X = (n) => L + (n / xmax) * (W - L - R)
  const Y = (p) => T + (1 - p) * (H - T - B)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="curva" role="img" aria-label="Probabilidade de pelo menos uma oferta">
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <g key={p}><line x1={L} x2={W - R} y1={Y(p)} y2={Y(p)} stroke="var(--linha)" /><text x={L - 8} y={Y(p) + 4} textAnchor="end" className="eixo">{Math.round(p * 100)}%</text></g>
      ))}
      {Array.from({ length: Math.floor(xmax / 5) + 1 }, (_, i) => i * 5).map((n) => (
        <text key={n} x={X(n)} y={H - 12} textAnchor="middle" className="eixo">{n}</text>
      ))}
      <text x={W / 2} y={H} textAnchor="middle" className="eixo">Número de candidaturas</text>
      {series.map((s) => (
        <path key={s.nome} d={s.pontos.map(([n, p], i) => `${i ? 'L' : 'M'}${X(n).toFixed(1)} ${Y(p).toFixed(1)}`).join(' ')}
          fill="none" stroke={s.cor} strokeWidth={s.grosso || 2} strokeDasharray={s.tracejado ? '5 5' : undefined} strokeLinecap="round" />
      ))}
      {marca && (
        <g>
          <line x1={X(marca.n)} x2={X(marca.n)} y1={T} y2={H - B} stroke="var(--tinta)" strokeDasharray="3 4" opacity=".4" />
          <circle cx={X(marca.n)} cy={Y(marca.p)} r="6" fill="var(--tinta)" />
        </g>
      )}
    </svg>
  )
}
