import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Briefcase, Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getRecentProjects } from '../../services/projectService'
import type { Project } from '../../types/project'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { EmptyProjects } from './EmptyProjects'
import { Skeleton } from '../../components/ui/skeleton'
import type { FieldValue, Timestamp } from 'firebase/firestore'

interface RecentProjectsProps {
  onCreateProjectClick: () => void
  onProjectClick: (projectId: string) => void
}

function formatDate(val: FieldValue | Timestamp | Date | null | undefined | unknown): string {
  if (!val) return 'N/A'
  
  const hasToDate = val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => unknown }).toDate === 'function'
  if (hasToDate) {
    const d = (val as { toDate: () => Date }).toDate()
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
  }
  if (val instanceof Date) {
    return val.toLocaleDateString(undefined, { dateStyle: 'medium' })
  }
  return 'N/A'
}

// Custom Async State Manager matching React Query's API
function useProjectsQuery(uid: string | undefined) {
  const [data, setData] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const refetch = useCallback(async () => {
    if (!uid) return
    setLoading(true)
    setError(null)
    try {
      const projects = await getRecentProjects(uid)
      if (isMountedRef.current) {
        setData(projects)
      }
    } catch (err) {
      console.error('Error in RecentProjects query fetch:', err)
      if (isMountedRef.current) {
        setError(err as Error)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [uid])

  useEffect(() => {
    let active = true
    if (!uid) {
      Promise.resolve().then(() => {
        if (active) setLoading(false)
      })
      return
    }

    getRecentProjects(uid)
      .then((projects) => {
        if (active) {
          setData(projects)
          setError(null)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err as Error)
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [uid])

  return { data, loading, error, refetch }
}

export const RecentProjects: React.FC<RecentProjectsProps> = ({ onCreateProjectClick, onProjectClick }) => {
  const { user } = useAuth()
  const { data: projects, loading, error, refetch } = useProjectsQuery(user?.uid)

  if (loading) {
    return (
      <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] p-6 space-y-4 col-span-1 lg:col-span-2">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-3 pt-4">
          <Skeleton className="h-14 w-full rounded-2xl animate-pulse" />
          <Skeleton className="h-14 w-full rounded-2xl animate-pulse" />
          <Skeleton className="h-14 w-full rounded-2xl animate-pulse" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border border-rose-200/50 bg-rose-50/10 backdrop-blur-md shadow-lg dark:border-rose-950/30 dark:bg-rose-950/5 rounded-[2rem] p-8 text-center col-span-1 lg:col-span-2 flex flex-col items-center justify-center min-h-[300px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 mb-4">
          <Briefcase className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-rose-950 dark:text-rose-200">Failed to load projects</h3>
        <p className="text-sm text-rose-705 dark:text-rose-450 mt-1 max-w-xs font-semibold leading-relaxed">
          {error.message || 'Could not retrieve recent projects.'}
        </p>
        <button
          onClick={refetch}
          className="mt-5 rounded-full border border-rose-200 bg-white text-rose-800 hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-950 dark:text-rose-300 font-extrabold text-xs px-5 py-2.5 transition"
        >
          Retry Connection
        </button>
      </Card>
    )
  }

  return (
    <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] overflow-hidden col-span-1 lg:col-span-2 flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Briefcase className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em]">Workspaces</span>
          </div>
          <CardTitle className="text-xl">Recent Projects</CardTitle>
          <CardDescription>Review status logs and actions for active accounts.</CardDescription>
        </div>
        {projects.length > 0 && (
          <button
            onClick={onCreateProjectClick}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20 hover:opacity-95 transition"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-start">
        {projects.length === 0 ? (
          <EmptyProjects onCreateClick={onCreateProjectClick} />
        ) : (
          <div className="space-y-3">
            {projects.map((proj) => (
              <button
                key={proj.projectId}
                onClick={() => onProjectClick(proj.projectId)}
                className="w-full flex items-center justify-between rounded-[1.4rem] border border-slate-100 bg-white/60 p-4 transition-all duration-300 dark:border-slate-850 dark:bg-slate-900/60 text-left hover:border-blue-500/80 hover:bg-slate-50/50 dark:hover:border-blue-500/80 dark:hover:bg-slate-850 outline-none"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">
                    {proj.companyName}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-semibold text-slate-450 dark:text-slate-400">
                    <span className="truncate">Industry: {proj.industry}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(proj.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="ml-4 shrink-0 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      proj.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
