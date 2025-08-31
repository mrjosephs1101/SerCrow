import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Eye, 
  Lock, 
  Zap, 
  Globe, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PrivacySettingsProps {
  privacyMode: boolean;
  onTogglePrivacy: (enabled: boolean) => void;
  trackersBlocked: number;
  adsBlocked: number;
  httpsUpgrades: number;
  onReset: () => void;
}

export function PrivacySettings({
  privacyMode,
  onTogglePrivacy,
  trackersBlocked,
  adsBlocked,
  httpsUpgrades,
  onReset
}: PrivacySettingsProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Privacy Protection</h2>
          <p className="text-muted-foreground">Control your browsing privacy and security</p>
        </div>
        <Badge variant={privacyMode ? "default" : "secondary"} className="text-sm">
          {privacyMode ? "Protected" : "Standard"}
        </Badge>
      </div>

      {/* Main Privacy Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`h-6 w-6 ${privacyMode ? 'text-green-600' : 'text-muted-foreground'}`} />
              <div>
                <CardTitle>Privacy Protection</CardTitle>
                <CardDescription>
                  Block trackers, ads, and upgrade connections to HTTPS
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={privacyMode}
              onCheckedChange={onTogglePrivacy}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Privacy Stats */}
      {privacyMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Eye className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{trackersBlocked}</p>
                  <p className="text-sm text-muted-foreground">Trackers Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{adsBlocked}</p>
                  <p className="text-sm text-muted-foreground">Ads Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{httpsUpgrades}</p>
                  <p className="text-sm text-muted-foreground">HTTPS Upgrades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Privacy Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Privacy Features</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">No Search History Stored</p>
                <p className="text-sm text-muted-foreground">Your searches are never saved or tracked</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Tracker Blocking</p>
                <p className="text-sm text-muted-foreground">Automatically blocks known tracking scripts</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">HTTPS Everywhere</p>
                <p className="text-sm text-muted-foreground">Upgrades connections to secure HTTPS when possible</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Anonymous Browsing</p>
                <p className="text-sm text-muted-foreground">Your IP address is not logged or stored</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Stats */}
      {privacyMode && (trackersBlocked > 0 || adsBlocked > 0 || httpsUpgrades > 0) && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onReset}>
            Reset Privacy Stats
          </Button>
        </div>
      )}
    </div>
  );
}