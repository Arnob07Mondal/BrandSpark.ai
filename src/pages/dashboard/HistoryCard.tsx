import React, { useState } from 'react'
import { History, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import type { GeneratedBrand } from '../../services/gemini'

interface HistoryItem {
  id: string
  timestamp: number
  input: {
    businessType: string
    keywords: string
    brandStyle: string
  }
  result: GeneratedBrand
}

interface HistoryCardProps {
  onRestore: (item: HistoryItem) => void
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ onRestore }) => {
  const [history] = useState<HistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('brandspark_history')
      return savedHistory ? JSON.parse(savedHistory) : []
    } catch {
      return []
    }
  })

  return (
    <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <History className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">Activity Log</span>
        </div>
        <CardTitle className="text-xl">Brand History</CardTitle>
        <CardDescription>Quick access to your last five generated assets.</CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-start">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8 text-slate-400 dark:text-slate-500">
            <p className="text-xs font-semibold">No recent generation logs found.</p>
            <p className="text-[10px] mt-0.5 leading-relaxed">Your generated brands will show up here.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onRestore(item)}
                className="w-full flex items-center justify-between rounded-2xl border border-slate-100 bg-white/50 p-3 hover:border-blue-500 hover:bg-slate-50/50 transition text-left dark:border-slate-850 dark:bg-slate-900/50 dark:hover:border-blue-500 dark:hover:bg-slate-850"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
                    {item.input.businessType}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-450 dark:text-slate-400 mt-0.5 truncate">
                    Keywords: {item.input.keywords}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-bold text-slate-600 dark:bg-slate-850 dark:text-slate-400 uppercase">
                    {item.input.brandStyle}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
