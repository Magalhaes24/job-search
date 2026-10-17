import { diasAte } from './format'

export const RHO = 0.5

/** Probabilidade de pelo menos uma oferta, com correlação rho entre candidaturas. */
export function pAlgumaOferta(ps, rho = RHO) {
  if (!ps.length) return 0
  const soma = ps.reduce((a, p) => a + Math.log(1 - Math.min(p, 0.999)), 0)
  return 1 - Math.exp((1 - rho) * soma)
}

export const PESOS = [
  { chave: 'fIdioma', nome: 'Idioma', peso: 0.3, texto: 'A tua proficiência na língua-chave da vaga, pesada pela exigência.' },
  { chave: 'fExperiencia', nome: 'Experiência', peso: 0.3, texto: 'O que a vaga pede de experiência prévia face ao teu CV.' },
  { chave: 'fElegibilidade', nome: 'Elegibilidade', peso: 0.25, texto: 'Se aceita recém-licenciadas ou exige estar inscrita.' },
  { chave: 'fPerfil', nome: 'Perfil e skills', peso: 0.15, texto: 'Excel, Python e liderança face ao que a vaga pede.' },
]

export const TAXAS_BASE = [
  ['Muito alta', 0.01],
  ['Alta', 0.03],
  ['Média-alta', 0.08],
  ['Média', 0.12],
]

/** Ordena as vagas gostadas por urgência e valor esperado. */
export function recomendar(vagas) {
  return vagas
    .map((v) => {
      const dias = diasAte(v.deadline)
      const ativa = v.ativa === 1 && !(dias != null && dias < 0)
      const valor = (v.pEfetiva ?? v.prob ?? 0) * ((v.fit ?? 3) / 5)
      let urgencia = 1
      if (dias != null && dias >= 0) urgencia = dias <= 7 ? 2 : dias <= 21 ? 1.5 : 1.15
      const razoes = []
      if (dias != null && dias >= 0 && dias <= 21) razoes.push(`o prazo termina em ${dias} ${dias === 1 ? 'dia' : 'dias'}`)
      if ((v.fit ?? 0) >= 4.5) razoes.push('está no topo do teu interesse em private equity e finanças')
      if (v.chance === 'Boa') razoes.push('tem das melhores probabilidades da tua lista')
      if (v.qualidade === 'Verificada na página') razoes.push('a vaga foi verificada na página da empresa')
      if (v.lingua === 'PT') razoes.push('é em português, sem barreira de língua')
      return { v, dias, ativa, score: ativa ? valor * urgencia * (v.tipoEmpresa === 'Via de acesso' ? 0.5 : 1) : -1, razoes }
    })
    .sort((a, b) => b.score - a.score)
}

export const FAMILIAS = [
  ['Private equity e VC', /private equity|venture|\bpe\b|pe \(|pe\)/i],
  ['Banca de investimento e M&A', /ib \/|m&a|corporate finance|transações|advisory/i],
  ['Mercados e gestão de ativos', /capital markets|asset|quant|mercados|research|esg/i],
  ['Banca e risco', /banca|risco|seguros|instituição/i],
  ['Consultoria, auditoria e outras', /.*/],
]
export const familiaDe = (area) => FAMILIAS.find(([, re]) => re.test(area || ''))[0]
