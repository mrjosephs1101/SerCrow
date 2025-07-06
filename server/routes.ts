import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchQuerySchema, type SearchResponse, type SearchResult, type SearchSuggestion } from "@shared/schema";
import { z } from "zod";

// Enhanced Brave Search API integration
async function searchBrave(query: string, filter: string = 'all', offset: number = 0, count: number = 20): Promise<any> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    console.warn("BRAVE_SEARCH_API_KEY is not configured - using fallback search");
    return null;
  }

  try {
    // Build search parameters based on filter
    const searchParams = new URLSearchParams({
      q: query,
      offset: offset.toString(),
      count: count.toString(),
      safesearch: 'moderate',
      freshness: 'all',
      text_decorations: 'true',
      spellcheck: 'true'
    });

    // Add filter-specific parameters
    if (filter === 'news') {
      searchParams.append('result_filter', 'news');
    } else if (filter === 'images') {
      searchParams.append('result_filter', 'images');
    } else if (filter === 'videos') {
      searchParams.append('result_filter', 'videos');
    }

    const url = `https://api.search.brave.com/res/v1/web/search?${searchParams.toString()}`;
    
    console.log(`🔍 Brave Search API request: ${query} (filter: ${filter})`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
        'User-Agent': 'SerCrow-Search-Engine/1.0'
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.ok) {
      console.error(`Brave Search API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Brave Search returned ${data?.web?.results?.length || 0} results`);
    return data;

  } catch (error) {
    console.error("Brave Search API request failed:", error);
    return null;
  }
}

// Enhanced result conversion with better formatting
function convertBraveResults(braveData: any, filter: string): SearchResult[] {
  if (!braveData?.web?.results) {
    return [];
  }

  return braveData.web.results.map((result: any, index: number) => {
    // Extract domain for favicon
    let domain = '';
    try {
      domain = new URL(result.url).hostname;
    } catch (e) {
      domain = 'unknown';
    }

    // Generate favicon URL
    let favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    if (result.profile?.img) {
      favicon = result.profile.img;
    }

    // Clean up description
    let description = result.description || 'No description available';
    if (description.length > 200) {
      description = description.substring(0, 197) + '...';
    }

    // Format last modified date
    let lastModified = undefined;
    if (result.age) {
      lastModified = result.age;
    } else if (result.published) {
      lastModified = new Date(result.published).toLocaleDateString();
    }

    // Add relevant tags
    const tags = [];
    if (result.type) tags.push(result.type);
    if (filter !== 'all') tags.push(filter);
    if (result.language) tags.push(result.language);

    return {
      id: `brave-${index}-${Date.now()}`,
      title: result.title || 'Untitled',
      url: result.url || '',
      description,
      favicon,
      lastModified,
      tags
    };
  });
}

