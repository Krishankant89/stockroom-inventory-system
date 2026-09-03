import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function AuthCallback() {
  const { session, loading, passwordRecovery, getMfaAssurance } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    const finish = async () => {
      if (!session) {
        navigate('/login', { replace: true })
        return
      }

      if (passwordRecovery) {
        navigate('/update-password', { replace: true })
        return
      }

      try {
        const { data, error } = await getMfaAssurance()
        if (!error && data?.currentLevel === 'aal1' && data?.nextLevel === 'aal2') {
          navigate('/mfa', { replace: true })
          return
        }
      } catch {
        // Fall through to dashboard when MFA status cannot be read.
      }

      navigate('/', { replace: true })
    }

    finish()
  }, [session, loading, passwordRecovery, getMfaAssurance, navigate])

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, bgcolor: 'background.default', color: 'primary.main' }}>
      <CircularProgress size={22} /><Typography variant="h6">Completing sign in…</Typography>
    </Box>
  )
}
