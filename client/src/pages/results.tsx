import React, { useState, useEffect } from 'react';
import { useLocation, useSearch as useWouterSearch } from 'wouter';
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
import { WingManAssistant } from '@/components/wingman-assistant';

export default function Results() {
  const [location, setLocation] = useLocation();
  const searchStr = useWouterSearch();
  
  // Parse URL parameters in a router-aware way to ensure sync
  const params = new URLSearchParams(searchStr || '');
  const initialQuery = params.get('q') || '';
  const initialFilter = params.get('filter') || 'all';
  const initialPage = parseInt(params.get('page') || '1', 10);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filter, setFilter] = useState(initialFilter);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Search with current parameters
  const { data: searchData, isLoading, error, refetch } = useSearch(
    searchQuery,
    filter,
    currentPage
  );

  // Update state when location changes
  useEffect(() => {
    const params = new URLSearchParams(searchStr || '');
    const newQuery = params.get('q') || '';
    const newFilter = params.get('filter') || 'all';
    const newPage = parseInt(params.get('page') || '1', 10);
    
    if (newQuery !== searchQuery) {
      setSearchQuery(newQuery);
    }
    if (newFilter !== filter) {
      setFilter(newFilter);
    }
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [location, searchStr]);

  useEffect(() => {
    if (searchQuery) {
      document.title = `${searchQuery} - SerCrow Search`;
    } else {
      document.title = 'Search Results - SerCrow';
    }
  }, [searchQuery]);

const handleSearch = (query: string) => {
    if (query.trim()) {
      const q = query.trim();
      const newParams = new URLSearchParams();
      newParams.set('q', q);
      if (filter && filter !== 'all') newParams.set('filter', filter);
      newParams.set('page', '1');
      const searchId = `${q.toLowerCase().replace(/\s+/g, '-')}-${filter}`;
  setLocation(`#/sq/${searchId}?${newParams.toString()}`);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    const newParams = new URLSearchParams();
    newParams.set('q', searchQuery);
    if (newFilter && newFilter !== 'all') newParams.set('filter', newFilter);
    newParams.set('page', '1');
    const searchId = `${searchQuery.toLowerCase().replace(/\s+/g, '-')}-${newFilter}`;
  setLocation(`#/sq/${searchId}?${newParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams();
    newParams.set('q', searchQuery);
    if (filter !== 'all') newParams.set('filter', filter);
    newParams.set('page', page.toString());
    
    const searchId = `${searchQuery.toLowerCase().replace(/\s+/g, '-')}-${filter}`;
  setLocation(`#/sq/${searchId}?${newParams.toString()}`);
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('network');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Header compact />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Search bar */}
          <div className="mb-6 sm:mb-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search SerCrow or type a URL"
              className="w-full sm:max-w-2xl"
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

          {/* WingMan AI Assistant */}
          {searchQuery && !isLoading && (
            <WingManAssistant
              query={searchQuery}
              results={searchData?.results}
              onQueryChange={setSearchQuery}
              onSearch={handleSearch}
            />
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