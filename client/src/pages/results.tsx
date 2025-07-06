import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Header } from '@/components/header';
import { SearchBar } from '@/components/search-bar';
import { SearchResults } from '@/components/search-results';
import { Pagination } from '@/components/pagination';
import { Footer } from '@/components/footer';
import { useSearch } from '@/hooks/use-search';
import { useDebounce } from '@/hooks/use-debounce';
import { Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Results() {
  const [location, setLocation] = useLocation();

  // Extract search ID from URL path
  const searchIdValue = location.split('/sq/')[1]?.split('?')[0] || '';

  // Parse URL parameters
  const params = new URLSearchParams(location.split('?')[1] || '');

  const [searchQuery, setSearchQuery] = useState(params.get('q') || '');
  const [filter, setFilter] = useState(params.get('filter') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(params.get('page') || '1', 10));
  const [shouldSearch, setShouldSearch] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data: searchData, isLoading, error, refetch } = useSearch(
    shouldSearch ? lastSearchQuery : debouncedSearchQuery,
    filter,
    currentPage
  );

  useEffect(() => {
    if (searchData) {
      setShouldSearch(false);
    }
  }, [searchData]);

  useEffect(() => {
    if (searchQuery) {
      document.title = `${searchQuery} - SerCrow Search`;
    } else {
      document.title = 'Search Results - SerCrow';
    }
  }, [searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const urlQuery = params.get('q') || '';
    const urlFilter = params.get('filter') || 'all';
    const urlPage = parseInt(params.get('page') || '1', 10);

    if (urlQuery && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
      setLastSearchQuery(urlQuery);
      setShouldSearch(true);
    }
    if (urlFilter !== filter) {
      setFilter(urlFilter);
    }
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [location]);

  useEffect(() => {
    if (!shouldSearch || !lastSearchQuery.trim()) return;

    const newParams = new URLSearchParams();
    newParams.set('q', lastSearchQuery);
    if (filter !== 'all') newParams.set('filter', filter);
    if (currentPage !== 1) newParams.set('page', currentPage.toString());

    const searchIdValue = `${lastSearchQuery.toLowerCase().replace(/\s+/g, '-')}-${filter}`;
    const newUrl = `/sq/${searchIdValue}?${newParams.toString()}`;

    if (location !== newUrl) {
      setLocation(newUrl, { replace: true });
    }
  }, [shouldSearch, lastSearchQuery, filter, currentPage, location, setLocation]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setLastSearchQuery(query.trim());
      setShouldSearch(true);
      setCurrentPage(1); // Reset to first page on new search
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setShouldSearch(true);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setShouldSearch(true);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('network');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Header compact />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search bar */}
          <div className="mb-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search SerCrow or type a URL"
              className="max-w-2xl"
              compact
            />
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching the web...</span>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="mb-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    {isNetworkError ? (
                      <div className="flex items-center gap-2">
                        <WifiOff className="h-4 w-4" />
                        Network error - please check your connection
                      </div>
                    ) : (
                      `Search error: ${error.message}`
                    )}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()}
                    className="ml-4"
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Search results */}
          {searchData && !isLoading && (
            <>
              <SearchResults
                results={searchData.results}
                totalResults={searchData.totalResults}
                searchTime={searchData.searchTime}
                query={searchData.query}
                filter={searchData.filter}
                onFilterChange={handleFilterChange}
              />

              {/* Pagination */}
              {searchData.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={searchData.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}

          {/* No search query state */}
          {!searchQuery && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <div className="text-lg font-medium mb-2">Start your search</div>
                <div className="text-sm">Enter a search term to find results from across the web</div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}