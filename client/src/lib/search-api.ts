
import type { SearchResponse, SearchSuggestion } from '@shared/schema';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function searchWeb(
  query: string, 
  filter: string = 'all', 
  page: number = 1,
  limit: number = 10
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    filter,
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE}/api/search?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getSearchSuggestions(query: string): Promise<{ suggestions: SearchSuggestion[] }> {
  const params = new URLSearchParams({ q: query });
  
  const response = await fetch(`${API_BASE}/api/suggestions?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Suggestions failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getPopularSearches() {
  const response = await fetch(`${API_BASE}/api/popular-searches`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Popular searches failed: ${response.statusText}`);
  }

  return response.json();
}
