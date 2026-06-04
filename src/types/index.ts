export type UserId = 'userA' | 'userB'

export interface User {
  id: UserId
  name: string
  email: string
  avatar: string
}

export type TaskCategory = string
export type TaskStatus = 'pending' | 'done' | 'overdue'

export interface Task {
  id: string
  title: string
  description: string
  category: TaskCategory
  assignedTo: UserId
  createdBy: UserId
  deadline: string
  status: TaskStatus
  imageUrl: string
  createdAt: string
  penaltyApplied: boolean
}

export type ClaimStatus = 'active' | 'completed'

export interface Claim {
  id: string
  createdBy: UserId
  targetUser: UserId
  hours: number
  memo: string
  status: ClaimStatus
  createdAt: string
  completedAt?: string
}
