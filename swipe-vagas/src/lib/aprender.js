// Aprendizagem do gosto da Chancha a partir das decisões no site.
//
// O que faz: treina, no próprio browser, uma regressão logística regularizada que
// prevê a probabilidade de ela gostar de cada vaga. As características de uma vaga
// são a área, o tipo de empresa, o país, a cidade, a empresa, a língua, a
// dificuldade, o salário bruto, o interesse e algumas palavras do título.
//
// Como aprende:
//  - cada gosto é um exemplo positivo e cada passo um negativo; prioridade (estrela)
//    e candidaturas enviadas, entrevistas e ofertas pesam mais;
//  - as decisões antigas pesam menos, porque o gosto muda (meia-vida de 45 dias);
//  - sem dados, o modelo coincide com o ranking que já existia (a priori), e vai
//    cedendo terreno aos dados à medida que há decisões;
//  - a incerteza de cada previsão serve para explorar: vagas de que o modelo sabe
//    pouco sobem um pouco na fila (limite superior de confiança), e a fila evita
//    mostrar a mesma empresa várias vezes seguidas.
// Tudo é recalculado a partir das decisões guardadas, por isso não há nada a sincronizar.

import { familiaDe } from './model'

const MEIA_VIDA_DIAS = 30
const PISO_RECENCIA = 0.12
const PESO_ESTRELA = 1.6
const EXTRA_CAND = { enviada: 1, 'em-processo': 1, entrevista: 1.5, oferta: 2 }
const TAXA_A_PRIORI = 0.35

// regularização por grupo: quanto mais alto, mais dados são precisos para mexer no peso
const LAMBDA = {
  num: 0.3, area: 1.5, areaDet: 3, tipo: 2, pais: 2, pt: 2, cidade: 4, lingua: 3,
  dif: 3, empresa: 5, pal: 4, sal: 3, fit: 3, match: 3,
}
// pesos a priori das características numéricas, para o arranque a frio
const A_PRIORI = { 'num:fit': 0.6, 'num:match': 0.4, 'num:prob': 0.2, 'num:sal': 0 }

const PARADA = new Set((
  'de da do das dos e em para a o as os na no nas nos com um uma por ao the of and in for at to intern internship estagio estagiario estagiaria ' +
  'program programa janeiro january 2027 2026 2025 off cycle off-cycle summer spring autumn jan mid'
).split(' '))

const limpar = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const tokens = (txt) =>
  limpar(txt).replace(/[^a-z0-9&+ ]/g, ' ').split(/\s+/).filter((t) => t.length >= 3 && !PARADA.has(t) && !/^\d+$/.test(t))

const balde = (x, cortes, nomes) => {
  for (let i = 0; i < cortes.length; i++) if (x < cortes[i]) return nomes[i]
  return nomes[nomes.length - 1]
}
const limitar = (x, a) => Math.max(-a, Math.min(a, x))
const sig = (z) => 1 / (1 + Math.exp(-z))

/** Palavras do título que aparecem em pelo menos 3 vagas (as outras não generalizam). */
export function construirVocabulario(vagas) {
  const df = new Map()
  for (const v of vagas) for (const t of new Set(tokens(v.role))) df.set(t, (df.get(t) || 0) + 1)
  return new Set([...df].filter(([, n]) => n >= 3).map(([t]) => t))
}

