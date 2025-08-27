import React, { useEffect, useRef, useState } from 'react';
import { BrowserControls } from './BrowserControls';

export interface BrowserViewProps {
  initialUrl?: string;
  className?: string;
  onNavigationStateChange?: (state: {
    url: string;
    title?: string;
    canGoBack: boolean;
    canGoForward: boolean;
    isLoading: boolean;
  }) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: Error) => void;
}

export function BrowserView({
  initialUrl = 'about:blank',
  className = '',
  onNavigationStateChange,
  onLoadStart,
  onLoadEnd,
  onError,
}: BrowserViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [title, setTitle] = useState('');

  const handleNavigation = (url: string) => {
    setCurrentUrl(url);
    setIsLoading(true);
    onLoadStart?.();
    
    if (window.electron) {
      // In Electron, we'll let the main process handle the navigation
      window.electron.ipcRenderer.send('toMain', { 
        type: 'navigate', 
        url 
      });
    } else if (iframeRef.current) {
      // Fallback for web: use iframe
      iframeRef.current.src = url;
    }
  };

  const handleGoBack = () => {
    if (window.electron) {
      window.electron.ipcRenderer.send('toMain', { type: 'goBack' });
    } else if (iframeRef.current?.contentWindow?.history) {
      iframeRef.current.contentWindow.history.back();
    }
  };

  const handleGoForward = () => {
    if (window.electron) {
      window.electron.ipcRenderer.send('toMain', { type: 'goForward' });
    } else if (iframeRef.current?.contentWindow?.history) {
      iframeRef.current.contentWindow.history.forward();
    }
  };

  const handleReload = () => {
    if (window.electron) {
      window.electron.ipcRenderer.send('toMain', { type: 'reload' });
    } else if (iframeRef.current) {
      iframeRef.current.contentWindow?.location.reload();
    }
  };

  // Handle Electron-specific events
  useEffect(() => {
    if (window.electron) {
      const handleNavStateChange = (data: any) => {
        if (data.type === 'nav-state-change') {
          setCurrentUrl(data.url);
          setCanGoBack(data.canGoBack);
          setCanGoForward(data.canGoForward);
          setIsLoading(data.isLoading);
          setTitle(data.title || '');
          
          onNavigationStateChange?.({
            url: data.url,
            title: data.title,
            canGoBack: data.canGoBack,
            canGoForward: data.canGoForward,
            isLoading: data.isLoading,
          });
          
          if (data.isLoading) {
            onLoadStart?.();
          } else {
            onLoadEnd?.();
          }
        }
      };

      window.electron.ipcRenderer.on('fromMain', handleNavStateChange);
      return () => {
        window.electron?.ipcRenderer.removeListener('fromMain', handleNavStateChange);
      };
    }
  }, [onNavigationStateChange, onLoadStart, onLoadEnd]);

  // Handle iframe events for web fallback
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || window.electron) return;

    const handleLoad = () => {
      setIsLoading(false);
      onLoadEnd?.();
      
      try {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow) {
          const url = iframe.contentWindow?.location.href || currentUrl;
          const title = iframe.contentDocument?.title || '';
          
          setCurrentUrl(url);
          setTitle(title);
          
          onNavigationStateChange?.({
            url,
            title,
            canGoBack: iframeWindow.history?.length > 1,
            canGoForward: false, // Can't determine this in web iframe
            isLoading: false,
          });
        }
      } catch (e) {
        // Cross-origin iframe, can't access content
        onNavigationStateChange?.({
          url: iframe.src,
          canGoBack: false,
          canGoForward: false,
          isLoading: false,
        });
      }
    };

    const handleError = (event: ErrorEvent) => {
      onError?.(event.error || new Error('Failed to load page'));
      onLoadEnd?.();
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError as EventListener);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError as EventListener);
    };
  }, [currentUrl, onNavigationStateChange, onLoadStart, onLoadEnd, onError]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <BrowserControls 
        url={currentUrl}
        onNavigate={handleNavigation}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        isLoading={isLoading}
      />
      
      <div className="flex-1 relative">
        {window.electron ? (
          // In Electron, the view is managed by the main process
          <div id="browser-view" className="w-full h-full" />
        ) : (
          // Fallback for web: use iframe
          <iframe
            ref={iframeRef}
            src={initialUrl}
            className="w-full h-full border-0"
            title="Browser View"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allow="geolocation; microphone; camera; fullscreen; payment"
          />
        )}
        
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse" />
        )}
      </div>
    </div>
  );
}
