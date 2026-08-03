import { useMemo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  RefreshCcw,
  Building2,
  Copy,
  Check,
  AlertCircle,
  BookOpen,
  Lightbulb,
  Loader2,
  ExternalLink,
  Download,
  Trash2,
  History,
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { generateBrand } from '../services/gemini'
import type { GeneratedBrand, BrandName } from '../services/gemini'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

type BrandStyle = 'Modern' | 'Luxury' | 'Minimal' | 'Tech' | 'Creative' | 'Fun'

type FormValues = {
  businessType: string
  keywords: string
  brandStyle: BrandStyle | ''
}

interface HistoryItem {
  id: string
  timestamp: number
  input: FormValues
  result: GeneratedBrand
}

const initialValues: FormValues = {
  businessType: '',
  keywords: '',
  brandStyle: '',
}

const brandStyles: BrandStyle[] = ['Modern', 'Luxury', 'Minimal', 'Tech', 'Creative', 'Fun']

// Impure functions declared at module scope to avoid React purity rule warnings
function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function getTimestamp(): number {
  return Date.now()
}

// Framer Motion Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 110,
      damping: 15,
    },
  },
}

// Custom Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 mt-8 w-full"
    >
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="mt-2 h-4 w-96 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[2rem] border border-slate-200/50 bg-white/40 p-6 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/40 animate-pulse space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
          <div className="h-7 w-48 bg-slate-300 dark:bg-slate-700 rounded"></div>
          <div className="space-y-3 pt-2">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-11/12 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
        
        <div className="rounded-[2rem] border border-slate-200/50 bg-white/40 p-6 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/40 animate-pulse space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
          <div className="h-7 w-36 bg-slate-300 dark:bg-slate-700 rounded"></div>
          <div className="space-y-3 pt-2">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-11/12 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-[1.8rem] border border-slate-200/50 bg-white/40 p-6 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/40 animate-pulse space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-6 w-28 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="h-5 w-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
              </div>
              <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-10 w-full bg-slate-200/60 dark:bg-slate-900/60 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

interface BrandFormProps {
  initialValues?: FormValues
}

