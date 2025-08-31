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



export function useSearch(query: string, filter: string = 'all', page: number = 1) {
  return useQuery({
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
