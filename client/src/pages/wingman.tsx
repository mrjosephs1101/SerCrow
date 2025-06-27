// pages/wingman.tsx
import React, { useEffect } from 'react';
import { WingMan } from '@/components/wingman-component';
import { useUser } from '@/hooks/use-user';
import { useLocation } from 'wouter';

export default function WingManPage() {
  const { user } = useUser();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">🦾 WingMan</h1>
      <WingMan />
    </div>
  );
}
