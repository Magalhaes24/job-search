import { useMemo, useState } from 'react'
import { BarrasH, Curva, Dispersao, Rosca } from '../components/Graficos'
import { Explicacao, Seccao } from '../components/Pecas'
import { useStore } from '../store'
import { PESOS, pAlgumaOferta, TAXAS_BASE } from '../lib/model'
import { fmtEuro, fmtNum, fmtPct } from '../lib/format'

const contar = (arr, f) => {
  const m = {}
  arr.forEach((x) => { const k = f(x); m[k] = (m[k] || 0) + 1 })
  return Object.entries(m).map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor)
}
const media = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)

export default function Analise() {
  const { vagas } = useStore()
  const ativas = useMemo(() => vagas.filter((v) => v.ativa === 1), [vagas])
  const [n, setN] = useState(10)
  const [rho, setRho] = useState(0.5)

  const veredictos = [
    { nome: 'Prioridade', cor: 'var(--verde)' },
    { nome: 'Candidatar (reach)', cor: 'var(--azul)' },
    { nome: 'Reserva', cor: 'var(--cinza)' },
  ].map((x) => ({ ...x, valor: ativas.filter((v) => v.veredicto === x.nome).length }))

  const porPais = contar(ativas, (v) => v.pais).slice(0, 8)
  const porTipo = contar(ativas, (v) => v.tipoEmpresa).slice(0, 8)
  const top = [...ativas].sort((a, b) => b.indice - a.indice).slice(0, 12)
  const ordenadas = useMemo(() => [...ativas].sort((a, b) => b.indice - a.indice), [ativas])
  const ps = ordenadas.map((v) => v.pEfetiva ?? v.prob)
  const curva = (r) => Array.from({ length: 41 }, (_, i) => [i, pAlgumaOferta(ps.slice(0, i), r)])
  const pN = pAlgumaOferta(ps.slice(0, n), rho)

  const porLingua = useMemo(() => {
    const m = {}
    ativas.forEach((v) => { (m[v.lingua] ||= []).push(v) })
    return Object.entries(m).map(([l, a]) => ({ l, n: a.length, m: media(a.map((v) => v.match)), p: media(a.map((v) => v.pEfetiva ?? v.prob)) })).sort((a, b) => b.n - a.n)
  }, [ativas])
  const L = (l) => porLingua.find((x) => x.l === l)
  const nomeL = { PT: 'Português', EN: 'Inglês', FR: 'Francês', DE: 'Alemão', ES: 'Espanhol', IT: 'Italiano', NL: 'Neerlandês' }

  const pt = ativas.filter((v) => v.pais === 'Portugal')
  const sal = (a) => media(a.map((v) => v.salMed).filter(Boolean))

  return (
    <div className="pagina analise">
      <header className="topo-vista"><div><h1>Análise</h1><p className="sub">As análises do Excel, aqui com explicação e para mexer. Só contam as vagas ativas.</p></div></header>

      <div className="kpis">
        <div><b>{vagas.length}</b><small>vagas no total</small></div>
        <div><b>{ativas.length}</b><small>ativas (abertas ou por confirmar)</small></div>
        <div><b>{pt.length}</b><small>em Portugal</small></div>
        <div><b>{veredictos[0].valor}</b><small>com veredicto Prioridade</small></div>
        <div><b>{fmtPct(media(ps))}</b><small>probabilidade média</small></div>
        <div><b>{fmtEuro(sal(ativas))}</b><small>salário bruto médio estimado/mês</small></div>
      </div>
      <Explicacao titulo="Como ler os números">
        As vagas «ativas» são as que estão abertas, ou ainda por confirmar. Ficam de fora as expiradas e as edições de 2027 que ainda não abriram. A probabilidade é uma estimativa feita a partir da dificuldade da vaga e do teu match com o CV.
      </Explicacao>

      <Seccao titulo="Veredicto do modelo" sub="Quantas vagas caem em cada categoria">
        <Rosca dados={veredictos} centro={<><b>{ativas.length}</b><small>ativas</small></>} />
        <Explicacao>
          Cada vaga recebe uma pontuação: 60% o interesse em PE e finanças e 40% a facilidade de entrar. Com 3,5 ou mais é «Prioridade», entre 3 e 3,4 é «Candidatar (reach)», uma aposta mais difícil que vale a pena tentar, e abaixo de 3 é «Reserva».
        </Explicacao>
      </Seccao>

      <Seccao titulo="Onde estão as vagas" sub="Por país e por tipo de empresa">
        <div className="duas-col">
          <div><h4>País</h4><BarrasH dados={porPais} destaque="Portugal" /></div>
          <div><h4>Tipo de empresa</h4><BarrasH dados={porTipo} /></div>
        </div>
        <Explicacao>
          {porPais[0]?.nome} e {porPais[1]?.nome} concentram {porPais[0]?.valor + porPais[1]?.valor} das {ativas.length} vagas ativas. A mistura de tipos de empresa (banca de investimento, Big 4, banca comercial, corporate) serve para não dependeres de um só tipo de processo de seleção.
        </Explicacao>
      </Seccao>

      <Seccao titulo="As vagas com melhor equilíbrio" sub="Índice = probabilidade × interesse (fit/5)">
        <BarrasH dados={top.map((v) => ({ nome: `${v.empresa} · ${v.cidade}`, valor: v.indice }))} formato={(x) => fmtPct(x)} />
        <Explicacao>
          Uma vaga fácil mas pouco interessante não ganha à frente de uma vaga difícil que te diz muito. O índice multiplica as duas coisas. É a ordem do ranking que ouves no baralho por omissão.
        </Explicacao>
      </Seccao>

      <Seccao titulo="Match contra probabilidade" sub="Cada ponto é uma vaga">
        <Dispersao pontos={ativas} />
        <Explicacao>
          Mais à direita significa melhor encaixe com o teu CV. Mais acima significa mais fácil de entrar. A escala vertical é logarítmica, porque as probabilidades vão de menos de 1% a mais de 30%. Os pontos verdes são as vagas de chance boa (8% ou mais), os amarelos de chance média e os cinzentos de chance baixa.
        </Explicacao>
      </Seccao>

      <Seccao titulo="Quantas candidaturas fazer" sub="Probabilidade de receberes pelo menos uma oferta">
        <div className="controlo">
          <label>Candidaturas: <b>{n}</b>
            <input type="range" min="1" max="40" value={n} onChange={(e) => setN(+e.target.value)} />
          </label>
          <label>Semelhança entre candidaturas: <b>{Math.round(rho * 100)}%</b>
            <input type="range" min="0" max="0.9" step="0.05" value={rho} onChange={(e) => setRho(+e.target.value)} />
          </label>
        </div>
        <div className="grande-num"><b>{fmtPct(pN)}</b><small>com as {n} melhores vagas do índice</small></div>
        <Curva xmax={40} marca={{ n, p: pN }} series={[
          { nome: 'Independentes', pontos: curva(0), cor: 'var(--cinza)', tracejado: true },
          { nome: 'Escolhida', pontos: curva(rho), cor: 'var(--tinta)', grosso: 2.5 },
          { nome: 'Muito parecidas', pontos: curva(0.8), cor: 'var(--azul)', tracejado: true },
        ]} />
        <Explicacao>
          Cada candidatura tem pouca hipótese, mas somam-se. Se as candidaturas fossem independentes, a curva seria a mais alta (tracejada a cinzento). Como o CV é o mesmo em todas, assumimos uma correlação de 50% por omissão: a mesma fraqueza, como não ter estágio em finanças, pesa em todas ao mesmo tempo. Mexe nos controlos para ver o efeito.
        </Explicacao>
      </Seccao>

      <Seccao titulo="A língua pesa" sub="Por língua-chave da vaga">
        <table className="tbl">
          <thead><tr><th>Língua</th><th>Vagas</th><th>Match médio</th><th>Probabilidade média</th></tr></thead>
          <tbody>
            {porLingua.map((r) => (<tr key={r.l}><td>{nomeL[r.l] || r.l}</td><td>{r.n}</td><td>{fmtNum(r.m)}</td><td>{fmtPct(r.p)}</td></tr>))}
          </tbody>
        </table>
        <Explicacao>
          O match médio é de {fmtNum(L('PT')?.m)} nas vagas em português e de {fmtNum(L('EN')?.m)} nas vagas em inglês, e cai para {fmtNum(L('FR')?.m)} em francês e {fmtNum(L('DE')?.m)} em alemão. A língua pesa 30% do match e o teu nível atual de francês e alemão é muito baixo, por isso as vagas de Paris, Frankfurt e Zurique têm probabilidades bem menores, mesmo sendo muitas.
        </Explicacao>
      </Seccao>

      <Seccao titulo="O modelo e os pressupostos" sub="O que está por trás de cada número">
        <h4>Peso de cada fator no match</h4>
        <ul className="pesos">
          {PESOS.map((p) => (
            <li key={p.chave}><span><b>{p.nome}</b> {Math.round(p.peso * 100)}%</span><div className="barra"><i style={{ width: `${p.peso * 100 * 2.5}%` }} /></div><small>{p.texto}</small></li>
          ))}
        </ul>
        <h4>Taxa base por dificuldade da vaga</h4>
        <table className="tbl">
          <thead><tr><th>Dificuldade</th><th>Taxa base</th></tr></thead>
          <tbody>{TAXAS_BASE.map(([n, t]) => <tr key={n}><td>{n}</td><td>{fmtPct(t, 0)}</td></tr>)}</tbody>
        </table>
        <Explicacao titulo="Fórmula">
          Probabilidade = taxa base × (0,4 + 1,2 × match/100), com teto de 50% e um corte forte quando a vaga não aceita recém-licenciadas. As taxas base são um pressuposto meu, porque não existem estatísticas públicas fiáveis de aceitação para estes estágios. Usa os números para comparar vagas entre si e não como previsão exata.
        </Explicacao>
      </Seccao>
    </div>
  )
}
