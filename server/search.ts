
// Search result types - Copied from shared/schema.ts
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  description: string;
  favicon?: string;
  lastModified?: string;
  tags?: string[];
  imageUrl?: string; // For image search results
  videoUrl?: string; // For video search results
}

export interface SearchSuggestion {
  text: string;
  count?: number;
}

// Enhanced Google Custom Search API integration with proper media type support
export async function searchGoogle(query: string, filter: string = 'all', start: number = 1, num: number = 10): Promise<any> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  
  if (!apiKey || !searchEngineId) {
    console.warn("GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_ENGINE_ID is not configured - using fallback search");
    return null;
  }

  try {
    const searchParams = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: query,
      start: start.toString(),
      num: Math.min(num, 10).toString(), // Google CSE max is 10 per request
      safe: 'active',
      fields: 'items(title,link,snippet,pagemap/cse_thumbnail,pagemap/cse_image),searchInformation(totalResults,searchTime)'
    });

    // Add search type specific parameters
    if (filter === 'images') {
      searchParams.append('searchType', 'image');
      searchParams.append('imgSize', 'medium');
      searchParams.append('imgType', 'photo');
    } else if (filter === 'news') {
      // Add news-specific query modifiers
      searchParams.set('q', `${query} site:news.google.com OR site:bbc.com OR site:cnn.com OR site:reuters.com`);
      searchParams.append('dateRestrict', 'm1'); // Last month for news
    } else if (filter === 'videos') {
      // Add video-specific query modifiers
      searchParams.set('q', `${query} site:youtube.com OR site:vimeo.com`);
    }
    
    const url = `https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`;
    
    console.log(`🔍 Google Custom Search API request: ${query} (filter: ${filter})`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SerCrow-Search-Engine/1.0'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Google Search API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      return null;
    }

    const data = await response.json();
    
    // Log result counts
    if (data?.items) {
      console.log(`✅ Google Search returned ${data.items.length} results`);
    } else {
      console.log(`✅ Google API returned results (no items found)`);
    }
    
    return data;

  } catch (error) {
    console.error("Google Search API request failed:", error);
    return null;
  }
}

// Enhanced result conversion with better formatting and image support for Google CSE
export function convertGoogleResults(googleData: any, filter: string): SearchResult[] {
  // Handle case where no items are returned
  if (!googleData?.items || !Array.isArray(googleData.items)) {
    return [];
  }

  return googleData.items.map((result: any, index: number) => {
    // Extract domain for favicon
    let domain = '';
    try {
      domain = new URL(result.link).hostname;
    } catch (e) {
      domain = 'unknown';
    }

    // Generate favicon URL
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    // Clean up description (snippet)
    let description = result.snippet || 'No description available';
    if (description.length > 200) {
      description = description.substring(0, 197) + '...';
    }

    // Add relevant tags
    const tags = [];
    if (filter !== 'all') tags.push(filter);
    if (domain) tags.push(domain);
    
    // Handle image search results
    let imageUrl = undefined;
    if (filter === 'images') {
      // For image search, the link is the image URL
      imageUrl = result.link;
      // Try to get thumbnail from pagemap
      if (result.pagemap?.cse_thumbnail?.[0]?.src) {
        imageUrl = result.pagemap.cse_thumbnail[0].src;
      }
      tags.push('image');
    }

    // Handle video results (YouTube, Vimeo, etc.)
    let videoUrl = undefined;
    if (filter === 'videos' || result.link.includes('youtube.com') || result.link.includes('vimeo.com')) {
      videoUrl = result.link;
      tags.push('video');
    }

    // Handle news results
    if (filter === 'news' || result.link.includes('news.') || result.link.includes('bbc.com') || result.link.includes('cnn.com')) {
      tags.push('news');
    }

    return {
      id: `google-${index}-${Date.now()}`,
      title: result.title || 'Untitled',
      url: result.link || '',
      description,
      favicon,
      lastModified: undefined, // Google CSE doesn't provide this directly
      tags,
      imageUrl,
      videoUrl
    };
  });
}

// Get search suggestions from Google API
export async function getGoogleSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  if (!apiKey || query.length < 2) {
    return [];
  }

  try {
    const url = `https://api.search.Google.com/res/v1/suggest?q=${encodeURIComponent(query)}&count=8`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey,
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Google Suggestions API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    // Google suggestions API returns array format: [query, [suggestions], [descriptions], [urls]]
    if (Array.isArray(data) && data[1] && Array.isArray(data[1])) {
      return data[1].slice(0, 8).map((text: string, index: number) => ({
        text,
        count: Math.max(1000 - index * 100, 50) // Simulated popularity score
      }));
    }

    return [];
  } catch (error) {
    console.error("Google Suggestions API error:", error);
    return [];
  }
}

// Fallback search results for when API is unavailable
export function getFallbackResults(query: string, filter: string): SearchResult[] {
  const fallbackResults = [
    {
      id: 'fallback-1',
      title: `Search results for "${query}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      description: 'Google Search API is currently unavailable. This is a fallback result that would normally show real web search results.',
      favicon: 'https://www.google.com/favicon.ico',
      tags: ['fallback', filter]
    },
    {
      id: 'fallback-2',
      title: `${query} - Wikipedia`,
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
      description: `Wikipedia search results for ${query}. This would normally be replaced with real search results from the Google Search API.`,
      favicon: 'https://en.wikipedia.org/favicon.ico',
      tags: ['wikipedia', filter]
    }
  ];

  return fallbackResults;
}

// Type guard to validate SearchResult array
export function isSearchResultArray(value: any): value is SearchResult[] {
  return Array.isArray(value) && value.every((item: any) => 
    item && 
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.url === 'string' &&
    typeof item.description === 'string'
  );
}
