import { useState, useCallback, useEffect } from 'react';
import { useSearch as useBaseSearch, useSearchSuggestions } from './use-search';
import { useDebounce } from 'use-debounce';

export interface SearchResult {
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  source?: string;
}

export function useEnhancedSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery] = useDebounce(query, 300);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [browserUrl, setBrowserUrl] = useState('about:blank');
  const [searchHistory, setSearchHistory] = useState<Array<{query: string; timestamp: number}>>([]);
  const [browserHistory, setBrowserHistory] = useState<Array<{url: string; title: string; timestamp: number}>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Use the base search hook
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch,
  } = useBaseSearch(debouncedQuery, 'all', 1);
  
  // Get search suggestions
  const {
    data: suggestionsData,
    isLoading: isLoadingSuggestions,
  } = useSearchSuggestions(debouncedQuery);

  // Process search results
  const results: SearchResult[] = searchData?.results?.map((item: any) => ({
    url: item.url,
    title: item.title,
    description: item.description,
    favicon: item.favicon,
    source: item.source,
  })) || [];

  // Handle search submission
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    
    // Add to search history
    setSearchHistory(prev => [
      { query: searchQuery, timestamp: Date.now() },
      ...prev.filter(item => item.query.toLowerCase() !== searchQuery.toLowerCase())
        .slice(0, 9) // Keep only the 10 most recent searches
    ]);
    
    // Reset active result index
    setActiveResultIndex(-1);
    
    // Execute the search
    await refetchSearch();
  }, [refetchSearch]);

  // Handle navigation in the browser
  const navigateTo = useCallback((url: string, title: string = '') => {
    if (!url) return;
    
    // Ensure URL has a protocol
    let targetUrl = url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }
    
    setBrowserUrl(targetUrl);
    
    // Add to browser history if it's a new URL
    setBrowserHistory(prev => {
      // Don't add if it's the same as the current URL
      if (prev[0]?.url === targetUrl) return prev;
      
      return [
        { url: targetUrl, title, timestamp: Date.now() },
        ...prev.filter(item => item.url !== targetUrl)
      ].slice(0, 50); // Keep a reasonable history size
    });
    
    // Reset history index when navigating to a new URL
    setHistoryIndex(-1);
  }, []);

  // Handle back/forward navigation in browser history
  const goBack = useCallback(() => {
    if (historyIndex < browserHistory.length - 1) {
      const newIndex = historyIndex + 1;
      const historyItem = browserHistory[newIndex];
      setBrowserUrl(historyItem.url);
      setHistoryIndex(newIndex);
    }
  }, [browserHistory, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const historyItem = browserHistory[newIndex];
      setBrowserUrl(historyItem.url);
      setHistoryIndex(newIndex);
    } else if (historyIndex === 0) {
      // Go to the most recent item
      const historyItem = browserHistory[0];
      setBrowserUrl(historyItem.url);
      setHistoryIndex(-1);
    }
  }, [browserHistory, historyIndex]);

  // Handle keyboard navigation of search results
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (results.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveResultIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setActiveResultIndex(prev => 
          prev > 0 ? prev - 1 : -1
        );
        break;
        
      case 'Enter':
        if (activeResultIndex >= 0 && activeResultIndex < results.length) {
          e.preventDefault();
          const result = results[activeResultIndex];
          if (e.ctrlKey || e.metaKey) {
            // Open in new tab
            window.open(result.url, '_blank');
          } else {
            // Open in browser
            navigateTo(result.url, result.title);
          }
        }
        break;
    }
  }, [activeResultIndex, results, navigateTo]);

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // State
    query,
    setQuery,
    results,
    suggestions: suggestionsData?.suggestions || [],
    isSearching: isSearching || isLoadingSuggestions,
    error: searchError,
    activeResultIndex,
    setActiveResultIndex,
    browserUrl,
    setBrowserUrl: navigateTo,
    searchHistory,
    browserHistory,
    
    // Actions
    search,
    navigateTo,
    goBack,
    goForward,
    canGoBack: historyIndex < browserHistory.length - 1,
    canGoForward: historyIndex > 0 || (historyIndex === 0 && browserHistory.length > 0),
  };
}
