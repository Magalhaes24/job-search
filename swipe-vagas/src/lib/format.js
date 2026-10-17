export const hojeISO = () => new Date().toISOString().slice(0, 10)

export const fmtPct = (p, casas = 1) => {
  if (p == null || Number.isNaN(p)) return '—'
  const v = p * 100
  if (v < 0.1) return '<0,1%'
  return v.toFixed(v >= 10 ? 0 : casas).replace('.', ',') + '%'
}

export const fmtEuro = (n) => (n ? Math.round(n).toLocaleString('pt-PT') + ' €' : '—')

export const fmtNum = (n, casas = 0) =>
  n == null ? '—' : Number(n).toLocaleString('pt-PT', { maximumFractionDigits: casas, minimumFractionDigits: casas })

/** Lê uma data no formato dd-mm-aaaa no início do texto. Devolve Date ou null. */
export function lerPrazo(txt) {
  const m = /^(\d{2})-(\d{2})-(\d{4})/.exec(txt || '')
  if (!m) return null
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 23, 59, 59)
}

export function diasAte(txt) {
  const d = lerPrazo(txt)
  if (!d) return null
  return Math.ceil((d.getTime() - Date.now()) / 86400000)
}

export function prazoLegivel(txt) {
  if (!txt || /indicado/i.test(txt)) return 'Sem prazo indicado'
  const dias = diasAte(txt)
  if (dias == null) return txt
  if (dias < 0) return 'Prazo passado'
  if (dias === 0) return 'Termina hoje'
  if (dias === 1) return 'Termina amanhã'
  return `Termina em ${dias} dias`
}

export const dataCurta = (ts) =>
  new Date(ts).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })

export const horaCurta = (ts) =>
  new Date(ts).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

export const diaChave = (ts) => {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const somarDias = (iso, n) => {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export const chanceCor = (c) => (c === 'Boa' ? 'var(--verde)' : c === 'Média' ? 'var(--ambar)' : 'var(--cinza)')

export const dataPT = (iso) => (iso ? iso.split('-').reverse().join('-') : '')
