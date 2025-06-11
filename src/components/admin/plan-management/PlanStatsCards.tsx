import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Users, Building2, TrendingUp, DollarSign } from 'lucide-react';
import { PlanStatsEntity } from '@/types/plan-management';

interface PlanStatsCardsProps {
  stats: PlanStatsEntity;
}

export function PlanStatsCards({ stats }: PlanStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPlans}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activePlans} active plans
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Organizations</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
          <p className="text-xs text-muted-foreground">
            With active plans
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
          <p className="text-xs text-muted-foreground">
            Active subscriptions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            Annual: {formatCurrency(stats.annualRevenue)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface PlanTypeStatsProps {
  plansByType: PlanStatsEntity['plansByType'];
}

export function PlanTypeStats({ plansByType }: PlanTypeStatsProps) {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plans by Organization Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(plansByType).map(([type, data]) => (
            <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{type}</h4>
                  <Badge variant="secondary">{data.plans} plans</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{data.organizations} organizations</span>
                  <span>{data.subscriptions} subscriptions</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(data.revenue.totalRevenue)}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
