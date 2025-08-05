import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { AccessibilitySettings } from '@/components/accessibility-settings';
import serqoLogoPath from '@assets/20250620_150619_1750447628914.png';
import { useAuth0 } from '@auth0/auth0-react';

interface HeaderProps {
  compact?: boolean;
}

export function Header({ compact = false }: HeaderProps) {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();

  return (
    <header className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img 
                src={serqoLogoPath} 
                alt="SerCrow Bird Logo" 
                className="w-10 h-10 object-contain drop-shadow-sm"
              />
              <span className="text-2xl font-bold serqo-blue dark:text-blue-400">SerCrow</span>
            </div>
          </Link>
          
          {!compact && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/results?filter=images">
                <span className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors cursor-pointer">Images</span>
              </Link>
              <Link href="/results?filter=news">
                <span className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors cursor-pointer">News</span>
              </Link>
              <Link href="/results?filter=shopping">
                <span className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors cursor-pointer">Shopping</span>
              </Link>
              <Link href="/browser">
                <span className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors cursor-pointer">Browser</span>
              </Link>
              <span className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors cursor-pointer">More</span>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            <AccessibilitySettings />
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Welcome, {user?.name}!</span>
                <Button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} variant="outline">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={() => loginWithRedirect()} className="bg-serqo-blue hover:bg-serqo-blue-dark text-white px-6 py-2 rounded-full">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

