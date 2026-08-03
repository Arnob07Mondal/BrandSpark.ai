/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle, Sparkles } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Impure id generator at module scope to satisfy linting purity rules
function generateToastId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = generateToastId()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur pointer-events-auto border ${
                toast.type === 'success'
                  ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800 dark:bg-emerald-950/95 dark:border-emerald-900/50 dark:text-emerald-300'
                  : toast.type === 'error'
                  ? 'bg-rose-50/95 border-rose-200 text-rose-800 dark:bg-rose-950/95 dark:border-rose-900/50 dark:text-rose-300'
                  : 'bg-indigo-50/95 border-indigo-200 text-indigo-850 dark:bg-slate-950/95 dark:border-indigo-900/50 dark:text-indigo-300'
              }`}
            >
              {toast.type === 'success' ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-450" />
              ) : (
                <Sparkles className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              )}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
