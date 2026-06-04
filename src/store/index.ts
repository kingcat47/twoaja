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
  _hasHydrated: boolean
  setCurrentUser: (id: UserId) => void
  setHasHydrated: (val: boolean) => void
  logout: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentUser: null,
      _hasHydrated: false,
      setCurrentUser: (id) => set({ currentUser: id }),
      setHasHydrated: (val) => set({ _hasHydrated: val }),
      logout: () => set({ currentUser: null }),
    }),
    {
      name: 'twoaja-user',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
