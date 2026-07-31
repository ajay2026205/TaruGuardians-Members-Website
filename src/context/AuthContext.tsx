import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, type Profile } from '../lib/supabase'

type AuthState = {
  session: Session | null
  profile: Profile | null
  loading: boolean
  profileLoading: boolean
  authError: string | null
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  session: null,
  profile: null,
  loading: true,
  profileLoading: false,
  authError: null,
  signOut: async () => {},
  refreshProfile: async () => {},
})

const PROFILE_RETRY_DELAYS_MS = [250, 750, 1500]
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const loadIdRef = useRef(0)

  const loadProfile = useCallback(async (uid: string, email: string, userMeta?: Record<string, unknown>) => {
    const loadId = ++loadIdRef.current
    setProfileLoading(true)
    setAuthError(null)

    try {
      for (let attempt = 0; attempt <= PROFILE_RETRY_DELAYS_MS.length; attempt += 1) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .maybeSingle()

        if (loadId !== loadIdRef.current) return

        if (error) {
          console.error('[auth] profile load error:', error.message)
          setProfile(null)
          setAuthError(`Could not load your profile: ${error.message}`)
          return
        }

        if (data) {
          setProfile(data as Profile)
          return
        }

        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: uid,
            email,
            full_name:
              (userMeta?.full_name as string) ??
              (userMeta?.name as string) ??
              null,
            photo_url:
              (userMeta?.avatar_url as string) ??
              (userMeta?.picture as string) ??
              null,
            role: 'member',
            onboarded: false,
          })
          .select('*')
          .maybeSingle()

        if (loadId !== loadIdRef.current) return

        if (created) {
          setProfile(created as Profile)
          return
        }

        if (createError && createError.code !== '23505') {
          console.error('[auth] profile create error:', createError.message)
        }

        if (attempt < PROFILE_RETRY_DELAYS_MS.length) {
          await wait(PROFILE_RETRY_DELAYS_MS[attempt])
        }
      }

      setProfile(null)
      setAuthError('Your login succeeded, but your profile could not be created. Please apply the latest Supabase migration and try again.')
    } finally {
      if (loadId === loadIdRef.current) setProfileLoading(false)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      await loadProfile(session.user.id, session.user.email ?? '', session.user.user_metadata)
    }
  }, [loadProfile, session])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      if (error) setAuthError(error.message)
      setSession(data.session)
      if (data.session?.user?.id) {
        loadProfile(
          data.session.user.id,
          data.session.user.email ?? '',
          data.session.user.user_metadata,
        ).finally(() => mounted && setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (!newSession?.user?.id) {
        loadIdRef.current += 1
        setProfile(null)
        setProfileLoading(false)
        setAuthError(null)
        if (mounted) setLoading(false)
        return
      }

      window.setTimeout(() => {
        loadProfile(
          newSession.user.id,
          newSession.user.email ?? '',
          newSession.user.user_metadata,
        ).finally(() => mounted && setLoading(false))
      }, 0)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    loadIdRef.current += 1
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    setProfileLoading(false)
    setAuthError(null)
  }, [])

  return (
    <AuthContext.Provider value={{ session, profile, loading, profileLoading, authError, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
