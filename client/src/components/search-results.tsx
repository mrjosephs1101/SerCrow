import { useState } from 'react';
import { useLocation } from 'wouter';
import { SearchResult } from '@shared/schema';
import { ExternalLink, Clock, Tag, Share2, Image as ImageIcon, Video, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [, navigate] = useLocation();


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
        // You could add a toast notification here
        console.log('URL copied to clipboard');
      } catch (error) {
        console.error('Failed to copy URL');
      }
    }
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          <div className="text-lg font-medium">No results found for "{query}"</div>
          <div className="text-sm mt-2">Try different keywords or check your spelling</div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => onFilterChange('all')}>
            All Results
          </Button>
          <Button variant="outline" size="sm" onClick={() => onFilterChange('news')}>
            News
          </Button>
          <Button variant="outline" size="sm" onClick={() => onFilterChange('images')}>
            Images
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Stats - Chrome style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-700 pb-4 gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          About {totalResults.toLocaleString()} results ({(searchTime / 1000).toFixed(2)} seconds)
        </div>
        
        {/* Filter tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {['all', 'news', 'images', 'videos'].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? "default" : "ghost"}
              size="sm"
              onClick={() => onFilterChange(filterOption)}
              className="capitalize whitespace-nowrap"
            >
              {filterOption === 'all' ? 'All' : filterOption}
            </Button>
          ))}
        </div>
      </div>

      {/* Search Results - Enhanced Chrome style with media support */}
      {filter === 'images' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
          {results.map((result, index) => (
            <div key={result.id} className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {result.imageUrl && (
                <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                  <img 
                    src={result.imageUrl} 
                    alt={result.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => window.open(result.url, '_blank')}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.svg';
                    }}
                  />
                </div>
              )}
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                  {result.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {formatUrl(result.url)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : filter === 'videos' ? (
        <div className="space-y-6">
          {results.map((result, index) => (
            <div key={result.id} className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0 w-48 h-32 bg-black flex items-center justify-center">
                  {result.videoUrl ? (
                    <video 
                      className="w-full h-full object-cover" 
                      src={result.videoUrl} 
                      controls
                      poster={result.imageUrl}
                    />
                  ) : (
                    <div className="flex items-center justify-center text-white">
                      <Video className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {result.favicon && (
                      <img src={result.favicon} alt="" className="w-4 h-4 mr-2 rounded" />
                    )}
                    <span className="truncate">{formatUrl(result.url)}</span>
                  </div>
                  <h3 
                    className="text-lg text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mb-2 leading-tight"
                    onClick={() => window.open(result.url, '_blank')}
                  >
                    {result.title}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {result.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((result, index) => (
            <div key={result.id} className="max-w-2xl group">
              {/* URL and domain */}
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
                <span className="truncate flex-1">{formatUrl(result.url)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  onClick={() => handleShare(result)}
                >
                  <Share2 className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Title */}
              <h3 
                className="text-xl text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mb-2 leading-tight"
                onClick={() => {
                  if (window.electron) {
                    window.electron.ipcRenderer.send('toMain', { type: 'navigate', url: result.url });
                    navigate('/browser');
                  } else {
                    window.open(result.url, '_blank');
                  }
                }}
              >
                <span className="flex items-center gap-1">
                  {filter === 'news' && <Calendar className="h-4 w-4" />}
                  {result.title}
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </span>
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                {result.description}
              </p>
              
              {/* Metadata row */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                {/* Date if available */}
                {result.lastModified && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {result.lastModified}
                  </div>
                )}
                
                {/* Tags */}
                {result.tags && result.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    <div className="flex gap-1">
                      {result.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge 
                          key={tagIndex} 
                          variant="secondary" 
                          className="text-xs px-1 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more hint */}
      {results.length > 0 && (
        <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
          Showing {results.length} of {totalResults.toLocaleString()} results
        </div>
      )}
    </div>
  );
}
