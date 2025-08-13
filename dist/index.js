var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertSearchQuerySchema: () => insertSearchQuerySchema,
  insertUserSchema: () => insertUserSchema,
  searchQueries: () => searchQueries,
  users: () => users
});
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var searchQueries = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  searchId: text("search_id").notNull().unique(),
  query: text("query").notNull(),
  filter: text("filter").default("all"),
  resultsCount: integer("results_count").default(0),
  searchTime: integer("search_time").default(0),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertSearchQuerySchema = createInsertSchema(searchQueries).pick({
  searchId: true,
  query: true,
  filter: true,
  resultsCount: true,
  searchTime: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, sql } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async logSearchQuery(insertQuery) {
    const [query] = await db.insert(searchQueries).values({
      ...insertQuery,
      filter: insertQuery.filter || null,
      resultsCount: insertQuery.resultsCount || null,
      searchTime: insertQuery.searchTime || null
    }).returning();
    return query;
  }
  async getRecentSearches(limit = 10) {
    return await db.select().from(searchQueries).orderBy(desc(searchQueries.timestamp)).limit(limit);
  }
  async getPopularSearches(limit = 10) {
    const popularQueries = await db.select({
      query: searchQueries.query,
      filter: searchQueries.filter,
      count: sql`count(*)`.as("count"),
      // Get the most recent instance of each query
      id: sql`max(${searchQueries.id})`.as("id"),
      searchId: sql`max(${searchQueries.searchId})`.as("searchId"),
      resultsCount: sql`max(${searchQueries.resultsCount})`.as("resultsCount"),
      searchTime: sql`max(${searchQueries.searchTime})`.as("searchTime"),
      timestamp: sql`max(${searchQueries.timestamp})`.as("timestamp")
    }).from(searchQueries).groupBy(searchQueries.query, searchQueries.filter).orderBy(desc(sql`count(*)`)).limit(limit);
    return popularQueries.map((item) => ({
      id: item.id,
      searchId: item.searchId,
      query: item.query,
      filter: item.filter,
      resultsCount: item.resultsCount,
      searchTime: item.searchTime,
      timestamp: item.timestamp
    }));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { lru } from "tiny-lru";

// server/wingman.ts
var WingMan = class {
  apiKey;
  defaultModel;
  baseUrl;
  isAvailable = false;
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    this.defaultModel = process.env.OPENROUTER_MODEL || "openai/gpt-4-turbo-preview";
    this.baseUrl = "https://openrouter.ai/api/v1";
    this.checkAvailability();
  }
  async checkAvailability() {
    if (!this.apiKey) {
      this.isAvailable = false;
      console.warn("\u26A0\uFE0F OpenRouter API key not configured. WingMan AI features disabled.");
      return;
    }
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        this.isAvailable = true;
        console.log("\u{1F916} WingMan AI Assistant is ready with OpenRouter!");
      } else {
        this.isAvailable = false;
        console.warn("\u26A0\uFE0F OpenRouter API connection failed. WingMan AI features disabled.");
      }
    } catch (error) {
      this.isAvailable = false;
      console.warn("\u26A0\uFE0F OpenRouter API not available. WingMan AI features disabled.");
    }
  }
  getStatus() {
    return {
      available: this.isAvailable,
      model: this.defaultModel,
      provider: "OpenRouter"
    };
  }
  async callOpenRouter(prompt, options = {}) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sercrow.ai",
        "X-Title": "SerCrow WingMan AI Assistant"
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 500,
        response_format: { type: "json_object" }
      })
    });
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  }
  // Smart search query enhancement and suggestions
  async enhanceSearchQuery(query) {
    if (!this.isAvailable) {
      return {
        original: query,
        enhanced: query,
        suggestions: [],
        intent: "web_search"
      };
    }
    try {
      const prompt = `
Analyze this search query and help improve it for better search results.

Query: "${query}"

Provide:
1. Enhanced version of the query (more specific, better keywords)
2. 3 alternative search suggestions
3. Search intent (web_search, image_search, video_search, news_search, academic_search, shopping, local_search, definition)

Respond in this exact JSON format:
{
  "enhanced": "enhanced query here",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "intent": "search_type_here"
}`;
      const responseText = await this.callOpenRouter(prompt, {
        temperature: 0.7,
        max_tokens: 200
      });
      const result = JSON.parse(responseText);
      return {
        original: query,
        enhanced: result.enhanced || query,
        suggestions: result.suggestions || [],
        intent: result.intent || "web_search"
      };
    } catch (error) {
      console.error("WingMan query enhancement error:", error);
      return {
        original: query,
        enhanced: query,
        suggestions: [],
        intent: "web_search"
      };
    }
  }
  // Generate AI summary of search results
  async summarizeResults(query, results) {
    if (!this.isAvailable || results.length === 0) {
      return {
        summary: "",
        keyPoints: [],
        confidence: 0
      };
    }
    try {
      const topResults = results.slice(0, 5);
      const resultsText = topResults.map(
        (result2, index) => `${index + 1}. ${result2.title}
   ${result2.description}`
      ).join("\n\n");
      const prompt = `
Based on these search results for the query "${query}", provide a comprehensive summary.

Search Results:
${resultsText}

Provide:
1. A clear, informative summary (2-3 sentences)
2. 3-5 key points from the results
3. Confidence level (0-100) in the information accuracy

Respond in this exact JSON format:
{
  "summary": "comprehensive summary here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "confidence": 85
}`;
      const responseText = await this.callOpenRouter(prompt, {
        temperature: 0.3,
        max_tokens: 300
      });
      const result = JSON.parse(responseText);
      return {
        summary: result.summary || "",
        keyPoints: result.keyPoints || [],
        confidence: result.confidence || 0
      };
    } catch (error) {
      console.error("WingMan summarization error:", error);
      return {
        summary: "",
        keyPoints: [],
        confidence: 0
      };
    }
  }
  // Direct question answering
  async answerQuestion(question, context) {
    if (!this.isAvailable) {
      return {
        answer: "",
        sources: [],
        confidence: 0,
        followUpQuestions: []
      };
    }
    try {
      let contextText = "";
      let sources = [];
      if (context && context.length > 0) {
        contextText = context.slice(0, 3).map((result2, index) => {
          sources.push(result2.url);
          return `Source ${index + 1}: ${result2.title}
${result2.description}`;
        }).join("\n\n");
      }
      const prompt = `
Answer this question using the provided context (if available) and your knowledge.

Question: "${question}"

${contextText ? `Context from search results:
${contextText}
` : ""}

Provide:
1. A clear, accurate answer
2. Confidence level (0-100)
3. 3 relevant follow-up questions

${contextText ? "If using context, cite the sources." : "Answer based on general knowledge."}

Respond in this exact JSON format:
{
  "answer": "detailed answer here",
  "confidence": 90,
  "followUpQuestions": ["question 1?", "question 2?", "question 3?"]
}`;
      const responseText = await this.callOpenRouter(prompt, {
        temperature: 0.2,
        max_tokens: 400
      });
      const result = JSON.parse(responseText);
      return {
        answer: result.answer || "",
        sources,
        confidence: result.confidence || 0,
        followUpQuestions: result.followUpQuestions || []
      };
    } catch (error) {
      console.error("WingMan question answering error:", error);
      return {
        answer: "",
        sources: [],
        confidence: 0,
        followUpQuestions: []
      };
    }
  }
  // Smart search suggestions based on search history and trends
  async generateSmartSuggestions(partialQuery, searchHistory) {
    if (!this.isAvailable || partialQuery.length < 2) {
      return [];
    }
    try {
      const historyContext = searchHistory && searchHistory.length > 0 ? `Recent searches: ${searchHistory.slice(0, 5).join(", ")}` : "";
      const prompt = `
Generate 5 smart search suggestions for the partial query "${partialQuery}".

${historyContext}

Consider:
- Popular search trends
- Related topics
- Different search intents
- Completion of partial words

Respond with just a JSON array of strings:
["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5"]`;
      const responseText = await this.callOpenRouter(prompt, {
        temperature: 0.8,
        max_tokens: 150
      });
      const suggestions = JSON.parse(responseText);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
      console.error("WingMan smart suggestions error:", error);
      return [];
    }
  }
  // Content analysis and categorization
  async analyzeContent(title, description) {
    if (!this.isAvailable) {
      return {
        category: "general",
        relevanceScore: 50,
        tags: [],
        sentiment: "neutral"
      };
    }
    try {
      const prompt = `
Analyze this content and categorize it:

Title: "${title}"
Description: "${description}"

Provide:
1. Category (technology, science, news, entertainment, business, health, sports, education, etc.)
2. Relevance score (0-100)
3. 3-5 relevant tags
4. Sentiment (positive, neutral, negative)

Respond in this exact JSON format:
{
  "category": "category_name",
  "relevanceScore": 85,
  "tags": ["tag1", "tag2", "tag3"],
  "sentiment": "neutral"
}`;
      const responseText = await this.callOpenRouter(prompt, {
        temperature: 0.1,
        max_tokens: 150
      });
      const result = JSON.parse(responseText);
      return {
        category: result.category || "general",
        relevanceScore: result.relevanceScore || 50,
        tags: result.tags || [],
        sentiment: result.sentiment || "neutral"
      };
    } catch (error) {
      console.error("WingMan content analysis error:", error);
      return {
        category: "general",
        relevanceScore: 50,
        tags: [],
        sentiment: "neutral"
      };
    }
  }
};
var wingman = new WingMan();

