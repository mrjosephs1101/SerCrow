import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DuckDuckGoBrowser } from '@/components/DuckDuckGoBrowser';
import { Search as SearchIcon, Mic, Settings, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showBrowser, setShowBrowser] = useState(!!searchParams.get('q'));
  const navigate = useNavigate();

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      setShowBrowser(true);
    }
  }, [searchParams]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      setShowBrowser(true);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`, { replace: true });
    }
  };

  const handleBackToHome = () => {
    setQuery('');
    setShowBrowser(false);
    navigate('/search', { replace: true });
  };

  if (showBrowser) {
    return (
      <div className="h-screen">
        <DuckDuckGoBrowser 
          initialQuery={query}
          initialUrl={query.startsWith('http') ? query : ''}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <span className="font-semibold text-lg">SerCrow</span>
          <Badge variant="secondary" className="ml-2">
            <Globe className="h-3 w-3 mr-1" />
            Private Search Engine
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/setup')}
            className="ml-2"
          >
            <Settings className="h-4 w-4 mr-2" /> Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/auth')}
            className="ml-2"
          >
            Sign in
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/SerCrow logo.png"
            alt="SerCrow Logo"
            className="w-96 h-auto"
          />
        </div>

        {/* Tagline */}
        <div className="mb-6 text-center">
          <h2 className="text-xl text-gray-600 mb-2">The search engine that doesn't track you.</h2>
          <p className="text-sm text-gray-500">Private search with built-in browser protection.</p>
        </div>

        {/* Search Box */}
        <div className="w-full max-w-xl mb-8">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="flex items-center border-2 border-gray-300 rounded-full px-4 py-3 hover:shadow-lg focus-within:shadow-lg focus-within:border-orange-500 transition-all">
                <SearchIcon className="h-5 w-5 text-gray-400 mr-3" />
                <Input
                  type="text"
                  placeholder="Search the web without being tracked..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 border-none outline-none text-base bg-transparent focus:ring-0"
                  autoFocus
                />
                <Mic className="h-5 w-5 text-gray-400 ml-3 cursor-pointer hover:text-orange-500 transition-colors" />
              </div>
            </div>
          </form>
        </div>

        {/* Search Buttons */}
        <div className="flex space-x-4 mb-8">
          <Button
            type="submit"
            className="px-6 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-full"
            onClick={handleSearch}
          >
            Search Privately
          </Button>
          <Button
            variant="outline"
            className="px-6 py-2 text-sm border-orange-300 text-orange-600 hover:bg-orange-50 rounded-full"
            onClick={() => {
              const randomQueries = ['latest tech news', 'healthy recipes', 'weather forecast', 'movie reviews', 'travel destinations'];
              const randomQuery = randomQueries[Math.floor(Math.random() * randomQueries.length)];
              setQuery(randomQuery);
              setShowBrowser(true);
              navigate(`/search?q=${encodeURIComponent(randomQuery)}`);
            }}
          >
            I'm Feeling Private
          </Button>
        </div>

        {/* Privacy Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mb-8">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 text-xl">🛡️</span>
            </div>
            <h3 className="font-semibold mb-2">No Tracking</h3>
            <p className="text-sm text-gray-600">We don't store your personal information or search history.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 text-xl">🌐</span>
            </div>
            <h3 className="font-semibold mb-2">Built-in Browser</h3>
            <p className="text-sm text-gray-600">Browse search results with integrated privacy protection.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 text-xl">⚡</span>
            </div>
            <h3 className="font-semibold mb-2">Fast & Clean</h3>
            <p className="text-sm text-gray-600">No ads, no clutter, just the results you need.</p>
          </div>
        </div>

        {/* Language Options */}
        <div className="text-sm text-gray-600">
          SerCrow offered in: 
          <a href="#" className="text-orange-600 hover:underline ml-1">English</a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="px-8 py-4 text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <a href="#" className="hover:text-orange-600 transition-colors">About</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Help</a>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-orange-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Settings</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Feedback</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
