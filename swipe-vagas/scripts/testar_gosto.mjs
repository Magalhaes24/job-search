// Simula utilizadoras com gostos conhecidos e verifica que o modelo aprende.
// Corre com: npm run testar
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { treinar } from '../src/lib/aprender.js'

const vagas = JSON.parse(readFileSync(resolve(process.cwd(), 'src/data/vagas.json'), 'utf-8'))
const porId = Object.fromEntries(vagas.map((v) => [v.id, v]))

// geradora pseudo-aleatória com semente (resultados repetíveis)
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }

const PERFIS = {
  'PE em Portugal': (v) => (/private equity|venture/i.test(v.area) ? 1.6 : -0.6) + (v.pais === 'Portugal' ? 1.4 : -0.8),
  'banca de investimento em Londres e Paris': (v) => (/banca de investimento/i.test(v.tipoEmpresa) ? 1.5 : -0.7) + (['Reino Unido', 'França'].includes(v.pais) ? 1.2 : -1),
  'salário alto, qualquer área': (v) => ((v.salMed ?? 1500) - 2000) / 500,
}

let falhou = 0
const ganhos = []
const afirmar = (ok, msg) => { console.log((ok ? '  ok   ' : '  FALHA ') + msg); if (!ok) falhou++ }

function auc(notas, ys) {
  let b = 0, t = 0
  for (let i = 0; i < notas.length; i++) for (let j = 0; j < notas.length; j++) if (ys[i] && !ys[j]) { t++; b += notas[i] > notas[j] ? 1 : notas[i] === notas[j] ? 0.5 : 0 }
  return t ? b / t : 0.5
}

for (const [nome, afinidade] of Object.entries(PERFIS)) {
  console.log(`\nPerfil simulado: ${nome}`)
  const rand = rng(7)
  const pVerd = new Map(vagas.map((v) => [v.id, 1 / (1 + Math.exp(-(afinidade(v) - 0.3)))]))
  const verdade = new Map(vagas.map((v) => [v.id, rand() < pVerd.get(v.id)]))
  const gostosTotal = [...verdade.values()].filter(Boolean).length

  // sem dados: o modelo tem de coincidir com o ranking antigo
  const zero = treinar(vagas, { decisoes: {}, candidaturas: {} })
  const ord0 = zero.ordenar(vagas.filter((v) => v.ativa === 1)).slice(0, 3).map((v) => v.rank)
  afirmar(zero.n === 0 && ord0[0] <= 6, `sem decisões, a fila arranca pelo ranking antigo (ranks ${ord0.join(', ')})`)

  // sessão: ela decide as vagas pela ordem que o site lhe mostra
  const estado = { decisoes: {}, candidaturas: {} }
  const ativas = vagas.filter((v) => v.ativa === 1)
  const mostradas = []
  const t0 = Date.now()
  for (let i = 0; i < 80; i++) {
    const m = treinar(vagas, estado, t0 + i * 60000)
    const fila = m.ordenar(ativas.filter((v) => !estado.decisoes[v.id]))
    const v = fila[0]
    const gosta = verdade.get(v.id)
    estado.decisoes[v.id] = { id: v.id, estado: gosta ? 'like' : 'pass', star: false, ts: t0 + i * 60000 }
    mostradas.push(gosta)
  }
  // a mesma sessão com o ranking antigo, para comparar
  const antigaSessao = [...ativas].sort((x, y) => x.rank - y.rank).slice(0, 80).map((v) => verdade.get(v.id))
  const taxa = (a) => a.filter(Boolean).length / a.length
  const base = ativas.filter((v) => verdade.get(v.id)).length / ativas.length
  const inicio = taxa(mostradas.slice(0, 15)), fim = taxa(mostradas.slice(40))
  const fimAntigo = taxa(antigaSessao.slice(40))
  afirmar(fim >= fimAntigo + 0.05 || fim >= 0.7, `da 41.ª à 80.ª decisão, ${(fim * 100).toFixed(0)}% das vagas mostradas agradam (ranking antigo: ${(fimAntigo * 100).toFixed(0)}%; média da lista: ${(base * 100).toFixed(0)}%)`)

  // generaliza para vagas por ver? (80 decisões em vagas escolhidas ao acaso, para não haver enviesamento da fila)
  const m = treinar(vagas, estado, t0 + 81 * 60000)
  const sorteio = rng(3)
  const aoAcaso = { decisoes: {}, candidaturas: {} }
  ativas.map((v) => [sorteio(), v]).sort((x, y) => x[0] - y[0]).slice(0, 80).forEach(([, v], i) => {
    aoAcaso.decisoes[v.id] = { id: v.id, estado: verdade.get(v.id) ? 'like' : 'pass', ts: t0 + i * 60000 }
  })
  const ma = treinar(vagas, aoAcaso, t0 + 81 * 60000)
  const resto = vagas.filter((v) => !aoAcaso.decisoes[v.id])
  const a = auc(resto.map((v) => ma.afinidade(v.id)), resto.map((v) => verdade.get(v.id)))
  const antigo = auc(resto.map((v) => -v.rank), resto.map((v) => verdade.get(v.id)))
  const oraculo = auc(resto.map((v) => pVerd.get(v.id)), resto.map((v) => verdade.get(v.id)))
  afirmar(a > antigo + 0.05 && a > 0.58, `nas ${resto.length} vagas que nunca viu, AUC = ${a.toFixed(2)} (ranking antigo: ${antigo.toFixed(2)}; limite teórico: ${oraculo.toFixed(2)}; acaso: 0,50)`)
  afirmar(m.gosta.length > 0, `descobre o que ela gosta: ${m.gosta.slice(0, 4).map((t) => t.texto).join('; ')}`)
  afirmar(!m.validacao || m.validacao.auc > 0.5, `a validação cruzada interna dá AUC ${m.validacao ? m.validacao.auc.toFixed(2) : 'n/d'}`)

  // mudança de gosto: passa a gostar do contrário e o modelo tem de acompanhar
  const rand2 = rng(11)
  const pNovo = new Map(vagas.map((v) => [v.id, 1 / (1 + Math.exp(-(-afinidade(v) - 0.3)))]))
  const novo = new Map(vagas.map((v) => [v.id, rand2() < pNovo.get(v.id)]))
  const t1 = t0 + 100 * 86400000
  const est2 = { decisoes: { ...estado.decisoes }, candidaturas: {} }
  for (let i = 0; i < 40; i++) {
    const mm = treinar(vagas, est2, t1 + i * 60000)
    const v = mm.ordenar(ativas.filter((x) => !est2.decisoes[x.id]))[0]
    est2.decisoes[v.id] = { id: v.id, estado: novo.get(v.id) ? 'like' : 'pass', star: false, ts: t1 + i * 60000 }
  }
  const mm = treinar(vagas, est2, t1 + 41 * 60000)
  const resto2 = vagas.filter((v) => !est2.decisoes[v.id])
  const a2 = auc(resto2.map((v) => mm.afinidade(v.id)), resto2.map((v) => novo.get(v.id)))
  const velho = auc(resto2.map((v) => m.afinidade(v.id)), resto2.map((v) => novo.get(v.id)))
  const orac2 = auc(resto2.map((v) => pNovo.get(v.id)), resto2.map((v) => novo.get(v.id)))
  ganhos.push(a2 - velho)
  console.log(`  info se o gosto se inverter por completo, o AUC passa de ${velho.toFixed(2)} (modelo antigo) para ${a2.toFixed(2)} com 40 decisões novas (limite teórico ${orac2.toFixed(2)})`)
}

