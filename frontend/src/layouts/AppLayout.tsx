import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Layers, LogOut, Shield, Users, Tickets } from 'lucide-react'

export default function AppLayout() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn('flex items-center gap-1.5 text-sm font-medium transition-colors',
      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b bg-background sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Tickets className="h-5 w-5 text-primary" />
              Zeal
            </div>
            <nav className="flex items-center gap-5">
              <NavLink to="/users" className={navLink}>
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </NavLink>
              {isAdmin && (
                <NavLink to="/roles" className={navLink}>
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Roles</span>
                </NavLink>
              )}
              <NavLink to="/teams" className={navLink}>
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Teams</span>
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="avatar"
                className="h-8 w-8 rounded-full object-cover border"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.firstName} {user?.lastName}
              {user?.role && (
                <span className="ml-1 text-xs opacity-60">({user.role.name})</span>
              )}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
