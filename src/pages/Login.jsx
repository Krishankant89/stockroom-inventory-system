import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Boxes, ShieldCheck } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

export default function Login() {
  const {
    session,
    loading,
    sendLoginLink,
    sendAccountCreationLink,
    signInWithGoogle,
    getMfaAssurance,
  } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (loading) return

    const checkSession = async () => {
      if (!session) return

      try {
        const { data, error } = await getMfaAssurance()
        if (error) {
          navigate('/', { replace: true })
          return
        }

        if (data?.currentLevel === 'aal1' && data?.nextLevel === 'aal2') {
          navigate('/mfa', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      } catch {
        navigate('/', { replace: true })
      }
    }
    checkSession()
  }, [session, loading, getMfaAssurance, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaToken) {
      toast.error('Please complete the security check.')
      return
    }

    setBusy(true)
    setMessage('')
    const { error } = await sendLoginLink(email.trim().toLowerCase(), captchaToken)

    if (!error) {
      setMessage('If an account exists for this email, a login link has been sent to it.')
      setBusy(false)
      return
    }

    // Supabase intentionally does not expose account existence. For a new
    // address we fall back to its passwordless sign-up flow and keep the UI
    // message deliberately non-enumerating.
    const { error: createError } = await sendAccountCreationLink(email.trim().toLowerCase(), '', captchaToken)
    setBusy(false)
    if (createError) {
      toast.error(error.message)
      return
    }
    setMessage('If an account exists, a login link was sent. If you are new, a secure account-creation link was sent to this email.')
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
          <h1 className="font-display text-xl text-ink mb-1">Sign in</h1>
          <p className="text-sm text-ink/60 mb-6">Enter your email and we'll send a secure sign-in link.</p>

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
              {busy ? 'Sending…' : 'Send sign-in link'}
            </button>
          </form>

          {message && <p className="mt-4 rounded-lg bg-brand-50 border border-brand-100 p-3 text-sm text-brand-800">{message}</p>}

          <div className="flex items-center gap-3 my-5"><div className="h-px bg-line flex-1" /><span className="text-xs text-ink/40">OR</span><div className="h-px bg-line flex-1" /></div>

          <button onClick={handleGoogle} disabled={busy} className="w-full border border-line rounded-lg py-2.5 text-sm font-medium text-ink hover:bg-paper transition disabled:opacity-60">
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-ink/60 mt-6">
          New to Stockroom?{' '}
          <Link to="/signup" className="text-brand-600 font-medium hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
