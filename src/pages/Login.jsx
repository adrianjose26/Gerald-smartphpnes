import { useState } from 'react'
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Logo from '../components/ui/Logo'

// Pantalla de inicio de sesión. Solo entra el usuario creado en Supabase.
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setError('')
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setBusy(false)
    if (error) {
      setError(
        /invalid login/i.test(error.message)
          ? 'Correo o contraseña incorrectos.'
          : error.message
      )
    }
    // Si entra bien, App detecta la sesión y muestra la app.
  }

  return (
    <div className="grid min-h-screen place-items-center bg-light-bg px-4 dark:bg-dark-bg">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo variant="mark" size={64} />
          <div>
            <h1 className="font-display text-2xl font-extrabold text-light-text dark:text-dark-text">Ventura Smartphone</h1>
            <p className="text-sm text-light-muted dark:text-dark-muted">Inventario y facturación</p>
          </div>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-bold text-light-text dark:text-dark-text">Iniciar sesión</h2>

          <div>
            <label className="label" htmlFor="l-email">Correo</label>
            <input
              id="l-email"
              type="email"
              autoComplete="username"
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="tucorreo@gmail.com"
            />
          </div>

          <div>
            <label className="label" htmlFor="l-pass">Contraseña</label>
            <div className="relative">
              <input
                id="l-pass"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                className="field pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-light-muted hover:bg-light-bg2 dark:hover:bg-dark-border"
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-brand-red/10 px-3 py-2 text-sm font-medium text-brand-red">{error}</p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-light-muted dark:text-dark-muted">
          @VENTURASMARTPHONE · 809-986-1389
        </p>
      </div>
    </div>
  )
}
