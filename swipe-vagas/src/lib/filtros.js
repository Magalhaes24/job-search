import { diasAte, lerPrazo } from './format'
import { familiaDe } from './model'

export const FILTROS_INICIAIS = {
  pais: 'todos', // 'todos' | 'Portugal' | 'Estrangeiro' | nome do país
  familia: 'todas',
  veredicto: 'todos',
  incluirInativas: false,
  ordem: 'rank',
  texto: '',
}

export const ORDENS = [
  ['rank', 'Ranking do modelo'],
  ['prob', 'Probabilidade'],
  ['match', 'Match com o CV'],
  ['fit', 'Interesse (PE e finanças)'],
  ['prazo', 'Prazo mais próximo'],
  ['salario', 'Salário bruto estimado'],
]

export function aplicarFiltros(vagas, f) {
  let out = vagas
  if (!f.incluirInativas) out = out.filter((v) => v.ativa === 1)
  if (f.pais === 'Portugal') out = out.filter((v) => v.pais === 'Portugal')
  else if (f.pais === 'Estrangeiro') out = out.filter((v) => v.pais !== 'Portugal')
  else if (f.pais !== 'todos') out = out.filter((v) => v.pais === f.pais)
  if (f.familia !== 'todas') out = out.filter((v) => familiaDe(v.area) === f.familia)
  if (f.veredicto !== 'todos') out = out.filter((v) => v.veredicto === f.veredicto)
  if (f.texto) {
    const t = f.texto.toLowerCase()
    out = out.filter((v) => `${v.empresa} ${v.role} ${v.cidade} ${v.area}`.toLowerCase().includes(t))
  }
  const cmp = {
    rank: (a, b) => a.rank - b.rank,
    prob: (a, b) => (b.pEfetiva ?? b.prob) - (a.pEfetiva ?? a.prob),
    match: (a, b) => b.match - a.match,
    fit: (a, b) => b.fit - a.fit || a.rank - b.rank,
    prazo: (a, b) => {
      const da = diasAte(a.deadline), db = diasAte(b.deadline)
      const va = da != null && da >= 0 ? da : 1e6, vb = db != null && db >= 0 ? db : 1e6
      return va - vb || a.rank - b.rank
    },
    salario: (a, b) => (b.salMed ?? 0) - (a.salMed ?? 0),
  }[f.ordem]
  return [...out].sort(cmp)
}

export const paisesDe = (vagas) =>
  [...new Set(vagas.map((v) => v.pais))].sort((a, b) => a.localeCompare(b, 'pt'))
export { lerPrazo }
