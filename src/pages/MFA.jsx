import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function MFA() {
  const { session, listMfaFactors, enrollMfa, challengeMfa, verifyMfa, signOut } = useAuth()
  const navigate = useNavigate()
  const [factor, setFactor] = useState(null)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [mode, setMode] = useState('loading')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!session) {
        navigate('/login', { replace: true })
        return
      }
      const { data, error } = await listMfaFactors()
      if (error) {
        toast.error(error.message)
        setMode('error')
        return
      }
      const verified = data?.totp?.find((item) => item.status === 'verified')
      if (verified) {
        setFactor(verified)
        const { data: challenge, error: challengeError } = await challengeMfa(verified.id)
        if (challengeError) {
          toast.error(challengeError.message)
          setMode('error')
          return
        }
        setChallengeId(challenge.id)
        setMode('challenge')
      } else {
        const { data: enrolled, error: enrollError } = await enrollMfa()
        if (enrollError) {
          toast.error(enrollError.message)
          setMode('error')
          return
        }
        setFactor(enrolled)
        setQrCode(enrolled.totp.qr_code)
        setSecret(enrolled.totp.secret)
        setMode('enroll')
      }
    }
    load()
  }, [session, navigate, listMfaFactors, enrollMfa, challengeMfa])

  const handleVerify = async (e) => {
    e.preventDefault()
    setBusy(true)
    let currentChallengeId = challengeId
    if (!currentChallengeId) {
      const { data: challenge, error: challengeError } = await challengeMfa(factor.id)
      if (challengeError) {
        setBusy(false)
        toast.error(challengeError.message)
        return
      }
      currentChallengeId = challenge.id
    }
    const { error } = await verifyMfa(factor.id, currentChallengeId, code.trim())
    setBusy(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('MFA verified')
    navigate('/', { replace: true })
  }

  if (mode === 'loading') return <div className="min-h-screen flex items-center justify-center bg-paper">Loading security settings…</div>
  if (mode === 'error') return <div className="min-h-screen flex items-center justify-center bg-paper"><button onClick={signOut} className="border border-line rounded-lg px-4 py-2 text-sm">Sign out</button></div>

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-surface border border-line rounded-card shadow-card p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink mb-6"><ArrowLeft size={16} /> Back</Link>
        <div className="flex items-center gap-3 mb-2"><ShieldCheck className="text-brand-600" /><h1 className="font-display text-2xl">Two-factor authentication</h1></div>

        {mode === 'challenge' ? (
          <>
            <p className="text-sm text-ink/60 mb-6">Your account is protected by MFA. Enter the six-digit code from your authenticator app.</p>
            <form onSubmit={handleVerify} className="space-y-4">
              <input autoFocus inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="input text-center tracking-[0.35em] text-lg" placeholder="000000" />
              <button disabled={busy} className="w-full bg-brand-600 hover:bg-brand-700 text-paper rounded-lg py-2.5 text-sm font-medium disabled:opacity-60">{busy ? 'Verifying…' : 'Verify MFA code'}</button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm text-ink/60 mb-6">Scan this QR code with an authenticator app, then enter the generated six-digit code to enable MFA.</p>
            <div className="flex justify-center mb-5" dangerouslySetInnerHTML={{ __html: qrCode }} />
            <p className="text-xs text-ink/50 mb-2">Can't scan? Enter this secret manually:</p>
            <code className="block break-all rounded-lg bg-paper border border-line p-3 text-xs mb-5">{secret}</code>
            <form onSubmit={handleVerify} className="space-y-4">
              <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="input text-center tracking-[0.35em] text-lg" placeholder="000000" />
              <button disabled={busy} className="w-full bg-brand-600 hover:bg-brand-700 text-paper rounded-lg py-2.5 text-sm font-medium disabled:opacity-60">{busy ? 'Enabling…' : 'Enable MFA'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
