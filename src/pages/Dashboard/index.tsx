import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, USERS } from '@/store'
import { useTasks } from '@/hooks/useTasks'
import TaskCard from '@/components/feature/TaskCard'
import TaskDetail from '@/components/feature/TaskDetail'
import BottomSheet from '@/components/feature/BottomSheet'
import TaskForm from '@/components/feature/TaskForm'
import TabBar from '@/components/layout/TabBar'
import type { Task, UserId } from '@/types'
import s from './styles.module.scss'

type Tab = 'mine' | 'theirs'

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentUser, logout, _hasHydrated } = useAppStore()
  const { tasks, loading, addTask, completeTask, deleteTask } = useTasks()
  const [tab, setTab] = useState<Tab>('mine')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!_hasHydrated) return
    if (!currentUser) navigate('/')
  }, [_hasHydrated, currentUser, navigate])

  if (!_hasHydrated || !currentUser) return null

  const otherId: UserId = currentUser === 'userA' ? 'userB' : 'userA'
  const user = USERS[currentUser]

  const mineTasks = tasks.filter((t) => t.assignedTo === currentUser && t.status !== 'done')
  const theirTasks = tasks.filter((t) => t.assignedTo === otherId && t.status !== 'done')
  const doneTasks = tasks.filter((t) => t.status === 'done')
  const displayTasks = tab === 'mine' ? mineTasks : theirTasks

  return (
    <div className={s.container}>
      {/* 헤더 */}
      <div className={s.header}>
        <div ref={menuRef} className={s.avatarMenu}>
          <button className={s.avatarBtn} onClick={() => setMenuOpen((v) => !v)}>
            <span className={s.avatar}>{user.avatar}</span>
            <span className={s.name}>{user.name}의 집</span>
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className={s.menu}
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <button className={s.menuItem} onClick={() => { setMenuOpen(false); logout(); navigate('/') }}>
                  <RefreshCw size={15} />
                  프로필 전환
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          className={s.addBtn}
          onClick={() => setSheetOpen(true)}
          whileTap={{ scale: 0.93 }}
        >
          <Plus size={16} strokeWidth={2.5} />
          추가
        </motion.button>
      </div>

      <div className={s.scroll}>
        {/* 탭 */}
        <div className={s.tabs}>
          <button
            className={`${s.tab} ${tab === 'mine' ? s.active : ''}`}
            onClick={() => setTab('mine')}
          >
            내 할 일
            {mineTasks.length > 0 && <span className={s.badge}>{mineTasks.length}</span>}
          </button>
          <button
            className={`${s.tab} ${tab === 'theirs' ? s.active : ''}`}
            onClick={() => setTab('theirs')}
          >
            {USERS[otherId].name} 할 일
            {theirTasks.length > 0 && <span className={s.badge}>{theirTasks.length}</span>}
          </button>
        </div>

        {/* 태스크 리스트 */}
        {loading ? (
          <div className={s.empty}>불러오는 중...</div>
        ) : displayTasks.length === 0 ? (
          <div className={s.empty}>
            <span className={s.emptyEmoji}>🎉</span>
            <span>할 일이 없어요!</span>
          </div>
        ) : (
          <AnimatePresence>
            <div className={s.taskList}>
              {displayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUser={currentUser}
                  onComplete={completeTask}
                  onClick={setSelectedTask}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* 완료된 태스크 */}
        {doneTasks.length > 0 && (
          <div className={s.section}>
            <p className={s.sectionTitle}>완료 ({doneTasks.length})</p>
            <div className={s.taskList}>
              {doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUser={currentUser}
                  onComplete={completeTask}
                  onClick={setSelectedTask}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <TabBar />

      {/* 할 일 등록 바텀시트 */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="할 일 등록">
        <TaskForm
          currentUser={currentUser}
          onSubmit={addTask}
          onClose={() => setSheetOpen(false)}
        />
      </BottomSheet>

      {/* 할 일 상세 바텀시트 */}
      <TaskDetail
        task={selectedTask}
        currentUser={currentUser}
        onClose={() => setSelectedTask(null)}
        onComplete={completeTask}
        onDelete={deleteTask}
      />
    </div>
  )
}
