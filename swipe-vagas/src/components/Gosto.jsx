import { Explicacao, Seccao } from './Pecas'
import { useStore } from '../store'

const Traco = ({ t, tom }) => (
  <li className={`traco ${tom}`}>
    <span className="traco-g">{t.grupo}</span>
    <b>{t.texto}</b>
    <small>{t.gostos} gostos em {t.n} vagas assim</small>
  </li>
)

/** O que o site aprendeu sobre o gosto dela, com os números por trás. */
export default function Gosto() {
  const { gosto } = useStore()
  const v = gosto.validacao

  return (
    <Seccao titulo="O que aprendi sobre o teu gosto" sub="Aprende com cada gosto, passo, prioridade e candidatura. Ainda não é um palpite: é o que as tuas decisões mostram.">
      {!gosto.pronto ? (
        <div className="gosto-vazio">
          <p>
            Ainda não tenho dados que cheguem. Preciso de pelo menos 8 decisões, com 2 gostos e 2 passos.
            Tens {gosto.n} ({gosto.nGostos} {gosto.nGostos === 1 ? 'gosto' : 'gostos'}, {gosto.nPassos} {gosto.nPassos === 1 ? 'passo' : 'passos'}).
          </p>
        </div>
      ) : (
        <>
          <div className="gosto-resumo">
            <div><b>{gosto.n}</b><small>decisões em que aprendo</small></div>
            <div><b>{Math.round(gosto.confianca * 100)}%</b><small>confiança do modelo</small></div>
            <div>
              <b>{v ? `${Math.round(v.auc * 100)}%` : 'n/d'}</b>
              <small>{v ? 'acerto a ordenar decisões que não tinha visto' : 'precisa de 20 decisões para se testar'}</small>
            </div>
          </div>

          {(gosto.gosta.length > 0 || gosto.evita.length > 0) ? (
            <div className="gosto-colunas">
              <div>
                <h4>Tens tendência a gostar de</h4>
                <ul className="tracos">{gosto.gosta.length ? gosto.gosta.map((t) => <Traco key={t.nome} t={t} tom="mais" />) : <li className="traco-vazio">Nada que se destaque ainda.</li>}</ul>
              </div>
              <div>
                <h4>Tens tendência a evitar</h4>
                <ul className="tracos">{gosto.evita.length ? gosto.evita.map((t) => <Traco key={t.nome} t={t} tom="menos" />) : <li className="traco-vazio">Nada que se destaque ainda.</li>}</ul>
              </div>
            </div>
          ) : (
            <p className="nota-peq">Ainda não há padrões claros. Com mais decisões aparecem aqui.</p>
          )}

          {gosto.numericos.length > 0 && (
            <p className="gosto-num">Em geral: {gosto.numericos.map((t) => t.texto).join('; ')}.</p>
          )}
        </>
      )}
      <Explicacao titulo="Como aprende">
        Cada gosto conta como um exemplo positivo e cada passo como um negativo. Prioridades e candidaturas enviadas pesam mais. As decisões mais antigas pesam menos, porque o gosto muda.
        O modelo compara as vagas pela área, tipo de empresa, país, cidade, empresa, salário bruto, interesse e palavras do título.
        No início segue o ranking do Excel e, à medida que aprende, passa a mandar na ordem do baralho (podes voltar ao ranking nos filtros). De vez em quando mostra uma vaga de que sabe pouco, para não ficar preso ao que já viu.
        Tudo é calculado neste dispositivo a partir das tuas decisões.
      </Explicacao>
    </Seccao>
  )
}
