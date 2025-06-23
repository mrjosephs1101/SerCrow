import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { usePopularSearches } from '@/hooks/use-search';
import serqoLogoPath from "@assets/20250620_150619_1750447628914.png";

export default function Search() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: popularSearchesData } = usePopularSearches();
  const popularSearches = popularSearchesData?.searches || [];

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const searchId = query.trim().toLowerCase().replace(/\s+/g, '-') + '-all';
      setLocation(`/sq/${searchId}?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLuckySearch = () => {
    if (searchQuery.trim()) {
      // In a real implementation, this would redirect to the first search result
      handleSearch(searchQuery);
    }
  };

  const handlePopularSearchClick = (query: string) => {
    setSearchQuery(query);
    const searchId = query.toLowerCase().replace(/\s+/g, '-') + '-all';
    setLocation(`/sq/${searchId}?q=${encodeURIComponent(query)}`);
  };

  // Set page title
  useEffect(() => {
    document.title = 'SerCrow - The Best Search Engine Ever';
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Chrome-style homepage */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img 
              src={serqoLogoPath} 
              alt="SerCrow" 
              className="w-24 h-24 object-contain"
            />
          </div>

          {/* Search bar - Chrome style */}
          <div className="relative mb-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search SerCrow or type a URL"
              className="w-full h-12 text-base rounded-full border border-gray-300 dark:border-gray-600 px-6 shadow-sm hover:shadow-md focus-within:shadow-md transition-shadow"
            />
          </div>

          {/* Chrome-style buttons */}
          <div className="flex justify-center gap-3 mb-8">
            <Button
              variant="outline"
              onClick={() => handleSearch(searchQuery)}
              className="px-6 py-2 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-sm"
            >
              SerCrow Search
            </Button>
            <Button
              variant="outline"
              onClick={handleLuckySearch}
              className="px-6 py-2 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-sm"
            >
              I'm Feeling Lucky
            </Button>
          </div>

          {/* Popular searches - simplified */}
          {popularSearches.length > 0 && (
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Popular searches:</div>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.slice(0, 6).map((search) => (
                  <button
                    key={search.id}
                    onClick={() => handlePopularSearchClick(search.query)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
                  >
                    {search.query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
