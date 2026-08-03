import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface DashboardLayoutProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogoutClick: () => void
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  setActiveTab,
  onLogoutClick,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      {/* 1. Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogoutClick={onLogoutClick}
        />
      </div>

      {/* 2. Mobile Drawer Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Background screen shadow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative flex w-full max-w-xs flex-1 flex-col h-full z-10"
            >
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab)
                  setMobileMenuOpen(false)
                }}
                onLogoutClick={() => {
                  setMobileMenuOpen(false)
                  onLogoutClick()
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Main content workspace shell */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Scrollable contents zone */}
        <main className="flex-1 overflow-y-auto px-6 py-6 outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}
