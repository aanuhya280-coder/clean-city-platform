import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Menu,
  X,
  LogOut,
  MapPin,
  Home,
  PlusCircle,
  LayoutDashboard,
  BarChart3,
  FileText,
  Info,
  Shield,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/feed', label: 'Reports', icon: FileText },
  { to: '/map', label: 'Map', icon: MapPin },
  { to: '/dashboard', label: 'Analytics', icon: BarChart3 },
  { to: '/about', label: 'About', icon: Info },
];

export default function Layout() {
  const { user, profile, signOut, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-green-600 font-bold text-xl">
              <Shield className="w-7 h-7" />
              <span className="hidden sm:inline">CleanCity</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(to) ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              {user && (
                <Link
                  to="/submit"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/submit') ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit
                </Link>
              )}
              {isStaff && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin') ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">{profile?.full_name || profile?.email}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">
                    {profile?.role}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1 text-slate-500 hover:text-red-600 text-sm transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-green-600 transition-colors">
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-medium bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white py-3">
            <nav className="flex flex-col px-4 gap-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(to) ? 'bg-green-50 text-green-700' : 'text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              {user && (
                <Link
                  to="/submit"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive('/submit') ? 'bg-green-50 text-green-700' : 'text-slate-600'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit Report
                </Link>
              )}
              {isStaff && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive('/admin') ? 'bg-green-50 text-green-700' : 'text-slate-600'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              <div className="border-t border-slate-200 mt-2 pt-2">
                {user ? (
                  <button
                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                ) : (
                  <div className="flex flex-col gap-1">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm text-slate-600">
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg text-center"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <Shield className="w-5 h-5" />
              CleanCity
            </div>
            <p className="text-sm text-slate-500">Garbage Reporting & Public Transparency Platform</p>
            <p className="text-xs text-slate-400">Open data for cleaner communities</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
