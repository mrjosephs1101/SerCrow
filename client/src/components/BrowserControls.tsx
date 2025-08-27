import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, RotateCw, X, Search } from 'lucide-react';

export interface BrowserControlsProps {
  url: string;
  isLoading?: boolean;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onNavigate: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onSearch?: (query: string) => void;
  showSearchButton?: boolean;
  className?: string;
}

export function BrowserControls({
  url,
  isLoading = false,
  canGoBack = false,
  canGoForward = false,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onSearch,
  showSearchButton = false,
  className = '',
}: BrowserControlsProps) {
  const [inputUrl, setInputUrl] = useState(url);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Update input when URL changes from props
  useEffect(() => {
    setInputUrl(url);
  }, [url]);

  const handleNavigate = () => {
    let targetUrl = inputUrl.trim();
    
    // Add https:// if no protocol is specified
    if (targetUrl && !/^https?:\/\//i.test(targetUrl)) {
      // Check if it's a valid domain or IP
      if (/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(:[0-9]{1,5})?(\/.*)?$/i.test(targetUrl) ||
          /^localhost(\:\d+)?(\/.*)?$/i.test(targetUrl) ||
          /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\:\d+)?(\/.*)?$/.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
      } else if (onSearch) {
        // If it's not a valid URL and we have a search handler, treat it as a search
        onSearch(targetUrl);
        return;
      } else {
        // Default to search if no search handler is provided
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
      }
    }
    
    onNavigate(targetUrl);
    // Blur the input after navigation
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNavigate();
    } else if (e.key === 'Escape') {
      // Reset to current URL on escape
      setInputUrl(url);
      inputRef.current?.blur();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputUrl('');
    inputRef.current?.focus();
  };

  return (
    <div className={`flex items-center gap-2 p-2 bg-background border-b ${className}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onGoBack} 
        disabled={!canGoBack}
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onGoForward} 
        disabled={!canGoForward}
        aria-label="Go forward"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onReload}
        aria-label="Reload page"
      >
        <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
      
      <div className="relative flex-1 flex items-center">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search or enter website address"
            className={`pr-10 ${isFocused ? 'bg-background' : 'bg-muted/50'}`}
            aria-label="Address bar"
          />
          
          {inputUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-8"
              onClick={handleClear}
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {showSearchButton && onSearch && (
          <Button 
            variant="default" 
            size="sm" 
            className="ml-2"
            onClick={() => onSearch(inputUrl)}
            disabled={!inputUrl.trim()}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        )}
      </div>
    </div>
  );
}

