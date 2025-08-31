import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  compact?: boolean;
}

export function Header({ compact = false }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/search')}
            className="text-2xl font-normal text-gray-700 hover:text-blue-600"
          >
            Ser<span className="text-blue-500">Crow</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <a href="#" className="text-gray-700 hover:underline">Gmail</a>
          <a href="#" className="text-gray-700 hover:underline">Images</a>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/auth')}
          >
            Sign in
          </Button>
        </div>
      </div>
    </header>
  );
}