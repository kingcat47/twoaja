import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { USERS } from '@/store'
import type { UserId } from '@/types'
import s from './styles.module.scss'

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const prevValue = useRef(0)

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.8, ease: 'easeOut' })
    prevValue.current = value
    return controls.stop
  }, [value, count])

  return <motion.span>{rounded}</motion.span>
}

interface PointGaugeProps {
  points: Record<UserId, number>
  currentUser: UserId
}

export default function PointGauge({ points, currentUser }: PointGaugeProps) {
  const total = points.userA + points.userB
  const ratioA = total === 0 ? 0.5 : points.userA / total

  return (
    <div className={s.container}>
      <div className={s.header}>
        <span className={s.label}>권리 포인트</span>
      </div>

      <div className={s.users}>
        <div className={s.user}>
          <span className={s.avatar}>{USERS.userA.avatar}</span>
          <span className={s.name}>{USERS.userA.name}</span>
          <span className={`${s.point} ${currentUser === 'userA' ? s.mine : ''}`}>
            <AnimatedNumber value={points.userA} />
            <span className={s.unit}>점</span>
          </span>
        </div>

        <div className={s.gaugeTrack}>
          <motion.div
            className={s.gaugeBar}
            initial={false}
            animate={{ width: `${ratioA * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        <div className={`${s.user} ${s.right}`}>
          <span className={s.avatar}>{USERS.userB.avatar}</span>
          <span className={s.name}>{USERS.userB.name}</span>
          <span className={`${s.point} ${currentUser === 'userB' ? s.mine : ''}`}>
            <AnimatedNumber value={points.userB} />
            <span className={s.unit}>점</span>
          </span>
        </div>
      </div>
    </div>
  )
}
