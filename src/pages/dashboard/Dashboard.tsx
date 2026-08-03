import { useState } from 'react'
import { AlertCircle, Sliders, Star, Folder } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from './DashboardLayout'
import { DashboardCards } from './DashboardCards'
import { BrandForm } from '../../components/brand-form'
import { EmptyState } from './EmptyState'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/button'
import { ProjectWizard } from './ProjectWizard'
import { ProjectWorkspace } from './ProjectWorkspace'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  
  const { logout } = useAuth()
  const { showToast } = useToast()

  const handleRestoreHistory = (item: { input: { businessType: string } }) => {
    setActiveTab('brand-assets')
    showToast(`Restored values for "${item.input.businessType}"! Scroll down to generate.`, 'info')
  }

  // If a project workspace is active, render it instead of the generic dashboard shell
  if (activeProjectId) {
    return (
      <ProjectWorkspace
        projectId={activeProjectId}
        onClose={() => {
          setActiveProjectId(null)
          setActiveTab('dashboard')
        }}
      />
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardCards
            onNewBrandClick={() => setShowWizard(true)}
            onRestoreHistory={handleRestoreHistory}
            onProjectClick={setActiveProjectId}
          />
        )
      case 'brand-assets':
        return <BrandForm />
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-200/50 pb-4 dark:border-slate-800/50">
              <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
              <p className="text-sm text-slate-500">Manage your branding workspaces.</p>
            </div>
            <EmptyState
              icon={Folder}
              title="No branding projects yet"
              description="Create a branding project slot to start generating naming campaigns."
              actionLabel="Create Project Slot"
              onAction={() => setShowWizard(true)}
            />
          </div>
        )
      case 'history':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-200/50 pb-4 dark:border-slate-800/50">
              <h2 className="text-2xl font-bold tracking-tight">Generation Logs</h2>
              <p className="text-sm text-slate-500">Track and restore past brand creations.</p>
            </div>
            <BrandForm />
          </div>
        )
      case 'favorites':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-200/50 pb-4 dark:border-slate-800/50">
              <h2 className="text-2xl font-bold tracking-tight">Favorites</h2>
              <p className="text-sm text-slate-500">Shortlisted names and taglines.</p>
            </div>
            <EmptyState
              icon={Star}
              title="No favorites saved"
              description="Star name ideas when generating brand packages to list them here."
            />
          </div>
        )
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-200/50 pb-4 dark:border-slate-800/50">
              <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
              <p className="text-sm text-slate-500">Configure parameters and API credentials.</p>
            </div>
            <EmptyState
              icon={Sliders}
              title="Configuration limits"
              description="API integrations and platform options are configured automatically."
            />
          </div>
        )
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-200/50 pb-4 dark:border-slate-800/50">
              <h2 className="text-2xl font-bold tracking-tight">Account Profile</h2>
              <p className="text-sm text-slate-500">Manage identity configurations.</p>
            </div>
            <div className="max-w-md">
              <EmptyState
                icon={Star}
                title="Account Synchronization active"
                description="Your Google account profile updates automatically on every session sign-in."
              />
            </div>
          </div>
        )
      default:
        return (
          <EmptyState
            icon={AlertCircle}
            title="Tab under development"
            description="This layout section will launch in the next minor version."
          />
        )
    }
  }

  return (
    <>
      <DashboardLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogoutClick={() => setShowLogoutConfirm(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </DashboardLayout>

      {/* Project Creation Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <ProjectWizard
            onClose={() => setShowWizard(false)}
            onSuccess={(id) => {
              setActiveProjectId(id)
              setShowWizard(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Global Log Out Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-slate-950/60">
            <div className="absolute inset-0" onClick={() => setShowLogoutConfirm(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative z-10 w-full max-w-sm rounded-[2rem] border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95"
            >
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50">
                  <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-455" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight">Confirm Sign Out</h3>
                <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                  Are you sure you want to sign out? You will need to authenticate again to generate brand architectures.
                </p>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl h-10 text-xs font-bold"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </Button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="flex-1 rounded-xl h-10 bg-gradient-to-r from-rose-500 to-red-600 text-xs font-bold text-white shadow-sm hover:opacity-95"
                  onClick={async () => {
                    setShowLogoutConfirm(false)
                    try {
                      await logout()
                      showToast('Successfully signed out.', 'info')
                    } catch {
                      showToast('Failed to sign out. Please try again.', 'error')
                    }
                  }}
                >
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
