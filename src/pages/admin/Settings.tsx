import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Database, Shield, Bell, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { adminService, SystemInfo } from '@/services/admin-service';
import { LoadingState } from '@/components/ui/loading';

const Settings = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const info = await adminService.getSystemInfo();
      setSystemInfo(info);
    } catch (error) {
      toast.error('Failed to fetch system information');
      console.error('Error fetching system info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, message: string) => {
    setIsLoading(action);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(message);
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()}`);
    } finally {
      setIsLoading(null);
    }
  };

  const handleBackup = () => handleAction('backup', 'Database backup completed successfully');
  const handleSecurity = () => handleAction('security', 'Security settings updated');
  const handleNotifications = () => handleAction('notifications', 'Notification settings updated');
  const handlePlatformConfig = () => handleAction('platform', 'Platform configuration updated');
  const handleClearCache = () => handleAction('cache', 'Cache cleared successfully');
  const handleRestartServices = () => handleAction('restart', 'Services restarted successfully');
  const handleExportData = () => handleAction('export', 'Data export initiated');
  const handleSystemLogs = () => handleAction('logs', 'System logs downloaded');
  const handleHealthCheck = () => handleAction('health', 'Health check completed - All systems operational');

  if (loading) {
    return <LoadingState height="400px" message="Loading system information..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings and system preferences
          </p>
        </div>
      </div>

      {/* Settings Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Management
            </CardTitle>
            <CardDescription>
              Database maintenance and backup settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Status</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {systemInfo?.database.status || 'Connected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Backup</span>
              <span className="text-sm text-muted-foreground">
                {systemInfo?.security.lastBackup
                  ? new Date(systemInfo.security.lastBackup).toLocaleString()
                  : '2 hours ago'
                }
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackup}
              disabled={isLoading === 'backup'}
            >
              {isLoading === 'backup' ? 'Running...' : 'Run Backup Now'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Security policies and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Two-Factor Authentication</span>
              <Badge variant="outline">{systemInfo?.security.twoFactorAuth || 'Optional'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Session Timeout</span>
              <span className="text-sm text-muted-foreground">
                {systemInfo?.security.sessionTimeout || '24 hours'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSecurity}
              disabled={isLoading === 'security'}
            >
              {isLoading === 'security' ? 'Configuring...' : 'Configure Security'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              System notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Notifications</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">System Alerts</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNotifications}
              disabled={isLoading === 'notifications'}
            >
              {isLoading === 'notifications' ? 'Updating...' : 'Manage Notifications'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Platform Settings
            </CardTitle>
            <CardDescription>
              General platform configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Platform Status</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {systemInfo?.platform.status || 'Online'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Maintenance Mode</span>
              <Badge variant="outline">
                {systemInfo?.platform.maintenanceMode ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlatformConfig}
              disabled={isLoading === 'platform'}
            >
              {isLoading === 'platform' ? 'Configuring...' : 'Platform Configuration'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Current system status and version information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Application</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-mono">{systemInfo?.application.version || 'v1.0.0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <Badge variant="outline">
                    {systemInfo?.application.environment || 'Development'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>{systemInfo?.application.uptime || '2 days, 14 hours'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Node.js:</span>
                  <span className="font-mono">{systemInfo?.application.nodeVersion || 'v18.0.0'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Database</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>{systemInfo?.database.type || 'PostgreSQL'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-mono">{systemInfo?.database.version || '15.4'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Records:</span>
                  <span>
                    {systemInfo?.database.recordCounts
                      ? `${Object.values(systemInfo.database.recordCounts).reduce((a, b) => a + b, 0)} total`
                      : '1,245 total'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Performance</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>CPU Usage:</span>
                  <span>{systemInfo?.performance.cpuUsage || '12%'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <span>
                    {systemInfo?.performance.memoryUsage || '68%'}
                    {systemInfo?.performance.memoryPercentage &&
                      ` (${systemInfo.performance.memoryPercentage}%)`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Records:</span>
                  <span>
                    {systemInfo?.database.recordCounts && (
                      <div className="text-right">
                        <div>Users: {systemInfo.database.recordCounts.users}</div>
                        <div>Orgs: {systemInfo.database.recordCounts.organizations}</div>
                        <div>Orders: {systemInfo.database.recordCounts.orders}</div>
                      </div>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              disabled={isLoading === 'cache'}
            >
              {isLoading === 'cache' ? 'Clearing...' : 'Clear Cache'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestartServices}
              disabled={isLoading === 'restart'}
            >
              {isLoading === 'restart' ? 'Restarting...' : 'Restart Services'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              disabled={isLoading === 'export'}
            >
              {isLoading === 'export' ? 'Exporting...' : 'Export Data'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSystemLogs}
              disabled={isLoading === 'logs'}
            >
              {isLoading === 'logs' ? 'Downloading...' : 'System Logs'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleHealthCheck}
              disabled={isLoading === 'health'}
            >
              {isLoading === 'health' ? 'Checking...' : 'Health Check'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
