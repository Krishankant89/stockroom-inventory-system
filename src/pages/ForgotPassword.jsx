import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Boxes } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (SITE_KEY && !captchaToken) {
      toast.error('Please complete the security check.')
      return
    }
    setBusy(true)
    setMessage('')
    const { error } = await requestPasswordReset(email.trim().toLowerCase(), captchaToken)
    setBusy(false)
    if (error) {
      toast.error(error.message)
      return
    }
    setMessage('If an account exists for this email, a password reset link has been sent.')
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fadeUp">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-card bg-brand-600 flex items-center justify-center text-paper"><Boxes size={20} /></div>
          <span className="font-display text-2xl text-ink">Stockroom</span>
        </div>

        <div className="bg-surface border border-line rounded-card shadow-card p-8">
          <h1 className="font-display text-xl text-ink mb-1">Reset password</h1>
          <p className="text-sm text-ink/60 mb-6">Enter your email and we’ll send a secure reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@company.com" />
            </div>

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

            <button type="submit" disabled={busy || !SITE_KEY} className="w-full bg-brand-600 hover:bg-brand-700 text-paper rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-60">
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          {message && <p className="mt-4 rounded-lg bg-brand-50 border border-brand-100 p-3 text-sm text-brand-800">{message}</p>}
        </div>

        <p className="text-center text-sm text-ink/60 mt-6">
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
