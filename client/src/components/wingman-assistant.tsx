import { useState, useEffect } from 'react';
import { SearchResult } from '@shared/schema';
import { 
  Bot, 
  Sparkles, 
  MessageCircle, 
  TrendingUp, 
  BarChart3, 
  Lightbulb,
  ChevronUp,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface WingManAssistantProps {
  query: string;
  results?: SearchResult[];
  onQueryChange: (newQuery: string) => void;
  onSearch: (query: string) => void;
}

interface QueryEnhancement {
  original: string;
  enhanced: string;
  suggestions: string[];
  intent: string;
}

interface ResultSummary {
  summary: string;
  keyPoints: string[];
  confidence: number;
}

interface QuestionAnswer {
  answer: string;
  sources: string[];
  confidence: number;
  followUpQuestions: string[];
}

export function WingManAssistant({ query, results, onQueryChange, onSearch }: WingManAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'enhance' | 'summarize' | 'ask'>('enhance');
  const [loading, setLoading] = useState(false);
  
  // AI Enhancement state
  const [queryEnhancement, setQueryEnhancement] = useState<QueryEnhancement | null>(null);
  
  // Summarization state
  const [resultSummary, setResultSummary] = useState<ResultSummary | null>(null);
  
  // Question answering state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<QuestionAnswer | null>(null);

  // Auto-enhance query when it changes
  useEffect(() => {
    if (query && query.length > 2 && activeTab === 'enhance') {
      enhanceQuery(query);
    }
  }, [query, activeTab]);

  // Auto-summarize results when they change
  useEffect(() => {
    if (results && results.length > 0 && activeTab === 'summarize') {
      summarizeResults();
    }
  }, [results, activeTab]);

  const enhanceQuery = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wingman/enhance-query?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const enhancement = await response.json();
        setQueryEnhancement(enhancement);
      }
    } catch (error) {
      console.error('Failed to enhance query:', error);
    } finally {
      setLoading(false);
    }
  };

  const summarizeResults = async () => {
    if (!results || results.length === 0) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/wingman/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, results })
      });
      
      if (response.ok) {
        const summary = await response.json();
        setResultSummary(summary);
      }
    } catch (error) {
      console.error('Failed to summarize results:', error);
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/wingman/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question, 
          context: results?.slice(0, 3) // Provide top 3 results as context
        })
      });
      
      if (response.ok) {
        const questionAnswer = await response.json();
        setAnswer(questionAnswer);
      }
    } catch (error) {
      console.error('Failed to answer question:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'image_search': return '🖼️';
      case 'video_search': return '📺';
      case 'news_search': return '📰';
      case 'academic_search': return '🎓';
      case 'shopping': return '🛒';
      case 'local_search': return '📍';
      case 'definition': return '📖';
      default: return '🔍';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="mb-6 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">WingMan AI Assistant</CardTitle>
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {!isExpanded && (
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            AI-powered search enhancement, summarization, and Q&amp;A
          </CardDescription>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={activeTab === 'enhance' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('enhance')}
              className="flex-1 h-8"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Enhance
            </Button>
            <Button
              variant={activeTab === 'summarize' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setActiveTab('summarize');
                if (results && results.length > 0) summarizeResults();
              }}
              className="flex-1 h-8"
              disabled={!results || results.length === 0}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Summarize
            </Button>
            <Button
              variant={activeTab === 'ask' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('ask')}
              className="flex-1 h-8"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Ask AI
            </Button>
          </div>

          {/* Query Enhancement Tab */}
          {activeTab === 'enhance' && (
            <div className="space-y-3">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing your search query...
                </div>
              )}
              
              {queryEnhancement && (
                <div className="space-y-3">
                  {queryEnhancement.enhanced !== queryEnhancement.original && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Enhanced Query</span>
                        <Badge variant="outline" className="text-xs">
                          {getIntentIcon(queryEnhancement.intent)} {queryEnhancement.intent.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{queryEnhancement.enhanced}</p>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          onQueryChange(queryEnhancement.enhanced);
                          onSearch(queryEnhancement.enhanced);
                        }}
                        className="h-7 text-xs"
                      >
                        Use Enhanced Query
                      </Button>
                    </div>
                  )}
                  
                  {queryEnhancement.suggestions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Alternative Suggestions:</p>
                      <div className="space-y-1">
                        {queryEnhancement.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              onQueryChange(suggestion);
                              onSearch(suggestion);
                            }}
                            className="block w-full text-left text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Fallback content when AI is not available */}
                  {queryEnhancement.enhanced === queryEnhancement.original && queryEnhancement.suggestions.length === 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">Search Tips</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>• Be specific with keywords</p>
                        <p>• Use quotes for exact phrases</p>
                        <p>• Try alternative terms if needed</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Results Summary Tab */}
          {activeTab === 'summarize' && (
            <div className="space-y-3">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Summarizing search results...
                </div>
              )}
              
              {resultSummary && (
                <div className="space-y-3">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">AI Summary</span>
                      <Badge variant="outline" className={`text-xs ${getConfidenceColor(resultSummary.confidence)}`}>
                        {resultSummary.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm">{resultSummary.summary}</p>
                  </div>
                  
                  {resultSummary.keyPoints.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Key Points:</p>
                      <ul className="space-y-1">
                        {resultSummary.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Ask AI Tab */}
          {activeTab === 'ask' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Textarea
                  placeholder="Ask a question about your search results..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <Button 
                  onClick={askQuestion} 
                  disabled={!question.trim() || loading}
                  size="sm"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ask WingMan
                    </>
                  )}
                </Button>
              </div>
              
              {answer && (
                <div className="space-y-3">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">AI Answer</span>
                      <Badge variant="outline" className={`text-xs ${getConfidenceColor(answer.confidence)}`}>
                        {answer.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{answer.answer}</p>
                    
                    {answer.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Sources: {answer.sources.length} search result(s)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {answer.followUpQuestions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Follow-up Questions:</p>
                      <div className="space-y-1">
                        {answer.followUpQuestions.map((followUp, index) => (
                          <button
                            key={index}
                            onClick={() => setQuestion(followUp)}
                            className="block w-full text-left text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            {followUp}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
