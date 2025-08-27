import React, { useState, useCallback, useEffect } from 'react';
import { BrowserView } from './BrowserView';
import { SearchResults } from './SearchResults';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Globe, ArrowUpRight } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function SearchWithBrowser() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'search' | 'browser'>('search');
  const [browserUrl, setBrowserUrl] = useState('about:blank');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isSearching, setIsSearching] = useState(false);
  
  const { results, isLoading, error, search } = useSearch();

  // Initialize from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    const tab = searchParams.get('tab') as 'search' | 'browser' | null;
    
    if (query) {
      setSearchQuery(query);
      if (!isSearching) {
        handleSearch(query);
      }
    }
    
    if (tab === 'browser') {
      setActiveTab('browser');
      const url = searchParams.get('url');
      if (url) {
        setBrowserUrl(url);
      }
    }
  }, [searchParams]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      await search(query);
      // Update URL without triggering a full page reload
      navigate(`/search?q=${encodeURIComponent(query)}&tab=search`, { replace: true });
      setActiveTab('search');
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }, [navigate, search]);

  const handleBrowserNavigation = (url: string) => {
    setBrowserUrl(url);
    // Update URL to reflect the current browser state
    navigate(`/search?q=${encodeURIComponent(searchQuery)}&tab=browser&url=${encodeURIComponent(url)}`, { replace: true });
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const openInBrowser = (url: string) => {
    setBrowserUrl(url);
    setActiveTab('browser');
    navigate(`/search?q=${encodeURIComponent(searchQuery)}&tab=browser&url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value as 'search' | 'browser');
          navigate(`/search?q=${encodeURIComponent(searchQuery)}&tab=${value}${value === 'browser' ? `&url=${encodeURIComponent(browserUrl)}` : ''}`);
        }}
        className="flex-1 flex flex-col h-full"
      >
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <TabsList>
            <TabsList>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </TabsTrigger>
              <TabsTrigger value="browser" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Browser</span>
              </TabsTrigger>
            </TabsList>
          </TabsList>
          
          {activeTab === 'browser' && browserUrl !== 'about:blank' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => openInNewTab(browserUrl)}
              className="flex items-center gap-2"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Open in new tab</span>
            </Button>
          )}
        </div>
        
        <TabsContent value="search" className="flex-1 overflow-auto">
          <div className="p-4">
            <SearchResults 
              results={results} 
              isLoading={isLoading} 
              error={error} 
              onOpenInBrowser={openInBrowser}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="browser" className="flex-1 overflow-hidden">
          <BrowserView 
            initialUrl={browserUrl}
            onNavigationStateChange={(state) => {
              if (state.url !== browserUrl) {
                handleBrowserNavigation(state.url);
              }
            }}
            className="h-full"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
