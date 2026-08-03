import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export const CreditsCard: React.FC = () => {
  const currentCredits = 120
  const maxCredits = 200
  const percentage = (currentCredits / maxCredits) * 100

  return (
    <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Zap className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">Usage Profile</span>
        </div>
        <CardTitle className="text-xl">Credits Remaining</CardTitle>
        <CardDescription>Reset cycles occur automatically every month.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 flex-1 flex flex-col justify-between pt-2">
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {currentCredits} <span className="text-sm font-medium text-slate-500">/ {maxCredits} Units</span>
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {percentage}% Left
            </span>
          </div>

          {/* Custom animated progress bar */}
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-850">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-4 dark:border-indigo-950/30 dark:bg-indigo-950/10 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-semibold">
            Premium plan active. Generation calls consume 1 credit unit per request.
          </p>
        </div>

        <Button
          type="button"
          className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs h-10 shadow-md shadow-blue-500/10 mt-2"
        >
          Upgrade Account
        </Button>
      </CardContent>
    </Card>
  )
}
