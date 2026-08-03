import { Loader2 } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import { LoginPage } from './components/login-page'
import { Dashboard } from './pages/dashboard/Dashboard'
import './App.css'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {/* Background glow highlights */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px] dark:bg-blue-500/5"></div>
          <div className="absolute -bottom-[10%] -right-[10%] h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px] dark:bg-purple-500/5"></div>
        </div>
        
        <div className="z-10 flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-2xl bg-blue-400 opacity-20"></span>
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight">Authenticating BrandSpark</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Initializing Secure Session</p>
          </div>
        </div>
      </div>
    )
  }

  return user ? <Dashboard /> : <LoginPage />
}

export default App
