import React, { useState, useEffect } from 'react';
import { Plus, X, Search, Globe, Image, Newspaper, ShoppingCart, Video, History, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRecentSearches } from '@/hooks/use-search';

interface SearchTab {
  id: string;
  title: string;
  query: string;
  filter: string;
  url: string;
  isActive: boolean;
  timestamp: Date;
}

interface SearchTabsProps {
  onTabChange: (tab: SearchTab) => void;
  onNewTab: () => void;
  currentQuery?: string;
  currentFilter?: string;
}

const filterIcons = {
  all: Globe,
  images: Image,
  news: Newspaper,
  shopping: ShoppingCart,
  videos: Video,
};

export function SearchTabs({ onTabChange, onNewTab, currentQuery = '', currentFilter = 'all' }: SearchTabsProps) {
  const [tabs, setTabs] = useState<SearchTab[]>([
    {
      id: '1',
      title: 'Home',
      query: '',
      filter: 'all',
      url: '/',
      isActive: true,
      timestamp: new Date(),
    }
  ]);

  const { data: recentSearchesData } = useRecentSearches();
  const recentSearches = recentSearchesData?.searches || [];

  const addNewTab = (query: string, filter: string) => {
    const searchId = query ? `${query.toLowerCase().replace(/\s+/g, '-')}-${filter}` : '';
    const newTab: SearchTab = {
      id: `tab-${Date.now()}`,
      title: query || 'New Search',
      query,
      filter,
      url: query ? `/sq/${searchId}?q=${encodeURIComponent(query)}&filter=${filter}` : '/',
      isActive: true,
      timestamp: new Date(),
    };

    setTabs(prevTabs => [
      ...prevTabs.map(tab => ({ ...tab, isActive: false })),
      newTab
    ]);

    // Recent searches are now managed by the database, no need to update local state

    onTabChange(newTab);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(prevTabs => {
      const remainingTabs = prevTabs.filter(tab => tab.id !== tabId);
      if (remainingTabs.length === 0) {
        // If no tabs left, create a new home tab
        const homeTab: SearchTab = {
          id: 'home',
          title: 'Home',
          query: '',
          filter: 'all',
          url: '/',
          isActive: true,
          timestamp: new Date(),
        };
        onTabChange(homeTab);
        return [homeTab];
      }
      
      // If the closed tab was active, activate the last tab
      const closedTab = prevTabs.find(tab => tab.id === tabId);
      if (closedTab?.isActive && remainingTabs.length > 0) {
        const newActiveTab = { ...remainingTabs[remainingTabs.length - 1], isActive: true };
        onTabChange(newActiveTab);
        return remainingTabs.map((tab, index) => 
          index === remainingTabs.length - 1 ? newActiveTab : { ...tab, isActive: false }
        );
      }
      
      return remainingTabs;
    });
  };

  const switchTab = (tab: SearchTab) => {
    setTabs(prevTabs => 
      prevTabs.map(t => ({ ...t, isActive: t.id === tab.id }))
    );
    onTabChange(tab);
  };

  const getTabIcon = (filter: string) => {
    const IconComponent = filterIcons[filter as keyof typeof filterIcons] || Globe;
    return <IconComponent className="h-3 w-3" />;
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return timestamp.toLocaleDateString();
  };

  // Update current tab when query/filter changes
  useEffect(() => {
    if (currentQuery) {
      const activeTab = tabs.find(tab => tab.isActive);
      if (activeTab && (activeTab.query !== currentQuery || activeTab.filter !== currentFilter)) {
        addNewTab(currentQuery, currentFilter);
      }
    }
  }, [currentQuery, currentFilter]);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Tab Bar */}
      <div className="flex items-center overflow-x-auto scrollbar-hide">
        <div className="flex items-center min-w-0 flex-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center min-w-0 max-w-xs border-r border-gray-200 dark:border-gray-700 cursor-pointer group ${
                tab.isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-b-2 border-b-blue-600' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => switchTab(tab)}
            >
              <div className="flex items-center gap-2 px-3 py-2 min-w-0 flex-1">
                {getTabIcon(tab.filter)}
                <span className="text-sm truncate font-medium text-gray-700 dark:text-gray-300">
                  {tab.title}
                </span>
                {tab.query && (
                  <Badge variant="secondary" className="text-xs">
                    {tab.filter}
                  </Badge>
                )}
              </div>
              {tabs.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => closeTab(tab.id, e)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {/* Add New Tab Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mx-2 flex-shrink-0"
          onClick={() => addNewTab('', 'all')}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Recent Searches Panel */}
      {recentSearches.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Recent Searches</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {recentSearches.slice(0, 5).map((search) => (
              <Card
                key={search.id}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                onClick={() => addNewTab(search.query, search.filter || 'all')}
              >
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    {getTabIcon(search.filter || 'all')}
                    <span className="text-xs text-gray-700 dark:text-gray-300">{search.query}</span>
                    <span className="text-xs text-gray-400">{formatTime(search.timestamp || new Date())}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}