import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '../lib/firebase'

export interface BrandName {
  name: string
  tagline: string
  domain: string
}

export interface GeneratedBrand {
  brandNames: BrandName[]
  brandStory: string
  brandingTips: string[]
}

/**
 * Invokes secure Cloud Function or Vercel API to generate a generic brand identity.
 */
export async function generateBrand(
  businessType: string,
  keywords: string,
  style: string
): Promise<GeneratedBrand> {
  try {
    const backendMode = import.meta.env.VITE_BACKEND_MODE || 'firebase'

    if (backendMode === 'vercel') {
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('Unauthenticated: User session is invalid or has expired.')
      }
      const token = await currentUser.getIdToken()

      const response = await fetch('/api/generate-brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessType,
          keywords,
          style,
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
      if (!data.success || !data.content) {
        throw new Error('Failed to retrieve generic brand results.')
      }
      return data.content
    } else {
      const generateGenericBrandContent = httpsCallable<{
        businessType: string
        keywords: string
        style: string
      }, { success: boolean; content: GeneratedBrand }>(functions, 'generateGenericBrandContent')

      const result = await generateGenericBrandContent({
        businessType,
        keywords,
        style,
      })

      if (!result.data.success || !result.data.content) {
        throw new Error('Failed to retrieve generic brand results.')
      }

      return result.data.content
    }
  } catch (error) {
    console.error('Failed to generate generic brand identity:', error)
    throw error
  }
}
