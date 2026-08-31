import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ArrowLeftRight,
  BarChart3,
  Boxes,
  UserCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/transactions', label: 'Stock Movements', icon: ArrowLeftRight },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/account', label: 'Account', icon: UserCircle },
]

export default function Layout() {
  const { profile, user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="w-9 h-9 rounded-card bg-brand-600 flex items-center justify-center text-paper shrink-0">
          <Boxes size={18} />
        </div>
        <span className="font-display text-xl text-ink">Stockroom</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-600 text-paper'
                  : 'text-ink/70 hover:bg-brand-50 hover:text-ink'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 pt-3 border-t border-line mx-3">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
            {(profile?.full_name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">
              {profile?.full_name || 'Team member'}
            </p>
            <p className="text-xs text-ink/50 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full mt-1 flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-ink/60 hover:bg-rose/10 hover:text-rose transition"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-line bg-surface shrink-0">
        <NavContent />
      </aside>

      {/* Mobile topbar + drawer */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-surface border-b border-line flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-paper">
            <Boxes size={15} />
          </div>
          <span className="font-display text-lg text-ink">Stockroom</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-ink/70">
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-72 bg-surface flex flex-col animate-fadeUp">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-[-3rem] text-paper bg-ink/40 rounded-full p-1.5"
            >
              <X size={18} />
            </button>
            <NavContent />
          </div>
          <div className="flex-1 bg-ink/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
