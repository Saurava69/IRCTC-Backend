import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Train, Shield, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/pnr', label: 'PNR Status' },
  ];

  if (isAuthenticated) {
    navLinks.push({ to: '/my-bookings', label: 'Bookings' });
  }

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 animate-slide-down">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <div className="bg-primary p-2 rounded-lg">
              <Train className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              Rail<span className="text-primary">Book</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150 no-underline"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-all duration-150 no-underline flex items-center gap-1.5"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-150"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="text-muted-foreground hover:text-foreground font-medium"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="bg-primary text-white hover:bg-primary/90 font-medium shadow-sm"
                >
                  Register
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 animate-slide-down border-t border-border pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary no-underline transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 no-underline"
                onClick={() => setMobileOpen(false)}
              >
                Admin Panel
              </Link>
            )}
            <div className="pt-3 border-t border-border space-y-1">
              {isAuthenticated ? (
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                    Login
                  </Button>
                  <Button size="sm" className="w-full bg-primary text-white" onClick={() => { navigate('/register'); setMobileOpen(false); }}>
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
