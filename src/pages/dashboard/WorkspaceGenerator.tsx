import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Copy,
  Check,
  RefreshCcw,
  AlertCircle,
  Bookmark,
  Star,
  Download,
  Share2,
  ChevronDown,
} from 'lucide-react'
import { generateAI } from '../../services/ai/aiEngine'
import type { GenerationType } from '../../services/ai/generationTypes'
import { useToast } from '../../context/ToastContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { Label } from '../../components/ui/label'
import { EmptyState } from './EmptyState'
import { useAuth } from '../../context/AuthContext'
import { addFavorite } from '../../services/favoriteService'

interface WorkspaceGeneratorProps {
  projectId: string
}

interface GenerationResult {
  brandNames?: Array<{ name: string; meaning: string; whyItFits: string; score: number }>
  brandStory?: string
  brandingTips?: string[]
  logoPrompt?: string
  styleNotes?: string
  coreConcept?: string
  visualMetaphors?: string[]
  slogan?: string
  explanation?: string
  mission?: string
  vision?: string
  story?: string
  voiceTone?: string
  guidelines?: string[]
  colors?: Array<{ hex: string; name: string; role: string }>
  primaryFont?: string
  secondaryFont?: string
  usageGuidelines?: string
  bio?: string
  tagline?: string
  hook?: string
  targetEmotion?: string
  valueProp?: string
  keyBenefits?: string[]
}

const BRAND_SUITE_MENU: { label: GenerationType; desc: string }[] = [
  { label: 'Brand Name', desc: 'Create unique naming options.' },
  { label: 'Slogan', desc: 'Craft memorable campaign slogans.' },
  { label: 'Tagline', desc: 'Develop brief brand catchphrases.' },
  { label: 'Mission Statement', desc: 'Formulate core company missions.' },
  { label: 'Vision Statement', desc: 'Define long-term vision guidelines.' },
  { label: 'Brand Story', desc: 'Compose background origin narratives.' },
  { label: 'Brand Voice', desc: 'Detail content tone guidelines.' },
  { label: 'Color Palette', desc: 'Map aesthetic color swatches.' },
  { label: 'Typography', desc: 'Recommend layout font pairings.' },
  { label: 'Logo Prompt', desc: 'Formulate AI graphic prompts.' },
]

