import React, { useState, useEffect } from 'react'
import { User, Calendar, ShieldCheck, Mail, Key } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getUser } from '../../services/userService'
import type { UserProfile } from '../../types/user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'

import type { FieldValue, Timestamp } from 'firebase/firestore'

// Helper to format timestamps securely
function formatTimestamp(val: FieldValue | Timestamp | Date | number | string | null | undefined | unknown): string {
  if (!val) return 'N/A'
  
  const hasToDate = val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => unknown }).toDate === 'function'
  if (hasToDate) {
    const d = (val as { toDate: () => Date }).toDate()
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }
  if (val instanceof Date) {
    return val.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }
  if (typeof val === 'number' || typeof val === 'string') {
    const d = new Date(val)
    if (!isNaN(d.getTime())) {
      return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    }
  }
  return 'N/A'
}

export const ProfileCard: React.FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true

    getUser(user.uid)
      .then((data) => {
        if (active) {
          setProfile(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Error in ProfileCard fetch:', err)
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [user])

  if (loading) {
    return (
      <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] p-6 space-y-4 animate-pulse">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </Card>
    )
  }

  const activeProfile = profile || {
    uid: user?.uid || '',
    displayName: user?.displayName || 'User',
    email: user?.email || '',
    photoURL: user?.photoURL || '',
    provider: 'google' as const,
    role: 'user' as const,
    isActive: true,
    createdAt: null,
    lastLogin: null,
  }

  return (
    <Card className="border border-white/20 bg-white/40 backdrop-blur-md shadow-lg dark:border-slate-800/40 dark:bg-slate-950/40 rounded-[2rem] overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <User className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">User Profile</span>
        </div>
        <CardTitle className="text-xl">Account Identity</CardTitle>
        <CardDescription>Secure credential configuration details.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5 flex-1 flex flex-col justify-between pt-2">
        {/* User Card Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-4">
          {activeProfile.photoURL ? (
            <img
              src={activeProfile.photoURL}
              alt={activeProfile.displayName}
              className="h-12 w-12 rounded-full object-cover shrink-0 border border-slate-200/50 dark:border-slate-800"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-sm font-bold text-white uppercase shrink-0">
              {activeProfile.displayName.charAt(0) || activeProfile.email.charAt(0) || 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-50 truncate">
              {activeProfile.displayName}
            </h4>
            <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30">
              Role: {activeProfile.role}
            </span>
          </div>
        </div>

        {/* Credentials list */}
        <div className="space-y-3.5 flex-1 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </div>
            <span className="font-semibold text-slate-850 dark:text-slate-300 truncate max-w-[170px]">
              {activeProfile.email}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Key className="h-4 w-4" />
              <span>Provider</span>
            </div>
            <span className="font-semibold text-slate-850 dark:text-slate-300 uppercase">
              {activeProfile.provider}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>Joined</span>
            </div>
            <span className="font-semibold text-slate-850 dark:text-slate-300">
              {formatTimestamp(activeProfile.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck className="h-4 w-4" />
              <span>Last Login</span>
            </div>
            <span className="font-semibold text-slate-850 dark:text-slate-300">
              {formatTimestamp(activeProfile.lastLogin)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
