import React from 'react';
import { BrowserControls } from '@/components/BrowserControls';

export default function Browser() {
  return (
    <div className="flex flex-col h-screen">
      <BrowserControls />
      <div className="flex-1">
        {/* The BrowserView is a native element that will be visible in this space */}
      </div>
    </div>
  );
}
