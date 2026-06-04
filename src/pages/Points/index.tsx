import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, USERS } from '@/store'
import { usePoints, useTasks } from '@/hooks/useTasks'
import { useClaims } from '@/hooks/useClaims'
import TabBar from '@/components/layout/TabBar'
import BottomSheet from '@/components/feature/BottomSheet'
import ClaimForm from '@/components/feature/ClaimForm'
import ClaimCard from '@/components/feature/ClaimCard'
import type { UserId } from '@/types'
import s from './styles.module.scss'

export default function Points() {
  const navigate = useNavigate()
  const { currentUser } = useAppStore()
  const points = usePoints()
  const { tasks } = useTasks()
  const { claims, addClaim, completeClaim } = useClaims()
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) navigate('/')
  }, [currentUser, navigate])

  if (!currentUser) return null

  const assignedToA = tasks.filter((t) => t.assignedTo === 'userA' && t.status !== 'done').length
  const assignedToB = tasks.filter((t) => t.assignedTo === 'userB' && t.status !== 'done').length
  const overdueByA = tasks.filter((t) => t.assignedTo === 'userA' && t.status === 'overdue').length
  const overdueByB = tasks.filter((t) => t.assignedTo === 'userB' && t.status === 'overdue').length

  const users: UserId[] = ['userA', 'userB']
  const myPoints = points[currentUser]
  const activeClaims = claims.filter((c) => c.status === 'active')
  const completedClaims = claims.filter((c) => c.status === 'completed')

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>권리 포인트</h1>
          <p className={s.subtitle}>마감을 어기면 상대방이 포인트를 얻어요</p>
        </div>
        <motion.button
          className={s.addBtn}
          onClick={() => setSheetOpen(true)}
          whileTap={{ scale: 0.93 }}
          disabled={!(myPoints >= 1)}
          title={!(myPoints >= 1) ? '포인트가 없어요' : '권리 행사하기'}
        >
          <Plus size={16} strokeWidth={2.5} />
          추가
        </motion.button>
      </div>

      {/* 통계 카드 */}
      <div className={s.statsGrid}>
        {users.map((uid, i) => (
          <motion.div
            key={uid}
            className={`${s.statCard} ${uid === currentUser ? s.statMine : ''}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
          >
            <div className={s.statHeader}>
              <span className={s.statAvatar}>{USERS[uid].avatar}</span>
              <span className={s.statName}>{USERS[uid].name}</span>
            </div>
            <div className={s.statRows}>
              <div className={s.statRow}>
                <span className={s.statLabel}>할당된 일</span>
                <span className={s.statValue}>{uid === 'userA' ? assignedToA : assignedToB}개</span>
              </div>
              <div className={s.statRow}>
                <span className={s.statLabel}>기한 초과</span>
                <span className={`${s.statValue} ${(uid === 'userA' ? overdueByA : overdueByB) > 0 ? s.danger : ''}`}>
                  {uid === 'userA' ? overdueByA : overdueByB}개
                </span>
              </div>
              <div className={s.statRow}>
                <span className={s.statLabel}>보유 포인트</span>
                <span className={`${s.statValue} ${s.point}`}>{points[uid]}점</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 권리 행사 목록 */}
      {activeClaims.length > 0 && (
        <div className={s.section}>
          <p className={s.sectionTitle}>진행 중인 압수 ({activeClaims.length})</p>
          <div className={s.claimList}>
            {activeClaims.map((claim) => (
              <ClaimCard
                key={claim.id}
                claim={claim}
                currentUser={currentUser}
                onComplete={completeClaim}
              />
            ))}
          </div>
        </div>
      )}

      {completedClaims.length > 0 && (
        <div className={s.section}>
          <p className={s.sectionTitle}>완료된 압수 ({completedClaims.length})</p>
          <div className={s.claimList}>
            {completedClaims.map((claim) => (
              <ClaimCard
                key={claim.id}
                claim={claim}
                currentUser={currentUser}
                onComplete={completeClaim}
              />
            ))}
          </div>
        </div>
      )}

      {activeClaims.length === 0 && completedClaims.length === 0 && (
        <div className={s.empty}>
          <span className={s.emptyEmoji}>😌</span>
          <span>아직 권리를 행사한 적이 없어요</span>
        </div>
      )}

      <TabBar />

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="권리 행사하기">
        <ClaimForm
          currentUser={currentUser}
          availablePoints={myPoints}
          onSubmit={(hours, memo) => addClaim(currentUser, hours, memo)}
          onClose={() => setSheetOpen(false)}
        />
      </BottomSheet>
    </div>
  )
}
