import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchQuerySchema, type SearchResponse, type SearchResult, type SearchSuggestion } from "@shared/schema";
import { z } from "zod";

// Brave Search API integration
async function searchBrave(query: string, offset: number = 0): Promise<any> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    throw new Error("BRAVE_SEARCH_API_KEY is not configured");
  }

  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&offset=${offset}&count=20`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Convert Brave Search results to our format
function convertBraveResults(braveData: any): SearchResult[] {
  if (!braveData?.web?.results) {
    return [];
  }

  return braveData.web.results.map((result: any, index: number) => {
    let favicon = `https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}`;
    if (result.profile?.img) {
      favicon = result.profile.img;
    }
    
    return {
      id: `brave-${index}`,
      title: result.title || 'No Title',
      url: result.url || '',
      description: result.description || 'No description available',
      favicon: favicon,
      lastModified: result.age || undefined,
      tags: result.type ? [result.type] : []
    };
  });
}



export async function registerRoutes(app: Express): Promise<Server> {
  // Search endpoint
  app.get("/api/search", async (req, res) => {
    try {
      const { q: query, filter = "all", page = "1", limit = "10" } = req.query;
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      // Generate unique search ID
      const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const startTime = Date.now();
      const pageNum = parseInt(page as string, 10);
      const limitNum = Math.min(parseInt(limit as string, 10), 20);
      const offset = (pageNum - 1) * limitNum;

      let searchResults: SearchResult[] = [];
      let totalResults = 0;

      try {
        // Use Brave Search API for real results
        const braveData = await searchBrave(query, offset);
        searchResults = convertBraveResults(braveData);
        totalResults = braveData?.web?.total_count || searchResults.length;
        
        console.log(`Brave Search returned ${searchResults.length} results for query: ${query}`);
      } catch (error) {
        console.error("Brave Search API error:", error);
        
        // Return empty results if API fails
        searchResults = [];
        totalResults = 0;
        console.log(`Search API unavailable for query: ${query}`);
      }

      // Apply filter if specified
      let filteredResults = searchResults;
      if (filter !== 'all' && typeof filter === 'string') {
        filteredResults = searchResults.filter(result => {
          const matchesFilter = result.tags?.some(tag => 
            tag.toLowerCase().includes(filter.toLowerCase())
          ) || result.title.toLowerCase().includes(filter.toLowerCase()) ||
             result.description.toLowerCase().includes(filter.toLowerCase());
          return matchesFilter;
        });
      }
      
      const searchTime = Date.now() - startTime;
      const paginatedResults = filteredResults.slice(0, limitNum);
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
      } catch (error) {
        console.error("Failed to log search query:", error);
      }

      const response: SearchResponse = {
        results: paginatedResults,
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
      res.status(500).json({ error: "Internal server error during search" });
    }
  });

  // Search suggestions endpoint
  app.get("/api/suggestions", async (req, res) => {
    try {
      const { q: query } = req.query;
      
      if (!query || typeof query !== "string" || query.length < 2) {
        return res.json({ suggestions: [] });
      }

      try {
        // Try to get suggestions from Brave Search API
        const apiKey = process.env.BRAVE_SEARCH_API_KEY;
        if (apiKey) {
          const suggestUrl = `https://api.search.brave.com/res/v1/suggest?q=${encodeURIComponent(query)}`;
          const response = await fetch(suggestUrl, {
            headers: {
              'Accept': 'application/json',
              'X-Subscription-Token': apiKey,
            },
          });

          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const braveData = await response.json();
              if (braveData && braveData[1]) {
                const suggestions: SearchSuggestion[] = braveData[1].slice(0, 8).map((text: string, index: number) => ({
                  text,
                  count: Math.max(1000 - index * 100, 50)
                }));
                return res.json({ suggestions });
              }
            } else {
              console.error("Brave suggestions API returned non-JSON response");
            }
          }
        }
      } catch (error) {
        console.error("Brave suggestions API error:", error);
      }

      // Return empty suggestions if API fails
      res.json({ suggestions: [] });
    } catch (error) {
      console.error("Suggestions error:", error);
      res.status(500).json({ error: "Internal server error fetching suggestions" });
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

  const httpServer = createServer(app);
  return httpServer;
}
