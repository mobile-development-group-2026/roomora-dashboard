import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, UserCheck, Heart, FileCheck2, TrendingUp } from 'lucide-react'

const nav = [
  { to: '/',             label: 'Overview',               icon: LayoutDashboard },
  { to: '/onboarding',   label: 'BQ1 · Onboarding',       icon: UserCheck },
  { to: '/favorites',    label: 'BQ2 · Favorites Funnel', icon: Heart },
  { to: '/applications', label: 'BQ3 · Applications',     icon: FileCheck2 },
  { to: '/conversion',   label: 'BQ4 · Conversion',       icon: TrendingUp },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="text-xl font-bold text-brand-600">Roomora</div>
          <div className="text-xs text-gray-500 mt-0.5">Analytics Dashboard</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
          Mock data · v0.1
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
