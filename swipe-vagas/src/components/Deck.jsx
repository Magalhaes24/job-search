import { forwardRef, useImperativeHandle } from 'react'
import { animate, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'
import VagaCard from './VagaCard'

const LIMIAR = 110

const Carta = forwardRef(function Carta({ v, onDecidir, onDetalhes }, ref) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rodar = useTransform(x, [-300, 0, 300], [-14, 0, 14])
  const gosto = useTransform(x, [20, LIMIAR], [0, 1])
  const passo = useTransform(x, [-LIMIAR, -20], [1, 0])
  const prio = useTransform(y, [-LIMIAR, -20], [1, 0])
  const controls = useAnimation()

  const sair = async (dir) => {
    const alvo = dir === 'like' ? { x: 700, y: 40 } : dir === 'pass' ? { x: -700, y: 40 } : { x: 0, y: -800 }
    await controls.start({ ...alvo, opacity: 0, transition: { duration: 0.28, ease: [0.4, 0, 0.8, 0.4] } })
    onDecidir(dir)
  }
  useImperativeHandle(ref, () => ({
    like: () => sair('like'),
    pass: () => sair('pass'),
    star: () => sair('star'),
  }))

  return (
    <motion.div
      className="deck-carta topo"
      style={{ x, y, rotate: rodar }}
      animate={controls}
      drag
      dragSnapToOrigin
      dragElastic={0.9}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={(_, i) => {
        if (i.offset.y < -LIMIAR && Math.abs(i.offset.x) < 120) return sair('star')
        if (i.offset.x > LIMIAR || i.velocity.x > 700) return sair('like')
        if (i.offset.x < -LIMIAR || i.velocity.x < -700) return sair('pass')
        animate(x, 0, { type: 'spring', stiffness: 500, damping: 35 })
        animate(y, 0, { type: 'spring', stiffness: 500, damping: 35 })
      }}
      onTap={onDetalhes}
      initial={{ scale: 0.96, y: 14, opacity: 0.9 }}
    >
      <VagaCard v={v} />
      <motion.div className="selo like" style={{ opacity: gosto }}>Gosto</motion.div>
      <motion.div className="selo pass" style={{ opacity: passo }}>Passo</motion.div>
      <motion.div className="selo prio" style={{ opacity: prio }}>Prioridade</motion.div>
    </motion.div>
  )
})

export default forwardRef(function Deck({ fila, onDecidir, onDetalhes }, ref) {
  const [a, b, c] = fila
  return (
    <div className="deck">
      {c && <div className="deck-carta fundo f3"><VagaCard v={c} /></div>}
      {b && <div className="deck-carta fundo f2"><VagaCard v={b} /></div>}
      {a && <Carta key={a.id} ref={ref} v={a} onDecidir={(d) => onDecidir(a, d)} onDetalhes={() => onDetalhes(a)} />}
    </div>
  )
})
