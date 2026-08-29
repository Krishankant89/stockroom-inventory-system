import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MFA from './pages/MFA'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Suppliers from './pages/Suppliers'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import { useEffect, useState } from 'react'

function PrivateRoute({ children }) {
  const { session, loading, getMfaAssurance } = useAuth()
  const location = useLocation()
  const [mfaLoading, setMfaLoading] = useState(true)
  const [needsMfa, setNeedsMfa] = useState(false)

  useEffect(() => {
    let active = true
    const check = async () => {
      if (!session) {
        if (active) setMfaLoading(false)
        return
      }

      try {
        const { data, error } = await getMfaAssurance()
        if (active) {
          setNeedsMfa(!error && data?.currentLevel === 'aal1' && data?.nextLevel === 'aal2')
          setMfaLoading(false)
        }
      } catch {
        if (active) {
          setNeedsMfa(false)
          setMfaLoading(false)
        }
      }
    }
    check()
    return () => { active = false }
  }, [session, getMfaAssurance])

  if (loading || mfaLoading) return <div className="h-screen w-screen flex items-center justify-center bg-paper text-brand-700 font-display text-lg">Loading Stockroom…</div>
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (needsMfa && location.pathname !== '/mfa') return <Navigate to="/mfa" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/mfa" element={<PrivateRoute><MFA /></PrivateRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ style: { background: '#12241f', color: '#f6f4ee', fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '10px' } }} />
      <AppRoutes />
    </AuthProvider>
  )
}
