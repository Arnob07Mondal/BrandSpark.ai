import { httpsCallable } from 'firebase/functions'
import { functions } from '../lib/firebase'

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
 * Invokes secure Cloud Function to generate a generic brand identity.
 */
export async function generateBrand(
  businessType: string,
  keywords: string,
  style: string
): Promise<GeneratedBrand> {
  try {
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
  } catch (error) {
    console.error('Failed to generate generic brand identity:', error)
    throw error
  }
}
