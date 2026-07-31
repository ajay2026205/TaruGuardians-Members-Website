import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { hasSupabaseConfig } from './lib/supabase'
import App from './App'
import ConfigError from './pages/ConfigError'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {hasSupabaseConfig ? (
        <AuthProvider>
          <App />
        </AuthProvider>
      ) : (
        <ConfigError />
      )}
    </BrowserRouter>
  </React.StrictMode>,
)
