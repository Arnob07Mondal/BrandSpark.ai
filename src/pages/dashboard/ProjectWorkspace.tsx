import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Layout,
  Sparkles,
  Image,
  History,
  Settings,
  Briefcase,
  Calendar,
  Globe,
  Tag,
  Palette,
  FileText,
  User,
  Trash2,
  Save,
  BookOpen,
} from 'lucide-react'
import { getProject, deleteProject, updateProject } from '../../services/projectService'
import type { Project } from '../../types/project'
import { getProjectFavorites, removeFavorite } from '../../services/favoriteService'
import type { Favorite } from '../../services/favoriteService'
import { getProjectHistory } from '../../services/historyService'
import type { GenerationLog } from '../../services/historyService'
import { EmptyState } from './EmptyState'
import { useToast } from '../../context/ToastContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Skeleton } from '../../components/ui/skeleton'

import { WorkspaceGenerator } from './WorkspaceGenerator'
import { VisualAssets } from './VisualAssets'
import { BrandBookWorkspace } from '../../components/brandBook/BrandBookWorkspace'

interface ProjectWorkspaceProps {
  projectId: string
  onClose: () => void
}

import type { FieldValue, Timestamp } from 'firebase/firestore'

function formatDate(val: FieldValue | Timestamp | Date | null | undefined | unknown): string {
  if (!val) return 'N/A'
  
  const hasToDate = val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => unknown }).toDate === 'function'
  if (hasToDate) {
    const d = (val as { toDate: () => Date }).toDate()
    return d.toLocaleDateString(undefined, { dateStyle: 'long' })
  }
  if (val instanceof Date) {
    return val.toLocaleDateString(undefined, { dateStyle: 'long' })
  }
  return 'N/A'
}

