import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Auth() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Sign In to SerCrow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full" 
            onClick={() => window.location.href = '/api/auth/google'}
          >
            Sign in with Google
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/search')}
          >
            Continue as Guest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}