import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export default function SetupPage() {
  const [, setLocation] = useLocation();
  const [displayName, setDisplayName] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [safeSearch, setSafeSearch] = useState(true);
  const [newsBias, setNewsBias] = useState<'balanced'|'left'|'right'>('balanced');
  const [saving, setSaving] = useState(false);

  // Guard: redirect if not required
  (async () => {
    try {
      const res = await fetch('/api/auth/require-setup');
      const data = await res.json();
      if (!data?.requireSetup) {
        setLocation('/');
      }
    } catch {
      setLocation('/');
    }
  })();

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, darkMode, safeSearch, newsBias })
      });
      setLocation('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg p-6">
        <CardContent>
          <h1 className="text-2xl font-semibold mb-4">Welcome to SerCrow</h1>
          <p className="text-sm text-muted-foreground mb-6">Let’s personalize your experience.</p>
          <div className="space-y-5">
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="What should we call you?" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dark mode</div>
                <div className="text-xs text-muted-foreground">Use a darker color scheme</div>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Safe search</div>
                <div className="text-xs text-muted-foreground">Filter explicit results</div>
              </div>
              <Switch checked={safeSearch} onCheckedChange={setSafeSearch} />
            </div>
            <div>
              <Label>News bias</Label>
              <div className="flex gap-2 mt-2">
                {(['balanced','left','right'] as const).map(opt => (
                  <Button key={opt} variant={newsBias===opt? 'default':'outline'} size="sm" onClick={() => setNewsBias(opt)}>
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={handleSave} className="w-full" disabled={saving}>{saving ? 'Saving…' : 'Finish'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
