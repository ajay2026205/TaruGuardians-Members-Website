import { Logo } from '../components/Logo'
import { Settings as SettingsIcon, ShieldAlert, ArrowRight } from 'lucide-react'

export default function ConfigError() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-obsidian px-4">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-crimson/5 blur-[100px]" />

      <div className="relative z-10 w-full max-w-lg animate-scale-in">
        <div className="mb-10 flex flex-col items-center text-center">
          <Logo size="lg" />
        </div>

        <div className="card p-8">
          <div className="mb-5 flex justify-center">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-crimson/30 bg-crimson/10">
              <ShieldAlert size={28} className="text-crimson" />
            </div>
          </div>

          <h1 className="text-center font-display text-2xl font-extrabold tracking-tight text-white">
            Configuration Error
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-400">
            Missing Supabase environment variables. Set{' '}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-gold">VITE_SUPABASE_URL</code>{' '}
            and{' '}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-gold">VITE_SUPABASE_ANON_KEY</code>{' '}
            in your Vercel project settings under{' '}
            <span className="font-semibold text-slate-200">Settings → Environment Variables</span>.
          </p>

          <div className="mt-6 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-left">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <SettingsIcon size={12} /> Quick steps
            </p>
            <ol className="space-y-2 text-xs text-slate-400">
              <li className="flex gap-2">
                <span className="font-bold text-gold">1.</span>
                <span>Go to your Vercel project → <span className="text-slate-200">Settings → Environment Variables</span></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-gold">2.</span>
                <span>Add <code className="font-mono text-gold">VITE_SUPABASE_URL</code> with your Supabase project URL</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-gold">3.</span>
                <span>Add <code className="font-mono text-gold">VITE_SUPABASE_ANON_KEY</code> with your anon/public key</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-gold">4.</span>
                <span>Trigger a new deployment (Redeploy) so the new values take effect</span>
              </li>
            </ol>
          </div>

          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="btn-gold mt-6 w-full py-3"
          >
            Open Vercel Dashboard <ArrowRight size={16} />
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Environment variables must be set before the app can connect to its database.
        </p>
      </div>
    </div>
  )
}
