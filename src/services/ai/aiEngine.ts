import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
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
 * Orchestrates AI generation by invoking a secure serverless callable Cloud Function.
 * This preserves the existing client signature, eliminating changes in downstream code.
 */
export async function generateAI<T = unknown>(
  projectId: string,
  generationType: GenerationType,
  userInputs?: Record<string, unknown>
): Promise<NormalizedAIResponse<T>> {
  try {
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
  } catch (err) {
    console.error(`AI generation failure in Cloud Function call for type ${generationType}:`, err)
    throw err
  }
}
