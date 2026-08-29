import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Boxes } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

export default function Signup() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaToken) {
      toast.error('Please complete the security check.')
      return
    }
    setBusy(true)
    const { error } = await signUp(email.trim().toLowerCase(), password, fullName, captchaToken)
    setBusy(false)
    if (error) {
      toast.error(error.message)
      return
    }
    setMessage('Your account creation link has been sent to your email. Open it to finish signing in.')
  }

  const handleGoogle = async () => {
    setBusy(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setBusy(false)
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fadeUp">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-card bg-brand-600 flex items-center justify-center text-paper"><Boxes size={20} /></div>
          <span className="font-display text-2xl text-ink">Stockroom</span>
        </div>

        <div className="bg-surface border border-line rounded-card shadow-card p-8">
          <h1 className="font-display text-xl text-ink mb-1">Create your account</h1>
          <p className="text-sm text-ink/60 mb-6">We'll verify your email before giving you access.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Full name" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@company.com" />
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="At least 8 characters" />

            {SITE_KEY ? (
              <Turnstile
                siteKey={SITE_KEY}
                onSuccess={setCaptchaToken}
                onExpire={() => setCaptchaToken('')}
                onError={() => setCaptchaToken('')}
              />
            ) : (
              <p className="text-xs text-amber-700">Turnstile site key is not configured.</p>
            )}

            <button disabled={busy || !SITE_KEY} className="w-full bg-brand-600 hover:bg-brand-700 text-paper rounded-lg py-2.5 text-sm font-medium disabled:opacity-60">
              {busy ? 'Creating…' : 'Create account'}
            </button>
          </form>

          {message && <p className="mt-4 rounded-lg bg-brand-50 border border-brand-100 p-3 text-sm text-brand-800">{message}</p>}

          <div className="flex items-center gap-3 my-5"><div className="h-px bg-line flex-1" /><span className="text-xs text-ink/40">OR</span><div className="h-px bg-line flex-1" /></div>
          <button onClick={handleGoogle} disabled={busy} className="w-full border border-line rounded-lg py-2.5 text-sm font-medium text-ink hover:bg-paper transition disabled:opacity-60">Continue with Google</button>
        </div>

        <p className="text-center text-sm text-ink/60 mt-6">
          Already have an account? <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
