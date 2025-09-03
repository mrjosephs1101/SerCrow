// server/search.ts
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
      return data[1].slice(0, 8).map((text, index) => ({
        text,
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

// server/worker.ts
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    if (pathname === "/api/search") {
      return await handleSearch(request, env);
    }
    if (pathname === "/api/suggestions") {
      return await handleSuggestions(request, env);
    }
    if (pathname === "/api/popular-searches") {
      return await handlePopularSearches(request, env);
    }
    if (pathname === "/api/recent-searches") {
      return await handleRecentSearches(request, env);
    }
    if (pathname === "/api/auth/me") {
      return await handleAuthMe(request, env);
    }
    if (pathname.startsWith("/api/wingman")) {
      return await handleWingman(request, env);
    }
    return new Response("Not found", { status: 404 });
  }
};
async function handleSearch(request, env) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const query = searchParams.get("q");
  const filter = searchParams.get("filter") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  if (!query) {
    return new Response(JSON.stringify({ error: "Query parameter 'q' is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const googleData = await searchGoogle(query, filter, (page - 1) * limit + 1, limit);
  let searchResults;
  if (googleData) {
    searchResults = convertGoogleResults(googleData, filter);
  } else {
    searchResults = getFallbackResults(query, filter);
  }
  const response = {
    results: searchResults,
    totalResults: googleData?.searchInformation?.totalResults || searchResults.length,
    searchTime: googleData?.searchInformation?.searchTime || 0,
    currentPage: page,
    totalPages: Math.ceil((googleData?.searchInformation?.totalResults || searchResults.length) / limit),
    query,
    filter,
    searchId: `search_${Date.now()}`
  };
  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" }
  });
}
async function handleSuggestions(request, env) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const query = searchParams.get("q");
  if (!query) {
    return new Response(JSON.stringify({ suggestions: [] }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  const suggestions = await getGoogleSearchSuggestions(query);
  return new Response(JSON.stringify({ suggestions }), {
    headers: { "Content-Type": "application/json" }
  });
}
async function handlePopularSearches(request, env) {
  const popularSearches = [
    { id: "1", query: "React" },
    { id: "2", query: "Cloudflare Workers" },
    { id: "3", query: "TypeScript" }
  ];
  return new Response(JSON.stringify({ searches: popularSearches }), {
    headers: { "Content-Type": "application/json" }
  });
}
async function handleRecentSearches(request, env) {
  const recentSearches = [
    { id: "1", query: "How to deploy a Cloudflare Worker" },
    { id: "2", query: "Vite React template" },
    { id: "3", query: "esbuild vs webpack" }
  ];
  return new Response(JSON.stringify({ searches: recentSearches }), {
    headers: { "Content-Type": "application/json" }
  });
}
async function handleAuthMe(request, env) {
  const user = { id: "1", email: "user@example.com" };
  return new Response(JSON.stringify(user), {
    headers: { "Content-Type": "application/json" }
  });
}
async function handleWingman(request, env) {
  const response = { message: "Wingman is not implemented yet" };
  return new Response(JSON.stringify(response), {
    status: 501,
    headers: { "Content-Type": "application/json" }
  });
}
export {
  worker_default as default
};
