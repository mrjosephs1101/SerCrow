import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Globe, 
  Shield, 
  Zap, 
  Lock,
  Eye,
  ArrowRight
} from 'lucide-react';

interface QuickStartGuideProps {
  onStartSearching: () => void;
  onOpenBrowser: () => void;
}

export function QuickStartGuide({ onStartSearching, onOpenBrowser }: QuickStartGuideProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">SC</span>
          </div>
          <h1 className="text-3xl font-bold">Welcome to SerCrow</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your privacy-focused search engine and browser. Search the web without being tracked, 
          browse with enhanced protection, and take control of your digital privacy.
        </p>
        <Badge variant="secondary" className="text-sm">
          <Shield className="h-3 w-3 mr-1" />
          Privacy Protection Active
        </Badge>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Search className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Private Search</CardTitle>
            </div>
            <CardDescription>
              Search without tracking. No search history stored, no personal data collected.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onStartSearching} className="w-full">
              Start Searching
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Protected Browser</CardTitle>
            </div>
            <CardDescription>
              Browse with automatic tracker blocking, ad blocking, and HTTPS upgrades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onOpenBrowser} variant="outline" className="w-full">
              Open Browser
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Fast & Secure</CardTitle>
            </div>
            <CardDescription>
              Lightning-fast search results with enterprise-grade security and encryption.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Privacy Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Privacy Features
          </CardTitle>
          <CardDescription>
            Built-in privacy protection that works automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Eye className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium">Tracker Blocking</p>
                <p className="text-sm text-muted-foreground">Blocks tracking scripts automatically</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Lock className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">HTTPS Everywhere</p>
                <p className="text-sm text-muted-foreground">Upgrades to secure connections</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">No Data Collection</p>
                <p className="text-sm text-muted-foreground">We don't store your searches or data</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Ad Blocking</p>
                <p className="text-sm text-muted-foreground">Blocks ads and improves speed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">Ready to get started?</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onStartSearching} size="lg" className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Privately
          </Button>
          <Button onClick={onOpenBrowser} variant="outline" size="lg" className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Browse Securely
          </Button>
        </div>
      </div>
    </div>
  );
}