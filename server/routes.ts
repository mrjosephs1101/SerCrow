import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchQuerySchema, type SearchResponse, type SearchResult, type SearchSuggestion } from "@shared/schema";
import { lru } from "tiny-lru";
import { wingman } from "./wingman";

const cache = lru(100, 60000); // Cache up to 100 items for 60 seconds

// Enhanced Google Custom Search API integration with proper media type support
async function searchGoogle(query: string, filter: string = 'all', start: number = 1, num: number = 10): Promise<any> {
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
function convertGoogleResults(googleData: any, filter: string): SearchResult[] {
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
async function getGoogleSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
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
function getFallbackResults(query: string, filter: string): SearchResult[] {
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
function isSearchResultArray(value: any): value is SearchResult[] {
  return Array.isArray(value) && value.every((item: any) => 
    item && 
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.url === 'string' &&
    typeof item.description === 'string'
  );
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Enhanced search endpoint with full Google API integration
  app.get("/api/search", async (req: Request, res: Response) => {
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

      const cacheKey = `${query}-${filter}-${pageNum}-${limitNum}`;
      if (cache.has(cacheKey)) {
        console.log(`⚡️ Cache hit for: "${query}"`);
        return res.json(cache.get(cacheKey));
      }

      console.log(`🔍 Processing search: "${query}" (filter: ${filter}, page: ${pageNum})`);

      let searchResults: SearchResult[] = [];
      let totalResults = 0;
      let apiUsed = false;

      // Try Google Search API first
      const startIndex = offset + 1; // Google uses 1-based indexing
      const googleData = await searchGoogle(query, filter as string, startIndex, limitNum);
      
      if (googleData) {
        searchResults = convertGoogleResults(googleData, filter as string);
        // Get total count from Google search information
        if (googleData?.searchInformation?.totalResults) {
          totalResults = parseInt(googleData.searchInformation.totalResults, 10);
        } else {
          totalResults = searchResults.length;
        }
        apiUsed = true;
        console.log(`✅ Google API returned ${searchResults.length} results`);
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

      cache.set(cacheKey, response);
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
  app.get("/api/suggestions", async (req: Request, res: Response) => {
    try {
      const { q: query } = req.query;
      
      if (!query || typeof query !== "string" || query.length < 2) {
        return res.json({ suggestions: [] });
      }

      console.log(`💡 Getting suggestions for: "${query}"`);

      // Get suggestions from Google API
      const suggestions = await getGoogleSearchSuggestions(query);
      
      if (suggestions.length > 0) {
        console.log(`✅ Google API returned ${suggestions.length} suggestions`);
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
  app.get("/api/popular-searches", async (req: Request, res: Response) => {
    try {
      const popularSearches = await storage.getPopularSearches(10);
      res.json({ searches: popularSearches });
    } catch (error) {
      console.error("Popular searches error:", error);
      res.status(500).json({ error: "Internal server error fetching popular searches" });
    }
  });

  // Recent searches endpoint
  app.get("/api/recent-searches", async (req: Request, res: Response) => {
    try {
      const recentSearches = await storage.getRecentSearches(10);
      res.json({ searches: recentSearches });
    } catch (error) {
      console.error("Recent searches error:", error);
      res.status(500).json({ error: "Internal server error fetching recent searches" });
    }
  });

  // WingMan AI: Enhanced query suggestions
  app.get("/api/wingman/enhance-query", async (req: Request, res: Response) => {
    try {
      const { q: query } = req.query;
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      console.log(`🤖 WingMan enhancing query: "${query}"`);
      const enhancement = await wingman.enhanceSearchQuery(query);
      
      res.json(enhancement);
    } catch (error) {
      console.error("WingMan query enhancement error:", error);
      res.status(500).json({ 
        error: "Internal server error enhancing query",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // WingMan AI: Smart search suggestions
  app.get("/api/wingman/smart-suggestions", async (req: Request, res: Response) => {
    try {
      const { q: query, history } = req.query;
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const searchHistory = history ? String(history).split(',') : [];
      console.log(`🤖 WingMan generating smart suggestions for: "${query}"`);
      
      const suggestions = await wingman.generateSmartSuggestions(query, searchHistory);
      
      res.json({ suggestions });
    } catch (error) {
      console.error("WingMan smart suggestions error:", error);
      res.status(500).json({ 
        error: "Internal server error generating suggestions",
        suggestions: []
      });
    }
  });

  // WingMan AI: Summarize search results
  app.post("/api/wingman/summarize", async (req: Request, res: Response) => {
    try {
      const requestBody = req.body;
      
      if (!requestBody || typeof requestBody !== 'object') {
        return res.status(400).json({ error: "Request body is required" });
      }

      const { query, results } = requestBody;
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required and must be a string" });
      }

      if (!results || !isSearchResultArray(results)) {
        return res.status(400).json({ error: "Results array is required and must be valid SearchResult[]" });
      }

      console.log(`🤖 WingMan summarizing ${results.length} results for: "${query}"`);
      const summary = await wingman.summarizeResults(query, results as SearchResult[]);
      
      res.json(summary);
    } catch (error) {
      console.error("WingMan summarization error:", error);
      res.status(500).json({ 
        error: "Internal server error summarizing results",
        summary: '',
        keyPoints: [],
        confidence: 0
      });
    }
  });

  // WingMan AI: Answer questions
  app.post("/api/wingman/answer", async (req: Request, res: Response) => {
    try {
      const { question, context } = req.body;
      
      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Question is required" });
      }

      console.log(`🤖 WingMan answering question: "${question}"`);
      
      // If context is provided and is an array of search results, use it
      // Otherwise, pass an empty array
      let searchContext: SearchResult[] = [];
      if (context && Array.isArray(context) && isSearchResultArray(context)) {
        searchContext = context as SearchResult[];
      }
      
      const answer = await wingman.answerQuestion(question, searchContext);
      
      res.json(answer);
    } catch (error) {
      console.error("WingMan question answering error:", error);
      res.status(500).json({ 
        error: "Internal server error answering question",
        answer: '',
        sources: [],
        confidence: 0,
        followUpQuestions: []
      });
    }
  });

  // WingMan AI: Content analysis
  app.post("/api/wingman/analyze", async (req: Request, res: Response) => {
    try {
      const { title, description } = req.body;
      
      if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "Title is required and must be a string" });
      }

      if (!description || typeof description !== "string") {
        return res.status(400).json({ error: "Description is required and must be a string" });
      }

      console.log(`🤖 WingMan analyzing content: "${title}"`);
      const analysis = await wingman.analyzeContent(title, description);
      
      res.json(analysis);
    } catch (error) {
      console.error("WingMan content analysis error:", error);
      res.status(500).json({ 
        error: "Internal server error analyzing content",
        category: 'general',
        relevanceScore: 50,
        tags: [],
        sentiment: 'neutral'
      });
    }
  });

  // WingMan AI: Conversational chat
  app.post("/api/wingman/chat", async (req: Request, res: Response) => {
    try {
      const requestBody = req.body;
      
      if (!requestBody || typeof requestBody !== 'object') {
        return res.status(400).json({ error: "Request body is required" });
      }

      const { message, conversationHistory = [], searchResults = [] } = requestBody;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Validate searchResults if provided
      let validSearchResults: SearchResult[] = [];
      if (searchResults.length > 0) {
        if (isSearchResultArray(searchResults)) {
          validSearchResults = searchResults as SearchResult[];
        } else {
          console.warn("Invalid searchResults provided to chat endpoint, ignoring");
        }
      }

      console.log(`🤖 WingMan chat: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
      
      // Prepare context for the AI
      let context = '';
      
      // Add conversation history to context
      if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        context += "Previous conversation:\n";
        conversationHistory.slice(-6).forEach((msg: any, index: number) => {
          if (msg && typeof msg === 'object' && msg.role && msg.content) {
            const role = msg.role === 'user' ? 'Human' : 'Assistant';
            context += `${role}: ${msg.content}\n`;
          }
        });
        context += "\n";
      }
      
      // Add recent search results to context if available and valid
      if (validSearchResults.length > 0) {
        context += "Recent search results for context:\n";
        validSearchResults.slice(0, 5).forEach((result: SearchResult, index: number) => {
          context += `${index + 1}. ${result.title}\n${result.description}\n${result.url}\n\n`;
        });
      }
      
      // Use the WingMan answerQuestion method with search results as context
      const response = await wingman.answerQuestion(message, validSearchResults);
      
      // Add conversation metadata
      const chatResponse = {
        ...response,
        conversationId: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        hasContext: context.length > 0
      };
      
      res.json(chatResponse);
    } catch (error) {
      console.error("WingMan chat error:", error);
      res.status(500).json({ 
        error: "Internal server error in chat",
        answer: "I'm sorry, I encountered an error while processing your message. Please try again.",
        sources: [],
        confidence: 0,
        followUpQuestions: [],
        conversationId: null,
        timestamp: new Date().toISOString(),
        hasContext: false
      });
    }
  });

  // API status endpoint to check Google API and WingMan availability
  app.get("/api/status", async (req: Request, res: Response) => {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const hasApiKey = !!apiKey;
    
    let apiWorking = false;
    if (hasApiKey) {
      try {
        const testData = await searchGoogle("test", "all", 0, 1);
        apiWorking = !!testData;
      } catch (error) {
        apiWorking = false;
      }
    }

    const wingmanStatus = wingman.getStatus();

    res.json({
      GoogleApiConfigured: hasApiKey,
      GoogleApiWorking: apiWorking,
      databaseConnected: true, // We know this works if we got here
      wingman: wingmanStatus,
      version: "1.0.0"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}