/** Características de uma vaga: mapa nome -> valor. Os nomes começam por «grupo:». */
export function extrair(v, vocab) {
  const f = {}
  f['num:fit'] = ((v.fit ?? 3) - 3) / 1.5
  f['num:match'] = ((v.match ?? 60) - 60) / 25
  f['num:prob'] = limitar(Math.log(Math.max(v.pEfetiva ?? v.prob ?? 0.04, 0.002) / 0.04), 2.5) / 1.2
  f['num:sal'] = limitar(((v.salMed ?? 1800) - 1800) / 1200, 2.5)
  f[`area:${familiaDe(v.area)}`] = 1
  if (v.area) f[`areaDet:${v.area}`] = 1
  if (v.tipoEmpresa) f[`tipo:${v.tipoEmpresa}`] = 1
  f[`pais:${v.pais}`] = 1
  f[`pt:${v.pais === 'Portugal' ? 'Portugal' : 'Estrangeiro'}`] = 1
  if (v.cidade) f[`cidade:${v.cidade}`] = 1
  if (v.lingua) f[`lingua:${v.lingua}`] = 1
  if (v.dificuldade) f[`dif:${v.dificuldade}`] = 1
  f[`empresa:${v.empresa}`] = 1
  f[`sal:${balde(v.salMed ?? 0, [1, 1300, 2000, 3000], ['sem estimativa', 'até 1300 €', '1300 a 2000 €', '2000 a 3000 €', 'mais de 3000 €'])}`] = 1
  f[`fit:${balde(v.fit ?? 3, [3.5, 4.5], ['interesse médio', 'interesse alto', 'interesse máximo'])}`] = 1
  for (const t of new Set(tokens(v.role))) if (vocab.has(t)) f[`pal:${t}`] = 1
  return f
}

const grupoDe = (nome) => nome.slice(0, nome.indexOf(':'))

/** Exemplos de treino a partir do estado guardado (decisões e candidaturas). */
export function exemplos(estado, vagasPorId, agora = Date.now()) {
  const out = []
  const validas = Object.values(estado.decisoes || {}).filter((d) => (d.estado === 'like' || d.estado === 'pass') && vagasPorId[d.id])
  // a idade conta a partir da decisão mais recente: uma pausa de semanas não apaga o que já se aprendeu
  const maisRecente = validas.reduce((m, d) => Math.max(m, d.ts || 0), 0) || agora
  for (const d of validas) {
    const idade = Math.max(0, (maisRecente - (d.ts || maisRecente)) / 86400000)
    let w = Math.max(PISO_RECENCIA, Math.pow(0.5, idade / MEIA_VIDA_DIAS))
    const y = d.estado === 'like' ? 1 : 0
    if (y && d.star) w *= PESO_ESTRELA
    const c = estado.candidaturas?.[d.id]
    if (y && c?.estado && EXTRA_CAND[c.estado]) w += EXTRA_CAND[c.estado]
    out.push({ id: d.id, y, w, star: !!d.star })
  }
  return out
}

/** Ajusta os pesos por Newton coordenada a coordenada, com L2 em torno do a priori. */
function ajustar(X, y, w, vistas) {
  const n = X.length
  const nomes = new Map()
  X.forEach((x) => Object.keys(x).forEach((k) => nomes.set(k, true)))
  for (const k of vistas) nomes.set(k, true)
  const idx = [...nomes.keys()]
  const colunas = new Map(idx.map((k) => [k, []]))
  X.forEach((x, i) => { for (const [k, val] of Object.entries(x)) colunas.get(k).push([i, val]) })

  const b0 = Math.log(TAXA_A_PRIORI / (1 - TAXA_A_PRIORI))
  const prior = (k) => (k === 'bias' ? b0 : A_PRIORI[k] ?? 0)
  const lam = (k) => (k === 'bias' ? 0.05 : LAMBDA[grupoDe(k)] ?? 3)
  const peso = new Map(idx.map((k) => [k, prior(k)]))
  let bias = b0
  const z = new Float64Array(n).fill(bias)
  for (const [k, col] of colunas) { const wk = peso.get(k); for (const [i, v] of col) z[i] += wk * v }

  for (let ronda = 0; ronda < 30; ronda++) {
    let mexeu = 0
    // viés
    let g = 0, h = 0
    for (let i = 0; i < n; i++) { const p = sig(z[i]); g += w[i] * (p - y[i]); h += w[i] * p * (1 - p) }
    g += 0.05 * (bias - b0); h += 0.05
    let passo = limitar(g / h, 1)
    bias -= passo; for (let i = 0; i < n; i++) z[i] -= passo; mexeu += Math.abs(passo)
    for (const [k, col] of colunas) {
      const L = lam(k), w0 = prior(k), wk = peso.get(k)
      g = L * (wk - w0); h = L
      for (const [i, v] of col) { const p = sig(z[i]); g += w[i] * (p - y[i]) * v; h += w[i] * p * (1 - p) * v * v }
      passo = limitar(g / h, 1)
      if (passo !== 0) { peso.set(k, wk - passo); for (const [i, v] of col) z[i] -= passo * v; mexeu += Math.abs(passo) }
    }
    if (mexeu < 1e-4) break
  }

  // precisão (diagonal da hessiana) para estimar a incerteza das previsões
  const prec = new Map()
  for (const [k, col] of colunas) {
    let h = lam(k)
    for (const [i, v] of col) { const p = sig(z[i]); h += w[i] * p * (1 - p) * v * v }
    prec.set(k, h)
  }
  return { peso, bias, prec, b0, prior, lam }
}

