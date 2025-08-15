import { useQuery } from '@tanstack/react-query';
import type { SearchResponse, SearchSuggestion } from '@shared/schema';

export function useSearch(query: string, filter: string = 'all', page: number = 1) {
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
  return useQuery<{ suggestions: SearchSuggestion[] }>({
    queryKey: ['/api/suggestions', query],
    queryFn: async () => {
      const response = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Suggestions failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    enabled: query.trim().length > 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function usePopularSearches() {
  return useQuery<{ searches: { id: string; query: string }[] }>({
    queryKey: ['/api/popular-searches'],
    queryFn: async () => {
      const response = await fetch(`/api/popular-searches`);
      if (!response.ok) {
        throw new Error(`Popular searches failed: ${response.statusText}`);
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
        throw new Error(`Recent searches failed: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}
