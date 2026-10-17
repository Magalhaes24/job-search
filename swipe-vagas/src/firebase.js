import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyClboYRMWQZQg71SdH0962ht94jxqX328o',
  authDomain: 'job-search-ce7e0.firebaseapp.com',
  projectId: 'job-search-ce7e0',
  storageBucket: 'job-search-ce7e0.firebasestorage.app',
  messagingSenderId: '198084748549',
  appId: '1:198084748549:web:7f18ef475fc2e042a7436c',
  measurementId: 'G-V5QGLDY3K7',
}

export const app = initializeApp(firebaseConfig)

// Cache local persistente: as escritas feitas sem rede ficam em fila e sincronizam depois.
let _db
try {
  _db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
} catch {
  _db = initializeFirestore(app, {})
}
export const db = _db
export const auth = getAuth(app)

isSupported()
  .then((ok) => ok && getAnalytics(app))
  .catch(() => {})

// Dois utilizadores fixos, cada um com os seus dados em users/<id>/...
//  - chancha: o utilizador real (versão publicada).
//  - teste: para desenvolver e experimentar sem tocar nos dados dela.
// As palavras-passe não estão no código. Em desenvolvimento vêm do ficheiro
// .env.local (VITE_SENHA_CHANCHA e VITE_SENHA_TESTE); na versão publicada
// escreve-se uma vez no ecrã de entrada e fica guardada neste dispositivo.
const UTILIZADORES = {
  chancha: { id: 'chancha', email: 'chancha@job-search.app', env: import.meta.env.VITE_SENHA_CHANCHA },
  teste: { id: 'teste', email: 'teste@job-search.app', env: import.meta.env.VITE_SENHA_TESTE },
}

// Em desenvolvimento (npm run dev) o padrão é o utilizador de teste; na versão
// publicada é a Chancha. O endereço aceita ?perfil=teste ou ?perfil=chancha.
const pedido = new URLSearchParams(window.location.search).get('perfil')
export const PERFIL =
  pedido === 'teste' || pedido === 'chancha' ? pedido : import.meta.env.DEV ? 'teste' : 'chancha'
export const EM_TESTE = PERFIL === 'teste'
export const USER_ID = UTILIZADORES[PERFIL].id
export const USER_EMAIL = UTILIZADORES[PERFIL].email

const CHAVE_SENHA = `swipe-vagas:senha:${PERFIL}`
function lerSenha() {
  if (UTILIZADORES[PERFIL].env) return UTILIZADORES[PERFIL].env
  try { return localStorage.getItem(CHAVE_SENHA) || '' } catch { return '' }
}
export function guardarSenha(senha) {
  try { localStorage.setItem(CHAVE_SENHA, senha) } catch { /* ok */ }
}
export function esquecerSenha() {
  try { localStorage.removeItem(CHAVE_SENHA) } catch { /* ok */ }
}

/** Entra com o utilizador do perfil. Devolve 'ok', 'precisa-senha', 'senha-errada' ou 'sem-auth' (sem rede). */
export async function entrar() {
  const senha = lerSenha()
  if (!senha) return 'precisa-senha'
  try {
    await signInWithEmailAndPassword(auth, UTILIZADORES[PERFIL].email, senha)
    return 'ok'
  } catch (e) {
    if (e?.code === 'auth/invalid-credential' || e?.code === 'auth/wrong-password' || e?.code === 'auth/user-not-found') {
      esquecerSenha()
      return 'senha-errada'
    }
    return 'sem-auth'
  }
}
