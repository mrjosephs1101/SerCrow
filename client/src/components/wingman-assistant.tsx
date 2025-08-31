import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, MessageCircle } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  description: string;
}

interface WingManAssistantProps {
  query: string;
  results?: SearchResult[];
  onQueryChange?: (query: string) => void;
  onSearch?: (query: string) => void;
}

export function WingManAssistant({ query, results, onQueryChange, onSearch }: WingManAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    if (!results || results.length === 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/wingman/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, results: results.slice(0, 5) })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary || 'Unable to generate summary at this time.');
      } else {
        setSummary('Unable to generate summary at this time.');
      }
    } catch (error) {
      setSummary('Unable to generate summary at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQueries = [
    `${query} tutorial`,
    `${query} examples`,
    `what is ${query}`,
    `${query} vs alternatives`
  ];

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-blue-600" />
            WingMan AI Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isExpanded ? (
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">
              AI-powered insights available for your search
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
            >
              View Insights
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Search Summary</span>
              </div>
              
              {!summary ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSummary}
                  disabled={isLoading || !results || results.length === 0}
                >
                  {isLoading ? 'Generating...' : 'Generate AI Summary'}
                </Button>
              ) : (
                <div className="bg-white p-3 rounded-lg border text-sm">
                  {summary}
                </div>
              )}
            </div>

            {/* Suggested Queries */}
            <div>
              <span className="font-medium text-sm mb-2 block">Related Searches</span>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      if (onQueryChange) onQueryChange(suggestion);
                      if (onSearch) onSearch(suggestion);
                    }}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}