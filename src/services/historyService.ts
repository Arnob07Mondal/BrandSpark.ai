import {
  db,
  collection,
  getDocs,
  query,
  where,
} from '../lib/firestore'

export interface GenerationLog {
  generationId: string
  projectId: string
  ownerUid: string
  generationType: string
  prompt: string
  response: unknown
  model: string
  createdAt: unknown
  status: 'success' | 'failed'
  generationTime: number
}

/**
 * Gets all AI generation logs for a specific project.
 * Uses local sorting on createdAt timestamps to bypass index link setup constraints.
 */
export async function getProjectHistory(projectId: string): Promise<GenerationLog[]> {
  const genRef = collection(db, 'generations')
  const q = query(genRef, where('projectId', '==', projectId))
  const querySnapshot = await getDocs(q)

  const list: GenerationLog[] = []
  querySnapshot.forEach((d) => {
    const data = d.data()
    list.push({
      generationId: d.id,
      projectId: data.projectId,
      ownerUid: data.ownerUid,
      generationType: data.generationType,
      prompt: data.prompt,
      response: data.response,
      model: data.model,
      createdAt: data.createdAt,
      status: data.status,
      generationTime: data.generationTime || 0,
    })
  })

  // Sort by createdAt descending locally
  return list.sort((a, b) => {
    const tsA = a.createdAt as { seconds?: number; toMillis?: () => number } | null | undefined
    const tsB = b.createdAt as { seconds?: number; toMillis?: () => number } | null | undefined
    const timeA = tsA?.seconds || tsA?.toMillis?.() || 0
    const timeB = tsB?.seconds || tsB?.toMillis?.() || 0
    return timeB - timeA
  })
}
