
import { searchGoogle, convertGoogleResults, getFallbackResults, getGoogleSearchSuggestions } from './search';

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Simple router
    if (pathname === '/api/search') {
      return await handleSearch(request, env);
    }

    if (pathname === '/api/suggestions') {
      return await handleSuggestions(request, env);
    }

    if (pathname === '/api/popular-searches') {
      return await handlePopularSearches(request, env);
    }

    if (pathname === '/api/recent-searches') {
      return await handleRecentSearches(request, env);
    }

    if (pathname === '/api/auth/me') {
      return await handleAuthMe(request, env);
    }

    if (pathname.startsWith('/api/wingman')) {
      return await handleWingman(request, env);
    }

    // Serve static assets from Pages
    // This is handled by Cloudflare Pages, so we don't need to do anything here.
    // Any request that doesn't match an API route will be served from the `dist` directory.

    return new Response('Not found', { status: 404 });
  },
};

async function handleSearch(request: Request, env: any): Promise<Response> {
  const url = new URL(request.url);
  const { searchParams } = url;
  const query = searchParams.get('q');
  const filter = searchParams.get('filter') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (!query) {
    return new Response(JSON.stringify({ error: "Query parameter 'q' is required" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
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
    searchId: `search_${Date.now()}`,
  };

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleSuggestions(request: Request, env: any): Promise<Response> {
  const url = new URL(request.url);
  const { searchParams } = url;
  const query = searchParams.get('q');

  if (!query) {
    return new Response(JSON.stringify({ suggestions: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const suggestions = await getGoogleSearchSuggestions(query);

  return new Response(JSON.stringify({ suggestions }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handlePopularSearches(request: Request, env: any): Promise<Response> {
  // Mock data
  const popularSearches = [
    { id: '1', query: 'React' },
    { id: '2', query: 'Cloudflare Workers' },
    { id: '3', query: 'TypeScript' },
  ];

  return new Response(JSON.stringify({ searches: popularSearches }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleRecentSearches(request: Request, env: any): Promise<Response> {
  // Mock data
  const recentSearches = [
    { id: '1', query: 'How to deploy a Cloudflare Worker' },
    { id: '2', query: 'Vite React template' },
    { id: '3', query: 'esbuild vs webpack' },
  ];

  return new Response(JSON.stringify({ searches: recentSearches }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleAuthMe(request: Request, env: any): Promise<Response> {
  // Mock data
  const user = { id: '1', email: 'user@example.com' };

  return new Response(JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleWingman(request: Request, env: any): Promise<Response> {
  // Mock data
  const response = { message: 'Wingman is not implemented yet' };

  return new Response(JSON.stringify(response), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}
