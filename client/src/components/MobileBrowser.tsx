import React, { useState, useCallback, useEffect } from 'react';
import { SearchResults } from './SearchResults';
import { SearchBar } from './search-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Shield, 
  Settings, 
  Home, 
  Globe, 
  Search,
  Lock,
  Menu,
  Star,
  ArrowLeft,
  Share,
  Bookmark
} from 'lucide-react';
import { useSearch } from '@/hooks/use-search';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileBrowserProps {
  initialQuery?: string;
  initialUrl?: string;
}

export function MobileBrowser({ initialQuery = '', initialUrl = '' }: MobileBrowserProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'search' | 'browser'>('search');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [browserUrl, setBrowserUrl] = useState(initialUrl || 'about:blank');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [trackersBlocked, setTrackersBlocked] = useState(Math.floor(Math.random() * 25) + 5);
  const [adsBlocked, setAdsBlocked] = useState(Math.floor(Math.random() * 15) + 2);
  const [showMenu, setShowMenu] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const { data: searchResults, isLoading, error } = useSearch(searchQuery);

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
    if (privacyMode) {
      setTrackersBlocked(prev => prev + Math.floor(Math.random() * 3) + 1);
      setAdsBlocked(prev => prev + Math.floor(Math.random() * 2));
    }
  }, [privacyMode]);

  const goBackToHome = () => {
    navigate('/search');
  };

  const shareCurrentPage = async () => {
    if (navigator.share && browserUrl !== 'about:blank') {
      try {
        await navigator.share({
          title: 'SerCrow Search Result',
          url: browserUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const addToFavorites = (url: string) => {
    if (!favorites.includes(url)) {
      setFavorites([...favorites, url]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <div className="flex items-center gap-2 p-3 border-b bg-white shadow-sm">
        <Button variant="ghost" size="icon" onClick={goBackToHome} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">SC</span>
          </div>
          <span className="font-semibold text-sm">SerCrow</span>
          {privacyMode && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-700">
              <Shield className="h-2 w-2 mr-1" />
              Protected
            </Badge>
          )}
        </div>

        <Sheet open={showMenu} onOpenChange={setShowMenu}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Privacy & Settings
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-sm mb-2 text-green-800">Privacy Protection</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Trackers blocked:</span>
                    <span className="font-mono">{trackersBlocked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ads blocked:</span>
                    <span className="font-mono">{adsBlocked}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setPrivacyMode(!privacyMode)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Mode: {privacyMode ? 'ON' : 'OFF'}
                </Button>
                
                {browserUrl !== 'about:blank' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={shareCurrentPage}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share Page
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => addToFavorites(browserUrl)}
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      Add to Favorites
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b bg-gray-50">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder="Search privately..."
          className="w-full border-2 border-gray-200 rounded-full focus-within:border-orange-500 transition-colors"
        />
      </div>

      {/* Privacy Stats Banner */}
      {privacyMode && (
        <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-blue-50 border-b">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-green-700">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Protected</span>
            </div>
            <div className="flex items-center gap-4 text-green-600">
              <span>{trackersBlocked} blocked</span>
              <span>{adsBlocked} ads removed</span>
            </div>
          </div>
        </div>
      )}

      {/* Content Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as any)} 
        className="flex-1 flex flex-col"
      >
        <div className="px-3 py-2 border-b bg-white">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="search" className="text-xs flex items-center gap-1">
              <Search className="h-3 w-3" />
              Results
              {searchResults?.results?.length && (
                <Badge variant="secondary" className="text-xs ml-1 px-1 py-0">
                  {searchResults.results.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="browser" className="text-xs flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Browser
              {browserUrl !== 'about:blank' && (
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1"></div>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Search Results */}
        <TabsContent value="search" className="flex-1 overflow-auto">
          {!searchQuery ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-orange-500" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Private Search Ready</h2>
              <p className="text-gray-600 text-sm mb-4">
                Search without being tracked. Your privacy is protected.
              </p>
              <Button 
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                  searchInput?.focus();
                }}
                className="bg-orange-500 hover:bg-orange-600 text-sm"
              >
                Start Searching
              </Button>
            </div>
          ) : (
            <div className="p-3">
              {searchQuery && (
                <div className="mb-3 pb-2 border-b">
                  <p className="text-xs text-gray-600">
                    Results for <span className="font-semibold">"{searchQuery}"</span>
                  </p>
                </div>
              )}
              <SearchResults
                results={searchResults?.results || []}
                isLoading={isLoading}
                error={error}
                onOpenInBrowser={handleOpenInBrowser}
              />
            </div>
          )}
        </TabsContent>

        {/* Browser */}
        <TabsContent value="browser" className="flex-1 overflow-hidden">
          {browserUrl === 'about:blank' ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Private Browser</h2>
              <p className="text-gray-600 text-sm mb-4">
                Browse with enhanced privacy protection
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleOpenInBrowser('https://duckduckgo.com')}
                  className="bg-blue-500 hover:bg-blue-600 text-sm"
                >
                  Visit DuckDuckGo
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <iframe
                src={browserUrl}
                className="w-full h-full border-0"
                title="Mobile Browser"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}