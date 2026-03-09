import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Profile } from '../types'
import { storage, clearAllDemoData } from '../data/storage'
import { AUTH_USER_KEY } from '../data/storage/keys'
import { profilesRepo } from '../repos'

interface AuthState {
  user: Profile | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  login: (profileId: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  const loadStoredUser = useCallback(async () => {
    const storedId = storage.get<string>(AUTH_USER_KEY)
    if (!storedId) {
      setState({ user: null, loading: false })
      return
    }
    const profile = await profilesRepo.get(storedId)
    setState({ user: profile ?? null, loading: false })
  }, [])

  useEffect(() => {
    loadStoredUser()
  }, [loadStoredUser])

  const login = useCallback(
    async (profileId: string) => {
      const profile = await profilesRepo.get(profileId)
      if (!profile) return
      storage.set(AUTH_USER_KEY, profileId)
      setState({ user: profile, loading: false })
    },
    []
  )

  const logout = useCallback(() => {
    storage.remove(AUTH_USER_KEY)
    clearAllDemoData()
    setState({ user: null, loading: false })
    window.location.reload()
  }, [])

  const refreshUser = useCallback(async () => {
    await loadStoredUser()
  }, [loadStoredUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      refreshUser,
    }),
    [state, login, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
