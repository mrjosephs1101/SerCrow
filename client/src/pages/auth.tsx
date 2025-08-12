import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Google, Github, Microsoft } from 'react-icons/fa';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = mode === 'login' ? 'Sign in - SerCrow' : 'Create account - SerCrow';
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Authentication failed');
      if (mode === 'register') {
        setLocation('/setup');
      } else {
        setLocation('/');
      }
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-6">
        <CardContent>
          <h1 className="text-2xl font-semibold mb-6">{mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait…' : (mode === 'login' ? 'Sign in' : 'Create account')}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => { window.location.href = '/api/auth/google'; }}>
              <span className="sr-only">Sign in with Google</span>
              G
            </Button>
            <Button variant="outline" disabled>
              <span className="sr-only">Sign in with Microsoft</span>
              M
            </Button>
            <Button variant="outline" disabled>
              <span className="sr-only">Sign in with GitHub</span>
              GH
            </Button>
          </div>

          <div className="mt-6 text-sm text-center">
            {mode === 'login' ? (
              <button className="text-blue-600 hover:underline" onClick={() => setMode('register')}>Create an account</button>
            ) : (
              <button className="text-blue-600 hover:underline" onClick={() => setMode('login')}>Have an account? Sign in</button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