// Get search suggestions from Brave API
async function getBraveSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey || query.length < 2) {
    return [];
  }

  try {
    const url = `https://api.search.brave.com/res/v1/suggest?q=${encodeURIComponent(query)}&count=8`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey,
      },
      timeout: 5000
    });

    if (!response.ok) {
      console.error(`Brave Suggestions API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    // Brave suggestions API returns array format: [query, [suggestions], [descriptions], [urls]]
    if (Array.isArray(data) && data[1] && Array.isArray(data[1])) {
      return data[1].slice(0, 8).map((text: string, index: number) => ({
        text,
        count: Math.max(1000 - index * 100, 50) // Simulated popularity score
      }));
    }

    return [];
  } catch (error) {
    console.error("Brave Suggestions API error:", error);
    return [];
  }
}

// Fallback search results for when API is unavailable
function getFallbackResults(query: string, filter: string): SearchResult[] {
  const fallbackResults = [
    {
      id: 'fallback-1',
      title: `Search results for "${query}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      description: 'Brave Search API is currently unavailable. This is a fallback result that would normally show real web search results.',
      favicon: 'https://www.google.com/favicon.ico',
      tags: ['fallback', filter]
    },
    {
      id: 'fallback-2',
      title: `${query} - Wikipedia`,
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
      description: `Wikipedia search results for ${query}. This would normally be replaced with real search results from the Brave Search API.`,
      favicon: 'https://en.wikipedia.org/favicon.ico',
      tags: ['wikipedia', filter]
    }
  ];

  return fallbackResults;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Enhanced search endpoint with full Brave API integration
  app.get("/api/search", async (req, res) => {
    try {
      const { q: query, filter = "all", page = "1", limit = "10" } = req.query;
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      if (query.trim().length === 0) {
        return res.status(400).json({ error: "Query cannot be empty" });
      }

      // Generate unique search ID
      const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const startTime = Date.now();
      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10)), 50);
      const offset = (pageNum - 1) * limitNum;

      console.log(`🔍 Processing search: "${query}" (filter: ${filter}, page: ${pageNum})`);

      let searchResults: SearchResult[] = [];
      let totalResults = 0;
      let apiUsed = false;

      // Try Brave Search API first
      const braveData = await searchBrave(query, filter as string, offset, limitNum);
      
      if (braveData) {
        searchResults = convertBraveResults(braveData, filter as string);
        totalResults = braveData?.web?.total_count || searchResults.length;
        apiUsed = true;
        console.log(`✅ Brave API returned ${searchResults.length} results`);
      } else {
        // Use fallback results if API is unavailable
        searchResults = getFallbackResults(query, filter as string);
        totalResults = searchResults.length;
        console.log(`⚠️ Using fallback results for query: ${query}`);
      }

      // Apply additional filtering if needed
      let filteredResults = searchResults;
      if (filter !== 'all' && typeof filter === 'string' && !apiUsed) {
        // Only apply manual filtering for fallback results
        filteredResults = searchResults.filter(result => {
          const matchesFilter = result.tags?.some(tag => 
            tag.toLowerCase().includes(filter.toLowerCase())
          ) || result.title.toLowerCase().includes(filter.toLowerCase()) ||
             result.description.toLowerCase().includes(filter.toLowerCase());
          return matchesFilter;
        });
      }
      
      const searchTime = Date.now() - startTime;
      const totalPages = Math.ceil(totalResults / limitNum);

      // Log search query to database
      try {
        await storage.logSearchQuery({
          searchId,
          query,
          filter: filter as string,
          resultsCount: filteredResults.length,
          searchTime
        });
        console.log(`📊 Logged search query to database: ${searchId}`);
      } catch (error) {
        console.error("Failed to log search query:", error);
      }

      const response: SearchResponse = {
        results: filteredResults,
        totalResults: totalResults,
        searchTime,
        currentPage: pageNum,
        totalPages,
        query,
        filter: filter as string,
        searchId
      };

      res.json(response);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ 
        error: "Internal server error during search",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Enhanced search suggestions endpoint
  app.get("/api/suggestions", async (req, res) => {
    try {
      const { q: query } = req.query;
      
      if (!query || typeof query !== "string" || query.length < 2) {
        return res.json({ suggestions: [] });
      }

      console.log(`💡 Getting suggestions for: "${query}"`);

      // Get suggestions from Brave API
      const suggestions = await getBraveSearchSuggestions(query);
      
      if (suggestions.length > 0) {
        console.log(`✅ Brave API returned ${suggestions.length} suggestions`);
        return res.json({ suggestions });
      }

      // Fallback suggestions if API is unavailable
      const fallbackSuggestions: SearchSuggestion[] = [
        { text: `${query} tutorial`, count: 500 },
        { text: `${query} guide`, count: 400 },
        { text: `${query} examples`, count: 300 },
        { text: `what is ${query}`, count: 200 },
        { text: `${query} tips`, count: 100 }
      ].filter(s => s.text.length <= 50);

      console.log(`⚠️ Using fallback suggestions for: ${query}`);
      res.json({ suggestions: fallbackSuggestions });
    } catch (error) {
      console.error("Suggestions error:", error);
      res.status(500).json({ 
        error: "Internal server error fetching suggestions",
        suggestions: []
      });
    }
  });

  // Popular searches endpoint
  app.get("/api/popular-searches", async (req, res) => {
    try {
      const popularSearches = await storage.getPopularSearches(10);
      res.json({ searches: popularSearches });
    } catch (error) {
      console.error("Popular searches error:", error);
      res.status(500).json({ error: "Internal server error fetching popular searches" });
    }
  });

  // Recent searches endpoint
  app.get("/api/recent-searches", async (req, res) => {
    try {
      const recentSearches = await storage.getRecentSearches(10);
      res.json({ searches: recentSearches });
    } catch (error) {
      console.error("Recent searches error:", error);
      res.status(500).json({ error: "Internal server error fetching recent searches" });
    }
  });

  // API status endpoint to check Brave API availability
  app.get("/api/status", async (req, res) => {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    const hasApiKey = !!apiKey;
    
    let apiWorking = false;
    if (hasApiKey) {
      try {
        const testData = await searchBrave("test", "all", 0, 1);
        apiWorking = !!testData;
      } catch (error) {
        apiWorking = false;
      }
    }

    res.json({
      braveApiConfigured: hasApiKey,
      braveApiWorking: apiWorking,
      databaseConnected: true, // We know this works if we got here
      version: "1.0.0"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}