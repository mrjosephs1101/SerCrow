import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchResult {
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  source?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error: Error | null;
  onOpenInBrowser: (url: string) => void;
  className?: string;
}

export function SearchResults({ 
  results, 
  isLoading, 
  error, 
  onOpenInBrowser,
  className = '' 
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 ${className}`}>
        <p>Error loading search results: {error.message}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`text-center p-8 text-muted-foreground ${className}`}>
        <Globe className="mx-auto h-12 w-12 mb-4 opacity-20" />
        <h3 className="text-lg font-medium">No results found</h3>
        <p className="text-sm">Try a different search term or check your connection.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {results.map((result, index) => (
        <div 
          key={`${result.url}-${index}`} 
          className="group relative p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              {result.favicon ? (
                <img 
                  src={result.favicon} 
                  alt="" 
                  className="h-4 w-4" 
                  onError={(e) => {
                    // Fallback to a globe icon if favicon fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'h-4 w-4 flex items-center justify-center';
                    fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"></circle><line x1="2" x2="22" y1="12" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>';
                    target.parentNode?.insertBefore(fallback, target.nextSibling);
                  }}
                />
              ) : (
                <Globe className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {new URL(result.url).hostname}
              </span>
            </div>
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenInBrowser(result.url);
                }}
              >
                <Globe className="h-3 w-3 mr-1" />
                <span>Open in Browser</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(result.url, '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                <span>Open in New Tab</span>
              </Button>
            </div>
          </div>
          
          <a 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
            onClick={(e) => {
              e.preventDefault();
              onOpenInBrowser(result.url);
            }}
          >
            <h3 className="text-lg font-medium text-primary hover:underline">
              {result.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {result.description}
            </p>
          </a>
          
          {result.source && (
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">Source: {result.source}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
