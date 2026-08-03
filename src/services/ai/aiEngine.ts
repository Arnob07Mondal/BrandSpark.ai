import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '../../lib/firebase'
import type { GenerationType, NormalizedAIResponse } from './generationTypes'

interface CallableResponse<T> {
  success: boolean
  content: T
  metadata: {
    prompt: string
    model: string
    generationTime: number
  }
}

/**
 * Orchestrates AI generation by invoking a secure serverless callable Cloud Function or Vercel API.
 * This preserves the existing client signature, eliminating changes in downstream code.
 */
export async function generateAI<T = unknown>(
  projectId: string,
  generationType: GenerationType,
  userInputs?: Record<string, unknown>
): Promise<NormalizedAIResponse<T>> {
  try {
    const backendMode = import.meta.env.VITE_BACKEND_MODE || 'firebase'

    if (backendMode === 'vercel') {
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('Unauthenticated: User session is invalid or has expired.')
      }
      const token = await currentUser.getIdToken()

      const response = await fetch('/api/generate-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          generationType,
          userInputs,
        }),
      })

      if (!response.ok) {
        let errorDetail = `HTTP error ${response.status}`
        try {
          const errJson = await response.json()
          errorDetail = errJson.error || errorDetail
        } catch (parseErr) {
          console.warn('Failed to parse error response JSON:', parseErr)
        }
        throw new Error(errorDetail)
      }

      const data = await response.json()
      return {
        success: data.success,
        content: data.content,
        metadata: data.metadata,
      }
    } else {
      const generateAIContent = httpsCallable<{
        projectId: string
        generationType: GenerationType
        userInputs?: Record<string, unknown>
      }, CallableResponse<T>>(functions, 'generateAIContent')

      const result = await generateAIContent({
        projectId,
        generationType,
        userInputs,
      })

      const data = result.data

      return {
        success: data.success,
        content: data.content,
        metadata: data.metadata,
      }
    }
  } catch (err) {
    console.error(`AI generation failure in backend call for type ${generationType}:`, err)
    throw err
  }
}
