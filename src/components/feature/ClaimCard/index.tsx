import { motion } from 'framer-motion'
import { Smartphone, CheckCircle2 } from 'lucide-react'
import { USERS } from '@/store'
import type { Claim, UserId } from '@/types'
import s from './styles.module.scss'

interface ClaimCardProps {
  claim: Claim
  currentUser: UserId
  onComplete: (id: string) => void
}

export default function ClaimCard({ claim, currentUser, onComplete }: ClaimCardProps) {
  const isCompleted = claim.status === 'completed'
  const isMine = claim.createdBy === currentUser
  const claimer = USERS[claim.createdBy]
  const target = USERS[claim.targetUser]
  const startDate = new Date(claim.createdAt)
  const endDate = new Date(startDate.getTime() + claim.hours * 60 * 60 * 1000)
  const fmt = (d: Date) => d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      className={`${s.card} ${isCompleted ? s.completed : ''}`}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={s.left}>
        <div className={s.iconWrap}>
          <Smartphone size={18} className={s.icon} />
        </div>
        <div className={s.info}>
          <p className={s.title}>
            <span>{claimer.avatar} {claimer.name}</span>
            <span className={s.arrow}> → </span>
            <span>{target.avatar} {target.name}</span>
          </p>
          <p className={s.hours}>{claim.hours}시간 압수</p>
          {claim.memo && <p className={s.memo}>{claim.memo}</p>}
          <p className={s.date}>{fmt(startDate)} ~ {fmt(endDate)}</p>
        </div>
      </div>

      <div className={s.right}>
        {isCompleted ? (
          <span className={s.doneBadge}>완료</span>
        ) : isMine ? (
          <motion.button
            className={s.completeBtn}
            onClick={() => onComplete(claim.id)}
            whileTap={{ scale: 0.9 }}
          >
            <CheckCircle2 size={14} />
            완료
          </motion.button>
        ) : (
          <span className={s.activeBadge}>진행중</span>
        )}
      </div>
    </motion.div>
  )
}
