import React, { useState, useCallback, useEffect } from 'react';
import { BrowserView } from './BrowserView';
import { SearchResults } from './SearchResults';
import { SearchBar } from './search-bar';
import { PrivacySettings } from './PrivacySettings';
import { QuickStartGuide } from './QuickStartGuide';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Settings, 
  Home, 
  Globe, 
  Search,
  Lock,
  Zap,
  X,
  ArrowLeft,
  Menu,
  Star,
  Download
} from 'lucide-react';
import { useSearch } from '@/hooks/use-search';
import { useNavigate } from 'react-router-dom';

interface DuckDuckGoBrowserProps {
  initialQuery?: string;
  initialUrl?: string;
}

export function DuckDuckGoBrowser({ initialQuery = '', initialUrl = '' }: DuckDuckGoBrowserProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'search' | 'browser'>(initialQuery ? 'search' : 'search');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [browserUrl, setBrowserUrl] = useState(initialUrl || 'about:blank');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [trackersBlocked, setTrackersBlocked] = useState(Math.floor(Math.random() * 50) + 10);
  const [adsBlocked, setAdsBlocked] = useState(Math.floor(Math.random() * 30) + 5);
  const [httpsUpgrades, setHttpsUpgrades] = useState(Math.floor(Math.random() * 20) + 2);
  const [showSettings, setShowSettings] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const { data: searchResults, isLoading, error } = useSearch(searchQuery);

  // Auto-search on mount if there's an initial query
  useEffect(() => {
    if (initialQuery && !searchResults) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  }, []);

  const handleOpenInBrowser = useCallback((url: string) => {
    setBrowserUrl(url);
    setActiveTab('browser');
    // Simulate privacy protection stats
    if (privacyMode) {
      setTrackersBlocked(prev => prev + Math.floor(Math.random() * 5) + 1);
      setAdsBlocked(prev => prev + Math.floor(Math.random() * 3) + 1);
      if (url.startsWith('http://')) {
        setHttpsUpgrades(prev => prev + 1);
      }
    }
  }, [privacyMode]);

  const goHome = () => {
    setActiveTab('search');
    setSearchQuery('');
    setBrowserUrl('about:blank');
  };

  const resetPrivacyStats = () => {
    setTrackersBlocked(0);
    setAdsBlocked(0);
    setHttpsUpgrades(0);
  };

  const addToFavorites = (url: string) => {
    if (!favorites.includes(url)) {
      setFavorites([...favorites, url]);
    }
  };

  const goBackToHome = () => {
    navigate('/search');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header with DuckDuckGo-style branding and search */}
      <div className="flex items-center gap-3 p-3 border-b bg-white dark:bg-gray-900 shadow-sm">
        <Button variant="ghost" size="icon" onClick={goBackToHome} className="hover:bg-gray-100">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <span className="font-semibold text-lg text-gray-800">SerCrow</span>
        </div>
        
        <div className="flex-1 max-w-3xl mx-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Search privately or enter a URL..."
            className="w-full border-2 border-gray-200 rounded-full hover:border-orange-300 focus-within:border-orange-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {browserUrl !== 'about:blank' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => addToFavorites(browserUrl)}
              className="hover:bg-yellow-100"
              title="Add to favorites"
            >
              <Star className={`h-4 w-4 ${favorites.includes(browserUrl) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
            </Button>
          )}
          
          <Badge 
            variant={privacyMode ? "default" : "secondary"}
            className={`flex items-center gap-1 px-3 py-1 cursor-pointer transition-colors ${
              privacyMode 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            onClick={() => {
              setPrivacyMode(!privacyMode);
              if (!privacyMode) resetPrivacyStats();
            }}
          >
            <Shield className="h-3 w-3" />
            {privacyMode ? 'Protected' : 'Standard'}
          </Badge>

          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <Menu className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Privacy & Settings
                </DialogTitle>
              </DialogHeader>
              <PrivacySettings
                privacyMode={privacyMode}
                onTogglePrivacy={setPrivacyMode}
                trackersBlocked={trackersBlocked}
                adsBlocked={adsBlocked}
                httpsUpgrades={httpsUpgrades}
                onReset={resetPrivacyStats}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Privacy Protection Banner */}
      {privacyMode && (
        <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Privacy Protection Active</span>
              </div>
              
              <div className="flex items-center gap-4 text-green-600 dark:text-green-400">
                <span>{trackersBlocked} Trackers Blocked</span>
                <span>{adsBlocked} Ads Blocked</span>
                <span>{httpsUpgrades} HTTPS Upgrades</span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetPrivacyStats}
              className="text-green-600 hover:text-green-700"
            >
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as any)} 
        className="flex-1 flex flex-col"
      >
        <div className="px-4 py-2 border-b">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Results
            </TabsTrigger>
            <TabsTrigger value="browser" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Web Browser
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Search Results Tab */}
        <TabsContent value="search" className="flex-1 overflow-auto">
          {!searchQuery ? (
            <QuickStartGuide
              onStartSearching={() => {
                // Focus the search bar
                const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                searchInput?.focus();
              }}
              onOpenBrowser={() => {
                handleOpenInBrowser('https://duckduckgo.com');
              }}
            />
          ) : (
            <div className="p-4">
              <SearchResults
                results={searchResults?.results || []}
                isLoading={isLoading}
                error={error}
                onOpenInBrowser={handleOpenInBrowser}
              />
            </div>
          )}
        </TabsContent>

        {/* Browser Tab */}
        <TabsContent value="browser" className="flex-1 overflow-hidden">
          {browserUrl === 'about:blank' ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Private Browser</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Browse the web with enhanced privacy protection. Trackers and ads are automatically blocked.
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
                  // Simulate blocking trackers on navigation
                  setTrackersBlocked(prev => prev + Math.floor(Math.random() * 3));
                }
              }}
              onSearch={handleSearch}
              className="h-full"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}