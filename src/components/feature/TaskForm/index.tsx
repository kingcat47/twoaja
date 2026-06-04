import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, X, Loader } from 'lucide-react'
import { USERS } from '@/store'
import type { TaskCategory, UserId } from '@/types'
import s from './styles.module.scss'

const CATEGORIES: TaskCategory[] = ['청소', '요리', '세탁', '기타']

interface TaskFormProps {
  currentUser: UserId
  onSubmit: (
    data: {
      title: string
      description: string
      category: TaskCategory
      assignedTo: UserId
      createdBy: UserId
      deadline: string
    },
    imageFile?: File
  ) => Promise<void>
  onClose: () => void
}

export default function TaskForm({ currentUser, onSubmit, onClose }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TaskCategory>('청소')
  const [customCategory, setCustomCategory] = useState('')
  const [assignedTo, setAssignedTo] = useState<UserId>(currentUser)
  const [deadline, setDeadline] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const otherId: UserId = currentUser === 'userA' ? 'userB' : 'userA'

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !deadline) return
    setSubmitting(true)
    try {
      const finalCategory = category === '기타' && customCategory.trim() ? customCategory.trim() : category
      await onSubmit(
        { title: title.trim(), description: description.trim(), category: finalCategory, assignedTo, createdBy: currentUser, deadline },
        imageFile ?? undefined
      )
      onClose()
    } catch (err) {
      console.error('[TaskForm] 등록 실패:', err)
      alert('등록 중 오류가 발생했어요. 콘솔을 확인해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  const minDeadline = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      {/* 사진 업로드 */}
      <div className={s.imageArea} onClick={() => !submitting && fileRef.current?.click()}>
        {submitting && imageFile ? (
          <div className={s.uploadingOverlay}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader size={28} className={s.spinnerIcon} />
            </motion.div>
            <span>업로드 중...</span>
          </div>
        ) : imagePreview ? (
          <div className={s.imagePreview}>
            <img src={imagePreview} alt="preview" />
            <button
              type="button"
              className={s.removeImage}
              onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null) }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className={s.imagePlaceholder}>
            <Camera size={24} className={s.cameraIcon} />
            <span>사진 추가 (선택)</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} hidden />
      </div>

      {/* 제목 */}
      <div className={s.field}>
        <label className={s.label}>할 일 제목 *</label>
        <input
          className={s.input}
          placeholder="예: 설거지하기"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* 설명 */}
      <div className={s.field}>
        <label className={s.label}>설명 (선택)</label>
        <textarea
          className={s.textarea}
          placeholder="상세 내용을 입력하세요"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      {/* 카테고리 */}
      <div className={s.field}>
        <label className={s.label}>카테고리</label>
        <div className={s.chips}>
          {CATEGORIES.map((c) => (
            <motion.button
              key={c}
              type="button"
              className={`${s.chip} ${category === c ? s.active : ''}`}
              onClick={() => setCategory(c)}
              whileTap={{ scale: 0.93 }}
            >
              {c}
            </motion.button>
          ))}
        </div>
        {category === '기타' && (
          <motion.input
            className={s.input}
            placeholder="예: 분리수거, 화분 물주기..."
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>

      {/* 담당자 */}
      <div className={s.field}>
        <label className={s.label}>담당자</label>
        <div className={s.toggle}>
          {([currentUser, otherId] as UserId[]).map((uid) => (
            <motion.button
              key={uid}
              type="button"
              className={`${s.toggleBtn} ${assignedTo === uid ? s.active : ''}`}
              onClick={() => setAssignedTo(uid)}
              whileTap={{ scale: 0.95 }}
            >
              <span>{USERS[uid].avatar}</span>
              <span>{USERS[uid].name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 마감 기한 */}
      <div className={s.field}>
        <label className={s.label}>마감 기한 *</label>
        <input
          className={s.input}
          type="datetime-local"
          value={deadline}
          min={minDeadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
      </div>

      <motion.button
        className={s.submitBtn}
        type="submit"
        disabled={submitting || !title.trim() || !deadline}
        whileTap={{ scale: 0.97 }}
      >
        {submitting ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-flex' }}
            >
              <Loader size={16} />
            </motion.span>
            {imageFile ? '사진 업로드 중...' : '등록 중...'}
          </>
        ) : '할 일 등록'}
      </motion.button>
    </form>
  )
}
