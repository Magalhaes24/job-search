import { diaChave, hojeISO } from './format'
import { pAlgumaOferta } from './model'

export const META_DIARIA = 10

export function calcStats(state, vagasPorId) {
  const dec = Object.values(state.decisoes).filter((d) => d.estado === 'like' || d.estado === 'pass')
  const likes = dec.filter((d) => d.estado === 'like')
  const cands = Object.values(state.candidaturas).filter((c) => c.estado && c.estado !== 'por-enviar')
  const eventos = state.eventos
  const dias = new Set(eventos.map((e) => diaChave(e.ts)))
  const hoje = hojeISO()
  const hojeLocal = diaChave(Date.now())
  const decisoesHoje = eventos.filter((e) => ['like', 'pass', 'star', 'mudou'].includes(e.tipo) && diaChave(e.ts) === hojeLocal).length

  // sequência de dias consecutivos (hoje ou ontem como último)
  let streak = 0
  const d = new Date()
  if (!dias.has(diaChave(d))) d.setDate(d.getDate() - 1)
  while (dias.has(diaChave(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }

  const v = (id) => vagasPorId[id]
  const aplicadas = cands.map((c) => v(c.id)).filter(Boolean)
  const stats = {
    decididas: dec.length,
    likes: likes.length,
    passes: dec.length - likes.length,
    estrelas: dec.filter((x) => x.star && x.estado === 'like').length,
    candidaturas: cands.length,
    seguimentos: cands.filter((c) => c.seguimentoEnviado).length,
    entrevistas: cands.filter((c) => c.estado === 'entrevista' || c.estado === 'oferta').length,
    ofertas: cands.filter((c) => c.estado === 'oferta').length,
    mudancas: eventos.filter((e) => e.tipo === 'mudou').length,
    diasAtivos: dias.size,
    streak,
    decisoesHoje,
    hoje,
    arriscadas: aplicadas.filter((x) => x.chance === 'Baixa').length,
    emPortugal: aplicadas.filter((x) => x.pais === 'Portugal').length,
    noEstrangeiro: aplicadas.filter((x) => x.pais !== 'Portugal').length,
    privateEquity: aplicadas.filter((x) => /private equity|venture/i.test(x.area)).length,
    pAlguma: pAlgumaOferta(aplicadas.map((x) => x.pEfetiva ?? x.prob ?? 0)),
  }
  stats.xp = stats.decididas + stats.estrelas + stats.candidaturas * 10 + stats.seguimentos * 3 + stats.entrevistas * 20 + stats.ofertas * 50
  return stats
}

const NIVEIS = [0, 10, 30, 60, 100, 160, 240, 340, 460, 600, 800, 1000]
export function nivelDe(xp) {
  let n = 0
  while (n + 1 < NIVEIS.length && xp >= NIVEIS[n + 1]) n++
  const base = NIVEIS[n]
  const prox = NIVEIS[n + 1] ?? null
  return { nivel: n + 1, base, prox, pct: prox ? (xp - base) / (prox - base) : 1 }
}

export const CONQUISTAS = [
  { id: 'dec1', icone: 'ponto', titulo: 'Primeira decisão', desc: 'Decidiste a primeira vaga.', ok: (s) => s.decididas >= 1 },
  { id: 'dec10', icone: 'ponto', titulo: 'Dez decididas', desc: '10 vagas avaliadas.', ok: (s) => s.decididas >= 10 },
  { id: 'dec50', icone: 'ponto', titulo: 'Cinquenta decididas', desc: '50 vagas avaliadas.', ok: (s) => s.decididas >= 50 },
  { id: 'dec100', icone: 'ponto', titulo: 'Cem decididas', desc: '100 vagas avaliadas.', ok: (s) => s.decididas >= 100 },
  { id: 'seletiva', icone: 'filtro', titulo: 'Seletiva', desc: '10 passes. Escolher também é cortar.', ok: (s) => s.passes >= 10 },
  { id: 'prioridade', icone: 'estrela', titulo: 'Prioridade clara', desc: 'Marcaste uma vaga como prioridade.', ok: (s) => s.estrelas >= 1 },
  { id: 'mudou', icone: 'volta', titulo: 'Segunda opinião', desc: 'Mudaste uma decisão anterior.', ok: (s) => s.mudancas >= 1 },
  { id: 'cand1', icone: 'envio', titulo: 'Primeira candidatura', desc: 'Enviaste a primeira candidatura.', ok: (s) => s.candidaturas >= 1 },
  { id: 'cand3', icone: 'envio', titulo: 'Três candidaturas', desc: 'Já dá para falar em estratégia.', ok: (s) => s.candidaturas >= 3 },
  { id: 'cand5', icone: 'envio', titulo: 'Cinco candidaturas', desc: 'Cinco enviadas.', ok: (s) => s.candidaturas >= 5 },
  { id: 'cand10', icone: 'envio', titulo: 'Dez candidaturas', desc: 'Dez enviadas.', ok: (s) => s.candidaturas >= 10 },
  { id: 'risco', icone: 'raio', titulo: 'Aposta alta', desc: 'Candidatura a uma vaga de probabilidade baixa.', ok: (s) => s.arriscadas >= 1 },
  { id: 'casa', icone: 'casa', titulo: 'Em casa', desc: 'Candidatura em Portugal.', ok: (s) => s.emPortugal >= 1 },
  { id: 'fora', icone: 'globo', titulo: 'Fora de casa', desc: 'Candidatura no estrangeiro.', ok: (s) => s.noEstrangeiro >= 1 },
  { id: 'pe', icone: 'grafico', titulo: 'Private equity', desc: 'Candidatura em private equity ou VC.', ok: (s) => s.privateEquity >= 1 },
  { id: 'seg', icone: 'relogio', titulo: 'Seguimento', desc: 'Enviaste um email de seguimento.', ok: (s) => s.seguimentos >= 1 },
  { id: 'streak3', icone: 'chama', titulo: 'Três dias seguidos', desc: 'Avançaste três dias seguidos.', ok: (s) => s.streak >= 3 },
  { id: 'streak7', icone: 'chama', titulo: 'Uma semana', desc: 'Sete dias seguidos.', ok: (s) => s.streak >= 7 },
  { id: 'meta', icone: 'alvo', titulo: 'Meta diária', desc: `${META_DIARIA} decisões num só dia.`, ok: (s) => s.decisoesHoje >= META_DIARIA },
  { id: 'entrevista', icone: 'voz', titulo: 'Entrevista', desc: 'Chegaste a uma entrevista.', ok: (s) => s.entrevistas >= 1 },
  { id: 'oferta', icone: 'trofeu', titulo: 'Oferta', desc: 'Recebeste uma oferta.', ok: (s) => s.ofertas >= 1 },
]

const pct = (p) => (p * 100 < 10 ? (p * 100).toFixed(1) : Math.round(p * 100)).toString().replace('.', ',')

/** Mensagem curta depois de uma ação, ou null. As frases são secas de propósito. */
export function mensagem(tipo, s, ctx = {}) {
  const n = (arr) => arr[(s.decididas + s.candidaturas) % arr.length]
  switch (tipo) {
    case 'like':
    case 'pass': {
      if (s.decididas === 1) return 'Primeira decisão tomada. As seguintes custam menos.'
      if (s.decididas === 10) return 'Dez vagas decididas. Já tens um critério, mesmo que ainda não lhe saibas o nome.'
      if (s.decididas === 25) return 'Vinte e cinco decididas. No Excel isto levava o dobro do tempo.'
      if (s.decididas === 50) return 'Cinquenta vagas avaliadas. A lista de interesse já tem forma.'
      if (s.decididas === 100) return 'Cem decisões. Comparar vagas cansa, e tu continuaste.'
      if (s.decisoesHoje === META_DIARIA) return 'Meta de hoje cumprida. O resto pode esperar por amanhã.'
      if (ctx.sequencia === 5 && tipo === 'like') return 'Cinco gostos seguidos. A lista de candidaturas também tem de caber na semana.'
      if (ctx.sequencia === 8 && tipo === 'pass') return 'Oito passes seguidos. Ser seletiva ajuda, desde que sobre alguma coisa.'
      if (tipo === 'like' && s.likes === 1) return 'Primeiro gosto. Daqui em diante cada um entra na lista de candidaturas.'
      return null
    }
    case 'star':
      return n(['Prioridade marcada. Fica no topo da tua lista.', 'Esta passa à frente das outras. Boa razão para lhe dedicares uma tarde.'])
    case 'mudou':
      return 'Mudaste de ideias. Rever uma decisão também é decidir.'
    case 'fim':
      return 'Baralho terminado. Resta o passo que ninguém dá por ti: candidatar.'
    case 'candidatou': {
      if (ctx.arriscada) return `Vaga de risco alto e candidatura enviada. A probabilidade é de ${pct(ctx.p ?? 0)}%. Se não enviares, é de zero.`
      if (s.candidaturas === 1) return 'Primeira candidatura enviada. Já estás à frente de quem continua a pensar nisso.'
      if (s.candidaturas === 3) return 'Três candidaturas. Já dá para falar em estratégia.'
      if (s.candidaturas === 5) return `Cinco candidaturas. Pelas contas do modelo, a probabilidade de pelo menos uma oferta é de ${pct(s.pAlguma)}%.`
      if (s.candidaturas === 10) return `Dez candidaturas. A probabilidade de pelo menos uma oferta é agora de ${pct(s.pAlguma)}%.`
      return n(['Candidatura registada.', 'Enviada e registada. Falta só o seguimento daqui a uns dias.'])
    }
    case 'seguimento':
      return 'Seguimento enviado. É a parte que quase todos esquecem.'
    case 'entrevista':
      return 'Entrevista. A ficha de preparação da vaga está na pasta gerar-candidaturas.'
    case 'oferta':
      return 'Oferta recebida. Lê tudo com calma antes de responder.'
    case 'streak':
      if (s.streak === 3) return 'Três dias seguidos a avançar. O ritmo conta mais do que a intensidade.'
      if (s.streak === 7) return 'Uma semana inteira sem falhar um dia.'
      return null
    default:
      return null
  }
}
