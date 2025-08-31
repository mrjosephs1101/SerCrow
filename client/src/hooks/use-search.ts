import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockSearch } from '@/lib/mock-search';

interface SearchResult {
  url: string;
  title: string;
  description?: string;
  snippet?: string;
  favicon?: string;
  source?: string;
  displayUrl?: string;
}

interface SearchResponse {
  results: SearchResult[];
  total?: number;
  totalResults?: number;
  searchTime?: number;
}

export function useSearch(query: string, filter: string = 'all', page: number = 1) {
  return useQuery({
    queryKey: ['/api/search', query, filter, page],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          q: query,
          filter,
          page: page.toString()
        });

        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        if (!data || !Array.isArray(data.results)) {
          throw new Error("Invalid response from search API.");
        }

        return data;
      } catch (error) {
        // Fallback to mock search when backend is not available
        console.log('Backend not available, using mock search');
        return await mockSearch(query);
      }
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
