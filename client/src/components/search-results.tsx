import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  description: string;
  favicon?: string;
  tags?: string[];
  imageUrl?: string;
  videoUrl?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  totalResults?: number;
  searchTime?: number;
  query: string;
  filter: string;
  onFilterChange?: (filter: string) => void;
}

export function SearchResults({ 
  results, 
  totalResults, 
  searchTime, 
  query, 
  filter,
  onFilterChange 
}: SearchResultsProps) {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'images', label: 'Images' },
    { key: 'videos', label: 'Videos' },
    { key: 'news', label: 'News' }
  ];

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center space-x-6 border-b border-gray-200 pb-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange?.(f.key)}
            className="text-sm"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Search Stats */}
      {totalResults !== undefined && searchTime !== undefined && (
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <span>About {totalResults.toLocaleString()} results</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            ({searchTime}ms)
          </span>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                {result.favicon && (
                  <img
                    src={result.favicon}
                    alt=""
                    className="w-4 h-4 mt-1 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-blue-600 hover:underline mb-1">
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          {result.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </h3>
                      <p className="text-sm text-green-700 mb-2 truncate">{result.url}</p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {result.description}
                      </p>
                    </div>
                    
                    {result.imageUrl && (
                      <img
                        src={result.imageUrl}
                        alt={result.title}
                        className="w-20 h-20 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No results found for "{query}"</p>
          <p className="text-sm text-gray-400 mt-2">Try different keywords or check your spelling</p>
        </div>
      )}
    </div>
  );
}