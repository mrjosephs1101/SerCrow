import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BrowserView } from '@/components/BrowserView';
import { BrowserControls } from '@/components/BrowserControls';

export default function Browser() {
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get('url') || 'about:blank';
  const [url, setUrl] = useState(initialUrl);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('New Tab');

  const handleNavigate = useCallback((newUrl: string) => {
    setUrl(newUrl);
  }, []);

  const handleGoBack = useCallback(() => {
    // This will be implemented when we have browser history
    console.log('Go back');
  }, []);

  const handleGoForward = useCallback(() => {
    // This will be implemented when we have browser history
    console.log('Go forward');
  }, []);

  const handleReload = useCallback(() => {
    // This will trigger a reload in the BrowserView
    setUrl(url => url);
  }, []);

  const handleNavigationStateChange = useCallback((state: {
    url: string;
    title?: string;
    canGoBack: boolean;
    canGoForward: boolean;
    isLoading: boolean;
  }) => {
    setCanGoBack(state.canGoBack);
    setCanGoForward(state.canGoForward);
    setTitle(state.title || 'New Tab');
    setIsLoading(state.isLoading);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <BrowserControls 
        url={url}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        isLoading={isLoading}
      />
      <div className="flex-1">
        <BrowserView
          initialUrl={url}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
