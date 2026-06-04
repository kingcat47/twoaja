import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import s from './styles.module.scss'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={s.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={s.sheet}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <motion.div
              className={s.handle}
              onPanEnd={(_, info) => {
                if (info.velocity.y > 300 || info.offset.y > 100) onClose()
              }}
            />
            <div className={s.header}>
              {title && <span className={s.title}>{title}</span>}
              <button className={s.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            </div>
            <div className={s.content}>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