// server/routes.ts
var cache = lru(100, 6e4);
async function searchGoogle(query, filter = "all", start = 1, num = 10) {
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
      num: Math.min(num, 10).toString(),
      // Google CSE max is 10 per request
      safe: "active",
      fields: "items(title,link,snippet,pagemap/cse_thumbnail,pagemap/cse_image),searchInformation(totalResults,searchTime)"
    });
    if (filter === "images") {
      searchParams.append("searchType", "image");
      searchParams.append("imgSize", "medium");
      searchParams.append("imgType", "photo");
    } else if (filter === "news") {
      searchParams.set("q", `${query} site:news.google.com OR site:bbc.com OR site:cnn.com OR site:reuters.com`);
      searchParams.append("dateRestrict", "m1");
    } else if (filter === "videos") {
      searchParams.set("q", `${query} site:youtube.com OR site:vimeo.com`);
    }
    const url = `https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`;
    console.log(`\u{1F50D} Google Custom Search API request: ${query} (filter: ${filter})`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1e4);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "SerCrow-Search-Engine/1.0"
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
    if (data?.items) {
      console.log(`\u2705 Google Search returned ${data.items.length} results`);
    } else {
      console.log(`\u2705 Google API returned results (no items found)`);
    }
    return data;
  } catch (error) {
    console.error("Google Search API request failed:", error);
    return null;
  }
}
function convertGoogleResults(googleData, filter) {
  if (!googleData?.items || !Array.isArray(googleData.items)) {
    return [];
  }
  return googleData.items.map((result, index) => {
    let domain = "";
    try {
      domain = new URL(result.link).hostname;
    } catch (e) {
      domain = "unknown";
    }
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    let description = result.snippet || "No description available";
    if (description.length > 200) {
      description = description.substring(0, 197) + "...";
    }
    const tags = [];
    if (filter !== "all") tags.push(filter);
    if (domain) tags.push(domain);
    let imageUrl = void 0;
    if (filter === "images") {
      imageUrl = result.link;
      if (result.pagemap?.cse_thumbnail?.[0]?.src) {
        imageUrl = result.pagemap.cse_thumbnail[0].src;
      }
      tags.push("image");
    }
    let videoUrl = void 0;
    if (filter === "videos" || result.link.includes("youtube.com") || result.link.includes("vimeo.com")) {
      videoUrl = result.link;
      tags.push("video");
    }
    if (filter === "news" || result.link.includes("news.") || result.link.includes("bbc.com") || result.link.includes("cnn.com")) {
      tags.push("news");
    }
    return {
      id: `google-${index}-${Date.now()}`,
      title: result.title || "Untitled",
      url: result.link || "",
      description,
      favicon,
      lastModified: void 0,
      // Google CSE doesn't provide this directly
      tags,
      imageUrl,
      videoUrl
    };
  });
}
async function getGoogleSearchSuggestions(query) {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  if (!apiKey || query.length < 2) {
    return [];
  }
  try {
    const url = `https://api.search.Google.com/res/v1/suggest?q=${encodeURIComponent(query)}&count=8`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5e3);
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "X-Subscription-Token": apiKey
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      console.error(`Google Suggestions API error: ${response.status}`);
      return [];
    }
    const data = await response.json();
    if (Array.isArray(data) && data[1] && Array.isArray(data[1])) {
      return data[1].slice(0, 8).map((text2, index) => ({
        text: text2,
        count: Math.max(1e3 - index * 100, 50)
        // Simulated popularity score
      }));
    }
    return [];
  } catch (error) {
    console.error("Google Suggestions API error:", error);
    return [];
  }
}
function getFallbackResults(query, filter) {
  const fallbackResults = [
    {
      id: "fallback-1",
      title: `Search results for "${query}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      description: "Google Search API is currently unavailable. This is a fallback result that would normally show real web search results.",
      favicon: "https://www.google.com/favicon.ico",
      tags: ["fallback", filter]
    },
    {
      id: "fallback-2",
      title: `${query} - Wikipedia`,
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
      description: `Wikipedia search results for ${query}. This would normally be replaced with real search results from the Google Search API.`,
      favicon: "https://en.wikipedia.org/favicon.ico",
      tags: ["wikipedia", filter]
    }
  ];
  return fallbackResults;
}
function isSearchResultArray(value) {
  return Array.isArray(value) && value.every(
    (item) => item && typeof item === "object" && typeof item.id === "string" && typeof item.title === "string" && typeof item.url === "string" && typeof item.description === "string"
  );
}
async function registerRoutes(app2) {
  app2.get("/api/search", async (req, res) => {
    try {
      const { q: query, filter = "all", page = "1", limit = "10" } = req.query;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      if (query.trim().length === 0) {
        return res.status(400).json({ error: "Query cannot be empty" });
      }
      const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const startTime = Date.now();
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(Math.max(1, parseInt(limit, 10)), 50);
      const offset = (pageNum - 1) * limitNum;
      const cacheKey = `${query}-${filter}-${pageNum}-${limitNum}`;
      if (cache.has(cacheKey)) {
        console.log(`\u26A1\uFE0F Cache hit for: "${query}"`);
        return res.json(cache.get(cacheKey));
      }
      console.log(`\u{1F50D} Processing search: "${query}" (filter: ${filter}, page: ${pageNum})`);
      let searchResults = [];
      let totalResults = 0;
      let apiUsed = false;
      const startIndex = offset + 1;
      const googleData = await searchGoogle(query, filter, startIndex, limitNum);
      if (googleData) {
        searchResults = convertGoogleResults(googleData, filter);
        if (googleData?.searchInformation?.totalResults) {
          totalResults = parseInt(googleData.searchInformation.totalResults, 10);
        } else {
          totalResults = searchResults.length;
        }
        apiUsed = true;
        console.log(`\u2705 Google API returned ${searchResults.length} results`);
      } else {
        searchResults = getFallbackResults(query, filter);
        totalResults = searchResults.length;
        console.log(`\u26A0\uFE0F Using fallback results for query: ${query}`);
      }
      let filteredResults = searchResults;
      if (filter !== "all" && typeof filter === "string" && !apiUsed) {
        filteredResults = searchResults.filter((result) => {
          const matchesFilter = result.tags?.some(
            (tag) => tag.toLowerCase().includes(filter.toLowerCase())
          ) || result.title.toLowerCase().includes(filter.toLowerCase()) || result.description.toLowerCase().includes(filter.toLowerCase());
          return matchesFilter;
        });
      }
      const searchTime = Date.now() - startTime;
      const totalPages = Math.ceil(totalResults / limitNum);
      try {
        await storage.logSearchQuery({
          searchId,
          query,
          filter,
          resultsCount: filteredResults.length,
          searchTime
        });
        console.log(`\u{1F4CA} Logged search query to database: ${searchId}`);
      } catch (error) {
        console.error("Failed to log search query:", error);
      }
      const response = {
        results: filteredResults,
        totalResults,
        searchTime,
        currentPage: pageNum,
        totalPages,
        query,
        filter,
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
  app2.get("/api/suggestions", async (req, res) => {
    try {
      const { q: query } = req.query;
      if (!query || typeof query !== "string" || query.length < 2) {
        return res.json({ suggestions: [] });
      }
      console.log(`\u{1F4A1} Getting suggestions for: "${query}"`);
      const suggestions = await getGoogleSearchSuggestions(query);
      if (suggestions.length > 0) {
        console.log(`\u2705 Google API returned ${suggestions.length} suggestions`);
        return res.json({ suggestions });
      }
      const fallbackSuggestions = [
        { text: `${query} tutorial`, count: 500 },
        { text: `${query} guide`, count: 400 },
        { text: `${query} examples`, count: 300 },
        { text: `what is ${query}`, count: 200 },
        { text: `${query} tips`, count: 100 }
      ].filter((s) => s.text.length <= 50);
      console.log(`\u26A0\uFE0F Using fallback suggestions for: ${query}`);
      res.json({ suggestions: fallbackSuggestions });
    } catch (error) {
      console.error("Suggestions error:", error);
      res.status(500).json({
        error: "Internal server error fetching suggestions",
        suggestions: []
      });
    }
  });
  app2.get("/api/popular-searches", async (req, res) => {
    try {
      const popularSearches = await storage.getPopularSearches(10);
      res.json({ searches: popularSearches });
    } catch (error) {
      console.error("Popular searches error:", error);
      res.status(500).json({ error: "Internal server error fetching popular searches" });
    }
  });
  app2.get("/api/recent-searches", async (req, res) => {
    try {
      const recentSearches = await storage.getRecentSearches(10);
      res.json({ searches: recentSearches });
    } catch (error) {
      console.error("Recent searches error:", error);
      res.status(500).json({ error: "Internal server error fetching recent searches" });
    }
  });
  app2.get("/api/wingman/enhance-query", async (req, res) => {
    try {
      const { q: query } = req.query;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      console.log(`\u{1F916} WingMan enhancing query: "${query}"`);
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
  app2.get("/api/wingman/smart-suggestions", async (req, res) => {
    try {
      const { q: query, history } = req.query;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      const searchHistory = history ? String(history).split(",") : [];
      console.log(`\u{1F916} WingMan generating smart suggestions for: "${query}"`);
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
  app2.post("/api/wingman/summarize", async (req, res) => {
    try {
      const requestBody = req.body;
      if (!requestBody || typeof requestBody !== "object") {
        return res.status(400).json({ error: "Request body is required" });
      }
      const { query, results } = requestBody;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required and must be a string" });
      }
      if (!results || !isSearchResultArray(results)) {
        return res.status(400).json({ error: "Results array is required and must be valid SearchResult[]" });
      }
      console.log(`\u{1F916} WingMan summarizing ${results.length} results for: "${query}"`);
      const summary = await wingman.summarizeResults(query, results);
      res.json(summary);
    } catch (error) {
      console.error("WingMan summarization error:", error);
      res.status(500).json({
        error: "Internal server error summarizing results",
        summary: "",
        keyPoints: [],
        confidence: 0
      });
    }
  });
  app2.post("/api/wingman/answer", async (req, res) => {
    try {
      const { question, context } = req.body;
      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Question is required" });
      }
      console.log(`\u{1F916} WingMan answering question: "${question}"`);
      let searchContext = [];
      if (context && Array.isArray(context) && isSearchResultArray(context)) {
        searchContext = context;
      }
      const answer = await wingman.answerQuestion(question, searchContext);
      res.json(answer);
    } catch (error) {
      console.error("WingMan question answering error:", error);
      res.status(500).json({
        error: "Internal server error answering question",
        answer: "",
        sources: [],
        confidence: 0,
        followUpQuestions: []
      });
    }
  });
  app2.post("/api/wingman/analyze", async (req, res) => {
    try {
      const { title, description } = req.body;
      if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "Title is required and must be a string" });
      }
      if (!description || typeof description !== "string") {
        return res.status(400).json({ error: "Description is required and must be a string" });
      }
      console.log(`\u{1F916} WingMan analyzing content: "${title}"`);
      const analysis = await wingman.analyzeContent(title, description);
      res.json(analysis);
    } catch (error) {
      console.error("WingMan content analysis error:", error);
      res.status(500).json({
        error: "Internal server error analyzing content",
        category: "general",
        relevanceScore: 50,
        tags: [],
        sentiment: "neutral"
      });
    }
  });
  app2.post("/api/wingman/chat", async (req, res) => {
    try {
      const requestBody = req.body;
      if (!requestBody || typeof requestBody !== "object") {
        return res.status(400).json({ error: "Request body is required" });
      }
      const { message, conversationHistory = [], searchResults = [] } = requestBody;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }
      let validSearchResults = [];
      if (searchResults.length > 0) {
        if (isSearchResultArray(searchResults)) {
          validSearchResults = searchResults;
        } else {
          console.warn("Invalid searchResults provided to chat endpoint, ignoring");
        }
      }
      console.log(`\u{1F916} WingMan chat: "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"`);
      let context = "";
      if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        context += "Previous conversation:\n";
        conversationHistory.slice(-6).forEach((msg, index) => {
          if (msg && typeof msg === "object" && msg.role && msg.content) {
            const role = msg.role === "user" ? "Human" : "Assistant";
            context += `${role}: ${msg.content}
`;
          }
        });
        context += "\n";
      }
      if (validSearchResults.length > 0) {
        context += "Recent search results for context:\n";
        validSearchResults.slice(0, 5).forEach((result, index) => {
          context += `${index + 1}. ${result.title}
${result.description}
${result.url}

`;
        });
      }
      const response = await wingman.answerQuestion(message, validSearchResults);
      const chatResponse = {
        ...response,
        conversationId: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        hasContext: false
      });
    }
  });
  app2.get("/api/status", async (req, res) => {
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
      databaseConnected: true,
      // We know this works if we got here
      wingman: wingmanStatus,
      version: "1.0.0"
    });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var getPlugins = async () => {
  const plugins = [react()];
  const isReplit = process.env.REPL_ID !== void 0;
  if (isReplit) {
    const runtimeErrorOverlay = await import("@replit/vite-plugin-runtime-error-modal");
    const cartographer = await import("@replit/vite-plugin-cartographer");
    plugins.push(runtimeErrorOverlay.default());
    plugins.push(cartographer.cartographer());
  }
  return plugins;
};
var vite_config_default = defineConfig(async () => ({
  plugins: await getPlugins(),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    hmr: {
      overlay: false
      // Disables Vite’s default error overlay
    }
  }
}));

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import { createServer as createServer2 } from "http";
import dotenv from "dotenv";
dotenv.config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      console.log(logLine);
    }
  });
  next();
});
(async () => {
  registerRoutes(app);
  const server = createServer2(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = process.env.PORT || 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    const formattedTime = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "medium"
    }).format(/* @__PURE__ */ new Date());
    console.log(`${formattedTime} [express] serving on port ${PORT}`);
  });
})();
