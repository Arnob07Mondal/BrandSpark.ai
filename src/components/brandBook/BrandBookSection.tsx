import { Sparkles, Mail, Globe, Phone } from 'lucide-react'
import type { BrandBookSection as SectionType } from '../../services/brandBook/brandBookService'
import { THEME_CONFIGS } from '../../services/brandBook/brandBookTemplates'

interface BrandBookSectionProps {
  section: SectionType
  theme: 'Modern' | 'Minimal' | 'Corporate' | 'Creative' | 'Luxury'
  visibleSections: SectionType[]
}

interface SectionContent {
  companyName?: string
  industry?: string
  website?: string
  description?: string
  brandNames?: Array<{ name: string; meaning: string; score: number }>
  imageUrl?: string
  prompt?: string
  logoPrompt?: string
  styleNotes?: string
  colors?: Array<{ name: string; hex: string; role: string }>
  primaryFont?: string
  secondaryFont?: string
  usageGuidelines?: string
  mission?: string
  vision?: string
  story?: string
  voiceTone?: string
  guidelines?: string[]
  slogan?: string
  explanation?: string
  logoUrl?: string
  updatedAt?: string
}

export function BrandBookSection({ section, theme, visibleSections }: BrandBookSectionProps) {
  const config = THEME_CONFIGS[theme]
  const res = section.content as SectionContent

  if (!res && section.id !== 'toc') {
    return (
      <div className={`p-8 text-center italic border border-dashed rounded-2xl ${config.backgroundClass}`}>
        <p className="text-xs text-slate-400">
          (This section content is empty. Generate the asset inside the generator workbench first to compile it here.)
        </p>
      </div>
    )
  }

  switch (section.id) {
    case 'cover':
      return (
        <div className={`h-[500px] flex flex-col justify-between p-12 rounded-[2rem] shadow-xl relative overflow-hidden ${config.coverBgClass} ${config.fontFamily}`}>
          <div className="absolute top-0 right-0 h-48 w-48 bg-white/5 rounded-full blur-3xl" />
          <div className="space-y-2">
            <span className={config.subtitleClass}>{res?.industry} Brand Guidelines</span>
            <h1 className={`${config.titleClass} mt-2`}>{res?.companyName}</h1>
          </div>
          {res?.logoUrl && (
            <div className="h-28 w-28 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-3 overflow-hidden shadow-inner mx-auto my-6">
              <img src={res.logoUrl} alt="Logo" className="h-full w-full object-contain" />
            </div>
          )}
          <div className="flex justify-between items-end text-[10px] font-bold tracking-wider opacity-80 pt-4 border-t border-white/10">
            <span>{res?.website || 'brandspark.ai'}</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      )

    case 'toc': {
      const list = visibleSections.filter(s => s.id !== 'cover' && s.id !== 'toc')
      return (
        <div className={`space-y-6 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <div className="space-y-3 pt-2">
            {list.map((item, idx) => (
              <div key={item.id} className="flex justify-between items-center text-xs font-semibold border-b border-slate-100/10 pb-1.5">
                <span className="opacity-80">{idx + 1}. {item.title}</span>
                <span className="text-[10px] font-bold text-slate-400">Page {idx + 3}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'overview':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <p className={config.bodyTextClass}>{res?.description}</p>
        </div>
      )

    case 'name':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {res?.brandNames?.map((n: { name: string; meaning: string; score: number }, idx: number) => (
              <div key={idx} className={config.cardClass}>
                <h4 className="text-sm font-extrabold tracking-tight">{n.name}</h4>
                <p className={`${config.bodyTextClass} mt-2`}>
                  <span className="font-bold opacity-80 uppercase tracking-widest text-[9px] block">Meaning</span>
                  {n.meaning}
                </p>
                <p className={`${config.bodyTextClass} mt-2`}>
                  <span className="font-bold opacity-80 uppercase tracking-widest text-[9px] block">Memorability</span>
                  Score: {n.score}/10
                </p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'logo':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <div className="flex flex-col items-center justify-center p-6 border border-slate-100 bg-white/5 rounded-3xl shadow-inner">
            <img src={res?.imageUrl} alt="Core Logo" className="max-h-48 rounded-2xl shadow-md object-contain" />
            <p className="text-[10px] text-slate-450 mt-4 text-center max-w-md font-semibold leading-relaxed">
              Prompt Guidelines: {res?.prompt}
            </p>
          </div>
        </div>
      )

    case 'logo-variations': {
      const vars = section.content as Array<{ imageUrl: string; model: string }> | null | undefined
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {vars?.map((v: { imageUrl: string; model: string }, idx: number) => (
              <div key={idx} className="p-2 border border-slate-100/50 bg-white/5 rounded-2xl flex items-center justify-center aspect-square shadow-sm">
                <img src={v.imageUrl} alt="Variation" className="max-h-24 object-contain" />
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'logo-guidelines':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Rendering Prompt</span>
              <p className={config.bodyTextClass}>{res?.logoPrompt}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Usage Rules & Guidelines</span>
              <p className={config.bodyTextClass}>{res?.styleNotes}</p>
            </div>
          </div>
        </div>
      )

    case 'palette':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {res?.colors?.map((c: { name: string; hex: string; role: string }, idx: number) => (
              <div key={idx} className="rounded-2xl overflow-hidden border border-slate-100 bg-white/5 shadow-sm">
                <div className="h-12 w-full" style={{ backgroundColor: c.hex }} />
                <div className="p-3 text-[10px] font-bold">
                  <p className="truncate">{c.name}</p>
                  <p className="text-slate-400 font-semibold mt-0.5">{c.role}</p>
                  <p className="text-slate-400 font-mono text-[9px] mt-1 bg-slate-50 dark:bg-slate-900 p-1 rounded text-center border border-slate-100/40">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'typography':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={config.cardClass}>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Primary Header Font</span>
              <h3 className="text-lg font-bold mt-1.5">{res.primaryFont}</h3>
            </div>
            <div className={config.cardClass}>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Secondary Body Font</span>
              <h3 className="text-lg font-medium mt-1.5">{res.secondaryFont}</h3>
            </div>
          </div>
          <div className="space-y-1 pt-2">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Usage Instructions</span>
            <p className={config.bodyTextClass}>{res.usageGuidelines}</p>
          </div>
        </div>
      )

    case 'mission':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <p className={`${config.bodyTextClass} italic text-sm p-4 border-l-4 ${config.accentBorderClass}`}>
            "{res.mission}"
          </p>
        </div>
      )

    case 'vision':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <p className={`${config.bodyTextClass} italic text-sm p-4 border-l-4 ${config.accentBorderClass}`}>
            "{res.vision}"
          </p>
        </div>
      )

    case 'story':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <p className={config.bodyTextClass}>{res.story}</p>
        </div>
      )

    case 'voice':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Voice Tone & Style</span>
              <p className={config.bodyTextClass}>{res.voiceTone}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Writing Guidelines</span>
              {res.guidelines?.map((item: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-550 dark:text-slate-400 font-semibold">
                  <span className="text-purple-500 font-bold">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'slogan':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <div className="space-y-3">
            <p className="text-base font-extrabold text-slate-900 dark:text-white">"{res.slogan}"</p>
            {res.explanation && (
              <p className={config.bodyTextClass}>{res.explanation}</p>
            )}
          </div>
        </div>
      )

    case 'website':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-md max-w-md mx-auto text-left text-xs dark:bg-slate-950 dark:border-slate-850">
            <header className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1">
                {res.logoUrl && <img src={res.logoUrl} alt="Logo" className="h-5 w-5 object-contain" />}
                <span className="font-bold uppercase tracking-wider">{res.companyName}</span>
              </div>
              <div className="flex gap-2 text-[9px] font-bold text-slate-400">
                <span>Product</span>
                <span>About</span>
              </div>
            </header>
            <div className="py-6 space-y-3">
              <h4 className="text-sm font-extrabold">Build Your Dynamic Branding Deliverables</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Generate high-quality slogans, typographic pairings and guidelines context instantly.
              </p>
            </div>
          </div>
        </div>
      )

    case 'card':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center py-4">
            {/* Business card preview */}
            <div className="w-64 h-36 rounded-xl bg-slate-900 text-white p-4 flex flex-col justify-between border border-white/10 shadow">
              <div className="flex items-center gap-2">
                {res.logoUrl && <img src={res.logoUrl} alt="Logo" className="h-6 w-6 object-contain" />}
                <span className="text-[10px] font-extrabold uppercase tracking-wide">{res.companyName}</span>
              </div>
              <p className="text-[8px] text-slate-400 tracking-wider">{res.website}</p>
            </div>
            
            <div className="w-64 h-36 rounded-xl bg-white text-slate-900 border border-slate-250 p-4 flex flex-col justify-between shadow dark:bg-slate-950 dark:border-slate-850 dark:text-white">
              <div className="space-y-0.5">
                <h4 className="text-[10px] font-extrabold">Alex Mitchell</h4>
                <p className="text-[8px] text-slate-400 uppercase tracking-widest">Executive Director</p>
              </div>
              <div className="space-y-1 text-[8px] font-semibold text-slate-500">
                <div className="flex items-center gap-1.5"><Mail className="h-2.5 w-2.5" /> alex@brandspark.ai</div>
                <div className="flex items-center gap-1.5"><Globe className="h-2.5 w-2.5" /> {res.website}</div>
                <div className="flex items-center gap-1.5"><Phone className="h-2.5 w-2.5" /> +1 (555) 019-2834</div>
              </div>
            </div>
          </div>
        </div>
      )

    case 'social':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow overflow-hidden max-w-md mx-auto text-xs dark:bg-slate-950 dark:border-slate-900">
            <div className="h-20 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="p-4 relative">
              <div className="absolute -top-7 left-4 h-12 w-12 rounded-xl border-2 border-white bg-slate-50 shadow flex items-center justify-center overflow-hidden dark:border-slate-950">
                {res.logoUrl ? <img src={res.logoUrl} alt="Logo" className="h-full w-full object-cover" /> : <Sparkles className="h-5 w-5 text-blue-500" />}
              </div>
              <div className="pt-6 space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white">{res.companyName}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  Professional software brand identity system details.
                </p>
              </div>
            </div>
          </div>
        </div>
      )

    case 'summary':
      return (
        <div className={`space-y-4 ${config.fontFamily}`}>
          <h2 className={config.headingClass}>{section.title}</h2>
          <div className="space-y-2 pt-2">
            <p className={config.bodyTextClass}>
              This brand book compiled guidelines, stylesheets, and assets for <strong>{res.companyName}</strong>. 
            </p>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide">
              Document compilation timestamp: {res.updatedAt}
            </p>
          </div>
        </div>
      )

    default:
      return null
  }
}
