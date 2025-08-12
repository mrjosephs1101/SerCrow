// pages/wingman.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Loader2, Sparkles, RotateCcw, Menu, Settings, Plus, Copy, ThumbsUp, ThumbsDown, RefreshCw, MessageSquare, Trash2, Edit3, Sun, Moon, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/components/theme-provider';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export default function WingManPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme, setTheme } = useTheme();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [wingmanOnline, setWingmanOnline] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [enhancedSuggestions, setEnhancedSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('wingman_conversations');
    if (raw) {
      try {
        const parsed: Conversation[] = JSON.parse(raw);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveConversationId(parsed[0].id);
          setMessages(parsed[0].messages || []);
        } else {
          createNewConversation();
        }
      } catch {
        createNewConversation();
      }
    } else {
      createNewConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('wingman_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (!activeConversationId) return;
    setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages, updatedAt: new Date().toISOString() } : c));
    // Title generation from first user message
    const conv = conversations.find(c => c.id === activeConversationId);
    if (conv && conv.title === 'New conversation' && messages.length > 0) {
      const firstUser = messages.find(m => m.role === 'user');
      if (firstUser) {
        const t = firstUser.content.replace(/\n/g, ' ').slice(0, 40) + (firstUser.content.length > 40 ? '…' : '');
        setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, title: t } : c));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, activeConversationId]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setWingmanOnline(Boolean(data?.wingman?.available));
        }
      } catch {
        setWingmanOnline(false);
      }
    };
    fetchStatus();
    const t = setInterval(fetchStatus, 30000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Initialize with empty messages for ChatGPT-like experience
  // The welcome message is now shown in the empty state UI

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputMessage]);

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
        message: userMessage.content,
        conversationHistory: conversationHistory,
        searchResults: []
      };

      // Send to the chat endpoint
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
            content: aiResponse.answer || 'I apologize, but I couldn\'t generate a response at this time.',
            timestamp: new Date()
          }];
        });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      enhanceInput();
    }
  };

  const createNewConversation = () => {
    const id = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id,
      title: 'New conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(id);
    setMessages([]);
  };

  const switchConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;
    setActiveConversationId(id);
    setMessages(conv.messages || []);
    setInputMessage('');
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (id === activeConversationId) {
      const next = conversations.find(c => c.id !== id);
      if (next) {
        setActiveConversationId(next.id);
        setMessages(next.messages || []);
      } else {
        createNewConversation();
      }
    }
  };

  const clearChat = () => {
    createNewConversation();
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const generateImage = async () => {
    const prompt = inputMessage.trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    const loadingMessage: ChatMessage = {
      id: Date.now().toString() + '_img_loading',
      role: 'assistant',
      content: '[Generating image…]',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/wingman/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      const images: string[] = Array.isArray(data?.images) ? data.images : [];
      setMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat({
        id: Date.now().toString() + '_img',
        role: 'assistant',
        content: images.length ? images.map((url, i) => `![image ${i+1}](${url})`).join('\n\n') : 'No image generated.',
        timestamp: new Date()
      }));
    } catch (e) {
      console.error('Image generation failed:', e);
      setMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat({
        id: Date.now().toString() + '_img_error',
        role: 'assistant',
        content: 'Image generation failed. Please try again.',
        timestamp: new Date()
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceInput = async () => {
    const q = inputMessage.trim();
    if (!q || enhancing) return;
    setEnhancing(true);
    try {
      const res = await fetch(`/api/wingman/enhance-query?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.enhanced) setInputMessage(data.enhanced);
        setEnhancedSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
      }
    } catch (e) {
      console.error('Enhance input failed:', e);
    } finally {
      setEnhancing(false);
    }
  };

  const regenerateResponse = async (messageId: string) => {
    // Find the user message that prompted this response
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Find the previous user message
    let userMessageIndex = messageIndex - 1;
    while (userMessageIndex >= 0 && messages[userMessageIndex].role !== 'user') {
      userMessageIndex--;
    }

    if (userMessageIndex >= 0) {
      const userMessage = messages[userMessageIndex];
      
      // Remove the old response and add a new loading message
      const loadingMessage: ChatMessage = {
        id: Date.now().toString() + '_regenerate',
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true
      };

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[messageIndex] = loadingMessage;
        return newMessages;
      });

      setIsLoading(true);

      try {
        // Build conversation context up to the user message
        const conversationHistory = messages.slice(0, userMessageIndex + 1).map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const payload = {
          message: userMessage.content,
          conversationHistory,
          searchResults: []
        };

        const response = await fetch('/api/wingman/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const aiResponse = await response.json();
          
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[messageIndex] = {
              id: Date.now().toString() + '_regenerated',
              role: 'assistant',
              content: aiResponse.answer || 'I apologize, but I couldn\'t generate a response at this time.',
              timestamp: new Date()
            };
            return newMessages;
          });
        }
      } catch (error) {
        console.error('Regenerate error:', error);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[messageIndex] = {
            id: Date.now().toString() + '_error',
            role: 'assistant',
            content: 'I apologize, but I encountered an error while regenerating the response.',
            timestamp: new Date()
          };
          return newMessages;
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const [showSettings, setShowSettings] = useState(false);

  const [settings, setSettings] = useState({
    showTimestamps: true,
    compactMode: false,
    imageSize: '1024x1024' as '512x512' | '768x768' | '1024x1024',
  });

  const applySettings = (next: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...next }));
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} wingman-sidebar-transition overflow-hidden bg-muted/30 border-r border-border flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img src="/feather.png" alt="WingMan" className="h-8 w-8 rounded-full" />
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${wingmanOnline ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-background`}></div>
            </div>
            <div>
              <h1 className="font-semibold text-lg">WingMan</h1>
              <p className="text-xs text-muted-foreground">AI Search Assistant</p>
            </div>
          </div>
          <Button 
            onClick={clearChat}
            className="w-full justify-start gap-2 h-10 bg-background hover:bg-muted border border-border"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            New conversation
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="text-sm font-medium text-muted-foreground mb-3">Recent</div>
          <div className="space-y-1">
            {conversations.map((c) => (
              <div
                key={c.id}
                className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer group ${c.id === activeConversationId ? 'bg-muted/50' : ''}`}
                onClick={() => switchConversation(c.id)}
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate flex-1">{c.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="text-xs text-muted-foreground">No conversations yet</div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 p-0"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8 p-0"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="/feather.png" alt="WingMan" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">WM</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-sm">WingMan</h2>
                  <p className="text-xs text-muted-foreground">{wingmanOnline ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="mb-6">
                  <img src="/feather.png" alt="WingMan" className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">How can I help you today?</h3>
                  <p className="text-muted-foreground max-w-md">
                    I'm your AI search assistant, ready to help you find information, answer questions, and explore topics.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                  {[
                    { icon: "🔍", text: "Search for the latest AI developments", prompt: "Search for the latest AI developments and breakthroughs" },
                    { icon: "📚", text: "Help me learn about a topic", prompt: "I want to learn about machine learning. Where should I start?" },
                    { icon: "📊", text: "Analyze and summarize content", prompt: "Can you help me analyze and summarize research papers?" },
                    { icon: "💡", text: "Get research insights", prompt: "What are the current trends in technology?" }
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(suggestion.prompt)}
                      className="wingman-suggestion-card p-4 text-left rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{suggestion.icon}</span>
                        <div>
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                            {suggestion.text}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="group wingman-fade-in">
                    <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src="/feather.png" alt="WingMan" />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">WM</AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                        <div className={`wingman-message-bubble rounded-2xl px-4 py-3 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-muted'
                        }`}>
                          {message.isLoading ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          ) : (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              {(() => {
                                const regex = /!\[image \d+\]\((.*?)\)/g;
                                const matches = [...message.content.matchAll(regex)].map(m => m[1]);
                                if (matches.length > 0) {
                                  return (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {matches.map((url, idx) => (
                                        <img key={idx} src={url} alt={`Generated ${idx+1}`} className="rounded-lg border border-border" />
                                      ))}
                                    </div>
                                  );
                                }
                                return (
                                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {message.content}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                        
                        <div className={`flex items-center gap-2 mt-2 text-xs text-muted-foreground ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          {settings.showTimestamps && (
                            <span>
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          )}
                          {!message.isLoading && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={() => copyMessage(message.content)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {message.role === 'assistant' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-muted"
                                  onClick={() => regenerateResponse(message.id)}
                                  disabled={isLoading}
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {message.role === 'user' && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-background p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Message WingMan..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="wingman-input min-h-[60px] max-h-[200px] resize-none pr-12 py-4 border-2 focus:border-primary rounded-xl"
                disabled={isLoading}
                rows={1}
              />
              <Button
                size="sm"
                onClick={enhanceInput}
                disabled={!inputMessage.trim() || isLoading || enhancing}
                className="absolute right-12 bottom-3 h-8 w-8 p-0 rounded-lg"
                title="Enhance query (Ctrl+E)"
              >
                {enhancing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={generateImage}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-20 bottom-3 h-8 w-8 p-0 rounded-lg"
                title="Generate image from prompt"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>

              {showSettings && (
                <div className="absolute right-0 -top-48 w-80 bg-popover text-popover-foreground border border-border rounded-xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">WingMan Settings</div>
                    <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>Close</Button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Show timestamps</span>
                      <Button variant="outline" size="sm" onClick={() => applySettings({ showTimestamps: !settings.showTimestamps })}>{settings.showTimestamps ? 'On' : 'Off'}</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Compact mode</span>
                      <Button variant="outline" size="sm" onClick={() => applySettings({ compactMode: !settings.compactMode })}>{settings.compactMode ? 'On' : 'Off'}</Button>
                    </div>
                    <div>
                      <div className="mb-2">Image size</div>
                      <div className="flex gap-2">
                        {(['512x512','768x768','1024x1024'] as const).map(sz => (
                          <Button key={sz} variant={settings.imageSize===sz?'default':'outline'} size="sm" onClick={() => applySettings({ imageSize: sz })}>{sz}</Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <Button
                size="sm"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-3 bottom-3 h-8 w-8 p-0 rounded-lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {enhancedSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {enhancedSuggestions.slice(0,4).map((s, i) => (
                  <Button key={i} variant="outline" size="sm" className="h-7 rounded-full" onClick={() => setInputMessage(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
              <span>WingMan can make mistakes. Consider checking important information.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

