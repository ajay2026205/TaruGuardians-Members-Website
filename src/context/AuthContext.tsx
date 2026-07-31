import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, type Profile } from '../lib/supabase'

type AuthState = {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const profileLoadingFor = useRef<string | null>(null)

  const loadProfile = async (uid: string, email: string, userMeta?: Record<string, unknown>) => {
    if (profileLoadingFor.current === uid) return
    profileLoadingFor.current = uid

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle()

      if (error) {
        console.error('[auth] profile load error:', error.message)
        setProfile(null)
        return
      }

      if (data) {
        setProfile(data as Profile)
        return
      }

      // Trigger may not have fired yet — try to create the profile.
      // If trigger already created it (race), insert fails harmlessly.
      const { data: created, error: cerr } = await supabase
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

      if (cerr) {
        // Likely race: trigger already inserted. Re-read.
        if (cerr.code === '23505') {
          const { data: retry } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .maybeSingle()
          if (retry) setProfile(retry as Profile)
          else setProfile(null)
          return
        }
        console.error('[auth] profile create error:', cerr.message)
        setProfile(null)
        return
      }

      if (created) setProfile(created as Profile)
      else setProfile(null)
    } finally {
      profileLoadingFor.current = null
    }
  }

  const refreshProfile = async () => {
    if (session?.user?.id) {
      profileLoadingFor.current = null
      await loadProfile(session.user.id, session.user.email ?? '', session?.user?.user_metadata)
    }
  }

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
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
      ;(async () => {
        setSession(newSession)
        if (newSession?.user?.id) {
          profileLoadingFor.current = null
          await loadProfile(
            newSession.user.id,
            newSession.user.email ?? '',
            newSession.user.user_metadata,
          )
        } else {
          setProfile(null)
        }
        if (mounted) setLoading(false)
      })()
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = async () => {
    profileLoadingFor.current = null
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
