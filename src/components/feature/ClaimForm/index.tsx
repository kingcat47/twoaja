import { useState } from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus, Smartphone } from 'lucide-react'
import { USERS } from '@/store'
import type { UserId } from '@/types'
import s from './styles.module.scss'

interface ClaimFormProps {
  currentUser: UserId
  availablePoints: number
  onSubmit: (hours: number, memo: string) => Promise<void>
  onClose: () => void
}

export default function ClaimForm({ currentUser, availablePoints, onSubmit, onClose }: ClaimFormProps) {
  const [hours, setHours] = useState(1)
  const [memo, setMemo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const targetUser: UserId = currentUser === 'userA' ? 'userB' : 'userA'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hours < 1 || hours > availablePoints) return
    setSubmitting(true)
    try {
      await onSubmit(hours, memo.trim())
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <div className={s.preview}>
        <Smartphone size={28} className={s.previewIcon} />
        <p className={s.previewText}>
          <span className={s.previewName}>{USERS[targetUser].avatar} {USERS[targetUser].name}</span>의<br />
          전자기기를 <span className={s.previewHours}>{hours}시간</span> 압수할 수 있어요
        </p>
        <p className={s.previewCost}>{hours}포인트 사용</p>
      </div>

      <div className={s.field}>
        <label className={s.label}>압수 시간</label>
        <div className={s.stepper}>
          <motion.button
            type="button"
            className={s.stepBtn}
            onClick={() => setHours((h) => Math.max(1, h - 1))}
            whileTap={{ scale: 0.9 }}
            disabled={hours <= 1}
          >
            <Minus size={18} />
          </motion.button>
          <span className={s.stepValue}>{hours}시간</span>
          <motion.button
            type="button"
            className={s.stepBtn}
            onClick={() => setHours((h) => Math.min(availablePoints, h + 1))}
            whileTap={{ scale: 0.9 }}
            disabled={hours >= availablePoints}
          >
            <Plus size={18} />
          </motion.button>
        </div>
        <p className={s.pointsLeft}>보유 포인트: {availablePoints}점 → 사용 후 {availablePoints - hours}점</p>
      </div>

      <div className={s.field}>
        <label className={s.label}>사유 (선택)</label>
        <input
          className={s.input}
          placeholder="예: 설거지 3일 미룸"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      <motion.button
        className={s.submitBtn}
        type="submit"
        disabled={submitting || availablePoints < 1}
        whileTap={{ scale: 0.97 }}
      >
        {availablePoints < 1 ? '포인트가 부족해요' : submitting ? '행사 중...' : `${hours}포인트 사용하여 권리 행사`}
      </motion.button>
    </form>
  )
}
