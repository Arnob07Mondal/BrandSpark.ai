import React from 'react'
import { Sparkles, Image, Palette, FileText, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useToast } from '../../context/ToastContext'

interface QuickActionsProps {
  onNewBrandClick: () => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNewBrandClick }) => {
  const { showToast } = useToast()

  const handleAction = (label: string, isAvailable: boolean) => {
    if (isAvailable) {
      onNewBrandClick()
    } else {
      showToast(`${label} integration is coming soon to BrandSpark.ai!`, 'info')
    }
  }

  return (
    <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Zap className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">Utilities</span>
        </div>
        <CardTitle className="text-xl">Quick Actions</CardTitle>
        <CardDescription>Launch automated brand building tools instantly.</CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-start">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleAction('New Brand Generator', true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-white/60 hover:border-blue-500 hover:bg-slate-50 transition text-center dark:border-slate-850 dark:bg-slate-900/60 dark:hover:border-blue-500 dark:hover:bg-slate-850 group"
          >
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 group-hover:scale-110 transition duration-200 mb-2">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">New Brand</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('AI Logo Generator', false)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-white/60 hover:border-blue-500 hover:bg-slate-50 transition text-center dark:border-slate-850 dark:bg-slate-900/60 dark:hover:border-blue-500 dark:hover:bg-slate-850 group"
          >
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 group-hover:scale-110 transition duration-200 mb-2">
              <Image className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Generate Logo</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('Palette Generator', false)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-white/60 hover:border-blue-500 hover:bg-slate-50 transition text-center dark:border-slate-850 dark:bg-slate-900/60 dark:hover:border-blue-500 dark:hover:bg-slate-850 group"
          >
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 group-hover:scale-110 transition duration-200 mb-2">
              <Palette className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Generate Palette</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('Slogan Architect', true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-white/60 hover:border-blue-500 hover:bg-slate-50 transition text-center dark:border-slate-850 dark:bg-slate-900/60 dark:hover:border-blue-500 dark:hover:bg-slate-850 group"
          >
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 group-hover:scale-110 transition duration-200 mb-2">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Generate Slogan</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
