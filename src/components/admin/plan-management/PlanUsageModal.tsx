import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Activity
} from 'lucide-react';
import { adminService } from '@/services/admin-service';
import { PlanEntity } from '@/types/plan-management';

interface PlanUsageModalProps {
  plan: PlanEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanUsageModal({ plan, open, onOpenChange }: PlanUsageModalProps) {
  const { data: usageData, isLoading, error } = useQuery({
    queryKey: ['admin', 'plan-usage', plan?.id],
    queryFn: () => plan ? adminService.getPlanUsage(plan.id) : null,
    enabled: !!plan && open,
  });

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getOrganizationTypeColor = (type: string) => {
    const colors = {
      RESTAURANT: 'bg-orange-100 text-orange-800',
      HOTEL: 'bg-blue-100 text-blue-800',
      CAFE: 'bg-green-100 text-green-800',
      FOOD_TRUCK: 'bg-purple-100 text-purple-800',
      BAR: 'bg-red-100 text-red-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Plan Usage Analytics
          </DialogTitle>
          <DialogDescription>
            Detailed usage statistics and analytics for "{plan.name}"
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <LoadingState height="400px" message="Loading plan usage data..." />
        )}

        {error && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p>Unable to load plan usage data</p>
            </div>
          </div>
        )}

        {usageData && (
          <div className="space-y-6">
            {/* Plan Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Plan Information</span>
                  <Badge 
                    variant="secondary"
                    className={getOrganizationTypeColor(usageData.plan.organizationType)}
                  >
                    {usageData.plan.organizationType}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Plan Name</div>
                    <div className="font-medium">{usageData.plan.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly Price</div>
                    <div className="font-medium">{formatCurrency(plan.monthlyPrice)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Annual Price</div>
                    <div className="font-medium">{formatCurrency(plan.annualPrice)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageData.usage.totalOrganizations}</div>
                  <p className="text-xs text-muted-foreground">
                    {usageData.usage.activeOrganizations} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageData.usage.totalSubscriptions}</div>
                  <p className="text-xs text-muted-foreground">
                    Active subscriptions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(usageData.revenue.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    All time revenue
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Monthly Subscriptions</div>
                        <div className="text-sm text-muted-foreground">
                          {usageData.usage.monthlySubscriptions} active subscriptions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(usageData.revenue.monthlyRevenue)}</div>
                        <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Annual Subscriptions</div>
                        <div className="text-sm text-muted-foreground">
                          {usageData.usage.annualSubscriptions} active subscriptions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(usageData.revenue.annualRevenue)}</div>
                        <div className="text-sm text-muted-foreground">Annual Revenue</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organization Status */}
            <Card>
              <CardHeader>
                <CardTitle>Organization Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Active Organizations</span>
                    </div>
                    <span className="text-2xl font-bold">{usageData.usage.activeOrganizations}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="font-medium">Inactive Organizations</span>
                    </div>
                    <span className="text-2xl font-bold">
                      {usageData.usage.totalOrganizations - usageData.usage.activeOrganizations}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
