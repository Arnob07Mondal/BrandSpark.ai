import type { FieldValue, Timestamp } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  photoURL: string
  provider: 'google'
  createdAt: FieldValue | Timestamp
  lastLogin: FieldValue | Timestamp
  role: 'user'
  isActive: boolean
}
