import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserId, User } from '@/types'

export const USERS: Record<UserId, User> = {
  userA: {
    id: 'userA',
    name: import.meta.env.VITE_USER_A_NAME || '나',
    email: import.meta.env.VITE_USER_A_EMAIL || '',
    avatar: '🐱',
  },
  userB: {
    id: 'userB',
    name: import.meta.env.VITE_USER_B_NAME || '동거인',
    email: import.meta.env.VITE_USER_B_EMAIL || '',
    avatar: '🐶',
  },
}

interface AppStore {
  currentUser: UserId | null
  setCurrentUser: (id: UserId) => void
  logout: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (id) => set({ currentUser: id }),
      logout: () => set({ currentUser: null }),
    }),
    { name: 'twoaja-user' }
  )
)
