import type { Project } from '../../types/project'
import type { GenerationType } from './generationTypes'

/**
 * Builds the AI generation prompt based on project parameters and request category type.
 */
export function buildPrompt(
  project: Project,
  type: GenerationType,
  userInputs?: Record<string, unknown>
): string {
  const context = `
Brand Profile Context:
- Company Name: ${project.companyName}
- Industry: ${project.industry}
- Description: ${project.description}
- Target Audience: ${project.targetAudience}
- Target Country/Market: ${project.country}
- Demographic Age: ${project.ageGroup}
- Brand Personality: ${project.brandPersonality.join(', ')}
- Colors Preferred: ${project.primaryColors}
- Logo Style Preferred: ${project.logoStyle}
- Typography Style: ${project.typography}
${project.website ? `- Website: ${project.website}` : ''}
${userInputs?.customDirective ? `- Custom Directive: ${userInputs.customDirective}` : ''}
`

  switch (type) {
    case 'Brand Name':
      return `
${context}
Task: Generate exactly 10 unique, distinct, and premium brand name options for the company profile above. For each brand name, you must provide: the name itself, a meaningful explanation of the name, why it fits this specific business and context, and a memorability score from 1 to 10 (where 10 is extremely memorable and catchy).
`
    case 'Logo Prompt':
      return `
${context}
Task: Formulate a detailed, highly descriptive text prompt to be used in AI image generators (like Midjourney, DALL-E, or Stable Diffusion) to create a logo that fits the brand preferences above. Provide visual style notes on elements, color applications, and graphic structure.
`
    case 'Logo Concept':
      return `
${context}
Task: Elaborate on a core visual concept for a logo design for this brand. Provide 3 symbolic metaphors that can be incorporated into the visual brand identity.
`
    case 'Slogan':
      return `
${context}
Task: Generate a memorable slogan for this business. Provide a brief explanation of the branding strategy and message behind it.
`
    case 'Mission Statement':
      return `
${context}
Task: Formulate a powerful, concise Mission Statement that articulates the core purpose, audience, and value proposition of the brand.
`
    case 'Vision Statement':
      return `
${context}
Task: Formulate an inspiring, forward-looking Vision Statement depicting the long-term impact and future aspiration of this company.
`
    case 'Brand Story':
      return `
${context}
Task: Draft a compelling brand origin story narrative that outlines the problem this company solves, its values, and its promise to customers.
`
    case 'Brand Voice':
      return `
${context}
Task: Design the brand voice guidelines. Detail the tone of voice (voiceTone) and list 4 practical guidelines (dos/don'ts) for content writers.
`
    case 'Color Palette':
      return `
${context}
Task: Generate a structured color palette. Suggest 4 specific colors with their hex codes, descriptive names, and design roles (e.g. primary, secondary, accent, background) that align with the color preferences of the brand.
`
    case 'Typography':
      return `
${context}
Task: Recommend a premium font pairing: a primary header font and a secondary body font. Provide clear guidelines on when and how to use them.
`
    case 'Social Media Bio':
    case 'Instagram Bio':
    case 'LinkedIn About':
    case 'Twitter Bio':
      return `
${context}
Task: Write a professional, high-converting bio profile description for a ${type} account that fits the character count guidelines of that platform.
`
    case 'Tagline':
      return `
${context}
Task: Generate a short, punchy, customer-facing tagline (maximum 5 words) for this company.
`
    case 'Marketing Hook':
      return `
${context}
Task: Compose a persuasive marketing hook to grab user attention in ads or landing pages. Identify the target emotion this hook leverages.
`
    case 'Value Proposition':
      return `
${context}
Task: Formulate a compelling, clear Value Proposition statement. List 3 key benefits that distinguish this brand from competitors.
`
    default:
      throw new Error(`Unsupported generation type: ${type}`)
  }
}

/**
 * Returns the Gemini response schema definition mapping for the selected generation type.
 */
export function getResponseSchema(type: GenerationType): Record<string, unknown> {
  switch (type) {
    case 'Brand Name':
      return {
        type: 'OBJECT',
        properties: {
          brandNames: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                meaning: { type: 'STRING' },
                whyItFits: { type: 'STRING' },
                score: { type: 'INTEGER' },
              },
              required: ['name', 'meaning', 'whyItFits', 'score'],
            },
          },
        },
        required: ['brandNames'],
      }
    case 'Logo Prompt':
      return {
        type: 'OBJECT',
        properties: {
          logoPrompt: { type: 'STRING' },
          styleNotes: { type: 'STRING' },
        },
        required: ['logoPrompt', 'styleNotes'],
      }
    case 'Logo Concept':
      return {
        type: 'OBJECT',
        properties: {
          coreConcept: { type: 'STRING' },
          visualMetaphors: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
        },
        required: ['coreConcept', 'visualMetaphors'],
      }
    case 'Slogan':
      return {
        type: 'OBJECT',
        properties: {
          slogan: { type: 'STRING' },
          explanation: { type: 'STRING' },
        },
        required: ['slogan', 'explanation'],
      }
    case 'Mission Statement':
      return {
        type: 'OBJECT',
        properties: {
          mission: { type: 'STRING' },
        },
        required: ['mission'],
      }
    case 'Vision Statement':
      return {
        type: 'OBJECT',
        properties: {
          vision: { type: 'STRING' },
        },
        required: ['vision'],
      }
    case 'Brand Story':
      return {
        type: 'OBJECT',
        properties: {
          story: { type: 'STRING' },
        },
        required: ['story'],
      }
    case 'Brand Voice':
      return {
        type: 'OBJECT',
        properties: {
          voiceTone: { type: 'STRING' },
          guidelines: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
        },
        required: ['voiceTone', 'guidelines'],
      }
    case 'Color Palette':
      return {
        type: 'OBJECT',
        properties: {
          colors: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                hex: { type: 'STRING' },
                name: { type: 'STRING' },
                role: { type: 'STRING' },
              },
              required: ['hex', 'name', 'role'],
            },
          },
        },
        required: ['colors'],
      }
    case 'Typography':
      return {
        type: 'OBJECT',
        properties: {
          primaryFont: { type: 'STRING' },
          secondaryFont: { type: 'STRING' },
          usageGuidelines: { type: 'STRING' },
        },
        required: ['primaryFont', 'secondaryFont', 'usageGuidelines'],
      }
    case 'Social Media Bio':
    case 'Instagram Bio':
    case 'LinkedIn About':
    case 'Twitter Bio':
      return {
        type: 'OBJECT',
        properties: {
          bio: { type: 'STRING' },
        },
        required: ['bio'],
      }
    case 'Tagline':
      return {
        type: 'OBJECT',
        properties: {
          tagline: { type: 'STRING' },
        },
        required: ['tagline'],
      }
    case 'Marketing Hook':
      return {
        type: 'OBJECT',
        properties: {
          hook: { type: 'STRING' },
          targetEmotion: { type: 'STRING' },
        },
        required: ['hook', 'targetEmotion'],
      }
    case 'Value Proposition':
      return {
        type: 'OBJECT',
        properties: {
          valueProp: { type: 'STRING' },
          keyBenefits: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
        },
        required: ['valueProp', 'keyBenefits'],
      }
    default:
      throw new Error(`Unsupported schema request type: ${type}`)
  }
}
