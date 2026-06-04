import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Delete } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, USERS } from '@/store'
import type { UserId } from '@/types'
import s from './styles.module.scss'

const PINS: Record<UserId, string> = {
  userA: import.meta.env.VITE_USER_A_PIN || '',
  userB: import.meta.env.VITE_USER_B_PIN || '',
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function ProfileSelect() {
  const navigate = useNavigate()
  const { setCurrentUser, currentUser, _hasHydrated } = useAppStore()
  const [selectedUser, setSelectedUser] = useState<UserId | null>(null)

  useEffect(() => {
    if (_hasHydrated && currentUser) navigate('/dashboard', { replace: true })
  }, [_hasHydrated, currentUser, navigate])
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleCardClick = (id: UserId) => {
    if (!PINS[id]) {
      setCurrentUser(id)
      navigate('/dashboard')
      return
    }
    setSelectedUser(id)
    setPin('')
    setError(false)
  }

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setPin((p) => p.slice(0, -1))
      setError(false)
      return
    }
    if (pin.length >= 4) return
    const next = pin + key
    setPin(next)
    if (next.length === 4) {
      if (next === PINS[selectedUser!]) {
        setCurrentUser(selectedUser!)
        navigate('/dashboard')
      } else {
        setError(true)
        setTimeout(() => { setPin(''); setError(false) }, 600)
      }
    }
  }

  const user = selectedUser ? USERS[selectedUser] : null

  return (
    <div className={s.container}>
      <motion.div
        className={s.hero}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className={s.title}>집안일 트래커</h1>
        <p className={s.subtitle}>누구로 시작할까요?</p>
      </motion.div>

      <div className={s.cards}>
        {(Object.values(USERS) as (typeof USERS)[UserId][]).map((u, i) => (
          <motion.button
            key={u.id}
            className={s.card}
            onClick={() => handleCardClick(u.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.35 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={s.avatar}>{u.avatar}</span>
            <span className={s.name}>{u.name}</span>
          </motion.button>
        ))}
      </div>

      {/* PIN 키패드 모달 */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              className={s.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              className={s.modal}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <p className={s.modalTitle}>{user?.avatar} {user?.name}</p>
              <p className={s.modalSub}>PIN 4자리를 입력하세요</p>

              <motion.div
                className={s.dots}
                animate={error ? { x: [-6, 6, -6, 6, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                {[0,1,2,3].map((i) => (
                  <div key={i} className={`${s.dot} ${pin.length > i ? s.dotFilled : ''} ${error ? s.dotError : ''}`} />
                ))}
              </motion.div>

              {error && <p className={s.errorMsg}>PIN이 틀렸어요</p>}

              <div className={s.keypad}>
                {KEYS.map((key, i) => (
                  key === '' ? <div key={i} /> :
                  <motion.button
                    key={i}
                    className={`${s.key} ${key === '⌫' ? s.keyDel : ''}`}
                    onClick={() => handleKey(key)}
                    whileTap={{ scale: 0.88 }}
                  >
                    {key === '⌫' ? <Delete size={18} /> : key}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
