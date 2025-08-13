import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, RotateCw, X } from 'lucide-react';

// A flag to check if we're in Electron
const isElectron = !!window.electron;

export function BrowserControls() {
  const [url, setUrl] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const handleNavigate = () => {
    if (url && isElectron) {
      window.electron.ipcRenderer.send('toMain', { type: 'navigate', url });
    }
  };

  const handleGoBack = () => isElectron && window.electron.ipcRenderer.send('toMain', { type: 'goBack' });
  const handleGoForward = () => isElectron && window.electron.ipcRenderer.send('toMain', { type: 'goForward' });
  const handleReload = () => isElectron && window.electron.ipcRenderer.send('toMain', { type: 'reload' });

  useEffect(() => {
    if (isElectron) {
      window.electron.ipcRenderer.on('fromMain', (data) => {
        if (data.type === 'nav-state-change') {
          setUrl(data.url);
          setCanGoBack(data.canGoBack);
          setCanGoForward(data.canGoForward);
        }
      });
    }
  }, []);

  // Only render the controls if running in Electron
  if (!isElectron) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <Button variant="ghost" size="icon" onClick={handleGoBack} disabled={!canGoBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleGoForward} disabled={!canGoForward}>
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleReload}>
        <RotateCw className="h-4 w-4" />
      </Button>
      <div className="relative flex-1">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
          placeholder="https://..."
          className="pr-8"
        />
        {url && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={() => setUrl('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

