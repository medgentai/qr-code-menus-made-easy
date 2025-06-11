import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Users, Building2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/admin-service';
import { LoadingState } from '@/components/ui/loading';

const Analytics = () => {
  const [days, setDays] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch analytics data
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useQuery({
    queryKey: ['admin', 'analytics', days],
    queryFn: () => adminService.getPlatformAnalytics(days),
  });

  // Fetch growth metrics
  const {
    data: growth,
    isLoading: growthLoading,
    error: growthError,
    refetch: refetchGrowth
  } = useQuery({
    queryKey: ['admin', 'growth', days],
    queryFn: () => adminService.getGrowthMetrics(days),
  });

  // Fetch revenue analytics
  const {
    data: revenue,
    isLoading: revenueLoading,
    error: revenueError,
    refetch: refetchRevenue
  } = useQuery({
    queryKey: ['admin', 'revenue', days],
    queryFn: () => adminService.getRevenueAnalytics(days),
  });

  // Fetch top organizations
  const {
    data: topOrgs,
    isLoading: topOrgsLoading,
    error: topOrgsError,
    refetch: refetchTopOrgs
  } = useQuery({
    queryKey: ['admin', 'top-organizations'],
    queryFn: () => adminService.getTopOrganizations(10),
  });

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchAnalytics(),
        refetchGrowth(),
        refetchRevenue(),
        refetchTopOrgs()
      ]);
      toast.success('Analytics data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const isLoading = analyticsLoading || growthLoading || revenueLoading || topOrgsLoading;
  const hasError = analyticsError || growthError || revenueError || topOrgsError;

  if (isLoading) {
    return <LoadingState height="400px" message="Loading analytics..." />;
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <div className="text-center">
          <p>Unable to load analytics</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={days.toString()} onValueChange={(value) => setDays(Number(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{analytics?.overview?.totalRevenue?.toLocaleString() || 0}
            </div>
            {growth?.growth?.revenue !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${getGrowthColor(growth.growth.revenue)}`}>
                {getGrowthIcon(growth.growth.revenue)}
                <span>{growth.growth.revenue.toFixed(1)}% from previous period</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview?.totalOrders || 0}</div>
            {growth?.growth?.orders !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${getGrowthColor(growth.growth.orders)}`}>
                {getGrowthIcon(growth.growth.orders)}
                <span>{growth.growth.orders.toFixed(1)}% from previous period</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview?.totalUsers || 0}</div>
            {growth?.growth?.users !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${getGrowthColor(growth.growth.users)}`}>
                {getGrowthIcon(growth.growth.users)}
                <span>{growth.growth.users.toFixed(1)}% from previous period</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview?.totalOrganizations || 0}</div>
            {growth?.growth?.organizations !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${getGrowthColor(growth.growth.organizations)}`}>
                {getGrowthIcon(growth.growth.organizations)}
                <span>{growth.growth.organizations.toFixed(1)}% from previous period</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth Comparison */}
      {growth && (
        <Card>
          <CardHeader>
            <CardTitle>Growth Comparison</CardTitle>
            <CardDescription>
              Comparing current {days}-day period with previous {days}-day period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Current Period</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Users:</span>
                    <span className="font-medium">{growth.currentPeriod.users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Organizations:</span>
                    <span className="font-medium">{growth.currentPeriod.organizations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orders:</span>
                    <span className="font-medium">{growth.currentPeriod.orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium">₹{growth.currentPeriod.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Previous Period</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Users:</span>
                    <span className="font-medium">{growth.previousPeriod.users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Organizations:</span>
                    <span className="font-medium">{growth.previousPeriod.organizations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orders:</span>
                    <span className="font-medium">{growth.previousPeriod.orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium">₹{growth.previousPeriod.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Organizations */}
      {topOrgs && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Organizations</CardTitle>
            <CardDescription>Organizations ranked by total orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Venues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topOrgs.map((org, index) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{org.type.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>{org.totalOrders}</TableCell>
                      <TableCell>₹{org.totalRevenue.toLocaleString()}</TableCell>
                      <TableCell>{org.totalVenues}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
