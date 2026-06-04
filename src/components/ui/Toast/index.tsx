import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import s from './styles.module.scss'

export default function Toast() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const handler = (e: Event) => {
      setMessage((e as CustomEvent).detail)
      setVisible(true)
      clearTimeout(timer)
      timer = setTimeout(() => setVisible(false), 2500)
    }
    window.addEventListener('show-toast', handler)
    return () => {
      window.removeEventListener('show-toast', handler)
      clearTimeout(timer)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={s.wrap}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
        >
          <div className={s.toast}>{message}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
