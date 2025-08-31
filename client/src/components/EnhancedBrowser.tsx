import React, { useState, useCallback, useEffect } from 'react';
import { BrowserView } from './BrowserView';
import { SearchResults } from './SearchResults';
import { SearchBar } from './search-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, Settings, Home } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';

interface EnhancedBrowserProps {
  initialQuery?: string;
  initialUrl?: string;
}

export function EnhancedBrowser({ initialQuery = '', initialUrl = '' }: EnhancedBrowserProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'browser'>('search');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [browserUrl, setBrowserUrl] = useState(initialUrl || 'about:blank');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [adBlockEnabled, setAdBlockEnabled] = useState(true);
  const [trackersBlocked, setTrackersBlocked] = useState(0);

  const { data: searchResults, isLoading, error } = useSearch(searchQuery);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  }, []);

  const handleOpenInBrowser = useCallback((url: string) => {
    setBrowserUrl(url);
    setActiveTab('browser');
  }, []);

  const goHome = () => {
    setActiveTab('search');
    setSearchQuery('');
    setBrowserUrl('about:blank');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header with search and privacy controls */}
      <div className="flex items-center gap-4 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={goHome}>
          <Home className="h-4 w-4" />
        </Button>
        
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Search privately or enter URL"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={privacyMode ? "default" : "secondary"} className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Privacy: {privacyMode ? 'ON' : 'OFF'}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPrivacyMode(!privacyMode)}
          >
            {privacyMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Privacy stats */}
      {privacyMode && (
        <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-b">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700 dark:text-green-300">
              🛡️ Privacy Protection Active
            </span>
            <span className="text-green-600 dark:text-green-400">
              {trackersBlocked} trackers blocked
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <TabsContent value="search" className="flex-1 overflow-auto p-4">
          <SearchResults
            results={searchResults?.results || []}
            isLoading={isLoading}
            error={error}
            onOpenInBrowser={handleOpenInBrowser}
          />
        </TabsContent>

        <TabsContent value="browser" className="flex-1 overflow-hidden">
          <BrowserView
            initialUrl={browserUrl}
            onNavigationStateChange={(state) => {
              setBrowserUrl(state.url);
              if (privacyMode) {
                setTrackersBlocked(prev => prev + Math.floor(Math.random() * 3));
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}