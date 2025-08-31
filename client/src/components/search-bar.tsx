import React, { useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

export function SearchBar({ 
  value = '', 
  onChange, 
  onSearch, 
  placeholder = "Search...", 
  className = "",
  compact = false 
}: SearchBarProps) {
  const [query, setQuery] = useState(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const clearSearch = () => {
    setQuery('');
    if (onChange) {
      onChange('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative flex items-center">
        <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 hover:shadow-md focus-within:shadow-md transition-shadow w-full">
          <SearchIcon className="h-5 w-5 text-gray-400 mr-3" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleChange}
            className="flex-1 border-none outline-none bg-transparent"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="p-1 h-auto"
            >
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}