export function BrandForm({ initialValues: propInitialValues }: BrandFormProps = {}) {
  const [formValues, setFormValues] = useState<FormValues>(() => {
    return propInitialValues || initialValues
  })

  useEffect(() => {
    if (propInitialValues) {
      Promise.resolve().then(() => {
        setFormValues(propInitialValues)
      })
    }
  }, [propInitialValues])

  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})
  
  // Loading and results states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GeneratedBrand | null>(null)
  
  // Custom global toast hook
  const { showToast } = useToast()
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  // LocalStorage history state (lazily initialized to satisfy React compiler effect constraints)
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('brandspark_history')
      return savedHistory ? JSON.parse(savedHistory) : []
    } catch {
      return []
    }
  })

  const [copiedName, setCopiedName] = useState<string | null>(null)

  const isFormValid = useMemo(() => {
    return (
      Boolean(formValues.businessType.trim()) &&
      Boolean(formValues.keywords.trim()) &&
      Boolean(formValues.brandStyle)
    )
  }, [formValues])

  // Save new search to history
  const saveToHistory = useCallback((input: FormValues, generated: GeneratedBrand) => {
    const newItem: HistoryItem = {
      id: generateId(),
      timestamp: getTimestamp(),
      input,
      result: generated,
    }
    setHistory((prev) => {
      // Filter out duplicate queries with exact inputs to keep list diverse
      const filtered = prev.filter(
        (item) =>
          !(
            item.input.businessType.toLowerCase() === input.businessType.toLowerCase() &&
            item.input.keywords.toLowerCase() === input.keywords.toLowerCase() &&
            item.input.brandStyle === input.brandStyle
          )
      )
      const nextHistory = [newItem, ...filtered].slice(0, 5)
      localStorage.setItem('brandspark_history', JSON.stringify(nextHistory))
      return nextHistory
    })
  }, [])

  const handleRestoreHistory = (item: HistoryItem) => {
    setFormValues(item.input)
    setResult(item.result)
    setError(null)
    setErrors({})
    showToast(`Restored design architecture for "${item.input.businessType}"!`, 'info')
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem('brandspark_history')
    showToast('Search history cleared.', 'info')
  }

  const handleChange = (field: keyof FormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setError(null)
  }

  const validate = useCallback(() => {
    const nextErrors: Partial<Record<keyof FormValues, string>> = {}

    if (!formValues.businessType.trim()) {
      nextErrors.businessType = 'Business type is required.'
    }

    if (!formValues.keywords.trim()) {
      nextErrors.keywords = 'Keywords are required.'
    }

    if (!formValues.brandStyle) {
      nextErrors.brandStyle = 'Please choose a brand style.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [formValues])

  // Core Submit Action (called from form submit and shortcuts)
  const triggerBrandGeneration = useCallback(async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const generated = await generateBrand(
        formValues.businessType,
        formValues.keywords,
        formValues.brandStyle
      )
      setResult(generated)
      saveToHistory(formValues, generated)
      showToast('Brand identity generated successfully!')
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred while generating your brand concepts.'
      setError(errMsg)
      showToast(errMsg, 'error')
    } finally {
      setLoading(false)
    }
  }, [formValues, saveToHistory, showToast])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    triggerBrandGeneration()
  }

  const handleClear = () => {
    setFormValues(initialValues)
    setErrors({})
    setError(null)
    setResult(null)
  }

  // Keyboard shortcut hook for Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElem = document.activeElement
        if (
          activeElem &&
          (activeElem.tagName === 'INPUT' ||
            activeElem.tagName === 'SELECT' ||
            activeElem.id === 'brandStyle')
        ) {
          e.preventDefault()
          if (isFormValid && !loading) {
            triggerBrandGeneration()
          } else if (!isFormValid) {
            validate()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFormValid, loading, triggerBrandGeneration, validate])

  // Formatted output helpers for sharing/download
  const formatResultsText = (
    vals: FormValues,
    brandStory: string,
    brandNames: BrandName[],
    brandingTips: string[]
  ) => {
    return `=== BRANDSPARK AI PROFILE ===
Business Type: ${vals.businessType}
Keywords: ${vals.keywords}
Selected Style: ${vals.brandStyle}
Generated Timestamp: ${new Date().toLocaleString()}

=========================================
THE BRAND STORY
=========================================
${brandStory}

=========================================
BRAND NAME CANDIDATES (10)
=========================================
${brandNames
  .map(
    (b, idx) =>
      `${idx + 1}. Name: ${b.name}\n   Tagline: "${b.tagline}"\n   Suggested Domain: ${b.domain}`
  )
  .join('\n\n')}

=========================================
BRANDING GUIDELINES
=========================================
${brandingTips.map((tip, idx) => `${idx + 1}. ${tip}`).join('\n')}
`
  }

  const handleCopyAll = () => {
    if (!result) return
    const text = formatResultsText(
      formValues,
      result.brandStory,
      result.brandNames,
      result.brandingTips
    )
    navigator.clipboard.writeText(text)
    showToast('All brand results copied to clipboard!')
  }

  const handleDownloadTxt = () => {
    if (!result) return
    const text = formatResultsText(
      formValues,
      result.brandStory,
      result.brandNames,
      result.brandingTips
    )
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const sanitizedName = formValues.businessType.replace(/\s+/g, '-').toLowerCase()
    link.download = `brandspark-${sanitizedName}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('Identity profile downloaded successfully!')
  }

  const handleCopyCard = (brand: BrandName) => {
    const textToCopy = `Brand Name: ${brand.name}\nTagline: ${brand.tagline}\nSuggested Domain: ${brand.domain}`
    navigator.clipboard.writeText(textToCopy)
    setCopiedName(brand.name)
    setTimeout(() => setCopiedName(null), 2000)
    showToast(`Copied details for "${brand.name}"!`)
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Premium Navbar */}
      <nav className="flex items-center justify-between border-b border-slate-200/50 py-4 dark:border-slate-800/50 relative">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            BrandSpark<span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">.ai</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500"></span>
            Gemini 3.5 Flash Active
          </span>

          {user && (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 p-1 pr-3 hover:bg-slate-50 hover:border-slate-300 transition dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:bg-slate-800"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-7 w-7 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-[10px] font-bold text-white uppercase shrink-0">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden md:inline truncate max-w-[100px]">
                  {user.displayName || 'Account'}
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 z-20 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95"
                    >
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800/80">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            className="h-10 w-10 rounded-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-sm font-bold text-white uppercase shrink-0">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate">
                            {user.displayName || 'User'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setProfileOpen(false)
                            setShowLogoutConfirm(true)
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100/70 transition dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="text-center py-12 sm:py-16 space-y-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
            ✨ Next-Gen Brand Architect
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-slate-50 leading-tight"
        >
          Spark Your Next{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Brand Story
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
        >
          Instantly generate name candidates, strategic taglines, domain suggestions, and custom guidelines matching your business and style profile.
        </motion.p>
      </div>

      {/* Main Grid: Input Form and Interactive Preview */}
      <main className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {/* Input Card */}
          <Card className="overflow-hidden border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem]">
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-[0.2em]">Brand Setup</span>
              </div>
              <CardTitle className="text-2xl">Tell us about your business</CardTitle>
              <CardDescription>
                Provide the context needed for our AI. Press <kbd className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1 text-xs">Ctrl + Enter</kbd> to generate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input
                    id="businessType"
                    placeholder="Example: Coffee Shop, Fintech App"
                    className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-800 dark:focus:border-blue-400"
                    value={formValues.businessType}
                    onChange={(event) => handleChange('businessType', event.target.value)}
                    disabled={loading}
                  />
                  {errors.businessType ? (
                    <p className="text-sm text-rose-500">{errors.businessType}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="organic, premium, minimal, tech"
                    className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-800 dark:focus:border-blue-400"
                    value={formValues.keywords}
                    onChange={(event) => handleChange('keywords', event.target.value)}
                    disabled={loading}
                  />
                  {errors.keywords ? (
                    <p className="text-sm text-rose-500">{errors.keywords}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandStyle">Brand Style</Label>
                  <Select
                    value={formValues.brandStyle}
                    onValueChange={(value) => handleChange('brandStyle', value)}
                    disabled={loading}
                  >
                    <SelectTrigger id="brandStyle" className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-800 dark:focus:border-blue-400">
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-xl border-slate-200 dark:border-slate-800">
                      {brandStyles.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.brandStyle ? (
                    <p className="text-sm text-rose-500">{errors.brandStyle}</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 20px -10px rgba(59, 130, 246, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!isFormValid || loading}
                    className="flex-1 flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 text-sm font-semibold text-white shadow-md hover:opacity-95 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Brand
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleClear}
                    disabled={loading}
                    className="flex-1 flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Clear Form
                  </motion.button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* LocalStorage History Panel */}
          {history.length > 0 && (
            <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <History className="h-4.5 w-4.5" />
                    <span className="text-sm font-semibold uppercase tracking-[0.2em]">History</span>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    onClick={handleClearHistory}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg">Recent Brand Designs</CardTitle>
                <CardDescription>Restore the parameters and results of your last five requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/60 p-3 text-left transition hover:border-blue-500 dark:border-slate-800/60 dark:bg-slate-900/60 hover:dark:border-blue-500"
                      onClick={() => handleRestoreHistory(item)}
                      disabled={loading}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          {item.input.businessType}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          Keywords: {item.input.keywords}
                        </p>
                      </div>
                      <span className="ml-3 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-650 dark:bg-slate-800 dark:text-slate-350">
                        {item.input.brandStyle}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Preview Panel / Error Display */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {error ? (
              // Error Card
              <motion.div
                key="error-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-[2rem] border border-rose-200/60 bg-rose-50/30 p-8 text-center shadow-sm backdrop-blur-md dark:border-rose-950/30 dark:bg-rose-950/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50">
                  <AlertCircle className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-rose-950 dark:text-rose-200">
                  Generation Failed
                </h3>
                <p className="mt-2 text-sm text-rose-700/80 dark:text-rose-400/80 max-w-xs leading-relaxed">
                  {error}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 border-rose-200 bg-white text-rose-800 hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-950 dark:text-rose-300 rounded-full px-5"
                  onClick={triggerBrandGeneration}
                >
                  Try Again
                </Button>
              </motion.div>
            ) : (
              // Default Preview Card
              !loading && (
                <motion.div
                  key="preview-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full"
                >
                  <Card className="h-full border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem]">
                    <CardHeader>
                      <CardTitle className="text-2xl">Profile Live Preview</CardTitle>
                      <CardDescription>
                        Check your input selections dynamic breakdown before triggering AI.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-slate-200/60 bg-white/50 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                          Business Type
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
                          {formValues.businessType || 'Your Business'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200/60 bg-white/50 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                          Keywords
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
                          {formValues.keywords || 'Add Keywords'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200/60 bg-white/50 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                          Brand Style
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
                          {formValues.brandStyle || 'Choose Style'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Loading Skeleton Transition */}
      <AnimatePresence mode="wait">
        {loading ? <LoadingSkeleton key="pulse-skeleton" /> : null}
      </AnimatePresence>

      {/* Generated Brand Identity Area */}
      <AnimatePresence>
        {result && !loading ? (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="mt-8 space-y-8"
          >
            {/* Divider Header */}
            <div className="border-b border-slate-200 pb-4 dark:border-slate-800 flex flex-wrap gap-4 items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
                  Your Brand Spark Identity
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Explore your generated narrative, strategic guidelines, and brand name candidates.
                </p>
              </div>

              {/* Finishing Touches Utility Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2 border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-900 text-xs font-bold"
                  onClick={handleCopyAll}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2 border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-900 text-xs font-bold"
                  onClick={handleDownloadTxt}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download TXT
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="rounded-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold shadow-sm"
                  onClick={triggerBrandGeneration}
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Narrative and Tips Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Brand Story Card */}
              <Card className="border-t-4 border-t-blue-500 border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                      The Narrative
                    </span>
                  </div>
                  <CardTitle className="text-2xl">Brand Story</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-medium">
                    {result.brandStory}
                  </p>
                </CardContent>
              </Card>

              {/* Branding Tips Card */}
              <Card className="border-t-4 border-t-purple-500 border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <Lightbulb className="h-5 w-5" />
                    <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                      Strategy
                    </span>
                  </div>
                  <CardTitle className="text-2xl">Branding Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="space-y-4">
                    {result.brandingTips.map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-50 text-xs font-semibold text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
                           {idx + 1}
                        </span>
                        <span className="leading-tight font-medium">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Names & Taglines responsive grid */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  Brand Name Concepts (10)
                </h3>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {result.brandNames.map((brand: BrandName, index: number) => (
                  <motion.div
                    key={brand.name + index}
                    variants={itemVariants}
                    whileHover={{
                      y: -5,
                      boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.05), 0 10px 10px -5px rgba(139, 92, 246, 0.05)',
                    }}
                    className="relative flex flex-col justify-between overflow-hidden rounded-[1.8rem] border border-white/20 bg-white/40 backdrop-blur-md p-6 shadow-sm transition-all duration-300 dark:border-slate-800/40 dark:bg-slate-950/40"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                          {brand.name}
                        </h4>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                          .com
                        </span>
                      </div>
                      <p className="mt-3 text-sm italic font-medium text-slate-600 dark:text-slate-400">
                        "{brand.tagline}"
                      </p>
                      
                      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white/60 p-2.5 text-xs font-mono text-slate-600 dark:bg-slate-900/60 dark:text-slate-400 border border-slate-100 dark:border-slate-800/50">
                        <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="text-slate-400 shrink-0">Domain:</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold truncate">
                          {brand.domain}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full gap-2 text-xs font-semibold h-9 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
                        onClick={() => handleCopyCard(brand)}
                      >
                        {copiedName === brand.name ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Copied Details!
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-slate-500" />
                            <span>Copy Details</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      {/* Logout Confirmation Dialog Modal Overlay */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-slate-950/60">
            {/* Modal backdrop click trigger to close modal */}
            <div className="absolute inset-0" onClick={() => setShowLogoutConfirm(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative z-10 w-full max-w-sm rounded-[2rem] border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95"
            >
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-150 dark:bg-rose-950/50">
                  <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight">Confirm Sign Out</h3>
                <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                  Are you sure you want to sign out? You will need to authenticate again to generate brand architectures.
                </p>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl h-10 text-xs font-bold"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </Button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="flex-1 rounded-xl h-10 bg-gradient-to-r from-rose-500 to-red-600 text-xs font-bold text-white shadow-sm hover:opacity-95"
                  onClick={async () => {
                    setShowLogoutConfirm(false)
                    try {
                      await logout()
                      showToast('Successfully signed out.', 'info')
                    } catch {
                      showToast('Failed to sign out. Please try again.', 'error')
                    }
                  }}
                >
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/50 px-2 py-6 text-center text-sm text-slate-600 dark:border-slate-800/50 dark:text-slate-400 sm:flex-row">
        <p>© 2026 BrandSpark AI. Premium Brand Architect.</p>
        <p>Responsive • Accessible • Theme Aware</p>
      </footer>
    </div>
  )
}