afirmar(ganhos.reduce((a, b) => a + b, 0) / ganhos.length > 0.05, `em média, as decisões novas corrigem o modelo antigo (+${(ganhos.reduce((a, b) => a + b, 0) / ganhos.length).toFixed(2)} de AUC)`)

console.log('\nGosto muito concentrado')
{
  // ela só gosta de vagas em Lisboa: o modelo tem de mostrar também outras, para aprender o que ela não quer
  const alvo = (v) => v.cidade === 'Lisboa'
  const est = { decisoes: {}, candidaturas: {} }
  const ativas = vagas.filter((v) => v.ativa === 1)
  const t0 = Date.now()
  let passos = 0
  for (let i = 0; i < 30; i++) {
    const m = treinar(vagas, est, t0 + i * 60000)
    const v = m.ordenar(ativas.filter((x) => !est.decisoes[x.id]))[0]
    const gosta = alvo(v)
    if (!gosta) passos++
    est.decisoes[v.id] = { id: v.id, estado: gosta ? 'like' : 'pass', ts: t0 + i * 60000 }
  }
  afirmar(passos >= 6, `em 30 decisões, viu ${passos} vagas de que não gosta (sem isso o modelo nunca aprenderia o contrário)`)
  const m = treinar(vagas, est, t0 + 31 * 60000)
  afirmar(m.pronto && m.gosta.some((t) => /Lisboa|Portugal/.test(t.texto)), `percebe o padrão: ${m.gosta.slice(0, 3).map((t) => t.texto).join('; ')}`)
}

console.log('\nCasos limite')
const so = { decisoes: { [vagas[0].id]: { id: vagas[0].id, estado: 'like', ts: Date.now() } }, candidaturas: {} }
const m1 = treinar(vagas, so)
afirmar(m1.confianca < 0.2 && !m1.pronto, 'com um único gosto não finge saber (confiança baixa, sem afinidade na interface)')
const nulos = treinar(vagas, { decisoes: { 999999: { id: 999999, estado: 'like', ts: 1 } }, candidaturas: {} })
afirmar(nulos.n === 0, 'ignora decisões de vagas que já não existem')
const desf = treinar(vagas, { decisoes: { [vagas[1].id]: { id: vagas[1].id, estado: 'none', ts: 1 } }, candidaturas: {} })
afirmar(desf.n === 0, 'decisões desfeitas não contam')

if (falhou) { console.error(`\n${falhou} verificações falharam`); process.exit(1) }
console.log('\nTudo certo')
