import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Sun, Moon, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface TopbarProps {
  onMobileMenuToggle: () => void
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('brandspark_theme')
    if (stored) {
      return stored === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('brandspark_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('brandspark_theme', 'light')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200/50 bg-white/40 px-6 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/40 relative z-30">
      {/* Mobile Drawer Trigger & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMobileMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/60 bg-white/60 text-slate-500 hover:bg-slate-50 lg:hidden dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-400"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, domains, slogans..."
            className="h-9 w-full rounded-xl border border-slate-200/80 bg-white/60 pl-9 pr-4 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-200 outline-none transition"
          />
        </div>
      </div>

      {/* Utility Actions & User Menu */}
      <div className="flex items-center gap-3">
        {/* Dark Mode Switcher */}
        <button
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/60 bg-white/60 text-slate-500 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-400 transition"
        >
          {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications Icon */}
        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/60 bg-white/60 text-slate-500 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-400 transition relative">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 border border-white dark:border-slate-950"></span>
        </button>

        {/* User Photo & Dropdown Menu */}
        {user && (
          <div className="relative ml-2">
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
                          logout()
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100/70 transition dark:bg-rose-950/20 dark:text-rose-450 dark:hover:bg-rose-950/40"
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
    </header>
  )
}
