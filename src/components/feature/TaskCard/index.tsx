import { motion } from 'framer-motion'
import { CheckCircle2, Clock } from 'lucide-react'
import { USERS } from '@/store'
import type { Task, UserId } from '@/types'
import s from './styles.module.scss'

const CATEGORY_COLOR: Record<string, string> = {
  청소: '#74B9FF',
  요리: '#FDCB6E',
  세탁: '#A29BFE',
  기타: '#B2BEC3',
}

function formatDeadline(deadline: string) {
  const d = new Date(deadline)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (diff < 0) return '기한 초과'
  if (hours < 24) return `${hours}시간 남음`
  return `${days}일 남음`
}

interface TaskCardProps {
  task: Task
  currentUser: UserId
  onComplete: (id: string) => void
  onClick: (task: Task) => void
}

export default function TaskCard({ task, currentUser, onComplete, onClick }: TaskCardProps) {
  const isOverdue = task.status === 'overdue'
  const isDone = task.status === 'done'
  const canNudge = task.assignedTo !== currentUser && !isDone

  const assignee = USERS[task.assignedTo]
  const deadlineLabel = formatDeadline(task.deadline)

  return (
    <motion.div
      className={`${s.card} ${isDone ? s.done : ''} ${isOverdue ? s.overdue : ''}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={() => onClick(task)}
      style={{ cursor: 'pointer' }}
    >
      {task.imageUrl && (
        <div className={s.imageThumb}>
          <img src={task.imageUrl} alt={task.title} />
        </div>
      )}

      <div className={s.body}>
        <div className={s.topRow}>
          <span
            className={s.category}
            style={{ background: CATEGORY_COLOR[task.category] + '22', color: CATEGORY_COLOR[task.category] }}
          >
            {task.category}
          </span>
          <span className={`${s.deadline} ${isOverdue ? s.overdueText : ''}`}>
            <Clock size={12} />
            {deadlineLabel}
          </span>
        </div>

        <p className={`${s.title} ${isDone ? s.strikethrough : ''}`}>{task.title}</p>

        {task.description && <p className={s.desc}>{task.description}</p>}

        <div className={s.bottomRow}>
          <div className={s.assignee}>
            <span className={s.assigneeAvatar}>{assignee.avatar}</span>
            <span className={s.assigneeName}>{assignee.name}</span>
          </div>

          <div className={s.actions}>
            {canNudge && (
              <span className={s.nudgeHint}>탭해서 독촉하기 →</span>
            )}
            {!isDone && task.assignedTo === currentUser && (
              <motion.button
                className={s.doneBtn}
                onClick={(e) => { e.stopPropagation(); onComplete(task.id) }}
                whileTap={{ scale: 0.9 }}
              >
                <CheckCircle2 size={14} />
                완료
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
