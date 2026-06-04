import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  increment,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Claim, UserId } from '@/types'

export function useClaims() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'claims'), async (snap) => {
      const now = new Date()
      const list: Claim[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Claim))

      const WEEK = 7 * 24 * 60 * 60 * 1000
      const expired = list.filter(
        (c) => c.status === 'completed' && c.completedAt && now.getTime() - new Date(c.completedAt).getTime() > WEEK
      )
      await Promise.all(expired.map((c) => deleteDoc(doc(db, 'claims', c.id))))

      setClaims(list.filter((c) => !expired.find((e) => e.id === c.id)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setLoading(false)
    })
    return unsub
  }, [])

  const addClaim = useCallback(async (
    currentUser: UserId,
    hours: number,
    memo: string
  ) => {
    const targetUser: UserId = currentUser === 'userA' ? 'userB' : 'userA'
    const batch = writeBatch(db)

    // 포인트 차감
    const pointsRef = doc(db, 'meta', 'points')
    batch.set(pointsRef, { [currentUser]: increment(-hours) }, { merge: true })

    // 권리 행사 기록 생성
    const claimRef = doc(collection(db, 'claims'))
    batch.set(claimRef, {
      createdBy: currentUser,
      targetUser,
      hours,
      memo,
      status: 'active',
      createdAt: new Date().toISOString(),
    })

    await batch.commit()
  }, [])

  const completeClaim = useCallback(async (claimId: string) => {
    await updateDoc(doc(db, 'claims', claimId), { status: 'completed', completedAt: new Date().toISOString() })
  }, [])

  return { claims, loading, addClaim, completeClaim }
}
