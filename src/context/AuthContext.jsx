import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const getAuthRedirectUrl = () => `${window.location.origin}/auth/callback`

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      // Wait for URL token/code exchange before routing decisions.
      if (event === 'INITIAL_SESSION') {
        setLoading(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      return
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [session])

  const sendLoginLink = (email, captchaToken) =>
    supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: getAuthRedirectUrl(),
        captchaToken,
      },
    })

  const sendAccountCreationLink = (email, fullName, captchaToken) =>
    supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: getAuthRedirectUrl(),
        data: { full_name: fullName },
        captchaToken,
      },
    })

  const signUp = async (email, password, fullName, captchaToken) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: getAuthRedirectUrl(),
        captchaToken,
      },
    })
    return { data, error }
  }

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getAuthRedirectUrl() },
    })

  const getMfaAssurance = () => supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  const listMfaFactors = () => supabase.auth.mfa.listFactors()

  const enrollMfa = (friendlyName = 'Stockroom Authenticator') =>
    supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName })

  const challengeMfa = (factorId) => supabase.auth.mfa.challenge({ factorId })

  const verifyMfa = (factorId, challengeId, code) =>
    supabase.auth.mfa.verify({ factorId, challengeId, code })

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user,
        profile,
        loading,
        sendLoginLink,
        sendAccountCreationLink,
        signUp,
        signInWithGoogle,
        getMfaAssurance,
        listMfaFactors,
        enrollMfa,
        challengeMfa,
        verifyMfa,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)