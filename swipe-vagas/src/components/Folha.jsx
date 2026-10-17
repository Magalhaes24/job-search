import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from './Icons'

/** Folha deslizante (modal), no estilo dos sheets do iOS. */
export default function Folha({ aberta, onFechar, titulo, children, largura = 640 }) {
  useEffect(() => {
    if (!aberta) return
    const f = (e) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', f)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', f)
      document.body.style.overflow = ''
    }
  }, [aberta, onFechar])

  return (
    <AnimatePresence>
      {aberta && (
        <motion.div className="folha-fundo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onFechar}>
          <motion.div
            className="folha" style={{ maxWidth: largura }} role="dialog" aria-label={titulo}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, i) => (i.offset.y > 140 || i.velocity.y > 600) && onFechar()}
            dragListener={false}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="folha-pega" />
            <button className="folha-x" onClick={onFechar} aria-label="Fechar"><Icon nome="x" tam={18} /></button>
            <div className="folha-corpo">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
