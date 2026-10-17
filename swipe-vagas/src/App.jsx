import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Icon from './components/Icons'
import { Toasts } from './components/Pecas'
import Descobrir from './views/Descobrir'
import Shortlist from './views/Shortlist'
import Historico from './views/Historico'
import Analise from './views/Analise'
import Explorar from './views/Explorar'
import Progresso from './views/Progresso'
import { useStore } from './store'
import { EM_TESTE } from './firebase'
import { useTema } from './tema'

const ABAS = [
  ['descobrir', 'Descobrir', 'cards'],
  ['gostei', 'Gostei', 'heart'],
  ['historico', 'Histórico', 'clock'],
  ['analise', 'Análise', 'chart'],
  ['explorar', 'Vagas', 'search'],
  ['progresso', 'Progresso', 'trophy'],
]

export default function App() {
  const { toasts, dispensarToast, estado, s, auth, entrarComSenha } = useStore()
  const [aba, setAba] = useState(() => { try { return localStorage.getItem('swipe-vagas:aba') || 'descobrir' } catch { return 'descobrir' } })
  useEffect(() => { try { localStorage.setItem('swipe-vagas:aba', aba) } catch { /* ok */ } }, [aba])
  const { tema, alternar } = useTema()
  const nGostos = Object.values(s.decisoes).filter((d) => d.estado === 'like').length

  const Vista = { descobrir: Descobrir, gostei: Shortlist, historico: Historico, analise: Analise, explorar: Explorar, progresso: Progresso }[aba]

  if (auth === 'precisa-senha' || auth === 'senha-errada') return <Entrada erro={auth === 'senha-errada'} entrar={entrarComSenha} />

  return (
    <div className={`app ${EM_TESTE ? 'modo-teste' : ''}`}>
      {EM_TESTE && <div className="faixa-teste">Perfil de teste: os dados da Chancha não são tocados</div>}
      <nav className="nav" aria-label="Principal">
        <div className="marca"><i><Icon nome="check" tam={16} fino={3} cor="#fff" /></i><span>Vagas</span>{EM_TESTE && <em className="selo-teste">teste</em>}</div>
        {ABAS.map(([k, nome, ic]) => (
          <button key={k} className={aba === k ? 'on' : ''} onClick={() => setAba(k)} aria-current={aba === k ? 'page' : undefined}>
            <Icon nome={ic} tam={22} preencher={false} />
            <span>{nome}</span>
            {k === 'gostei' && nGostos > 0 && <em>{nGostos}</em>}
          </button>
        ))}
        <div className={`ligacao ${estado}`} title={estado === 'sincronizado' ? 'Sincronizado com o Firestore' : estado === 'offline' ? 'Sem ligação: a guardar neste dispositivo' : 'A ligar ao Firestore'}>
          <Icon nome="cloud" tam={16} /><span>{estado === 'sincronizado' ? 'Sincronizado' : estado === 'offline' ? 'Offline' : 'A ligar'}</span>
        </div>
      </nav>
      <button className="tema-btn" onClick={alternar} aria-label={tema === 'escuro' ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'} title={tema === 'escuro' ? 'Modo claro' : 'Modo escuro'}>
        {tema === 'escuro' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
        )}
      </button>
      <main className="conteudo">
        <motion.div key={aba} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
          <Vista irPara={setAba} />
        </motion.div>
      </main>
      <Toasts toasts={toasts} fechar={dispensarToast} />
    </div>
  )
}

function Entrada({ erro, entrar }) {
  const [senha, setSenha] = useState('')
  return (
    <div className="entrada">
      <form onSubmit={(e) => { e.preventDefault(); if (senha) entrar(senha) }}>
        <h1>Vagas</h1>
        <p className="sub">Escreve a palavra-passe. Fica guardada neste dispositivo.</p>
        <input type="password" autoFocus autoComplete="current-password" placeholder="Palavra-passe" value={senha} onChange={(e) => setSenha(e.target.value)} />
        {erro && <p className="entrada-erro">Palavra-passe errada. Tenta outra vez.</p>}
        <button className="btn primario" type="submit">Entrar</button>
      </form>
    </div>
  )
}
