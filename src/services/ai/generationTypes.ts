export type GenerationType =
  | 'Brand Name'
  | 'Logo Prompt'
  | 'Logo Concept'
  | 'Slogan'
  | 'Mission Statement'
  | 'Vision Statement'
  | 'Brand Story'
  | 'Brand Voice'
  | 'Color Palette'
  | 'Typography'
  | 'Social Media Bio'
  | 'Instagram Bio'
  | 'LinkedIn About'
  | 'Twitter Bio'
  | 'Tagline'
  | 'Marketing Hook'
  | 'Value Proposition'

export interface BrandName {
  name: string
  meaning: string
  whyItFits: string
  score: number
}

export interface BrandNameResult {
  brandNames: BrandName[]
}

export interface LogoPromptResult {
  logoPrompt: string
  styleNotes: string
}

export interface LogoConceptResult {
  coreConcept: string
  visualMetaphors: string[]
}

export interface SloganResult {
  slogan: string
  explanation: string
}

export interface MissionStatementResult {
  mission: string
}

export interface VisionStatementResult {
  vision: string
}

export interface BrandStoryResult {
  story: string
}

export interface BrandVoiceResult {
  voiceTone: string
  guidelines: string[]
}

export interface ColorPaletteSwatch {
  hex: string
  name: string
  role: string
}

export interface ColorPaletteResult {
  colors: ColorPaletteSwatch[]
}

export interface TypographyResult {
  primaryFont: string
  secondaryFont: string
  usageGuidelines: string
}

export interface BioResult {
  bio: string
}

export interface TaglineResult {
  tagline: string
}

export interface MarketingHookResult {
  hook: string
  targetEmotion: string
}

export interface ValuePropositionResult {
  valueProp: string
  keyBenefits: string[]
}

export interface NormalizedAIResponse<T = unknown> {
  success: boolean
  content: T
  metadata: {
    prompt: string
    model: string
    generationTime: number
  }
}
