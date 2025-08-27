import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

interface SearchResult {
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  source?: string;
}

interface SearchResponse {
  results: SearchResult[];
  total?: number;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResults(data.results || []);
      setQuery(searchQuery);
    } catch (err) {
      setError(err as Error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { results, isLoading, error, search, query };
}

export function useSearch2(query: string, filter: string = 'all', page: number = 1) {
  return useQuery<SearchResponse>({
    queryKey: ['/api/search', query, filter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        filter,
        page: page.toString()
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Search failed: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.results)) {
        throw new Error("Invalid response from search API.");
      }

      return data;
    },
    enabled: query.trim().length > 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery<{ suggestions: { text: string }[] }>({
    queryKey: ['/api/suggestions', query],
    queryFn: async () => {
      const response = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        return { suggestions: [] };
      }

      const data = await response.json();
      return data;
    },
    enabled: query.trim().length > 1,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function usePopularSearches() {
  return useQuery<{ searches: { id: string; query: string }[] }>({
    queryKey: ['/api/popular-searches'],
    queryFn: async () => {
      const response = await fetch(`/api/popular-searches`);
      if (!response.ok) {
        return { searches: [] };
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useRecentSearches() {
  return useQuery<{ searches: { id: string; query: string }[] }>({
    queryKey: ['/api/recent-searches'],
    queryFn: async () => {
      const response = await fetch(`/api/recent-searches`);
      if (!response.ok) {
        return { searches: [] };
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}
