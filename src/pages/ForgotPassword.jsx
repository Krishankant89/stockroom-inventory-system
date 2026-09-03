import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Turnstile } from '@marsidev/react-turnstile'
import toast from 'react-hot-toast'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { AuthFrame } from './Login'
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY
export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth(); const [email, setEmail] = useState(''); const [captchaToken, setCaptchaToken] = useState(''); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('')
  const handleSubmit = async (e) => { e.preventDefault(); if (SITE_KEY && !captchaToken) { toast.error('Please complete the security check.'); return }; setBusy(true); setMessage(''); const { error } = await requestPasswordReset(email.trim().toLowerCase(), captchaToken); setBusy(false); if (error) toast.error(error.message); else setMessage('If an account exists for this email, a password reset link has been sent.') }
  return <AuthFrame><Typography variant="h5">Reset password</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Enter your email and we’ll send a secure reset link.</Typography><Box component="form" onSubmit={handleSubmit}><Stack spacing={2}><TextField type="email" required label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" fullWidth />{SITE_KEY ? <Turnstile siteKey={SITE_KEY} onSuccess={setCaptchaToken} onExpire={() => setCaptchaToken('')} onError={() => setCaptchaToken('')} /> : <Typography variant="caption" color="warning.dark">Turnstile site key is not configured.</Typography>}<Button type="submit" disabled={busy || !SITE_KEY} variant="contained" fullWidth>{busy ? 'Sending…' : 'Send reset link'}</Button></Stack></Box>{message && <Typography variant="body2" sx={{ mt: 2, p: 1.5, bgcolor: '#eef7f1', border: 1, borderColor: '#d7ecdd', borderRadius: 1, color: 'primary.dark' }}>{message}</Typography>}<Typography variant="body2" align="center" sx={{ mt: 3 }}><Link to="/login" style={{ color: '#2f7d58', fontWeight: 600 }}>Back to sign in</Link></Typography></AuthFrame>
}
