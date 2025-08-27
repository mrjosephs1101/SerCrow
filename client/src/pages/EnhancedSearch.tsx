import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SearchWithBrowser } from '@/components/SearchWithBrowser';
import { useEnhancedSearch } from '@/hooks/use-enhanced-search';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, Home } from 'lucide-react';

export function EnhancedSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    query,
    setQuery,
    results,
    suggestions,
    isSearching,
    error,
    search,
    navigateTo,
    browserUrl,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
  } = useEnhancedSearch(searchParams.get('q') || '');

  // Handle initial search from URL
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      search(queryParam);
    }
  }, [searchParams, search]);

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    // Update URL with search query
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    
    // Execute the search
    search(searchQuery);
  };

  // Handle opening a URL in the browser
  const handleOpenInBrowser = (url: string, title: string = '') => {
    navigateTo(url, title);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              aria-label="Go to home"
            >
              <Home className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              SerCrow
            </h1>
          </div>
          
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(query);
                  }
                }}
                placeholder="Search the web or enter a URL"
                className="block w-full pl-10 pr-4 py-2 border border-input rounded-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Search the web or enter a URL"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <span className="sr-only">Clear search</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/settings')}
            >
              Settings
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <SearchWithBrowser 
          query={query}
          results={results}
          suggestions={suggestions}
          isLoading={isSearching}
          error={error}
          browserUrl={browserUrl}
          onSearch={handleSearch}
          onOpenInBrowser={handleOpenInBrowser}
          onGoBack={goBack}
          onGoForward={goForward}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          className="h-full"
        />
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-card py-2 px-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} SerCrow - Privacy-friendly Search & Browser</p>
        </div>
      </footer>
    </div>
  );
}
