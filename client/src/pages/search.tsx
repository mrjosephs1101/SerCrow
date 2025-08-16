import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePopularSearches } from '@/hooks/use-search';
import serqoLogoPath from "@assets/20250620_150619_1750447628914.png";
import { AdvancedSearch } from '@/components/advanced-search';

export default function Search() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [fileType, setFileType] = useState('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const { data: popularSearchesData } = usePopularSearches();
  const popularSearches = popularSearchesData?.searches || [];
  const [me, setMe] = useState<any>(null);

const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchQuery(query);
      const searchId = query.trim().toLowerCase().replace(/\s+/g, '-') + '-all';
  setLocation(`#/sq/${searchId}?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLuckySearch = async () => {
    const query = searchQuery.trim();
    if (query) {
      try {
        const params = new URLSearchParams({
          q: query,
          limit: '1',
        });
        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          handleSearch(query);
          return;
        }
        const data = await response.json();
        if (data?.results?.length > 0) {
          window.location.href = data.results[0].url;
        } else {
          handleSearch(query);
        }
      } catch (error) {
        console.error("I'm Feeling Lucky search failed, falling back to regular search.", error);
        handleSearch(query);
      }
    }
  };

  const handlePopularSearchClick = (query: string) => {
    setSearchQuery(query);
    const searchId = query.toLowerCase().replace(/\s+/g, '-') + '-all';
  setLocation(`#/sq/${searchId}?q=${encodeURIComponent(query)}`);
  };

  // Set page title
  useEffect(() => {
    document.title = 'SerCrow - The Best Search Engine Ever';
  }, []);

  // Fetch auth session
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setMe(data);
      } catch {}
    })();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Chrome-style homepage */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <img 
              src={serqoLogoPath} 
              alt="SerCrow" 
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
            />
          </div>

          {/* Search bar - Chrome style */}
          <div className="relative mb-6 sm:mb-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search SerCrow or type a URL"
              className="w-full h-10 sm:h-12 text-sm sm:text-base rounded-full shadow-sm hover:shadow-md focus-within:shadow-md transition-shadow"
            />
          </div>

          {/* Chrome-style buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Button
              variant="outline"
              onClick={() => handleSearch(searchQuery)}
              className="px-4 sm:px-6 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-sm w-full sm:w-auto"
            >
              SerCrow Search
            </Button>
            <Button
              variant="outline"
              onClick={handleLuckySearch}
              className="px-4 sm:px-6 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-sm w-full sm:w-auto"
            >
              I'm Feeling Lucky
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="px-4 sm:px-6 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-sm w-full sm:w-auto"
            >
              Advanced Search
            </Button>
                      </div>

          {/* Auth Section */}
          <div className="flex justify-center mb-6 sm:mb-8">
            {me ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">Signed in as {me.email}</span>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.reload();
                  }}
                  className="px-4 py-2 text-xs sm:text-sm"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => { window.location.href = '/auth'; }}
                className="bg-serqo-blue hover:bg-serqo-blue-dark text-white px-6 py-2 rounded-full text-xs sm:text-sm"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Advanced Search Options */}
          {showAdvancedSearch && (
            <div className="mb-8">
              <AdvancedSearch onSearch={handleSearch} />
            </div>
          )}

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="d">Past day</SelectItem>
                  <SelectItem value="w">Past week</SelectItem>
                  <SelectItem value="m">Past month</SelectItem>
                </SelectContent>
              </Select>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger>
                  <SelectValue placeholder="File type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">DOC</SelectItem>
                  <SelectItem value="xls">XLS</SelectItem>
                  <SelectItem value="ppt">PPT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

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
