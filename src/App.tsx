import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { FullPageLoader } from './components/ui'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import Tasks from './pages/Tasks'
import Chat from './pages/Chat'
import Schedule from './pages/Schedule'
import Admin from './pages/Admin'
import Settings from './pages/Settings'

function ProfileSetupProblem() {
  const { authError, refreshProfile, signOut } = useAuth()

  return (
    <div className="grid min-h-screen place-items-center bg-obsidian px-4 text-center">
      <div className="card max-w-md p-8">
        <h1 className="text-xl font-bold text-slate-100">Profile setup failed</h1>
        <p className="mt-3 text-sm text-slate-400">
          {authError ?? 'Your login worked, but we could not load your member profile yet.'}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button className="btn-gold py-3" onClick={() => void refreshProfile()}>Try again</button>
          <button className="btn-ghost py-3" onClick={() => void signOut()}>Back to login</button>
        </div>
      </div>
    </div>
  )
}

function Protected({ children }: { children: React.ReactNode }) {
  const { session, profile, loading, profileLoading } = useAuth()
  if (loading) return <FullPageLoader label="Authenticating…" />
  if (!session) return <Navigate to="/login" replace />
  // Session exists but profile is still loading — don't bounce yet.
  if (!profile && profileLoading) return <FullPageLoader label="Loading your profile…" />
  if (!profile) return <ProfileSetupProblem />
  if (!profile.onboarded) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading || !profile) return <FullPageLoader label="Checking access…" />
  if (profile.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  const { session, profile, loading, profileLoading, authError } = useAuth()

  if (loading) return <FullPageLoader label="Loading TaruGuardians…" />

  const authedAndLoadingProfile = session && !profile && profileLoading
  const authedProfileError = session && !profile && !profileLoading

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/onboarding-check" replace /> : <Login />} />
      <Route
        path="/onboarding-check"
        element={
          session ? (
            authedAndLoadingProfile ? (
              <FullPageLoader label="Loading your profile…" />
            ) : authedProfileError ? (
              <ProfileSetupProblem />
            ) : profile && !profile.onboarded ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/onboarding" element={session ? (profile ? (profile.onboarded ? <Navigate to="/dashboard" replace /> : <Onboarding />) : profileLoading ? <FullPageLoader label="Loading your profile…" /> : <ProfileSetupProblem />) : <Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/members" element={<Protected><Members /></Protected>} />
      <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
      <Route path="/chat" element={<Protected><Chat /></Protected>} />
      <Route path="/schedule" element={<Protected><Schedule /></Protected>} />
      <Route path="/admin" element={<Protected><AdminOnly><Admin /></AdminOnly></Protected>} />
      <Route path="/settings" element={<Protected><AdminOnly><Settings /></AdminOnly></Protected>} />
      <Route path="/" element={<Navigate to={session ? '/onboarding-check' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
