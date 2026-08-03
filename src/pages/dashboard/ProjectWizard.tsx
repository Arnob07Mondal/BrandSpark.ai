import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { createProject } from '../../services/projectService'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

interface ProjectWizardProps {
  onClose: () => void
  onSuccess: (projectId: string) => void
}

const PERSONALITY_OPTIONS = [
  'Modern',
  'Luxury',
  'Professional',
  'Friendly',
  'Playful',
  'Minimal',
  'Bold',
  'Elegant',
  'Innovative',
  'Premium',
]

const LOGO_STYLES = ['Minimalist', 'Emblem', 'Wordmark', 'Mascot', 'Abstract', 'Iconic']
const TYPOGRAPHY_STYLES = ['Serif (Classic)', 'Sans-Serif (Modern)', 'Slab Serif (Bold)', 'Monospace (Tech)', 'Script (Elegant)']
const AGE_GROUPS = ['Gen Z (10-25)', 'Millennials (26-41)', 'Gen X (42-57)', 'Boomers (58+)', 'All Age Groups']

export function ProjectWizard({ onClose, onSuccess }: ProjectWizardProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form State
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  
  const [targetAudience, setTargetAudience] = useState('')
  const [country, setCountry] = useState('')
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[4])

  const [brandPersonality, setBrandPersonality] = useState<string[]>([])
  
  const [primaryColors, setPrimaryColors] = useState('')
  const [logoStyle, setLogoStyle] = useState(LOGO_STYLES[0])
  const [typography, setTypography] = useState(TYPOGRAPHY_STYLES[1])

  const [description, setDescription] = useState('')

  const handleNext = () => {
    // Basic validation
    if (step === 1 && (!companyName.trim() || !industry.trim())) {
      showToast('Please enter Company Name and Industry.', 'error')
      return
    }
    if (step === 2 && (!targetAudience.trim() || !country.trim())) {
      showToast('Please describe your target audience and country.', 'error')
      return
    }
    if (step === 3 && brandPersonality.length === 0) {
      showToast('Please select at least one brand personality tag.', 'error')
      return
    }
    if (step === 4 && !primaryColors.trim()) {
      showToast('Please specify primary colors.', 'error')
      return
    }
    if (step === 5 && !description.trim()) {
      showToast('Please fill out the brand description.', 'error')
      return
    }

    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const handlePersonalityToggle = (option: string) => {
    setBrandPersonality((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    )
  }

  const handleSubmit = async () => {
    if (!user) return
    setLoading(true)
    try {
      const project = await createProject({
        ownerUid: user.uid,
        companyName,
        industry,
        website: website.trim() || undefined,
        targetAudience,
        country,
        ageGroup,
        brandPersonality,
        primaryColors,
        logoStyle,
        typography,
        description,
      })
      showToast('Project created successfully!', 'success')
      onSuccess(project.projectId)
    } catch (err) {
      console.error('Failed to create project:', err)
      showToast('Failed to create project. Please check permissions.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / 6) * 100

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Business Information</h3>
              <p className="text-xs text-slate-500">Provide the foundational identity values of your brand.</p>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="rounded-xl border-slate-200/80 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, Real Estate"
                  className="rounded-xl border-slate-200/80 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. www.acme.co"
                  className="rounded-xl border-slate-200/80 dark:border-slate-800"
                />
              </div>
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Target Audience</h3>
              <p className="text-xs text-slate-500">Outline the audience segment profile for marketing targeting.</p>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="targetAudience">Audience Description *</Label>
                <Input
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Young software engineers looking for productive work tools"
                  className="rounded-xl border-slate-200/80 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country">Target Country / Market *</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States, Global"
                  className="rounded-xl border-slate-200/80 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ageGroup">Target Age Group</Label>
                <select
                  id="ageGroup"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 outline-none"
                >
                  {AGE_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Brand Personality</h3>
              <p className="text-xs text-slate-500">Select multiple personality characteristics that fit your brand voice.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 pt-3 max-h-[220px] overflow-y-auto pr-1">
              {PERSONALITY_OPTIONS.map((option) => {
                const selected = brandPersonality.includes(option)
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handlePersonalityToggle(option)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition outline-none ${
                      selected
                        ? 'border-blue-500 bg-blue-50/20 text-blue-650 dark:bg-blue-950/20 dark:text-blue-400'
                        : 'border-slate-150 bg-white/40 text-slate-650 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900/40 dark:hover:bg-slate-850'
                    }`}
                  >
                    <span>{option}</span>
                    {selected && <Check className="h-4 w-4 text-blue-500" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Brand Preferences</h3>
              <p className="text-xs text-slate-500">Configure visual themes, color accents and logo architectures.</p>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="primaryColors">Primary Colors *</Label>
                <Input
                  id="primaryColors"
                  value={primaryColors}
                  onChange={(e) => setPrimaryColors(e.target.value)}
                  placeholder="e.g. Neon Blue and Dark Slate (#00F0FF, #1E293B)"
                  className="rounded-xl border-slate-200/80 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="logoStyle">Preferred Logo Style</Label>
                <select
                  id="logoStyle"
                  value={logoStyle}
                  onChange={(e) => setLogoStyle(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 outline-none"
                >
                  {LOGO_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="typography">Typography Style</Label>
                <select
                  id="typography"
                  value={typography}
                  onChange={(e) => setTypography(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 outline-none"
                >
                  {TYPOGRAPHY_STYLES.map((typo) => (
                    <option key={typo} value={typo}>
                      {typo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )
      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Brand Description</h3>
              <p className="text-xs text-slate-500">Explain the core activities, purpose, and utility of your business.</p>
            </div>
            
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="description">What does your business do? *</Label>
              <textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your brand's core mission, products, services and unique selling propositions in detail..."
                className="w-full rounded-2xl border border-slate-200/80 bg-white/60 p-4 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 outline-none resize-none transition"
              />
            </div>
          </motion.div>
        )
      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Review Specifications</h3>
              <p className="text-xs text-slate-500">Confirm all configured settings before compiling your branding slot.</p>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-900/40 text-xs font-semibold max-h-[220px] overflow-y-auto pr-1">
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-200/40 dark:border-slate-800/40">
                <span className="text-slate-450 dark:text-slate-500">Company</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200 font-bold">{companyName}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-200/40 dark:border-slate-800/40">
                <span className="text-slate-450 dark:text-slate-500">Industry</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200 font-bold">{industry}</span>
              </div>
              {website && (
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-200/40 dark:border-slate-800/40">
                  <span className="text-slate-450 dark:text-slate-500">Website</span>
                  <span className="col-span-2 text-slate-800 dark:text-slate-200 truncate">{website}</span>
                </div>
              )}
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-200/40 dark:border-slate-800/40">
                <span className="text-slate-450 dark:text-slate-500">Audience</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200 leading-relaxed truncate">{targetAudience}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-200/40 dark:border-slate-800/40">
                <span className="text-slate-450 dark:text-slate-500">Geography / Age</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200">{country} ({ageGroup})</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-200/40 dark:border-slate-800/40">
                <span className="text-slate-450 dark:text-slate-500">Personality</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200">{brandPersonality.join(', ')}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-200/40 dark:border-slate-800/40">
                <span className="text-slate-450 dark:text-slate-500">Visual Settings</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200">{logoStyle} Logo | {typography}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5">
                <span className="text-slate-450 dark:text-slate-500">Colors</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200">{primaryColors}</span>
              </div>
            </div>
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-slate-950/60">
      {/* Background shadow click close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main card box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/95 shadow-2xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95"
      >
        {/* Progress bar line */}
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-900">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em]">Workspace Wizard</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Card className="border-none bg-transparent shadow-none">
          <CardContent className="px-6 py-4">
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

            {/* Action buttons */}
            <div className="mt-8 flex gap-3 border-t border-slate-100 pt-5 dark:border-slate-800/60">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="rounded-xl h-10 px-4 text-xs font-bold"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              
              {step < 6 ? (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={handleNext}
                  className="flex-1 rounded-xl h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-bold text-white shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 hover:opacity-95"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex-1 rounded-xl h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-bold text-white shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </motion.button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
