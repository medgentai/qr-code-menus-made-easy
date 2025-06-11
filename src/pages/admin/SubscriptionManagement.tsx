import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Search, Filter, Eye, Pause, Play, X, Edit, DollarSign, Users, Building, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/admin-service';

interface Subscription {
  id: string;
  status: string;
  billingCycle: string;
  amount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  organization: {
    id: string;
    name: string;
    type: string;
    owner: {
      name: string;
      email: string;
    };
  };
  plan: {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    annualPrice: number;
    features: string[];
    venuesIncluded: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionStats {
  totalActive: number;
  totalInactive: number;
  totalCancelled: number;
  totalExpired: number;
  totalTrial: number;
  totalPastDue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
}

const SubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [billingCycleFilter, setBillingCycleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(billingCycleFilter && billingCycleFilter !== 'all' && { billingCycle: billingCycleFilter }),
      };

      const response = await adminService.getAllSubscriptions(params);
      // Handle both wrapped and direct response formats
      const data = response.data || response;
      setSubscriptions(data.subscriptions);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminService.getSubscriptionStats();
      // Handle both wrapped and direct response formats
      const data = response.data || response;
      setStats(data);
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      toast.error('Failed to fetch subscription statistics');
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, [page, searchTerm, statusFilter, billingCycleFilter]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'expired':
        return 'outline';
      case 'trial':
        return 'secondary';
      case 'past_due':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage platform subscriptions, billing, and revenue
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            fetchSubscriptions();
            fetchStats();
          }}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActive}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalInactive} inactive, {stats.totalCancelled} cancelled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRecurringRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.annualRecurringRevenue)} annually
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.averageRevenuePerUser)}</div>
              <p className="text-xs text-muted-foreground">
                Per user annually
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.churnRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>
            View and manage all platform subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by organization or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="TRIAL">Trial</SelectItem>
                <SelectItem value="PAST_DUE">Past Due</SelectItem>
              </SelectContent>
            </Select>
            <Select value={billingCycleFilter} onValueChange={setBillingCycleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by billing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Billing Cycles</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="ANNUAL">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscriptions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Loading subscriptions...
                    </TableCell>
                  </TableRow>
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subscription.organization.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.organization.type} • {subscription.organization.owner.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subscription.plan.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.plan.venuesIncluded} venues included
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {subscription.billingCycle}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(subscription.amount, subscription.currency)}
                      </TableCell>
                      <TableCell>
                        {formatDate(subscription.currentPeriodEnd)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedSubscription(subscription)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Subscription Details</DialogTitle>
                                <DialogDescription>
                                  View and manage subscription information
                                </DialogDescription>
                              </DialogHeader>
                              {selectedSubscription && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium">Organization</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedSubscription.organization.name}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">Plan</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedSubscription.plan.name}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">Status</h4>
                                      <Badge variant={getStatusBadgeVariant(selectedSubscription.status)}>
                                        {selectedSubscription.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">Amount</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {formatCurrency(selectedSubscription.amount, selectedSubscription.currency)}
                                      </p>
                                    </div>
                                  </div>
                                  {/* Add more subscription management actions here */}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
