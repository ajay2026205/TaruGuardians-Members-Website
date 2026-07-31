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

function Protected({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth()
  if (loading) return <FullPageLoader label="Authenticating…" />
  if (!session) return <Navigate to="/login" replace />
  // Session exists but profile still loading — don't bounce yet
  if (!profile) return <FullPageLoader label="Loading your profile…" />
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
  const { session, profile, loading } = useAuth()

  if (loading) return <FullPageLoader label="Loading TaruGuardians…" />

  // Authenticated: show loader while profile loads (prevents login loop)
  const authedAndLoadingProfile = session && !profile

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/onboarding-check" replace /> : <Login />} />
      <Route
        path="/onboarding-check"
        element={
          session ? (
            authedAndLoadingProfile ? (
              <FullPageLoader label="Loading your profile…" />
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
      <Route path="/onboarding" element={session ? (profile ? (profile.onboarded ? <Navigate to="/dashboard" replace /> : <Onboarding />) : <FullPageLoader label="Loading your profile…" />) : <Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/members" element={<Protected><Members /></Protected>} />
      <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
      <Route path="/chat" element={<Protected><Chat /></Protected>} />
      <Route path="/schedule" element={<Protected><Schedule /></Protected>} />
      <Route path="/admin" element={<Protected><AdminOnly><Admin /></AdminOnly></Protected>} />
      <Route path="/settings" element={<Protected><AdminOnly><Settings /></AdminOnly></Protected>} />
      <Route path="/" element={<Navigate to={session ? (profile && !profile.onboarded ? '/onboarding' : '/dashboard') : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
