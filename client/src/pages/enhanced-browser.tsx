import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { DuckDuckGoBrowser } from '@/components/DuckDuckGoBrowser';

export default function EnhancedBrowserPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialUrl = searchParams.get('url') || '';

  return (
    <DuckDuckGoBrowser 
      initialQuery={initialQuery}
      initialUrl={initialUrl}
    />
  );
}