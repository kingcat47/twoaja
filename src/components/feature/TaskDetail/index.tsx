import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle2, Clock, User, X, Trash2 } from 'lucide-react'
import BottomSheet from '@/components/feature/BottomSheet'
import { USERS } from '@/store'
import { sendNudgeEmail } from '@/lib/emailjs'
import { showToast } from '@/lib/toast'
import type { Task, UserId } from '@/types'
import s from './styles.module.scss'

const CATEGORY_COLOR: Record<string, string> = {
  청소: '#74B9FF',
  요리: '#FDCB6E',
  세탁: '#A29BFE',
  기타: '#B2BEC3',
}

function getCategoryColor(category: string) {
  return CATEGORY_COLOR[category] ?? '#B2BEC3'
}

function formatDeadline(deadline: string) {
  const d = new Date(deadline)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (diff < 0) return `기한 초과 (${d.toLocaleString('ko-KR')})`
  if (hours < 24) return `${hours}시간 남음 · ${d.toLocaleString('ko-KR')}`
  return `${days}일 남음 · ${d.toLocaleString('ko-KR')}`
}

interface TaskDetailProps {
  task: Task | null
  currentUser: UserId
  onClose: () => void
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}

export default function TaskDetail({ task, currentUser, onClose, onComplete, onDelete }: TaskDetailProps) {
  const [nudging, setNudging] = useState(false)
  const [nudged, setNudged] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!task) return null

  const isOverdue = task.status === 'overdue'
  const isDone = task.status === 'done'
  const assignee = USERS[task.assignedTo]
  const creator = USERS[task.createdBy]
  const isAssignedToMe = task.assignedTo === currentUser
  const canNudge = !isAssignedToMe && !isDone
  const canDelete = task.createdBy === currentUser

  const handleComplete = () => {
    onComplete(task.id)
    onClose()
  }

  const handleDelete = () => {
    onDelete(task.id)
    onClose()
  }

  const handleNudge = async () => {
    if (nudging || nudged) return
    setNudging(true)
    try {
      await sendNudgeEmail({
        toEmail: assignee.email,
        toName: assignee.name,
        fromName: USERS[currentUser].name,
        taskTitle: task.title,
        deadline: new Date(task.deadline).toLocaleString('ko-KR'),
      })
      setNudged(true)
      showToast('독촉 메일을 보냈어요')
    } finally {
      setNudging(false)
    }
  }

  return (
    <>
    <BottomSheet open={!!task} onClose={onClose}>
      <div className={s.container}>
        {task.imageUrl && (
          <div className={s.image} onClick={() => setFullscreen(true)}>
            <img src={task.imageUrl} alt={task.title} />
            <div className={s.imageHint}>탭하여 크게 보기</div>
          </div>
        )}

        <div className={s.topRow}>
          <span
            className={s.category}
            style={{ background: getCategoryColor(task.category) + '22', color: getCategoryColor(task.category) }}
          >
            {task.category}
          </span>
          <span className={`${s.status} ${isOverdue ? s.overdueStatus : ''} ${isDone ? s.doneStatus : ''}`}>
            {isDone ? '완료' : isOverdue ? '기한 초과' : '진행 중'}
          </span>
        </div>

        <h2 className={s.title}>{task.title}</h2>

        {task.description && <p className={s.description}>{task.description}</p>}

        <div className={s.infoList}>
          <div className={s.infoRow}>
            <Clock size={15} className={s.infoIcon} />
            <span className={`${s.infoText} ${isOverdue ? s.overdueText : ''}`}>
              {formatDeadline(task.deadline)}
            </span>
          </div>
          <div className={s.infoRow}>
            <User size={15} className={s.infoIcon} />
            <span className={s.infoText}>
              {assignee.avatar} {assignee.name} 담당
              {creator.id !== assignee.id && ` · ${creator.avatar} ${creator.name}이 등록`}
            </span>
          </div>
        </div>

        <div className={s.actions}>
          {!isDone && isAssignedToMe && (
            <motion.button className={s.completeBtn} onClick={handleComplete} whileTap={{ scale: 0.97 }}>
              <CheckCircle2 size={18} />
              완료하기
            </motion.button>
          )}
          {!isDone && canNudge && (
            <motion.button
              className={`${s.nudgeBtn} ${nudged ? s.nudged : ''}`}
              onClick={handleNudge}
              disabled={nudging || nudged}
              whileTap={{ scale: 0.97 }}
              animate={nudging ? { rotate: [0, -4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Bell size={18} />
              {nudged ? '독촉 완료!' : nudging ? '전송 중...' : '독촉하기'}
            </motion.button>
          )}
          {canDelete && (
            <motion.button className={s.deleteBtn} onClick={() => setConfirmDelete(true)} whileTap={{ scale: 0.97 }}>
              <Trash2 size={18} />
              삭제하기
            </motion.button>
          )}
        </div>
      </div>
    </BottomSheet>

    {/* 삭제 확인 팝업 */}
    <AnimatePresence>
      {confirmDelete && (
        <>
          <motion.div
            className={s.dialogBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(false)}
          />
          <div className={s.dialogWrapper}>
          <motion.div
            className={s.dialog}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            <p className={s.dialogTitle}>할 일을 삭제할까요?</p>
            <p className={s.dialogDesc}>"{task.title}"을 삭제하면 되돌릴 수 없어요.</p>
            <div className={s.dialogActions}>
              <button className={s.dialogCancel} onClick={() => setConfirmDelete(false)}>취소</button>
              <button className={s.dialogConfirm} onClick={handleDelete}>삭제</button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>

    {/* 이미지 풀스크린 */}
    <AnimatePresence>
      {fullscreen && task.imageUrl && (
        <motion.div
          className={s.fullscreen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setFullscreen(false)}
        >
          <motion.img
            src={task.imageUrl}
            className={s.fullscreenImg}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.85 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          />
          <button className={s.fullscreenClose}>
            <X size={22} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
