import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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
      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: query.length > 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
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
      return response.json();
    },
    enabled: query.length > 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePopularSearches() {
  return useQuery({
    queryKey: ['/api/popular-searches'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRecentSearches() {
  return useQuery({
    queryKey: ['/api/recent-searches'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
