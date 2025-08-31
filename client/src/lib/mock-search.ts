// Mock search API for frontend-only deployment
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  displayUrl: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
}

const mockResults: SearchResult[] = [
  {
    title: "DuckDuckGo — Privacy, simplified.",
    url: "https://duckduckgo.com",
    snippet: "The Internet privacy company that empowers you to seamlessly take control of your personal information online, without any tradeoffs.",
    displayUrl: "duckduckgo.com"
  },
  {
    title: "Privacy-focused search engines - Wikipedia",
    url: "https://en.wikipedia.org/wiki/Privacy-focused_search_engine",
    snippet: "Privacy-focused search engines are web search engines that prioritize user privacy by not tracking users or storing personal information.",
    displayUrl: "en.wikipedia.org"
  },
  {
    title: "Startpage - The world's most private search engine",
    url: "https://www.startpage.com",
    snippet: "Startpage is the world's most private search engine. Use Startpage to protect your personal data.",
    displayUrl: "startpage.com"
  }
];

export async function mockSearch(query: string): Promise<SearchResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Generate relevant mock results based on query
  const relevantResults = mockResults.map(result => ({
    ...result,
    title: result.title.includes(query.toLowerCase()) ? result.title : `${query} - ${result.title}`,
    snippet: `Search results for "${query}". ${result.snippet}`
  }));

  return {
    results: relevantResults,
    totalResults: relevantResults.length,
    searchTime: Math.random() * 0.5 + 0.1
  };
}