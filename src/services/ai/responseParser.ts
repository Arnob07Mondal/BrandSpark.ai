import type { GenerationType } from './generationTypes'

/**
 * Parses and validates structured JSON responses from the Gemini model based on generation category.
 */
export function parseResponse<T>(candidateText: string, type: GenerationType): T {
  if (!candidateText || !candidateText.trim()) {
    throw new Error('Received empty response from the AI model.')
  }

  // Find start and end of JSON boundary block in case the model returns markdown wrapper blocks
  let cleanText = candidateText.trim()
  if (cleanText.startsWith('```')) {
    const lines = cleanText.split('\n')
    // Remove first line (e.g. ```json) and last line (e.g. ```)
    if (lines.length > 2) {
      cleanText = lines.slice(1, -1).join('\n').trim()
    }
  }

  const parsedData = JSON.parse(cleanText)

  // Validate properties to ensure type safety matching the schemas defined in promptBuilder
  switch (type) {
    case 'Brand Name':
      if (!parsedData.brandNames || !Array.isArray(parsedData.brandNames)) {
        throw new Error('Schema mismatch: brandNames array is missing or invalid.')
      }
      for (const bn of parsedData.brandNames) {
        if (
          typeof bn.name !== 'string' ||
          typeof bn.meaning !== 'string' ||
          typeof bn.whyItFits !== 'string' ||
          typeof bn.score !== 'number'
        ) {
          throw new Error('Schema mismatch: Brand Name elements are missing or malformed.')
        }
      }
      break
    case 'Logo Prompt':
      if (typeof parsedData.logoPrompt !== 'string' || typeof parsedData.styleNotes !== 'string') {
        throw new Error('Schema mismatch: logoPrompt or styleNotes is missing or not a string.')
      }
      break
    case 'Logo Concept':
      if (typeof parsedData.coreConcept !== 'string' || !Array.isArray(parsedData.visualMetaphors)) {
        throw new Error('Schema mismatch: coreConcept or visualMetaphors list is missing or invalid.')
      }
      break
    case 'Slogan':
      if (typeof parsedData.slogan !== 'string' || typeof parsedData.explanation !== 'string') {
        throw new Error('Schema mismatch: slogan or explanation is missing or not a string.')
      }
      break
    case 'Mission Statement':
      if (typeof parsedData.mission !== 'string') {
        throw new Error('Schema mismatch: mission is missing or not a string.')
      }
      break
    case 'Vision Statement':
      if (typeof parsedData.vision !== 'string') {
        throw new Error('Schema mismatch: vision is missing or not a string.')
      }
      break
    case 'Brand Story':
      if (typeof parsedData.story !== 'string') {
        throw new Error('Schema mismatch: story is missing or not a string.')
      }
      break
    case 'Brand Voice':
      if (typeof parsedData.voiceTone !== 'string' || !Array.isArray(parsedData.guidelines)) {
        throw new Error('Schema mismatch: voiceTone or guidelines list is missing or invalid.')
      }
      break
    case 'Color Palette':
      if (!parsedData.colors || !Array.isArray(parsedData.colors)) {
        throw new Error('Schema mismatch: colors array is missing or invalid.')
      }
      break
    case 'Typography':
      if (
        typeof parsedData.primaryFont !== 'string' ||
        typeof parsedData.secondaryFont !== 'string' ||
        typeof parsedData.usageGuidelines !== 'string'
      ) {
        throw new Error('Schema mismatch: typography font pairing values are missing or invalid.')
      }
      break
    case 'Social Media Bio':
    case 'Instagram Bio':
    case 'LinkedIn About':
    case 'Twitter Bio':
      if (typeof parsedData.bio !== 'string') {
        throw new Error('Schema mismatch: bio text is missing or not a string.')
      }
      break
    case 'Tagline':
      if (typeof parsedData.tagline !== 'string') {
        throw new Error('Schema mismatch: tagline text is missing or not a string.')
      }
      break
    case 'Marketing Hook':
      if (typeof parsedData.hook !== 'string' || typeof parsedData.targetEmotion !== 'string') {
        throw new Error('Schema mismatch: marketing hook or targetEmotion is missing or invalid.')
      }
      break
    case 'Value Proposition':
      if (typeof parsedData.valueProp !== 'string' || !Array.isArray(parsedData.keyBenefits)) {
        throw new Error('Schema mismatch: valueProp or keyBenefits list is missing or invalid.')
      }
      break
    default:
      break
  }

  return parsedData as T
}
