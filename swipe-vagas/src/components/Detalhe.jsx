import Icon from './Icons'
import Candidatura from './Candidatura'
import { Anel, ChanceTag, Pontos } from './Pecas'
import { PESOS, TAXAS_BASE } from '../lib/model'
import { fmtEuro, fmtPct, prazoLegivel } from '../lib/format'

const Linha = ({ k, children }) => (children ? (
  <div className="linha-det"><dt>{k}</dt><dd>{children}</dd></div>
) : null)

export default function Detalhe({ v, comCandidatura = true }) {
  const base = TAXAS_BASE.find(([n]) => n === v.dificuldade)?.[1]
  return (
    <div className="detalhe">
      <div className="det-topo">
        <div>
          <p className="cv-area">{v.area} · {v.tipoEmpresa}</p>
          <h3>{v.empresa}</h3>
          <p className="cv-role">{v.role}</p>
          <p className="cv-meta">{[v.cidade, v.pais, v.modalidade].filter(Boolean).join(' · ')}</p>
        </div>
        <ChanceTag chance={v.chance} prob={v.pEfetiva ?? v.prob} />
      </div>

      {comCandidatura && v.ativa === 1 && <Candidatura v={v} />}
      {v.ativa !== 1 && <p className="aviso">Estado da vaga: {v.estado}. Não está aberta para candidatura neste momento.</p>}

      <h4>O que vais fazer</h4>
      <p>{v.descricao}</p>

      <h4>O que pedem</h4>
      <p>{v.requisitos}</p>

      <dl className="det-grelha">
        <Linha k="Início e duração">{[v.inicio, v.duracao].filter(Boolean).join(' · ')}</Linha>
        <Linha k="Prazo">{v.deadline && !/indicado/i.test(v.deadline) ? `${v.deadline} (${prazoLegivel(v.deadline).toLowerCase()})` : 'Não indicado'}</Linha>
        <Linha k="Línguas">{v.idiomas}</Linha>
        <Linha k="Elegibilidade">{v.elegibilidade}</Linha>
        <Linha k="Salário bruto">
          {v.salarioIndicado && !/indicado/i.test(v.salarioIndicado) ? `${v.salarioIndicado}. ` : ''}
          Estimativa: {fmtEuro(v.salMin)} a {fmtEuro(v.salMax)} brutos por mês (antes de impostos e descontos). {v.fonteSalario}
        </Linha>
        <Linha k="Dificuldade">{v.dificuldade}</Linha>
        <Linha k="Interesse"><Pontos valor={v.fit} /></Linha>
        <Linha k="Estado">{v.estado}</Linha>
      </dl>

      <h4>Como se chegou à probabilidade</h4>
      <div className="match-det">
        <Anel valor={v.match} tam={92} cor="var(--tinta)"><b>{Math.round(v.match)}</b><small>match</small></Anel>
        <ul>
          {PESOS.map((p) => (
            <li key={p.chave} title={p.texto}>
              <span>{p.nome} <em>{Math.round(p.peso * 100)}%</em></span>
              <div className="barra"><i style={{ width: `${(v[p.chave] ?? 0) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      </div>
      <p className="nota-peq">
        Taxa base da dificuldade «{v.dificuldade}»: {fmtPct(base)}. Ajustada pelo match ({Math.round(v.match)}/100) dá {fmtPct(v.prob)}.
        É uma estimativa para comparar vagas, não uma estatística oficial.
      </p>

      {v.porque && (<><h4>Porque encaixa (ou não) no teu CV</h4><p>{v.porque}</p></>)}
      {v.notas && (<><h4>Atenção</h4><p>{v.notas}</p></>)}

      <div className="det-rodape">
        <a className="btn" href={v.link} target="_blank" rel="noopener noreferrer"><Icon nome="link" tam={16} /> Abrir a vaga</a>
        <span className="nota-peq">{v.tipoLink}. Informação: {v.qualidade.toLowerCase()}.</span>
      </div>
    </div>
  )
}
