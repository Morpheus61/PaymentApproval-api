import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Users, FileText, Layout, Menu, Key } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { useState } from 'react';
import { ChangePassword } from '@/components/auth/change-password';

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleNewVoucher = () => {
    navigate('/dashboard', { state: { showNewVoucher: true } });
    setIsMenuOpen(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'generator':
        return 'Voucher Generator';
      case 'approver':
        return 'Voucher Approver';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center flex-shrink-0">
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Relish Foods Pvt. Ltd.</h1>
          </div>

          {user && (
            <>
              <div className="hidden md:flex items-center space-x-6">
                {/* User Info */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                  </div>
                </div>

                <nav className="flex items-center space-x-4">
                  {/* Desktop Navigation */}
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <Layout className="h-4 w-4" />
                      <span>Dashboard</span>
                    </div>
                  </Link>

                  {user.role === 'generator' && (
                    <button
                      onClick={handleNewVoucher}
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>New Voucher</span>
                      </div>
                    </button>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActive('/admin')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </div>
                    </Link>
                  )}
                </nav>

                <NotificationBell />

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowChangePassword(true)}
                  className="flex items-center space-x-2"
                >
                  <Key className="h-4 w-4" />
                  <span>Change Password</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>

              {/* Mobile menu button */}
              <div className="flex md:hidden items-center space-x-2">
                {/* User Info for Mobile */}
                <div className="text-right mr-4">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                </div>
                <NotificationBell />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {isMenuOpen && user && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="space-y-1 px-2 pb-3 pt-2">
              <Link
                to="/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/dashboard')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <Layout className="h-5 w-5" />
                  <span>Dashboard</span>
                </div>
              </Link>

              {user.role === 'generator' && (
                <button
                  onClick={handleNewVoucher}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>New Voucher</span>
                  </div>
                </button>
              )}

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </div>
                </Link>
              )}

              <button
                onClick={() => {
                  setShowChangePassword(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900"
              >
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Change Password</span>
                </div>
              </button>

              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900"
              >
                <div className="flex items-center space-x-2">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <ChangePassword
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </header>
  );
}