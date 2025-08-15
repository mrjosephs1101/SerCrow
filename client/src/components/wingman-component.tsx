import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export function WingMan() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are WingMan, a witty and helpful assistant for the SerCrow search engine.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const prompt = newMessages
        .filter(msg => msg.role !== 'system')
        .map(msg => `${msg.role === 'user' ? 'User' : 'WingMan'}: ${msg.content}`)
        .join('\n') + '\nWingMan:';

      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral', // or phi3, etc.
          prompt,
          stream: false
        })
      });

      const data = await res.json();
      const response = data.response.trim();

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error('WingMan failed:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Uh-oh... I think I lost signal to my bird brain!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-4 rounded-2xl shadow-xl bg-white/5 backdrop-blur">
      <CardContent className="space-y-3">
        <h2 className="text-xl font-bold">🦾 WingMan</h2>
        <div className="max-h-64 overflow-y-auto space-y-2 text-sm">
          {messages
            .filter(m => m.role !== 'system')
            .map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-md ${msg.role === 'user' ? 'bg-gray-700 text-white' : 'bg-blue-500 text-white'}`}
              >
                <strong>{msg.role === 'user' ? 'You' : 'WingMan'}:</strong> {msg.content}
              </div>
            ))}
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="Ask WingMan anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? '...' : 'Send'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
