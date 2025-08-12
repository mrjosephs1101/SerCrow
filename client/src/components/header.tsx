import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { AccessibilitySettings } from '@/components/accessibility-settings';
import serqoLogoPath from '@assets/20250620_150619_1750447628914.png';
import { useEffect, useState } from 'react';

interface HeaderProps {
  compact?: boolean;
}

export function Header({ compact = false }: HeaderProps) {
  const [me, setMe] = useState<any>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setMe(data);
      } catch {}
    })();
  }, []);

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
              <Link href="/wingman">
                <span className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors cursor-pointer">WingMan AI</span>
              </Link>
              <Link href="/browser">
                <span className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors cursor-pointer">Browser</span>
              </Link>
              <span className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors cursor-pointer">More</span>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            <AccessibilitySettings />
            {me ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Welcome, {me.email}!</span>
                <Button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.reload(); }} variant="outline">
                  Sign Out
                </Button>
              </div>
            ) : (
              <a href="/auth">
                <Button className="bg-serqo-blue hover:bg-serqo-blue-dark text-white px-6 py-2 rounded-full">
                  Sign In
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

