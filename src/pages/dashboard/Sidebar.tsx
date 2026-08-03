import React from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  Briefcase,
  Palette,
  History,
  Star,
  Settings,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogoutClick: () => void
}

interface NavItem {
  id: string
  label: string
  icon: typeof Home
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'brand-assets', label: 'Brand Assets', icon: Palette },
  { id: 'history', label: 'History', icon: History },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'Profile', icon: User },
]

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogoutClick,
}) => {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200/50 bg-white/40 p-5 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/40">
      {/* Brand Header */}
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20">
          <Sparkles className="h-4.5 w-4.5 animate-pulse" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
          BrandSpark<span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">.ai</span>
        </span>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 outline-none ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 rounded-xl bg-blue-50/50 border border-blue-100/50 dark:bg-blue-950/20 dark:border-blue-900/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`relative z-10 h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="relative z-10">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout bottom trigger */}
      <div className="border-t border-slate-200/50 pt-4 dark:border-slate-800/50">
        <button
          onClick={onLogoutClick}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 transition-all outline-none"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
