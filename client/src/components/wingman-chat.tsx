import { useState, useEffect, useRef } from 'react';
import { SearchResult } from '@shared/schema';
import { 
  Send,
  User,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WingManChatProps {
  query: string;
  results?: SearchResult[];
  onQueryChange: (newQuery: string) => void;
  onSearch: (query: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export function WingManChat({ query, results, onQueryChange, onSearch }: WingManChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! I\'m WingMan, your AI search assistant. I can help you with:\n\n• Enhancing your search queries\n• Summarizing search results\n• Answering questions based on your searches\n• Providing insights and analysis\n\nHow can I assist you today?',
        timestamp: new Date()
      }]);
    }
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    const loadingMessage: ChatMessage = {
      id: Date.now().toString() + '_loading',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add the current user message to the conversation
      conversationHistory.push({
        role: 'user',
        content: userMessage.content
      });

      // Prepare the context payload
      const payload = {
        conversation: conversationHistory,
        currentQuery: query,
        searchResults: results?.slice(0, 5) // Include top 5 results for context
      };

      // Send to the chat endpoint (we'll need to create this)
      const response = await fetch('/api/wingman/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const aiResponse = await response.json();
        
        // Remove loading message and add AI response
        setMessages(prev => {
          const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
          return [...withoutLoading, {
            id: Date.now().toString() + '_ai',
            role: 'assistant',
            content: aiResponse.response || 'I apologize, but I couldn\'t generate a response at this time.',
            timestamp: new Date()
          }];
        });

        // If the AI suggests a new search query, handle it
        if (aiResponse.suggestedQuery && aiResponse.suggestedQuery !== query) {
          // We could optionally show this as a clickable suggestion
        }
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove loading message and add error message
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
        return [...withoutLoading, {
          id: Date.now().toString() + '_error',
          role: 'assistant',
          content: 'I apologize, but I encountered an error while processing your message. Please try again.',
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m WingMan, your AI search assistant. I can help you with:\n\n• Enhancing your search queries\n• Summarizing search results\n• Answering questions based on your searches\n• Providing insights and analysis\n\nHow can I assist you today?',
      timestamp: new Date()
    }]);
  };

  return (
    <Card className="mb-6 border-blue-200 dark:border-blue-800 h-[600px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/feather.png" alt="WingMan" className="h-5 w-5" />
            <CardTitle className="text-lg">WingMan AI Assistant</CardTitle>
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearChat}
            className="h-8 text-xs"
          >
            Clear Chat
          </Button>
        </div>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          AI-powered chat assistant for search enhancement and insights
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 w-full rounded-md border p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <img src="/feather.png" alt="WingMan" className="h-4 w-4" />
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}>
                      {message.isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : (
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      )}
                      <div className={`text-xs mt-1 opacity-70 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                placeholder="Ask WingMan anything about your search..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] max-h-32 resize-none pr-12"
                disabled={isLoading}
              />
              <Button
                size="sm"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2 bottom-2 h-8 w-8 p-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Context Info */}
          {query && (
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
              <strong>Current search:</strong> {query}
              {results && results.length > 0 && (
                <span className="ml-2">• {results.length} results available</span>
              )}
            </div>
          )}
        </CardContent>
    </Card>
  );
}
