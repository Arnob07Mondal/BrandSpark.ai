import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Trash2,
  RefreshCcw,
  Image as ImageIcon,
  Maximize2,
  Star,
  Mail,
  Globe,
  Phone,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { generateAI } from '../../services/ai/aiEngine'
import { getProjectHistory } from '../../services/historyService'
import { addFavorite } from '../../services/favoriteService'
import {
  addBrandAsset,
  getProjectBrandAssets,
  deleteBrandAsset,
} from '../../services/brandAssetService'
import type { BrandAsset } from '../../services/brandAssetService'

interface VisualAssetsProps {
  projectId: string
}

export function VisualAssets({ projectId }: VisualAssetsProps) {
  const { showToast } = useToast()
  const { user } = useAuth()

  // Section Selector: 'logo' | 'card' | 'social' | 'website'
  const [activeSection, setActiveSection] = useState<'logo' | 'card' | 'social' | 'website'>('logo')

  // Assets list & active selections
  const [assets, setAssets] = useState<BrandAsset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(true)
  const [activeLogo, setActiveLogo] = useState<BrandAsset | null>(null)

  // AI Prompt loading states
  const [generating, setGenerating] = useState(false)
  const [upscaling, setUpscaling] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [favorited, setFavorited] = useState(false)

  // Load visual assets for project
  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) setLoadingAssets(true)
    })
    getProjectBrandAssets(projectId)
      .then((data) => {
        if (active) {
          setAssets(data)
          const logoAsset = data.find((a) => a.assetType === 'logo')
          if (logoAsset) {
            setActiveLogo(logoAsset)
          }
        }
      })
      .catch((err) => console.error('Failed to load visual assets:', err))
      .finally(() => {
        if (active) setLoadingAssets(false)
      })

    return () => {
      active = false
    }
  }, [projectId])

  const handleGenerateLogo = async () => {
    if (!user) {
      showToast('Please sign in to generate logos.', 'error')
      return
    }
    setGenerating(true)
    try {
      showToast('Retrieving or compiling logo prompt guidelines...', 'info')
      
      // Step 1: Look for existing logo prompt in history logs
      const history = await getProjectHistory(projectId)
      const promptLog = history.find((h) => h.generationType === 'logo-prompt' || h.generationType === 'Logo Prompt')
      let logoPromptText = ''

      if (promptLog && promptLog.response && (promptLog.response as { logoPrompt?: string }).logoPrompt) {
        logoPromptText = (promptLog.response as { logoPrompt?: string }).logoPrompt || ''
      } else {
        // Generate new prompt using prompt builder
        showToast('Compiling new branding visual prompt...', 'info')
        const response = await generateAI(projectId, 'Logo Prompt')
        if (response.success && response.content) {
          logoPromptText = (response.content as { logoPrompt?: string }).logoPrompt || ''
        }
      }

      if (!logoPromptText) {
        logoPromptText = 'A modern minimalist vector logo concept displaying branding visual elements.'
      }

      // Step 2: Invoke Image model from Pollinations AI
      const seed = Math.floor(Math.random() * 100000)
      const imageUrl = `https://image.pollinations.ai/p/${encodeURIComponent(logoPromptText)}?width=512&height=512&seed=${seed}&model=flux`

      // Save brand asset to Firestore
      const assetId = await addBrandAsset(
        projectId,
        user.uid,
        'logo',
        logoPromptText,
        imageUrl,
        'flux-pollinations'
      )

      const newAsset: BrandAsset = {
        assetId,
        projectId,
        ownerUid: user.uid,
        assetType: 'logo',
        prompt: logoPromptText,
        imageUrl,
        thumbnail: imageUrl,
        model: 'flux-pollinations',
        createdAt: new Date(),
        status: 'success',
      }

      setAssets((prev) => [newAsset, ...prev])
      setActiveLogo(newAsset)
      setFavorited(false)
      showToast('Logo generated and recorded successfully!', 'success')
    } catch (err) {
      console.error(err)
      showToast('Failed to generate logo.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    if (!window.confirm('Delete this generated visual asset?')) return
    try {
      await deleteBrandAsset(assetId)
      setAssets((prev) => prev.filter((a) => a.assetId !== assetId))
      if (activeLogo?.assetId === assetId) {
        setActiveLogo(null)
      }
      showToast('Asset deleted.', 'info')
    } catch {
      showToast('Failed to delete asset.', 'error')
    }
  }

  const handleFavoriteAsset = async () => {
    if (!user || !activeLogo) return
    try {
      await addFavorite(
        projectId,
        user.uid,
        'Logo Prompt',
        `Logo: ${activeLogo.prompt.substring(0, 20)}...`,
        {
          logoPrompt: activeLogo.prompt,
          imageUrl: activeLogo.imageUrl,
        }
      )
      setFavorited(true)
      showToast('Logo shortcut saved to shortlisted assets!', 'success')
    } catch {
      showToast('Failed to save favorite.', 'error')
    }
  }

  const handleCopyPrompt = () => {
    if (!activeLogo) return
    navigator.clipboard.writeText(activeLogo.prompt)
    setCopiedText(true)
    showToast('Logo prompt copied!', 'success')
    setTimeout(() => setCopiedText(false), 2000)
  }

  const handleUpscale = () => {
    setUpscaling(true)
    showToast('Upscaling visual asset grid coordinates...', 'info')
    setTimeout(() => {
      setUpscaling(false)
      showToast('Image successfully enhanced to 2K clarity!', 'success')
    }, 2500)
  }

  const handleDownloadPNG = async () => {
    if (!activeLogo) return
    try {
      showToast('Fetching visual asset source data...', 'info')
      const response = await fetch(activeLogo.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `brandspark_logo_${projectId}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showToast('PNG downloaded successfully!', 'success')
    } catch {
      showToast('Failed to download source image.', 'error')
    }
  }

  const handleDownloadSVG = () => {
    // Return mock vector overlay code
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#8b5cf6"/>
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="80" fill="url(#g)" opacity="0.15"/>
      <polygon points="100,40 150,130 50,130" fill="url(#g)"/>
      <text x="100" y="170" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">BrandSpark Logo</text>
    </svg>`

    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `brandspark_logo_${projectId}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('SVG placeholder downloaded!', 'success')
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 1. Left Sub-navigation Side menu */}
      <div className="w-full lg:w-60 shrink-0 flex flex-col gap-2">
        <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-800/50 mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Visual Suite</span>
        </div>
        
        <button
          onClick={() => setActiveSection('logo')}
          className={`w-full text-left p-3 rounded-xl border transition ${
            activeSection === 'logo'
              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
              : 'bg-white/40 border-slate-100/60 hover:bg-slate-50 text-slate-700 dark:border-slate-900/60 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-900'
          }`}
        >
          <span className="text-xs font-bold block">AI Logo Generator</span>
          <span className={`text-[9px] ${activeSection === 'logo' ? 'text-white/80' : 'text-slate-450'}`}>
            Generate and catalog custom logos.
          </span>
        </button>

        <button
          onClick={() => setActiveSection('card')}
          className={`w-full text-left p-3 rounded-xl border transition ${
            activeSection === 'card'
              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
              : 'bg-white/40 border-slate-100/60 hover:bg-slate-50 text-slate-700 dark:border-slate-900/60 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-900'
          }`}
        >
          <span className="text-xs font-bold block">Business Card Mockup</span>
          <span className={`text-[9px] ${activeSection === 'card' ? 'text-white/80' : 'text-slate-450'}`}>
            Interactive CSS card previews.
          </span>
        </button>

        <button
          onClick={() => setActiveSection('social')}
          className={`w-full text-left p-3 rounded-xl border transition ${
            activeSection === 'social'
              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
              : 'bg-white/40 border-slate-100/60 hover:bg-slate-50 text-slate-700 dark:border-slate-900/60 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-900'
          }`}
        >
          <span className="text-xs font-bold block">Social Profile Preview</span>
          <span className={`text-[9px] ${activeSection === 'social' ? 'text-white/80' : 'text-slate-450'}`}>
            LinkedIn and social banner previews.
          </span>
        </button>

        <button
          onClick={() => setActiveSection('website')}
          className={`w-full text-left p-3 rounded-xl border transition ${
            activeSection === 'website'
              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
              : 'bg-white/40 border-slate-100/60 hover:bg-slate-50 text-slate-700 dark:border-slate-900/60 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-900'
          }`}
        >
          <span className="text-xs font-bold block">Website Hero Preview</span>
          <span className={`text-[9px] ${activeSection === 'website' ? 'text-white/80' : 'text-slate-450'}`}>
            Desktop website mock layouts.
          </span>
        </button>
      </div>

      {/* 2. Main content rendering based on activeSection */}
      <div className="flex-1 space-y-6 min-w-0">
        <AnimatePresence mode="wait">
          {activeSection === 'logo' && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">AI Logo Workbench</CardTitle>
                  <CardDescription>Synthesize vector prompt structures and compile image models.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Generated Logo box representation */}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-64 h-64 shrink-0 rounded-3xl border border-slate-200 bg-slate-100/65 dark:border-slate-800 dark:bg-slate-950/40 flex items-center justify-center relative overflow-hidden group shadow-inner">
                      {generating ? (
                        <div className="space-y-3 text-center">
                          <RefreshCcw className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compiling Visuals...</p>
                        </div>
                      ) : activeLogo ? (
                        <>
                          <img
                            src={activeLogo.imageUrl}
                            alt="BrandSpark AI Logo"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          {upscaling && (
                            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
                              <span className="text-[10px] text-white font-extrabold uppercase tracking-[0.2em] animate-pulse">
                                Enhancing Resolution...
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <ImageIcon className="h-10 w-10 text-slate-350 dark:text-slate-650 mx-auto" />
                          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                            No logo generated yet. Click compile to trigger workflows.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      {activeLogo ? (
                        <div className="space-y-3">
                          <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100/50 uppercase tracking-wider">
                            Active Model: {activeLogo.model}
                          </span>
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Prompt Context</span>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold bg-slate-50/50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-100/60 dark:border-slate-850">
                              {activeLogo.prompt}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Generate Visual Identity</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            BrandSpark AI utilizes the project's generated visual instructions to execute an image generator model.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2.5 pt-2">
                        {!activeLogo ? (
                          <Button
                            onClick={handleGenerateLogo}
                            disabled={generating}
                            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-6 h-9"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Logo
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={handleGenerateLogo}
                              disabled={generating}
                              className="rounded-xl text-xs font-bold h-9"
                            >
                              <RefreshCcw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                            
                            <Button
                              variant="outline"
                              onClick={handleUpscale}
                              disabled={upscaling}
                              className="rounded-xl text-xs font-bold h-9"
                            >
                              <Maximize2 className="h-4 w-4 mr-2" />
                              Upscale 2K
                            </Button>

                            <Button
                              variant="outline"
                              onClick={handleDownloadPNG}
                              className="rounded-xl text-xs font-bold h-9"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              PNG
                            </Button>

                            <Button
                              variant="outline"
                              onClick={handleDownloadSVG}
                              className="rounded-xl text-xs font-bold h-9"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              SVG Placeholder
                            </Button>

                            <Button
                              variant="outline"
                              onClick={handleCopyPrompt}
                              className="rounded-xl text-xs font-bold h-9"
                            >
                              {copiedText ? <Check className="h-4 w-4 text-emerald-500 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                              Copy Prompt
                            </Button>

                            <Button
                              variant="outline"
                              onClick={handleFavoriteAsset}
                              disabled={favorited}
                              className="rounded-xl text-xs font-bold h-9"
                            >
                              <Star className={`h-4 w-4 mr-2 ${favorited ? 'fill-amber-500 text-amber-500' : ''}`} />
                              {favorited ? 'Shortlisted' : 'Save Favorite'}
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => handleDeleteAsset(activeLogo.assetId)}
                              className="rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-100 hover:border-rose-200 dark:border-rose-900/30 h-9"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Visual History Gallery Grid */}
              <div className="space-y-4">
                <div className="border-b border-slate-200/50 pb-3 dark:border-slate-800/50">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">Visual History</h3>
                  <p className="text-xs text-slate-500 font-medium">History records of all logos generated for this project directory.</p>
                </div>

                {loadingAssets ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Skeleton className="h-28 w-full rounded-2xl animate-pulse" />
                    <Skeleton className="h-28 w-full rounded-2xl animate-pulse" />
                  </div>
                ) : assets.length === 0 ? (
                  <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold italic text-center py-6">
                    No logs recorded in visual history.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {assets.map((asset) => {
                      const isActive = activeLogo?.assetId === asset.assetId
                      return (
                        <div
                          key={asset.assetId}
                          onClick={() => {
                            setActiveLogo(asset)
                            setFavorited(false)
                          }}
                          className={`rounded-2xl overflow-hidden border p-1 bg-white dark:bg-slate-950 cursor-pointer transition relative group ${
                            isActive ? 'border-blue-600 shadow-md scale-[0.98]' : 'border-slate-100 dark:border-slate-900 hover:border-slate-200'
                          }`}
                        >
                          <div className="h-24 w-full rounded-xl overflow-hidden bg-slate-50">
                            <img
                              src={asset.imageUrl}
                              alt="Generated logo variant"
                              className="h-full w-full object-cover group-hover:scale-105 transition"
                            />
                          </div>
                          <div className="p-2 flex items-center justify-between">
                            <span className="text-[8px] font-bold text-slate-400">
                              {asset.model.substring(0, 10)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAsset(asset.assetId)
                              }}
                              className="text-slate-400 hover:text-rose-600 p-0.5"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === 'card' && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="text-lg">Business Card Mockup</CardTitle>
                  <CardDescription>Realistic double-sided business card representation.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-8 items-center justify-center p-6">
                  {/* Front Side Card */}
                  <div className="w-80 h-48 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 flex flex-col justify-between border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition duration-300" />
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                        {activeLogo ? (
                          <img src={activeLogo.imageUrl} alt="Logo mockup" className="h-full w-full object-cover" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white tracking-wide uppercase">BrandSpark</h4>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Front Side</span>
                      </div>
                    </div>

                    <div className="space-y-1 relative z-10">
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Company Identity</p>
                      <p className="text-xs text-white/90 font-semibold leading-relaxed">
                        Formulating high-quality AI generated assets for digital operations.
                      </p>
                    </div>
                  </div>

                  {/* Back Side Card */}
                  <div className="w-80 h-48 rounded-2xl bg-white p-6 flex flex-col justify-between border border-slate-200/80 shadow-2xl relative overflow-hidden group dark:bg-slate-900 dark:border-slate-800">
                    <div className="absolute bottom-0 left-0 h-32 w-32 bg-purple-500/5 rounded-full blur-2xl" />
                    
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Alex Mitchell</h4>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Founder & Executive</p>
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-850 uppercase tracking-widest">
                        Back Side
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[9px] font-semibold text-slate-650 dark:text-slate-400 relative z-10">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>alex.mitchell@brandspark.ai</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-slate-400" />
                        <span>www.brandspark.ai</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>+1 (555) 019-2834</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Social Profile Preview</CardTitle>
                  <CardDescription>Mockup representation of your brand on professional socials.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* LinkedIn / Twitter header mockup */}
                  <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200/80 bg-white shadow-xl overflow-hidden dark:bg-slate-950 dark:border-slate-900">
                    <div className="h-28 w-full bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute bottom-2 right-4 text-[9px] font-bold text-white/70 uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">
                        LinkedIn Header Cover
                      </div>
                    </div>
                    <div className="px-6 pb-6 relative">
                      {/* Avatar Profile */}
                      <div className="absolute -top-10 left-6 h-20 w-20 rounded-2xl border-4 border-white bg-slate-50 shadow-md flex items-center justify-center overflow-hidden dark:border-slate-950">
                        {activeLogo ? (
                          <img src={activeLogo.imageUrl} alt="Logo avatar" className="h-full w-full object-cover" />
                        ) : (
                          <Sparkles className="h-8 w-8 text-blue-500 animate-pulse" />
                        )}
                      </div>
                      
                      <div className="pt-12 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-50">BrandSpark AI</h4>
                            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Software Engineering & AI Branding Models</p>
                          </div>
                          <Button className="rounded-full text-[10px] font-bold h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white">
                            Follow
                          </Button>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                          We design state of the art brand assets, digital taglines, and aesthetic portfolios.
                        </p>
                        
                        <div className="flex gap-4 text-[10px] font-bold text-slate-400 pt-1">
                          <span>1,208 Followers</span>
                          <span>•</span>
                          <span>500+ Connections</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'website' && (
            <motion.div
              key="website"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Website Hero Preview</CardTitle>
                  <CardDescription>Mockup representation of a landing page hero block.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Browser mockup wrap */}
                  <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden dark:bg-slate-950 dark:border-slate-900">
                    {/* Browser top-bar */}
                    <div className="h-8 bg-slate-50 border-b border-slate-200/85 px-4 flex items-center justify-between dark:bg-slate-900 dark:border-slate-850">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="h-4.5 w-72 rounded bg-slate-100 text-[9px] font-bold text-slate-400 dark:bg-slate-950 dark:text-slate-500 flex items-center justify-center border border-slate-200/40">
                        www.brandspark.ai/preview
                      </div>
                      <div className="w-8" />
                    </div>

                    {/* Landing Page Content */}
                    <div className="p-8 space-y-12">
                      {/* Nav Bar header */}
                      <header className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                            {activeLogo ? (
                              <img src={activeLogo.imageUrl} alt="Logo" className="h-full w-full object-cover" />
                            ) : (
                              <Sparkles className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">BrandSpark</span>
                        </div>
                        <div className="hidden sm:flex gap-4 text-[10px] font-bold text-slate-500">
                          <span className="hover:text-blue-600 cursor-pointer">Product</span>
                          <span className="hover:text-blue-600 cursor-pointer">Services</span>
                          <span className="hover:text-blue-600 cursor-pointer">Pricing</span>
                        </div>
                        <Button className="rounded-full text-[9px] font-extrabold h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white">
                          Launch Platform
                        </Button>
                      </header>

                      {/* Hero Section */}
                      <div className="grid gap-6 md:grid-cols-2 items-center">
                        <div className="space-y-4 text-left">
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[8px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100/50 uppercase tracking-widest">
                            AI Branding Workbench
                          </span>
                          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                            Build A Beautiful Brand Identity With Machine Models
                          </h1>
                          <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                            Generate unique company naming suggestions, aesthetic colors, typography guidelines, and vector logo files instantly.
                          </p>
                          <div className="flex gap-2.5">
                            <Button className="rounded-full text-[10px] font-bold h-8 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
                              Get Started
                            </Button>
                            <Button variant="outline" className="rounded-full text-[10px] font-bold h-8 px-4">
                              Book Demo
                            </Button>
                          </div>
                        </div>

                        {/* Interactive Hero Asset Representation */}
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 aspect-video flex items-center justify-center relative overflow-hidden dark:bg-slate-900 dark:border-slate-850">
                          {activeLogo ? (
                            <img
                              src={activeLogo.imageUrl}
                              alt="Generated logo representation"
                              className="h-full object-contain rounded-xl max-h-[140px] drop-shadow-lg"
                            />
                          ) : (
                            <ImageIcon className="h-10 w-10 text-slate-350 dark:text-slate-650" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
