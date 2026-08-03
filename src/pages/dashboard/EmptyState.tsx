import React from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-8 rounded-[2rem] border border-slate-200/50 bg-white/20 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/20"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500/10 to-purple-500/10 border border-blue-100/50 dark:border-slate-800/80 text-blue-600 dark:text-blue-400 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-450 mt-1 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white font-semibold text-xs px-5 shadow-md shadow-blue-500/10"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
