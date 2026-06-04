import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  increment,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadImage } from '@/lib/cloudinary'
import type { Task, UserId } from '@/types'

export function usePoints() {
  const [points, setPoints] = useState<Record<UserId, number>>({ userA: 0, userB: 0 })

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'meta', 'points'), (snap) => {
      const data = snap.data()
      setPoints({
        userA: Number(data?.userA) || 0,
        userB: Number(data?.userB) || 0,
      })
    })
    return unsub
  }, [])

  return points
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tasks'), async (snap) => {
      const now = new Date()
      const taskList: Task[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task))

      // 완료 후 7일 지난 태스크 자동 삭제
      const WEEK = 7 * 24 * 60 * 60 * 1000
      const expiredDone = taskList.filter(
        (t) => t.status === 'done' && now.getTime() - new Date(t.createdAt).getTime() > WEEK
      )
      await Promise.all(expiredDone.map((t) => deleteDoc(doc(db, 'tasks', t.id))))

      // 마감 초과 태스크에 페널티 적용
      const overdueUnprocessed = taskList.filter(
        (t) => t.status === 'pending' && new Date(t.deadline) < now && !t.penaltyApplied
      )

      if (overdueUnprocessed.length > 0) {
        const batch = writeBatch(db)
        const pointsRef = doc(db, 'meta', 'points')

        for (const task of overdueUnprocessed) {
          batch.update(doc(db, 'tasks', task.id), {
            status: 'overdue',
            penaltyApplied: true,
          })
          const beneficiary: UserId = task.assignedTo === 'userA' ? 'userB' : 'userA'
          batch.set(pointsRef, { [beneficiary]: increment(1) }, { merge: true })
        }

        await batch.commit()
      }

      setTasks(taskList.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()))
      setLoading(false)
    })

    return unsub
  }, [])

  const addTask = useCallback(async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'penaltyApplied' | 'imageUrl'>,
    imageFile?: File
  ) => {
    let imageUrl = ''
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
    }

    await addDoc(collection(db, 'tasks'), {
      ...taskData,
      imageUrl,
      status: 'pending',
      penaltyApplied: false,
      createdAt: new Date().toISOString(),
    })
  }, [])

  const completeTask = useCallback(async (taskId: string) => {
    await updateDoc(doc(db, 'tasks', taskId), { status: 'done' })
  }, [])

  const deleteTask = useCallback(async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId))
  }, [])

  return { tasks, loading, addTask, completeTask, deleteTask }
}
