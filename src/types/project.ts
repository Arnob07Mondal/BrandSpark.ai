import type { FieldValue, Timestamp } from 'firebase/firestore'

export interface Project {
  projectId: string
  ownerUid: string
  companyName: string
  industry: string
  website?: string
  targetAudience: string
  country: string
  ageGroup: string
  brandPersonality: string[]
  primaryColors: string
  logoStyle: string
  typography: string
  description: string
  status: 'draft' | 'completed'
  createdAt: FieldValue | Timestamp
  updatedAt: FieldValue | Timestamp
}