export function WorkspaceGenerator({ projectId }: WorkspaceGeneratorProps) {
  const { showToast } = useToast()
  const { user } = useAuth()
  
  const [category, setCategory] = useState<GenerationType>('Brand Name')
  const [customDirective, setCustomDirective] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [favoritedKeys, setFavoritedKeys] = useState<string[]>([])
  const [showExportOptions, setShowExportOptions] = useState(false)

  const handleToggleFavorite = async (
    item: { name: string; meaning: string; whyItFits: string; score: number },
    key: string
  ) => {
    if (!user) {
      showToast('Please sign in to save favorites.', 'error')
      return
    }
    try {
      await addFavorite(
        projectId,
        user.uid,
        'Brand Name',
        item.name,
        item,
        item.meaning,
        item.whyItFits,
        item.score
      )
      setFavoritedKeys((prev) => [...prev, key])
      showToast(`Shortlisted "${item.name}" to generated assets!`, 'success')
    } catch {
      showToast('Failed to add favorite.', 'error')
    }
  }

  const handleFavoriteAll = async () => {
    if (!user || !result) {
      showToast('Please sign in to save favorites.', 'error')
      return
    }
    try {
      let displayName: string = category
      let meaningText = ''
      let relevanceText = ''
      let scoreVal = 0

      if (category === 'Brand Name' && result.brandNames && result.brandNames.length > 0) {
        displayName = result.brandNames[0].name
        meaningText = result.brandNames[0].meaning
        relevanceText = result.brandNames[0].whyItFits
        scoreVal = result.brandNames[0].score
      } else if (category === 'Slogan') {
        displayName = result.slogan || 'Slogan'
        relevanceText = result.explanation || ''
      } else if (category === 'Tagline') {
        displayName = result.tagline || 'Tagline'
      } else if (category === 'Color Palette' && result.colors && result.colors.length > 0) {
        displayName = `Palette: ${result.colors[0].name}`
      }

      await addFavorite(
        projectId,
        user.uid,
        category,
        displayName,
        result,
        meaningText,
        relevanceText,
        scoreVal
      )
      setSaved(true)
      showToast(`Saved ${category} suite to assets shortlist!`, 'success')
    } catch {
      showToast('Failed to save to assets.', 'error')
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setSaved(false)
    try {
      const response = await generateAI(projectId, category, {
        customDirective: customDirective.trim() || undefined,
      })
      if (response.success) {
        setResult(response.content as GenerationResult)
      } else {
        setError('Generation completed but failed to parse results.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'AI engine failed to resolve prompt.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    showToast('Copied to clipboard!', 'success')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleShare = () => {
    const text = `BrandSpark AI - Generated ${category}:\n${window.location.origin}`
    navigator.clipboard.writeText(text)
    showToast('Share link copied to clipboard!', 'success')
  }

  const handleExport = (format: 'txt' | 'md' | 'pdf') => {
    if (!result) return
    const title = `${category} - Generated Asset`
    let plainText: string
    let markdownText: string

    if (category === 'Brand Name') {
      const names = result.brandNames?.map((n) => `- ${n.name}: ${n.meaning} (Why it fits: ${n.whyItFits}, Score: ${n.score}/10)`).join('\n') || ''
      plainText = `Generated Brand Names:\n\n${names}`
      markdownText = `## Generated Brand Names\n\n${names}`
    } else if (category === 'Color Palette') {
      const colors = result.colors?.map((c) => `- ${c.name} (${c.hex}) [Role: ${c.role}]`).join('\n') || ''
      plainText = `Generated Color Palette:\n\n${colors}`
      markdownText = `## Generated Color Palette\n\n${colors}`
    } else {
      const val = result.slogan || result.tagline || result.mission || result.vision || result.story || result.logoPrompt || result.voiceTone || result.primaryFont || result.valueProp || ''
      plainText = `Generated ${category}:\n\n${val}`
      markdownText = `## Generated ${category}\n\n${val}`
    }

    if (format === 'txt') {
      const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `${category.toLowerCase().replace(/ /g, '_')}_asset.txt`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showToast('Exported TXT successfully!', 'success')
    } else if (format === 'md') {
      const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `${category.toLowerCase().replace(/ /g, '_')}_asset.md`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showToast('Exported Markdown successfully!', 'success')
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 24px; color: #0f172a; }
                pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; white-space: pre-wrap; font-size: 14px; }
                .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #64748b; }
              </style>
            </head>
            <body>
              <h1>BrandSpark AI - ${category} Report</h1>
              <pre>${plainText}</pre>
              <div class="footer">Generated via BrandSpark AI Engine workspace panel.</div>
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
    setShowExportOptions(false)
  }

  const renderResult = () => {
    if (!result) return null

    switch (category) {
      case 'Brand Name':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {result.brandNames?.map((item, idx: number) => {
                const key = `bn-${idx}`
                const isFavorited = favoritedKeys.includes(key)
                return (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white/60 p-5 shadow-sm transition-all duration-300 hover:border-blue-500/80 hover:shadow-md dark:border-slate-850 dark:bg-slate-900/60 dark:hover:border-blue-500/85"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                            {item.name}
                          </h4>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100/50 mt-1">
                            Memorability: {item.score}/10
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopy(`${item.name} - Meaning: ${item.meaning}. Why it works: ${item.whyItFits}`, key)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 transition"
                          >
                            {copiedKey === key ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleToggleFavorite(item, key)}
                            disabled={isFavorited}
                            className={`flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 transition ${
                              isFavorited
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/20'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850'
                            }`}
                          >
                            <Star className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Meaning</p>
                        <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed font-semibold">
                          {item.meaning}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Why It Works</p>
                        <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
                          {item.whyItFits}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      case 'Color Palette':
        return (
          <div className="grid gap-4 sm:grid-cols-4">
            {result.colors?.map((color, idx: number) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white/60 shadow-sm dark:border-slate-850 dark:bg-slate-900/60 flex flex-col"
              >
                <div
                  className="h-16 w-full cursor-pointer hover:opacity-90 transition relative group"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleCopy(color.hex, `hex-${idx}`)}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition">
                    <span className="text-[10px] text-white font-bold">Copy Hex</span>
                  </div>
                </div>
                <div className="p-3 text-xs flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-extrabold text-slate-800 dark:text-slate-100">{color.name}</h5>
                    <p className="text-[10px] text-slate-450 dark:text-slate-450 font-semibold mt-0.5">{color.role}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(color.hex, `hex-${idx}`)}
                    className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:bg-slate-950 dark:text-slate-400 border border-slate-100"
                  >
                    <span>{color.hex}</span>
                    {copiedKey === `hex-${idx}` ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3 text-slate-450" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      case 'Logo Prompt':
        return (
          <Card className="border border-white/20 bg-white/40 backdrop-blur-sm dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500">Image Generator Prompt</span>
              <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed font-semibold bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                {result.logoPrompt}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500">Style Instructions</span>
              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-semibold">
                {result.styleNotes}
              </p>
            </div>
            <div className="pt-2 flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleCopy(result.logoPrompt || '', 'logo-prompt')}
                className="rounded-xl text-xs font-bold"
              >
                {copiedKey === 'logo-prompt' ? <Check className="h-4 w-4 text-emerald-500 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                Copy Prompt
              </Button>
            </div>
          </Card>
        )
      case 'Brand Voice':
        return (
          <Card className="border border-white/20 bg-white/40 backdrop-blur-sm dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500">Voice Tone</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                {result.voiceTone}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500">Writing Guidelines</span>
              <div className="space-y-1.5">
                {result.guidelines?.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )
      case 'Typography':
        return (
          <Card className="border border-white/20 bg-white/40 backdrop-blur-sm dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500">Primary Header Font</span>
                <p className="text-base font-extrabold text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100">
                  {result.primaryFont}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500">Secondary Body Font</span>
                <p className="text-base font-medium text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100">
                  {result.secondaryFont}
                </p>
              </div>
            </div>
            <div className="space-y-1 pt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">Usage Guidelines</span>
              <p className="text-xs text-slate-605 dark:text-slate-400 leading-relaxed font-semibold">
                {result.usageGuidelines}
              </p>
            </div>
          </Card>
        )
      case 'Value Proposition':
        return (
          <Card className="border border-white/20 bg-white/40 backdrop-blur-sm dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500">Core Value Proposition</span>
              <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-bold bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100">
                {result.valueProp}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500">Key Benefits</span>
              <div className="space-y-1.5">
                {result.keyBenefits?.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-605 dark:text-slate-400 font-semibold">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )
      default: {
        const textVal = result.bio || result.slogan || result.mission || result.vision || result.story || result.tagline || result.hook
        return (
          <Card className="border border-white/20 bg-white/40 backdrop-blur-sm dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500">Generated Asset Content</span>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100">
                {textVal}
              </p>
            </div>
            {result.explanation && (
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500">Visual Rationale</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  {result.explanation}
                </p>
              </div>
            )}
            {result.targetEmotion && (
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">Target Emotion</span>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                  Emotional leverage: {result.targetEmotion}
                </p>
              </div>
            )}
            <div className="pt-2 flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleCopy(textVal || '', 'text-val')}
                className="rounded-xl text-xs font-bold"
              >
                {copiedKey === 'text-val' ? <Check className="h-4 w-4 text-emerald-500 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                Copy Content
              </Button>
            </div>
          </Card>
        )
      }
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Vertical Categories Navigation Menu */}
      <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
        <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-800/50 mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Identity Suite</span>
        </div>
        {BRAND_SUITE_MENU.map((item) => {
          const isActive = category === item.label
          return (
            <button
              key={item.label}
              disabled={loading}
              onClick={() => {
                setCategory(item.label)
                setResult(null)
                setError(null)
                setSaved(false)
              }}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all outline-none ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'bg-white/40 border-slate-100/60 hover:bg-slate-55/60 text-slate-700 hover:text-slate-900 dark:border-slate-900/65 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-900'
              }`}
            >
              <h4 className="text-xs font-bold tracking-tight">{item.label}</h4>
              <p className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                {item.desc}
              </p>
            </button>
          )
        })}
      </div>

      {/* Right Workbench / Configuration Area */}
      <div className="flex-1 space-y-6">
        <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem]">
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">Asset Workbench</span>
            </div>
            <CardTitle className="text-xl">{category} Generator</CardTitle>
            <CardDescription>Tailor generation constraints for this branding asset.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="directives">Aesthetic Directives (Optional)</Label>
              <textarea
                id="directives"
                rows={3}
                value={customDirective}
                disabled={loading}
                onChange={(e) => setCustomDirective(e.target.value)}
                placeholder="E.g. Make it short, use blue theme colors, enforce minimalist tone, target executive personas..."
                className="w-full rounded-xl border border-slate-200/80 bg-white/60 p-3 text-xs font-semibold placeholder-slate-450 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 outline-none resize-none transition"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs px-6 h-10 shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4.5 w-4.5" />
              {loading ? 'Executing AI Engine...' : `Generate ${category}`}
            </Button>
          </CardContent>
        </Card>

        {/* Results Deck */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-[2.5rem] border border-white/20 bg-white/40 p-8 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/40 space-y-6"
              >
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48 animate-pulse" />
                  <Skeleton className="h-4 w-96 animate-pulse" />
                </div>
                <div className="space-y-4 pt-4">
                  <Skeleton className="h-16 w-full rounded-2xl animate-pulse" />
                  <Skeleton className="h-16 w-full rounded-2xl animate-pulse" />
                </div>
                <div className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 animate-pulse uppercase tracking-[0.2em] mt-6">
                  Resolving prompt context & compiling structured output...
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[2.5rem] border border-rose-200/50 bg-rose-50/10 p-8 backdrop-blur-md dark:border-rose-950/30 dark:bg-rose-950/5 text-center flex flex-col items-center justify-center min-h-[300px]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 mb-4">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-rose-950 dark:text-rose-200">Asset Generation Failure</h3>
                <p className="text-sm text-rose-700/80 dark:text-rose-450 mt-1 max-w-sm leading-relaxed">
                  {error}
                </p>
                <div className="mt-6">
                  <Button onClick={handleGenerate} className="rounded-full px-5 text-xs font-bold h-9">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Retry Generation
                  </Button>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/50 pb-3 dark:border-slate-800/50 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                      Generated {category}
                    </h3>
                    <p className="text-xs text-slate-500">Asset successfully parsed and registered in Firestore.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Share Action */}
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="rounded-xl text-xs font-bold h-9"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>

                    {/* Export Actions */}
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => setShowExportOptions(!showExportOptions)}
                        className="rounded-xl text-xs font-bold h-9"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                        <ChevronDown className="h-4 w-4 ml-1.5" />
                      </Button>
                      <AnimatePresence>
                        {showExportOptions && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setShowExportOptions(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute right-0 mt-1.5 z-35 w-36 rounded-xl border border-slate-200/60 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-950"
                            >
                              <button
                                onClick={() => handleExport('txt')}
                                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                              >
                                Export TXT
                              </button>
                              <button
                                onClick={() => handleExport('md')}
                                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                              >
                                Export Markdown
                              </button>
                              <button
                                onClick={() => handleExport('pdf')}
                                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                              >
                                Print PDF
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Favorite/Save Action */}
                    <Button
                      variant={saved ? 'outline' : 'default'}
                      onClick={handleFavoriteAll}
                      disabled={saved}
                      className="rounded-xl text-xs font-bold h-9"
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      {saved ? 'Shortlisted' : 'Save to Assets'}
                    </Button>
                  </div>
                </div>

                {renderResult()}
              </motion.div>
            )}

            {!loading && !error && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center pt-8"
              >
                <EmptyState
                  icon={Sparkles}
                  title="AI Identity Suite Ready"
                  description="Select a branding assistant menu on the left pane, configure constraints, and execute the generation."
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
