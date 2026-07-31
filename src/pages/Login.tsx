import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'
import { Spinner } from '../components/ui'
import { Mail, Lock, User, Chrome, ShieldCheck, Zap, Users } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    if (session) navigate('/onboarding-check', { replace: true })
  }, [session, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)

    if (mode === 'signup') {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: fullName.trim() ? { full_name: fullName.trim() } : {},
        },
      })
      if (signUpErr) {
        setError(signUpErr.message)
        setLoading(false)
        return
      }
      if (data.user && !data.session) {
        setInfo('Account created! Check your email for a confirmation link, then sign in.')
        setMode('signin')
        setLoading(false)
        return
      }
      // session is set — onAuthStateChange will fire and route the user
      setLoading(false)
      return
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (signInErr) {
      setError(signInErr.message)
      setLoading(false)
    }
    // on success, onAuthStateChange fires -> useEffect redirects
  }

  const handleGoogle = async () => {
    setError(null)
    setLoading(true)
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding-check`,
      },
    })
    if (oauthErr) {
      setError(oauthErr.message)
      setLoading(false)
    }
  }

  const switchMode = (m: 'signin' | 'signup') => {
    setMode(m)
    setError(null)
    setInfo(null)
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-obsidian px-4">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald2/5 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-slate-400">
            The private command center for an elite club. Sign in to access your content, tasks, and team.
          </p>
        </div>

        <div className="card p-8">
          <div className="mb-6 flex rounded-lg border border-white/10 bg-white/[0.02] p-1">
            <button
              onClick={() => switchMode('signin')}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                mode === 'signin' ? 'bg-gold/15 text-gold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                mode === 'signup' ? 'bg-gold/15 text-gold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label"><span className="inline-flex items-center gap-1.5"><User size={12} /> Full Name</span></label>
                <input
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="label"><span className="inline-flex items-center gap-1.5"><Mail size={12} /> Email</span></label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label"><span className="inline-flex items-center gap-1.5"><Lock size={12} /> Password</span></label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
              {mode === 'signup' && (
                <p className="mt-1.5 text-xs text-slate-600">At least 6 characters.</p>
              )}
            </div>

            {error && (
              <p className="rounded-md border border-crimson/30 bg-crimson/10 px-4 py-2.5 text-sm text-crimson">{error}</p>
            )}
            {info && (
              <p className="rounded-md border border-emerald2/30 bg-emerald2/10 px-4 py-2.5 text-sm text-emerald2">{info}</p>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full py-3">
              {loading ? <Spinner size={18} /> : null}
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-xs text-slate-600">or</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="btn-ghost w-full py-3"
          >
            {loading ? <Spinner size={18} /> : <Chrome size={18} />}
            Continue with Google
          </button>

          <p className="mt-5 text-center text-xs text-slate-500">
            {mode === 'signin'
              ? 'New here? Use Create Account to join the guild.'
              : 'The first account becomes the club admin automatically.'}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: ShieldCheck, label: 'Secure' },
            { icon: Zap, label: 'Automated' },
            { icon: Users, label: 'Connected' },
          ].map((f) => {
            const Icon = f.icon
            return (
              <div key={f.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] py-3">
                <Icon size={18} className="mx-auto text-gold/70" />
                <p className="mt-1.5 text-xs font-medium text-slate-400">{f.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
