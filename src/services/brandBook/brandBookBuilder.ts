import { getProject } from '../projectService'
import { getProjectHistory } from '../historyService'
import { getProjectBrandAssets } from '../brandAssetService'
import type { BrandBookSection } from './brandBookService'

export interface BrandCompleteness {
  score: number // 0 to 100
  missing: string[]
}

/**
 * Calculates the brand completeness score based on availability of core assets.
 */
export function calculateCompleteness(
  hasLogo: boolean,
  hasPalette: boolean,
  hasTypography: boolean,
  hasStory: boolean,
  hasMission: boolean,
  hasVision: boolean
): BrandCompleteness {
  const missing: string[] = []
  let count = 0

  if (hasLogo) count++
  else missing.push('Logo')

  if (hasPalette) count++
  else missing.push('Color Palette')

  if (hasTypography) count++
  else missing.push('Typography')

  if (hasStory) count++
  else missing.push('Brand Story')

  if (hasMission) count++
  else missing.push('Mission Statement')

  if (hasVision) count++
  else missing.push('Vision Statement')

  const score = Math.round((count / 6) * 100)
  return { score, missing }
}

/**
 * Compiles existing workspace documents and maps them into 18 Brand Book sections.
 */
export async function compileBrandBook(projectId: string): Promise<{
  sections: BrandBookSection[]
  completeness: BrandCompleteness
}> {
  // Fetch dependencies parallelly
  const [project, history, brandAssets] = await Promise.all([
    getProject(projectId),
    getProjectHistory(projectId),
    getProjectBrandAssets(projectId),
  ])

  if (!project) {
    throw new Error('Project details not found.')
  }

  // Identify existences in history logs
  const logoAsset = brandAssets.find((a) => a.assetType === 'logo')
  const logoVariations = brandAssets.filter((a) => a.assetType === 'logo-variation' || (a.assetType === 'logo' && a.assetId !== logoAsset?.assetId))

  const logoPromptLog = history.find((h) => h.generationType === 'Logo Prompt' || h.generationType === 'logo-prompt')
  const nameLog = history.find((h) => h.generationType === 'Brand Name' || h.generationType === 'brand-name')
  const sloganLog = history.find((h) => h.generationType === 'Slogan' || h.generationType === 'slogan')
  const missionLog = history.find((h) => h.generationType === 'Mission Statement' || h.generationType === 'mission-statement')
  const visionLog = history.find((h) => h.generationType === 'Vision Statement' || h.generationType === 'vision-statement')
  const storyLog = history.find((h) => h.generationType === 'Brand Story' || h.generationType === 'brand-story')
  const voiceLog = history.find((h) => h.generationType === 'Brand Voice' || h.generationType === 'brand-voice')
  const paletteLog = history.find((h) => h.generationType === 'Color Palette' || h.generationType === 'color-palette')
  const typographyLog = history.find((h) => h.generationType === 'Typography' || h.generationType === 'typography')

  // Calculate completeness
  const completeness = calculateCompleteness(
    !!logoAsset,
    !!paletteLog,
    !!typographyLog,
    !!storyLog,
    !!missionLog,
    !!visionLog
  )

  // Map to 18 sections
  const sections: BrandBookSection[] = [
    {
      id: 'cover',
      title: 'Cover Page',
      visible: true,
      content: {
        companyName: project.companyName,
        industry: project.industry,
        website: project.website || '',
        logoUrl: logoAsset?.imageUrl || '',
      },
    },
    {
      id: 'toc',
      title: 'Table of Contents',
      visible: true,
      content: {},
    },
    {
      id: 'overview',
      title: 'Brand Overview',
      visible: true,
      content: {
        description: project.description || 'Core brand overview and initial scope definition.',
        industry: project.industry,
      },
    },
    {
      id: 'name',
      title: 'Brand Name',
      visible: true,
      content: nameLog ? nameLog.response : null,
    },
    {
      id: 'logo',
      title: 'Logo Design',
      visible: true,
      content: logoAsset ? {
        imageUrl: logoAsset.imageUrl,
        prompt: logoAsset.prompt,
        model: logoAsset.model,
      } : null,
    },
    {
      id: 'logo-variations',
      title: 'Logo Variations',
      visible: true,
      content: logoVariations.length > 0 ? logoVariations.map(v => ({
        imageUrl: v.imageUrl,
        model: v.model,
      })) : null,
    },
    {
      id: 'logo-guidelines',
      title: 'Logo Usage Guidelines',
      visible: true,
      content: logoPromptLog ? logoPromptLog.response : null,
    },
    {
      id: 'palette',
      title: 'Color Palette',
      visible: true,
      content: paletteLog ? paletteLog.response : null,
    },
    {
      id: 'typography',
      title: 'Typography Systems',
      visible: true,
      content: typographyLog ? typographyLog.response : null,
    },
    {
      id: 'mission',
      title: 'Mission Statement',
      visible: true,
      content: missionLog ? missionLog.response : null,
    },
    {
      id: 'vision',
      title: 'Vision Statement',
      visible: true,
      content: visionLog ? visionLog.response : null,
    },
    {
      id: 'story',
      title: 'Brand Story',
      visible: true,
      content: storyLog ? storyLog.response : null,
    },
    {
      id: 'voice',
      title: 'Brand Voice & Tone',
      visible: true,
      content: voiceLog ? voiceLog.response : null,
    },
    {
      id: 'slogan',
      title: 'Slogans & Taglines',
      visible: true,
      content: sloganLog ? sloganLog.response : null,
    },
    {
      id: 'website',
      title: 'Website Preview Mockup',
      visible: true,
      content: {
        companyName: project.companyName,
        logoUrl: logoAsset?.imageUrl || '',
      },
    },
    {
      id: 'card',
      title: 'Business Card Mockup',
      visible: true,
      content: {
        companyName: project.companyName,
        logoUrl: logoAsset?.imageUrl || '',
        website: project.website || 'www.brandspark.ai',
      },
    },
    {
      id: 'social',
      title: 'Social Media Banner Preview',
      visible: true,
      content: {
        companyName: project.companyName,
        logoUrl: logoAsset?.imageUrl || '',
      },
    },
    {
      id: 'summary',
      title: 'Brand Summary',
      visible: true,
      content: {
        companyName: project.companyName,
        updatedAt: project.updatedAt || new Date().toISOString(),
      },
    },
  ]

  return { sections, completeness }
}
