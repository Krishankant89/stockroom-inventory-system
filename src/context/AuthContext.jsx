import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  sanitizeEmail,
  sanitizeText,
  validateEmail,
  validateFullName,
  validatePassword,
} from '../lib/inputValidation'

const AuthContext = createContext(null)

const getAuthRedirectUrl = () => `${window.location.origin}/auth/callback`
const getPasswordResetRedirectUrl = () => `${window.location.origin}/update-password`

async function fetchProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [passwordRecovery, setPasswordRecovery] = useState(false)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true)
      }
      if (event === 'SIGNED_OUT') {
        setPasswordRecovery(false)
        setProfile(null)
      }
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
    fetchProfile(session.user.id).then((data) => setProfile(data))
  }, [session])

  const refreshProfile = async () => {
    if (!session?.user) return null
    const data = await fetchProfile(session.user.id)
    setProfile(data)
    return data
  }

  const sendLoginLink = (email, captchaToken) => {
    const normalizedEmail = sanitizeEmail(email)
    const emailError = validateEmail(normalizedEmail)
    if (emailError) return Promise.resolve({ data: null, error: { message: emailError } })

    return supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: getAuthRedirectUrl(),
        captchaToken,
      },
    })
  }

  const sendAccountCreationLink = (email, fullName, captchaToken) => {
    const normalizedEmail = sanitizeEmail(email)
    const cleanName = sanitizeText(fullName)
    const emailError = validateEmail(normalizedEmail)
    const nameError = cleanName ? validateFullName(cleanName) : ''
    if (emailError || nameError) {
      return Promise.resolve({ data: null, error: { message: emailError || nameError } })
    }

    return supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: getAuthRedirectUrl(),
        data: { full_name: cleanName },
        captchaToken,
      },
    })
  }

  const signUp = async (email, password, fullName, captchaToken) => {
    const normalizedEmail = sanitizeEmail(email)
    const cleanName = sanitizeText(fullName)
    const emailError = validateEmail(normalizedEmail)
    const nameError = validateFullName(cleanName)
    const passwordError = validatePassword(password)
    if (emailError || nameError || passwordError) {
      return { data: null, error: { message: emailError || nameError || passwordError } }
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { full_name: cleanName },
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

  const requestPasswordReset = (email, captchaToken) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordResetRedirectUrl(),
      captchaToken,
    })

  const updatePassword = (password) => supabase.auth.updateUser({ password })

  const updateProfile = async ({ fullName, username }) => {
    const userId = session?.user?.id
    if (!userId) return { error: { message: 'You must be signed in.' } }

    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: fullName, username },
    })
    if (authError) return { error: authError }

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, username })
      .eq('id', userId)
      .select()
      .single()

    if (!error && data) setProfile(data)
    return { data, error }
  }

  const requestEmailChange = (email) =>
    supabase.auth.updateUser({
      email,
      options: { emailRedirectTo: getAuthRedirectUrl() },
    })

  const deactivateAccount = async () => {
    const { error } = await supabase.rpc('deactivate_own_account')
    if (error) return { error }
    return signOut()
  }

  const getMfaAssurance = () => supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  const listMfaFactors = () => supabase.auth.mfa.listFactors()

  const enrollMfa = (friendlyName = 'Stockroom Authenticator') =>
    supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName })

  const challengeMfa = (factorId) => supabase.auth.mfa.challenge({ factorId })

  const verifyMfa = (factorId, challengeId, code) =>
    supabase.auth.mfa.verify({ factorId, challengeId, code })

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    setSession(null)
    setProfile(null)
    setPasswordRecovery(false)
    return { error }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user,
        profile,
        loading,
        passwordRecovery,
        sendLoginLink,
        sendAccountCreationLink,
        signUp,
        signInWithGoogle,
        requestPasswordReset,
        updatePassword,
        updateProfile,
        requestEmailChange,
        deactivateAccount,
        refreshProfile,
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
