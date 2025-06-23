import { useState } from 'react';
import { SearchResult } from '@shared/schema';

interface SearchResultsProps {
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  query: string;
  filter: string;
  onFilterChange: (filter: string) => void;
}

export function SearchResults({
  results,
  totalResults,
  searchTime,
  query,
  filter,
  onFilterChange
}: SearchResultsProps) {

  const handleShare = async (result: SearchResult) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: result.title,
          url: result.url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(result.url);
        console.log('URL copied to clipboard');
      } catch (error) {
        console.error('Failed to copy URL');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Stats - Chrome style */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        About {totalResults.toLocaleString()} results ({(searchTime / 1000).toFixed(2)} seconds)
      </div>

      {/* Search Results - Chrome style */}
      <div className="space-y-6">
        {results.map((result) => (
          <div key={result.id} className="max-w-2xl">
            {/* URL */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
              {result.favicon && (
                <img
                  src={result.favicon}
                  alt=""
                  className="w-4 h-4 mr-2 rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="truncate">{result.url}</span>
            </div>
            
            {/* Title */}
            <h3 className="text-xl text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mb-1">
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                {result.title}
              </a>
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {result.description}
            </p>
            
            {/* Date if available */}
            {result.lastModified && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {result.lastModified}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}