import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { RecentProjects } from './RecentProjects'
import { QuickActions } from './QuickActions'
import { CreditsCard } from './CreditsCard'
import { ProfileCard } from './ProfileCard'
import { HistoryCard } from './HistoryCard'

interface DashboardCardsProps {
  onNewBrandClick: () => void
  onRestoreHistory: (item: { input: { businessType: string } }) => void
  onProjectClick: (projectId: string) => void
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  onNewBrandClick,
  onRestoreHistory,
  onProjectClick,
}) => {
  const { user } = useAuth()
  const name = user?.displayName || 'Creator'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-gradient-to-r from-blue-600/90 to-purple-600/90 p-8 text-white shadow-xl dark:border-slate-800/40">
        {/* Glow highlights */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] h-[300px] w-[300px] rounded-full bg-white/10 blur-[60px]" />
          <div className="absolute -bottom-[20%] -right-[10%] h-[300px] w-[300px] rounded-full bg-purple-500/20 blur-[60px]" />
        </div>

        <div className="relative z-10 space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Brand Builder Active
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, {name}
          </h2>
          <p className="text-sm font-semibold text-white/80 leading-relaxed max-w-lg">
            Ready to build your next brand identity architecture? Fire up the generator or review recent project slots below.
          </p>
        </div>
      </div>

      {/* Interactive Overview Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Row 1: Recent Projects (takes 2 columns) & Quick Actions */}
        <RecentProjects onCreateProjectClick={onNewBrandClick} onProjectClick={onProjectClick} />
        <QuickActions onNewBrandClick={onNewBrandClick} />

        {/* Row 2: History, Usage Credits, User Profile */}
        <HistoryCard onRestore={onRestoreHistory} />
        <CreditsCard />
        <ProfileCard />
      </div>
    </motion.div>
  )
}