function prever(modelo, f) {
  let z = modelo.bias, v = 0
  for (const [k, x] of Object.entries(f)) {
    z += (modelo.peso.get(k) ?? modelo.prior(k)) * x
    v += (x * x) / (modelo.prec.get(k) ?? modelo.lam(k))
  }
  return { z, sd: Math.sqrt(v) }
}

/** AUC: probabilidade de um gosto ter nota acima de um passo. */
function auc(notas, ys) {
  let boas = 0, total = 0
  for (let i = 0; i < notas.length; i++) for (let j = 0; j < notas.length; j++) {
    if (ys[i] === 1 && ys[j] === 0) { total++; boas += notas[i] > notas[j] ? 1 : notas[i] === notas[j] ? 0.5 : 0 }
  }
  return total ? boas / total : null
}

/** Validação cruzada em 5 partes: o modelo acerta em decisões que ainda não viu? */
function validar(X, y, w, partes = 5) {
  const n = X.length
  const ordem = [...Array(n).keys()].sort((a, b) => ((a * 2654435761) >>> 0) - ((b * 2654435761) >>> 0))
  const notas = new Array(n)
  for (let p = 0; p < partes; p++) {
    const teste = new Set(ordem.filter((_, k) => k % partes === p))
    const tr = ordem.filter((i) => !teste.has(i))
    if (new Set(tr.map((i) => y[i])).size < 2) return null
    const m = ajustar(tr.map((i) => X[i]), tr.map((i) => y[i]), tr.map((i) => w[i]), [])
    for (const i of teste) notas[i] = prever(m, X[i]).z
  }
  const a = auc(notas, y)
  const certo = notas.filter((s, i) => (s > Math.log(TAXA_A_PRIORI / (1 - TAXA_A_PRIORI))) === (y[i] === 1)).length / n
  const maioria = Math.max(y.filter(Boolean).length, y.filter((v) => !v).length) / n
  return { auc: a, acerto: certo, base: maioria }
}

/** Texto curto para cada característica. */
export function rotulo(nome) {
  const [g, ...r] = nome.split(':')
  const v = r.join(':')
  switch (g) {
    case 'area': return { grupo: 'Área', texto: v }
    case 'areaDet': return { grupo: 'Função', texto: v }
    case 'tipo': return { grupo: 'Tipo de empresa', texto: v }
    case 'pais': return { grupo: 'País', texto: v }
    case 'pt': return { grupo: 'Onde', texto: v === 'Portugal' ? 'Portugal' : 'Estrangeiro' }
    case 'cidade': return { grupo: 'Cidade', texto: v }
    case 'lingua': return { grupo: 'Língua da vaga', texto: v }
    case 'dif': return { grupo: 'Dificuldade', texto: `dificuldade ${v.toLowerCase()}` }
    case 'empresa': return { grupo: 'Empresa', texto: v }
    case 'sal': return { grupo: 'Salário bruto', texto: v }
    case 'fit': return { grupo: 'Interesse', texto: v }
    case 'pal': return { grupo: 'Palavra no título', texto: v }
    default: return { grupo: g, texto: v }
  }
}

