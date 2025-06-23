import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { SearchBar } from '@/components/search-bar';
import { SearchResults } from '@/components/search-results';
import { Pagination } from '@/components/pagination';
import { useSearch } from '@/hooks/use-search';
import { useDebounce } from '@/hooks/use-debounce';
import { Loader2 } from 'lucide-react';
import wingManLogo from '@assets/20250620_150619_1750447628914.png';

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

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <img src={wingManLogo} alt="WingMan Logo" className="w-10 h-10 rounded" />
        <h1 className="text-2xl font-bold text-gray-800">SerCrow Search</h1>
      </div>

      <SearchBar
        query={searchQuery}
        setQuery={setSearchQuery}
        onSearch={() => {
          setLastSearchQuery(searchQuery);
          setShouldSearch(true);
        }}
      />

      {isLoading ? (
        <div className="flex justify-center items-center mt-10 text-gray-600">
          <Loader2 className="animate-spin mr-2" /> Searching...
        </div>
      ) : error ? (
        <div className="text-red-500 text-center mt-4">Error: {error.message}</div>
      ) : (
        <SearchResults data={searchData} />
      )}

      <Pagination
        currentPage={currentPage}
        setCurrentPage={(page) => {
          setCurrentPage(page);
          setShouldSearch(true);
        }}
      />
    </div>
  );
}