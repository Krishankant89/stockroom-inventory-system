import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const { session, loading, getMfaAssurance } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    const finish = async () => {
      if (!session) {
        navigate('/login', { replace: true })
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
  }, [session, loading, getMfaAssurance, navigate])

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-paper text-brand-700 font-display text-lg">
      Completing sign in…
    </div>
  )
}