const NUM_TEXTO = {
  'num:fit': ['mais interesse em PE e finanças', 'menos interesse em PE e finanças'],
  'num:match': ['maior match com o CV', 'menor match com o CV'],
  'num:prob': ['maior probabilidade de seres aceite', 'menor probabilidade de seres aceite'],
  'num:sal': ['salário bruto mais alto', 'salário bruto mais baixo'],
}

/**
 * Treina o modelo e devolve tudo o que a interface precisa.
 * @param {object[]} vagas todas as vagas
 * @param {{decisoes:object, candidaturas:object}} estado estado guardado
 */
export function treinar(vagas, estado, agora = Date.now()) {
  const vocab = construirVocabulario(vagas)
  const vagasPorId = Object.fromEntries(vagas.map((v) => [v.id, v]))
  const feats = new Map(vagas.map((v) => [v.id, extrair(v, vocab)]))
  const ex = exemplos(estado, vagasPorId, agora)
  const n = ex.length
  const nGostos = ex.filter((e) => e.y === 1).length
  const nPassos = n - nGostos

  const X = ex.map((e) => feats.get(e.id))
  const y = ex.map((e) => e.y)
  const w = ex.map((e) => e.w)
  const modelo = ajustar(X, y, w, [...feats.values()].flatMap((f) => Object.keys(f)))

  // confiança: cresce com os dados e exige exemplos das duas classes
  const equilibrado = Math.min(nGostos, nPassos)
  const confianca = n === 0 ? 0 : (n / (n + 20)) * Math.min(1, equilibrado / 5)
  const prontoParaMostrar = n >= 8 && nGostos >= 2 && nPassos >= 2

  // pontuação por vaga
  const kappa = 1.1 * (1 - confianca) + 0.25
  const pontos = new Map()
  for (const v of vagas) {
    const { z, sd } = prever(modelo, feats.get(v.id))
    pontos.set(v.id, { p: sig(z), ucb: sig(z + kappa * sd), sd, z })
  }

  // a priori: o ranking que já existia, em percentil (1 = melhor)
  const porRank = [...vagas].sort((a, b) => a.rank - b.rank)
  const prior = new Map(porRank.map((v, i) => [v.id, 1 - i / Math.max(1, vagas.length - 1)]))

  const nota = (v) => (1 - confianca) * prior.get(v.id) + confianca * pontos.get(v.id).ucb

  /**
   * Ordena a fila: nota aprendida, variedade (sem repetir a mesma empresa em seguida) e
   * exploração. De cinco em cinco cartas aparece a vaga mais diferente do que ela já viu,
   * para o modelo também conhecer o que ela não quer e não ficar preso ao que já gostou.
   */
  function ordenar(lista) {
    const resto = [...lista].sort((a, b) => nota(b) - nota(a))
    const ps = resto.map((v) => pontos.get(v.id).p).sort((a, b) => a - b)
    const corte = ps.length ? ps[Math.floor(ps.length * 0.6)] : 1
    const out = []
    const recentes = []
    while (resto.length && out.length < 60) {
      let escolha = -1
      if (n >= 3 && (n + out.length + 1) % 5 === 0) {
        let melhorSd = -1
        for (let i = 0; i < resto.length; i++) {
          const pt = pontos.get(resto[i].id)
          if (pt.p <= corte && pt.sd > melhorSd) { melhorSd = pt.sd; escolha = i }
        }
      }
      if (escolha < 0) {
        let melhorNota = -Infinity
        const janela = Math.min(resto.length, 25)
        for (let i = 0; i < janela; i++) {
          const rep = recentes.filter((e) => e === resto[i].empresa).length
          const sc = nota(resto[i]) - 0.08 * rep
          if (sc > melhorNota) { melhorNota = sc; escolha = i }
        }
      }
      const [v] = resto.splice(escolha, 1)
      out.push(v); recentes.push(v.empresa); if (recentes.length > 3) recentes.shift()
    }
    return [...out, ...resto]
  }

  // o que aprendeu, com contagens reais
  const stats = new Map()
  ex.forEach((e, i) => {
    for (const k of Object.keys(X[i])) {
      if (k.startsWith('num:')) continue
      const s = stats.get(k) || { n: 0, gostos: 0 }
      s.n++; if (e.y) s.gostos++
      stats.set(k, s)
    }
  })
  const base = nGostos / Math.max(1, n)
  const tracos = []
  for (const [k, wk] of modelo.peso) {
    if (k.startsWith('num:')) continue
    const s = stats.get(k)
    if (!s || s.n < 3) continue
    const certeza = Math.abs(wk) * Math.sqrt(modelo.prec.get(k))
    if (certeza < 0.45 || Math.abs(wk) < 0.2) continue
    tracos.push({ nome: k, ...rotulo(k), peso: wk, certeza, n: s.n, gostos: s.gostos, taxa: s.gostos / s.n, base })
  }
  // sem repetir a mesma ideia (por exemplo «Portugal» como país e como «onde»)
  const unicos = (l) => { const vistos = new Set(); return l.filter((t) => { const k = t.texto.toLowerCase(); if (vistos.has(k)) return false; vistos.add(k); return true }) }
  const gosta = unicos(tracos.filter((t) => t.peso > 0 && t.taxa > base).sort((a, b) => b.certeza - a.certeza)).slice(0, 6)
  const evita = unicos(tracos.filter((t) => t.peso < 0 && t.taxa < base).sort((a, b) => b.certeza - a.certeza)).slice(0, 6)
  const numericos = ['num:fit', 'num:match', 'num:prob', 'num:sal']
    .map((k) => ({ k, w: modelo.peso.get(k) ?? 0, prior: A_PRIORI[k] }))
    .filter((t) => Math.abs(t.w - t.prior) > 0.25 && n >= 12)
    .map((t) => ({ nome: t.k, texto: NUM_TEXTO[t.k][t.w >= 0 ? 0 : 1], peso: t.w }))

  /** Porque é que o modelo acha que ela vai gostar (ou não) desta vaga. */
  function razoes(v, max = 2) {
    const f = feats.get(v.id)
    const contrib = Object.keys(f)
      .filter((k) => !k.startsWith('num:') && stats.get(k)?.n >= 2)
      .map((k) => ({ k, c: (modelo.peso.get(k) ?? 0) * f[k] }))
      .filter((c) => Math.abs(c.c) > 0.15)
      .sort((a, b) => Math.abs(b.c) - Math.abs(a.c))
    const pos = contrib.filter((c) => c.c > 0).slice(0, max).map((c) => rotulo(c.k).texto)
    const neg = contrib.filter((c) => c.c < 0).slice(0, 1).map((c) => rotulo(c.k).texto)
    return { pos, neg }
  }

  const validacao = n >= 20 && equilibrado >= 5 ? validar(X, y, w) : null

  return {
    n, nGostos, nPassos, confianca, pronto: prontoParaMostrar,
    afinidade: (id) => pontos.get(id)?.p ?? null,
    nota: (v) => nota(v),
    ordenar,
    razoes,
    gosta, evita, numericos,
    validacao,
    incerteza: (id) => pontos.get(id)?.sd ?? null,
    /** quantas decisões faltam para o modelo começar a mandar na fila */
    faltam: Math.max(0, 8 - n),
  }
}
