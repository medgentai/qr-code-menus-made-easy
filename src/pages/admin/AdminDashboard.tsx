import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Building2, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/admin-service';
import { LoadingState } from '@/components/ui/loading';

const AdminDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch platform stats
  const {
    data: platformStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['admin', 'platform-stats'],
    queryFn: adminService.getPlatformStats,
  });

  // Fetch platform analytics
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useQuery({
    queryKey: ['admin', 'platform-analytics'],
    queryFn: () => adminService.getPlatformAnalytics(30),
  });

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchAnalytics()]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (statsLoading || analyticsLoading) {
    return <LoadingState height="400px" message="Loading admin dashboard..." />;
  }

  if (statsError || analyticsError) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <div className="text-center">
          <TrendingUp className="h-8 w-8 mx-auto mb-2" />
          <p>Unable to load admin dashboard</p>
          <Button variant="outline" onClick={refreshData} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform-wide analytics and management overview
          </p>
          {platformStats?.lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(platformStats.lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={refreshData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Platform Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {platformStats?.activeUsers || 0} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats?.totalOrganizations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {platformStats?.activeOrganizations || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              All-time orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venues</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats?.totalVenues || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active venues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Growth */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Growth (30 days)</CardTitle>
            <CardDescription>New registrations and activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">New Users</span>
              <Badge variant="secondary">{platformStats?.recentUsers || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">New Organizations</span>
              <Badge variant="secondary">{platformStats?.recentOrganizations || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>30-day overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  ₹{analytics?.overview?.totalRevenue?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Orders (30d)</span>
              <Badge variant="outline">{analytics?.overview?.totalOrders || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
          <CardDescription>
            Key metrics and system health indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {((platformStats?.activeUsers || 0) / (platformStats?.totalUsers || 1) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">User Activity Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {((platformStats?.activeOrganizations || 0) / (platformStats?.totalOrganizations || 1) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Org Activity Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {((platformStats?.totalVenues || 0) / (platformStats?.totalOrganizations || 1)).toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Venues per Org</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
