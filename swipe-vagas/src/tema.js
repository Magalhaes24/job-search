import { useCallback, useEffect, useState } from 'react'

const CHAVE = 'swipe-vagas:tema'

function lerTema() {
  try {
    return localStorage.getItem(CHAVE) === 'escuro' ? 'escuro' : 'claro'
  } catch {
    return 'claro'
  }
}

/** Claro por omissão. A escolha fica guardada neste dispositivo. */
export function useTema() {
  const [tema, setTema] = useState(lerTema)
  useEffect(() => {
    const raiz = document.documentElement
    if (tema === 'escuro') raiz.setAttribute('data-tema', 'escuro')
    else raiz.removeAttribute('data-tema')
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', tema === 'escuro' ? '#000000' : '#f5f5f8')
    try { localStorage.setItem(CHAVE, tema) } catch { /* ok */ }
  }, [tema])
  const alternar = useCallback(() => setTema((t) => (t === 'escuro' ? 'claro' : 'escuro')), [])
  return { tema, alternar }
}
