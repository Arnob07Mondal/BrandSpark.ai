import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

export function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
      showToast('Successfully signed in!', 'success')
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Google authentication failed. Please try again.'
      console.error('LoginPage handleLogin error:', err)
      setError(errMsg)
      showToast(errMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      {/* Background Ornaments */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/5"></div>
        <div className="absolute -bottom-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px] dark:bg-purple-500/5"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="z-10 w-full max-w-md"
      >
        {/* Branding Logo */}
        <motion.div variants={itemVariants} className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            BrandSpark<span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">.ai</span>
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-semibold">
            AI-Powered Brand Story & Visual Architect
          </p>
        </motion.div>

        {/* Glassmorphism Card */}
        <motion.div
          variants={itemVariants}
          className="overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/40 p-8 backdrop-blur-xl shadow-xl dark:border-slate-800/40 dark:bg-slate-950/40 sm:p-10"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Welcome Back</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
              Sign in using your Google account to access your design history and generate brand names.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200/60 bg-rose-50/40 p-3.5 text-xs text-rose-800 dark:border-rose-950/30 dark:bg-rose-950/10 dark:text-rose-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-450" />
              <span className="font-semibold">{error}</span>
            </motion.div>
          )}

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.015, boxShadow: '0 8px 20px -8px rgba(59, 130, 246, 0.25)' }}
              whileTap={{ scale: 0.985 }}
              type="button"
              disabled={loading}
              onClick={handleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 disabled:pointer-events-none disabled:opacity-60 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-850"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.49 12.273c0-.818-.073-1.609-.208-2.373H12v4.545h6.44c-.277 1.455-1.1 2.69-2.34 3.527l4.35 7.69c2.545-2.345 4.04-5.8 4.04-9.39z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.238 0 6.182-1.09 8.39-2.964l-4.35-7.69c-1.077.732-2.454 1.164-4.04 1.164-3.555 0-6.566-2.418-7.634-5.69L1.488 12.1A11.96 11.96 0 0 0 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M4.364 14.82A7.03 7.03 0 0 1 4.137 12c0-.982.167-1.927.472-2.82L1.218 5.936A11.967 11.967 0 0 0 0 12c0 2.21.6 4.28 1.636 6.064l2.728-3.244z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.37 0 3.393 2.66 1.488 6.56l3.778 3.205A7.077 7.077 0 0 1 12 4.909z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        <motion.p variants={itemVariants} className="mt-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Secured with Google Cloud Identity • Firebase Auth
        </motion.p>
      </motion.div>
    </div>
  )
}
