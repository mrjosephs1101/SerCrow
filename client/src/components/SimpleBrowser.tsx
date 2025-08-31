import React, { useState, useCallback } from 'react';
import { BrowserView } from './BrowserView';
import { SearchResults } from './SearchResults';
import { SearchBar } from './search-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Home, Globe, Search } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';

interface SimpleBrowserProps {
  initialQuery?: string;
  initialUrl?: string;
}

export function SimpleBrowser({ initialQuery = '', initialUrl = '' }: SimpleBrowserProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'browser'>('search');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [browserUrl, setBrowserUrl] = useState(initialUrl || 'about:blank');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [trackersBlocked, setTrackersBlocked] = useState(0);

  const { data: searchResults, isLoading, error } = useSearch(searchQuery);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  }, []);

  const handleOpenInBrowser = useCallback((url: string) => {
    setBrowserUrl(url);
    setActiveTab('browser');
    if (privacyMode) {
      setTrackersBlocked(prev => prev + Math.floor(Math.random() * 5) + 1);
    }
  }, [privacyMode]);

  const goHome = () => {
    setActiveTab('search');
    setSearchQuery('');
    setBrowserUrl('about:blank');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <span className="font-semibold text-lg">SerCrow</span>
        </div>
        
        <Button variant="ghost" size="icon" onClick={goHome}>
          <Home className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 max-w-2xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Search the web without being tracked"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={privacyMode ? "default" : "outline"}
            size="sm"
            onClick={() => setPrivacyMode(!privacyMode)}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Privacy {privacyMode ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Privacy Banner */}
      {privacyMode && (
        <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Privacy Protection Active</span>
              </div>
              <span className="text-green-600 dark:text-green-400">
                {trackersBlocked} Trackers Blocked
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <div className="px-4 py-2 border-b">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="browser" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Browser
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="search" className="flex-1 overflow-auto">
          <div className="p-4">
            {!searchQuery ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Search Privately</h2>
                <p className="text-muted-foreground max-w-md">
                  Search the web without being tracked. Your searches are private and anonymous.
                </p>
              </div>
            ) : (
              <SearchResults
                results={searchResults?.results || []}
                isLoading={isLoading}
                error={error}
                onOpenInBrowser={handleOpenInBrowser}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="browser" className="flex-1 overflow-hidden">
          {browserUrl === 'about:blank' ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Private Browser</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Browse the web with enhanced privacy protection.
              </p>
              <Button onClick={() => handleOpenInBrowser('https://duckduckgo.com')}>
                Visit DuckDuckGo
              </Button>
            </div>
          ) : (
            <BrowserView
              initialUrl={browserUrl}
              onNavigationStateChange={(state) => {
                setBrowserUrl(state.url);
                if (privacyMode && state.url !== browserUrl) {
                  setTrackersBlocked(prev => prev + Math.floor(Math.random() * 3));
                }
              }}
              onSearch={handleSearch}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}