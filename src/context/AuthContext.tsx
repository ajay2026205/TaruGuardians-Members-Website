import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, type Profile } from '../lib/supabase'

// ─── Demo mode (auth bypassed) ──────────────────────────────────────
// Authentication is temporarily disabled. A demo admin profile is
// served directly so the app works without Google OAuth being
// configured. To re-enable auth, revert this file to use
// supabase.auth.getSession() + onAuthStateChange and restore the
// original routing in App.tsx.

const DEMO_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@taruguardians.demo',
  full_name: 'Taru Admin',
  photo_url: null,
  location: 'Mumbai, India',
  role: 'admin',
  onboarded: true,
  created_at: new Date().toISOString(),
}

const DEMO_SESSION = {
  access_token: 'demo',
  refresh_token: 'demo',
  expires_in: 999999,
  token_type: 'bearer',
  user: {
    id: DEMO_PROFILE.id,
    email: DEMO_PROFILE.email,
    app_metadata: {},
    user_metadata: { full_name: DEMO_PROFILE.full_name },
    aud: 'authenticated',
    created_at: DEMO_PROFILE.created_at,
  },
} as unknown as Session

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
  session: DEMO_SESSION,
  profile: DEMO_PROFILE,
  loading: false,
  profileLoading: false,
  authError: null,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile] = useState<Profile | null>(DEMO_PROFILE)
  const [session] = useState<Session | null>(DEMO_SESSION)

  const refreshProfile = useCallback(async () => {
    // no-op in demo mode
  }, [])

  const signOut = useCallback(async () => {
    // no-op in demo mode — there's no real session to end
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, profile, loading: false, profileLoading: false, authError: null, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
