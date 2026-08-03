import { ArrowUp, ArrowDown, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import type { BrandBookSection } from '../../services/brandBook/brandBookService'
import type { BrandCompleteness } from '../../services/brandBook/brandBookBuilder'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Label } from '../ui/label'

interface BrandBookSidebarProps {
  sections: BrandBookSection[]
  setSections: React.Dispatch<React.SetStateAction<BrandBookSection[]>>
  theme: 'Modern' | 'Minimal' | 'Corporate' | 'Creative' | 'Luxury'
  setTheme: (t: 'Modern' | 'Minimal' | 'Corporate' | 'Creative' | 'Luxury') => void
  completeness: BrandCompleteness
}

export function BrandBookSidebar({
  sections,
  setSections,
  theme,
  setTheme,
  completeness,
}: BrandBookSidebarProps) {
  // Toggle section visibility
  const handleToggleVisibility = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    )
  }

  // Edit section heading title
  const handleRenameHeading = (id: string, newTitle: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    )
  }

  // Move section position in book order
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === sections.length - 1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[newIndex]
    newSections[newIndex] = temp
    setSections(newSections)
  }

  return (
    <div className="w-full lg:w-80 shrink-0 space-y-6">
      {/* 1. Theme Configuration Card */}
      <Card className="border border-white/20 bg-white/40 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem]">
        <CardHeader>
          <CardTitle className="text-sm">Design Styling</CardTitle>
          <CardDescription>Select a layout template theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label htmlFor="bookTheme">Aesthetic Theme</Label>
            <select
              id="bookTheme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'Modern' | 'Minimal' | 'Corporate' | 'Creative' | 'Luxury')}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 outline-none"
            >
              <option value="Modern">Modern (Clean & Vibrant)</option>
              <option value="Minimal">Minimal (Clean Mono)</option>
              <option value="Corporate">Corporate (Midnight Professional)</option>
              <option value="Creative">Creative (Contrast & Gradients)</option>
              <option value="Luxury">Luxury (Elegant Slate Gold)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 2. Brand Book Completeness Score */}
      <Card className="border border-white/20 bg-white/45 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem]">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            Completeness Score
          </CardTitle>
          <CardDescription>Evaluates available identity assets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full border-4 border-slate-100 flex items-center justify-center relative shadow-inner">
              <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                {completeness.score}%
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold">Project State Log</h4>
              <p className="text-[10px] text-slate-450 mt-0.5">
                {completeness.score === 100 ? 'Brand ready for compile!' : 'Missing core components.'}
              </p>
            </div>
          </div>

          {completeness.missing.length > 0 && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/10 p-3 flex gap-2 dark:border-amber-900/30">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Missing Assets</p>
                <div className="flex flex-wrap gap-1">
                  {completeness.missing.map((m) => (
                    <span key={m} className="inline-block rounded bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 text-[8px] font-bold text-amber-700">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Section Sorter Workbench */}
      <Card className="border border-white/20 bg-white/40 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem]">
        <CardHeader>
          <CardTitle className="text-sm">Page Structuring</CardTitle>
          <CardDescription>Show, hide, reorder, or rename chapters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 bg-white/50 dark:bg-slate-950/50 transition ${
                section.visible ? 'border-slate-100 dark:border-slate-850' : 'border-slate-100/40 opacity-55'
              }`}
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisibility(section.id)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Ch {index + 1}
                  </span>
                </div>
                <input
                  type="text"
                  value={section.title}
                  disabled={!section.visible}
                  onChange={(e) => handleRenameHeading(section.id, e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none border-b border-transparent focus:border-slate-200 dark:text-slate-255 dark:focus:border-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1 shrink-0">
                <button
                  disabled={index === 0}
                  onClick={() => handleMoveSection(index, 'up')}
                  className="p-1 rounded hover:bg-slate-50 text-slate-400 disabled:opacity-30 dark:hover:bg-slate-900"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  disabled={index === sections.length - 1}
                  onClick={() => handleMoveSection(index, 'down')}
                  className="p-1 rounded hover:bg-slate-50 text-slate-400 disabled:opacity-30 dark:hover:bg-slate-900"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