export function ProjectWorkspace({ projectId, onClose }: ProjectWorkspaceProps) {
  const { showToast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Edit Settings states
  const [editName, setEditName] = useState('')
  const [editIndustry, setEditIndustry] = useState('')
  const [editWebsite, setEditWebsite] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // AI Assets and Logs history states
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [historyLogs, setHistoryLogs] = useState<GenerationLog[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // History log filters
  const [historyFilterType, setHistoryFilterType] = useState('all')
  const [historySortOrder, setHistorySortOrder] = useState<'newest' | 'oldest'>('newest')
  const [historyFavoritesOnly, setHistoryFavoritesOnly] = useState(false)

  // Lazy-load favorites when switching to assets tab
  useEffect(() => {
    let active = true
    if (activeTab === 'assets') {
      Promise.resolve().then(() => {
        if (active) setLoadingFavorites(true)
      })
      getProjectFavorites(projectId)
        .then((data) => {
          if (active) setFavorites(data)
        })
        .catch((err) => console.error('Failed to load favorites:', err))
        .finally(() => {
          if (active) setLoadingFavorites(false)
        })
    }
    return () => {
      active = false
    }
  }, [activeTab, projectId])

  // Lazy-load logs when switching to history tab
  useEffect(() => {
    let active = true
    if (activeTab === 'history') {
      Promise.resolve().then(() => {
        if (active) setLoadingHistory(true)
      })
      getProjectHistory(projectId)
        .then((data) => {
          if (active) setHistoryLogs(data)
        })
        .catch((err) => console.error('Failed to load history:', err))
        .finally(() => {
          if (active) setLoadingHistory(false)
        })
    }
    return () => {
      active = false
    }
  }, [activeTab, projectId])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) setLoading(true)
    })
    getProject(projectId)
      .then((data) => {
        if (active) {
          setProject(data)
          if (data) {
            setEditName(data.companyName)
            setEditIndustry(data.industry)
            setEditWebsite(data.website || '')
          }
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Error fetching project:', err)
        if (active) {
          showToast('Failed to load project details.', 'error')
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [projectId, showToast])

  const handleUpdate = async () => {
    if (!editName.trim() || !editIndustry.trim()) {
      showToast('Name and Industry are required.', 'error')
      return
    }
    setIsSaving(true)
    try {
      await updateProject(projectId, {
        companyName: editName,
        industry: editIndustry,
        website: editWebsite.trim() || undefined,
      })
      showToast('Project updated successfully!', 'success')
      // Refresh local state
      if (project) {
        setProject({
          ...project,
          companyName: editName,
          industry: editIndustry,
          website: editWebsite.trim() || undefined,
        })
      }
    } catch (err) {
      console.error('Failed to update project:', err)
      showToast('Failed to update settings.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      return
    }
    setIsDeleting(true)
    try {
      await deleteProject(projectId)
      showToast('Project deleted successfully.', 'success')
      onClose()
    } catch (err) {
      console.error('Failed to delete project:', err)
      showToast('Failed to delete project.', 'error')
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="space-y-4 w-full max-w-lg p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-2xl animate-pulse" />
          <Skeleton className="h-32 w-full rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <Card className="max-w-md w-full border border-slate-200/50 bg-white/40 p-6 backdrop-blur-md dark:border-slate-800/45 dark:bg-slate-950/40 rounded-[2rem] text-center">
          <h3 className="text-lg font-bold">Project Not Found</h3>
          <p className="text-sm text-slate-500 mt-2">The workspace directory was not located.</p>
          <Button onClick={onClose} className="mt-4 rounded-xl">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  // Pre-fill parameters mapping for the generator form
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {/* Business Card */}
            <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem]">
              <CardHeader>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Briefcase className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">Summary</span>
                </div>
                <CardTitle className="text-xl">Company Profile</CardTitle>
                <CardDescription>Visual preferences and identity attributes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <span className="text-slate-500">Name</span>
                  <span className="text-slate-850 dark:text-slate-200">{project.companyName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <span className="text-slate-500">Industry</span>
                  <span className="text-slate-850 dark:text-slate-200">{project.industry}</span>
                </div>
                {project.website && (
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                    <span className="text-slate-500">Website</span>
                    <span className="text-slate-850 dark:text-slate-200">{project.website}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <span className="text-slate-500 block">Core Mission</span>
                  <p className="text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                    {project.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Target Audience Card */}
            <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem]">
              <CardHeader>
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Globe className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">Audience</span>
                </div>
                <CardTitle className="text-xl">Market Segment</CardTitle>
                <CardDescription>Geographic targets and demographic values.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <span className="text-slate-500">Target Country</span>
                  <span className="text-slate-850 dark:text-slate-200">{project.country}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <span className="text-slate-500">Demographic Age</span>
                  <span className="text-slate-850 dark:text-slate-200">{project.ageGroup}</span>
                </div>
                <div className="space-y-2">
                  <span className="text-slate-500 block">User Persona description</span>
                  <p className="text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                    {project.targetAudience}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Brand Settings preferences */}
            <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Tag className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">Branding</span>
                </div>
                <CardTitle className="text-xl">Voice & Style Prefs</CardTitle>
                <CardDescription>Personality tags and visual rules mapping.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-3 text-xs font-semibold">
                <div className="space-y-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <User className="h-4 w-4" /> Personality Voice
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.brandPersonality.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Palette className="h-4 w-4" /> Brand Palette
                  </span>
                  <span className="text-slate-805 dark:text-slate-200 block text-xs font-bold bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                    {project.primaryColors}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" /> Styling Archetype
                  </span>
                  <span className="text-slate-805 dark:text-slate-200 block text-xs font-bold bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                    {project.logoStyle} logo | {project.typography}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      case 'generator':
        return <WorkspaceGenerator projectId={projectId} />
      case 'visual':
        return <VisualAssets projectId={projectId} />
      case 'book':
        return <BrandBookWorkspace projectId={projectId} />
      case 'assets':
        if (loadingFavorites) {
          return (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-2xl animate-pulse" />
              <Skeleton className="h-16 w-full rounded-2xl animate-pulse" />
            </div>
          )
        }
        if (favorites.length === 0) {
          return (
            <EmptyState
              icon={Image}
              title="No generated assets yet"
              description="Run the AI Generator tab to formulate brand story elements, slogan cards and custom naming packs."
              actionLabel="Open Generator"
              onAction={() => setActiveTab('generator')}
            />
          )
        }
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-200/50 pb-3 dark:border-slate-800/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">Shortlisted Brand Assets</h3>
              <p className="text-xs text-slate-500">Review all generated assets saved during identity builder cycles.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {favorites.map((fav) => (
                <div
                  key={fav.favoriteId}
                  className="rounded-3xl border border-slate-100 bg-white/60 p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900/60 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">{fav.name}</h4>
                        <span className="inline-block rounded-lg bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950/30 border border-blue-100/50 mt-1.5 uppercase tracking-wider">
                          {fav.generationType}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await removeFavorite(fav.favoriteId)
                            setFavorites((prev) => prev.filter((item) => item.favoriteId !== fav.favoriteId))
                            showToast(`Removed "${fav.name}" from shortlist.`, 'info')
                          } catch {
                            showToast('Failed to remove favorite.', 'error')
                          }
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:bg-slate-950 dark:hover:bg-rose-950/20 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Conditional sub-render of favorite payload */}
                    {(() => {
                      const res = fav.response as {
                        brandNames?: Array<{ name: string; meaning: string; whyItFits: string; score: number }>
                        colors?: Array<{ hex: string; name: string; role: string }>
                        slogan?: string
                        tagline?: string
                        mission?: string
                        vision?: string
                        story?: string
                        logoPrompt?: string
                        voiceTone?: string
                        primaryFont?: string
                        valueProp?: string
                        explanation?: string
                      } | null | undefined
                      if (!res) return null

                      if (fav.generationType === 'Brand Name') {
                        return (
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Meaning</p>
                              <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                                {fav.meaning || res.brandNames?.[0]?.meaning}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Why It Works</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                {fav.whyItFits || res.brandNames?.[0]?.whyItFits}
                              </p>
                            </div>
                          </div>
                        )
                      }

                      if (fav.generationType === 'Color Palette' && res.colors) {
                        return (
                          <div className="grid grid-cols-4 gap-2 pt-1">
                            {res.colors.map((c: { name: string; hex: string; role: string }, idx: number) => (
                              <div key={idx} className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 text-center text-[9px] font-bold">
                                <div className="h-8 w-full" style={{ backgroundColor: c.hex }} />
                                <div className="p-1 bg-white dark:bg-slate-900 truncate">{c.name}</div>
                              </div>
                            ))}
                          </div>
                        )
                      }

                      const val = res.slogan || res.tagline || res.mission || res.vision || res.story || res.logoPrompt || res.voiceTone || res.primaryFont || res.valueProp || fav.name
                      return (
                        <div className="space-y-1 pt-1">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">Content</p>
                          <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed font-semibold bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                            {val}
                          </p>
                          {res.explanation && (
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Rationale: {res.explanation}</p>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'history': {
        if (loadingHistory) {
          return (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-2xl animate-pulse" />
              <Skeleton className="h-16 w-full rounded-2xl animate-pulse" />
            </div>
          )
        }
        
        const filteredHistory = historyLogs
          .filter((log) => {
            const displayType = log.generationType === 'brand-name' ? 'Brand Name' : log.generationType
            if (historyFilterType !== 'all' && displayType !== historyFilterType) {
              return false
            }
            if (historyFavoritesOnly) {
              return favorites.some((fav) => JSON.stringify(fav.response) === JSON.stringify(log.response))
            }
            return true
          })
          .sort((a, b) => {
            const tsA = a.createdAt as { seconds?: number; toMillis?: () => number } | null | undefined
            const tsB = b.createdAt as { seconds?: number; toMillis?: () => number } | null | undefined
            const timeA = tsA?.seconds || tsA?.toMillis?.() || 0
            const timeB = tsB?.seconds || tsB?.toMillis?.() || 0
            return historySortOrder === 'newest' ? timeB - timeA : timeA - timeB
          })

        const displayHistoryTypeMap = (typeStr: string) => {
          return typeStr === 'brand-name' ? 'Brand Name' : typeStr
        }

        return (
          <div className="space-y-6">
            <div className="border-b border-slate-200/50 pb-3 dark:border-slate-800/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">Project Log History</h3>
              <p className="text-xs text-slate-500">Review past query execution details and response logs.</p>
            </div>

            {/* Filter and Sort Toolbar Panel */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Filter</label>
                <select
                  value={historyFilterType}
                  onChange={(e) => setHistoryFilterType(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 outline-none"
                >
                  <option value="all">All Category Types</option>
                  <option value="Brand Name">Brand Name</option>
                  <option value="Slogan">Slogan</option>
                  <option value="Tagline">Tagline</option>
                  <option value="Mission Statement">Mission Statement</option>
                  <option value="Vision Statement">Vision Statement</option>
                  <option value="Brand Story">Brand Story</option>
                  <option value="Brand Voice">Brand Voice</option>
                  <option value="Color Palette">Color Palette</option>
                  <option value="Typography">Typography</option>
                  <option value="Logo Prompt">Logo Prompt</option>
                </select>
              </div>

              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sorting</label>
                <select
                  value={historySortOrder}
                  onChange={(e) => setHistorySortOrder(e.target.value as 'newest' | 'oldest')}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="favorites-only"
                  checked={historyFavoritesOnly}
                  onChange={(e) => setHistoryFavoritesOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="favorites-only" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Favorites Only
                </label>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <EmptyState
                icon={History}
                title="No logs match filters"
                description="Adjust your logs category selections or toggle the favorites criteria switcher."
              />
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((log) => (
                  <div
                    key={log.generationId}
                    className="rounded-2xl border border-slate-100 bg-white/60 p-4 shadow-sm dark:border-slate-850 dark:bg-slate-900/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100/50 uppercase tracking-wider">
                        {displayHistoryTypeMap(log.generationType)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {log.createdAt ? formatDate(log.createdAt) : 'Just now'}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-550 dark:text-slate-405">
                        <span className="font-extrabold text-slate-700 dark:text-slate-205">Model:</span> {log.model} ({log.generationTime}ms)
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100/40 truncate max-w-2xl font-mono">
                        {JSON.stringify(log.response)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }
      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl space-y-6"
          >
            <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem]">
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
                <CardDescription>Rename your brand project workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="editName">Company Name</Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded-xl border-slate-200/80 dark:border-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editIndustry">Industry</Label>
                  <Input
                    id="editIndustry"
                    value={editIndustry}
                    onChange={(e) => setEditIndustry(e.target.value)}
                    className="rounded-xl border-slate-200/80 dark:border-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editWebsite">Website (Optional)</Label>
                  <Input
                    id="editWebsite"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="rounded-xl border-slate-200/80 dark:border-slate-800"
                  />
                </div>

                <Button
                  onClick={handleUpdate}
                  disabled={isSaving}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs px-5 shadow-sm mt-2"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-rose-100/50 bg-rose-50/10 backdrop-blur-md shadow-lg dark:border-rose-950/30 dark:bg-rose-950/5 rounded-[2rem]">
              <CardHeader>
                <CardTitle className="text-lg text-rose-600 dark:text-rose-450">Danger Zone</CardTitle>
                <CardDescription>Irreversible configuration actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-rose-700/80 dark:text-rose-400 font-semibold leading-relaxed">
                  Deleting this project will permanently delete all metadata profile attributes and associated files from Firestore.
                </p>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-full bg-gradient-to-r from-rose-500 to-red-600 hover:opacity-95 text-white font-bold text-xs px-5 shadow-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Project Workspace'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* 1. Left Sidebar Workspace Navigation */}
      <aside className="hidden lg:flex flex-col h-full w-64 border-r border-slate-200/50 bg-white/40 p-5 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/40">
        <div className="mb-6">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition dark:hover:text-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Brand Group */}
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
            BrandSpark<span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">.ai</span>
          </span>
        </div>

        {/* Tabs navigation list */}
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition outline-none ${
              activeTab === 'overview'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/40'
            }`}
          >
            {activeTab === 'overview' && (
              <motion.div
                layoutId="activeWorkspaceTabIndicator"
                className="absolute inset-0 rounded-xl bg-blue-50/50 border border-blue-100/50 dark:bg-blue-950/20 dark:border-blue-900/30"
              />
            )}
            <Layout className="relative z-10 h-4.5 w-4.5" />
            <span className="relative z-10">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition outline-none ${
              activeTab === 'generator'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/40'
            }`}
          >
            {activeTab === 'generator' && (
              <motion.div
                layoutId="activeWorkspaceTabIndicator"
                className="absolute inset-0 rounded-xl bg-blue-50/50 border border-blue-100/50 dark:bg-blue-950/20 dark:border-blue-900/30"
              />
            )}
            <Sparkles className="relative z-10 h-4.5 w-4.5" />
            <span className="relative z-10">AI Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('visual')}
            className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition outline-none ${
              activeTab === 'visual'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/40'
            }`}
          >
            {activeTab === 'visual' && (
              <motion.div
                layoutId="activeWorkspaceTabIndicator"
                className="absolute inset-0 rounded-xl bg-blue-50/50 border border-blue-100/50 dark:bg-blue-950/20 dark:border-blue-900/30"
              />
            )}
            <Palette className="relative z-10 h-4.5 w-4.5" />
            <span className="relative z-10">Visual Assets</span>
          </button>

          <button
            onClick={() => setActiveTab('book')}
            className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition outline-none ${
              activeTab === 'book'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/40'
            }`}
          >
            {activeTab === 'book' && (
              <motion.div
                layoutId="activeWorkspaceTabIndicator"
                className="absolute inset-0 rounded-xl bg-blue-50/50 border border-blue-100/50 dark:bg-blue-950/20 dark:border-blue-900/30"
              />
            )}
            <BookOpen className="relative z-10 h-4.5 w-4.5" />
            <span className="relative z-10">Brand Book</span>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition outline-none ${
              activeTab === 'assets'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/40'
            }`}
          >
            {activeTab === 'assets' && (
              <motion.div
                layoutId="activeWorkspaceTabIndicator"
                className="absolute inset-0 rounded-xl bg-blue-50/50 border border-blue-100/50 dark:bg-blue-950/20 dark:border-blue-900/30"
              />
            )}
            <Image className="relative z-10 h-4.5 w-4.5" />
            <span className="relative z-10">Generated Assets</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition outline-none ${
              activeTab === 'history'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/40'
            }`}
          >
            {activeTab === 'history' && (
              <motion.div
                layoutId="activeWorkspaceTabIndicator"
                className="absolute inset-0 rounded-xl bg-blue-50/50 border border-blue-100/50 dark:bg-blue-950/20 dark:border-blue-900/30"
              />
            )}
            <History className="relative z-10 h-4.5 w-4.5" />
            <span className="relative z-10">History</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition outline-none ${
              activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/40'
            }`}
          >
            {activeTab === 'settings' && (
              <motion.div
                layoutId="activeWorkspaceTabIndicator"
                className="absolute inset-0 rounded-xl bg-blue-50/50 border border-blue-100/50 dark:bg-blue-950/20 dark:border-blue-900/30"
              />
            )}
            <Settings className="relative z-10 h-4.5 w-4.5" />
            <span className="relative z-10">Settings</span>
          </button>
        </nav>
      </aside>

      {/* 2. Main content workspace shell */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Topbar for project stats */}
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-200/50 bg-white/40 px-6 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/40 relative z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/60 bg-white/60 text-slate-500 hover:bg-slate-50 lg:hidden dark:border-slate-800/80 dark:bg-slate-900/60"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-50 truncate">
                  {project.companyName}
                </h1>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 uppercase tracking-wider shrink-0">
                  {project.status}
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">
                Industry: {project.industry}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[10px] font-semibold text-slate-450 dark:text-slate-450">
            <span className="hidden sm:flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Created {formatDate(project.createdAt)}
            </span>
          </div>
        </header>

        {/* Main Work Content tab items */}
        <main className="flex-1 overflow-y-auto px-6 py-6 outline-none">
          {/* Mobile subnavigation bar tab headers */}
          <div className="flex items-center gap-1 border-b border-slate-200/50 pb-3 mb-6 lg:hidden overflow-x-auto">
            {['overview', 'generator', 'visual', 'book', 'assets', 'history', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-550 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/50'
                }`}
              >
                {tab === 'generator' ? 'Generator' : tab === 'visual' ? 'Visuals' : tab === 'book' ? 'Brand Book' : tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
