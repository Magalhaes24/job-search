import { Anel, ChanceTag, Pontos } from './Pecas'
import { useStore } from '../store'
import { fmtEuro, fmtPct, prazoLegivel } from '../lib/format'

const abrev = (m) => (m || '').replace(/\s*\(.*\)/, '').replace('Não indicado', 'Modalidade a confirmar')

export default function VagaCard({ v }) {
  const prazo = prazoLegivel(v.deadline)
  const { gosto } = useStore()
  const afin = gosto.pronto ? gosto.afinidade(v.id) : null
  const razoes = afin != null ? gosto.razoes(v) : null
  return (
    <div className="carta-vaga">
      <div className="cv-topo">
        <span className="cv-area">{v.area}</span>
        <ChanceTag chance={v.chance} prob={v.pEfetiva ?? v.prob} />
      </div>
      <h3 className="cv-empresa">{v.empresa}</h3>
      <p className="cv-role">{v.role}</p>
      <p className="cv-meta">
        {[v.cidade, v.pais !== 'Portugal' ? v.pais : null, abrev(v.modalidade), /indicado/i.test(v.inicio) ? null : v.inicio].filter(Boolean).join(' · ')}
      </p>

      <div className="cv-numeros">
        <div>
          <Anel valor={v.match} tam={74} grosso={8} cor={v.match >= 70 ? 'var(--verde)' : v.match >= 50 ? 'var(--ambar)' : 'var(--cinza)'} legenda="Match com o CV">
            <b>{Math.round(v.match)}</b>
          </Anel>
          <small>Match com o CV</small>
        </div>
        <div className="cv-grande">
          <b>{fmtPct(v.pEfetiva ?? v.prob)}</b>
          <small>Probabilidade de seres aceite</small>
        </div>
      </div>

      <p className="cv-resumo">{v.resumo}</p>
      {afin != null && (
        <p className="cv-afin" title="Estimativa feita a partir das tuas decisões anteriores">
          <span className="afin-barra"><i style={{ width: `${Math.round(afin * 100)}%` }} /></span>
          <b>Afinidade {Math.round(afin * 100)}%</b>
          {razoes.pos.length > 0 && <span>{razoes.pos.join(', ')}</span>}
        </p>
      )}
      {v.porque && afin == null && <p className="cv-porque">{v.porque}</p>}

      <dl className="cv-grelha">
        <div><dt>Salário bruto</dt><dd>{v.salMed ? `~${fmtEuro(v.salMed)}/mês` : '—'}</dd></div>
        <div><dt>Prazo</dt><dd>{prazo}</dd></div>
        <div><dt>Dificuldade</dt><dd>{v.dificuldade}</dd></div>
        <div><dt>Interesse</dt><dd><Pontos valor={v.fit} /></dd></div>
      </dl>
    </div>
  )
}
