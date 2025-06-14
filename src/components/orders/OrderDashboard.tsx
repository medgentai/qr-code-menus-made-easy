import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  Receipt, 
  DollarSign, 
  Calculator,
  FileText,
  Filter
} from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import OrderService, { Order, OrderStatus } from '@/services/order-service';
import { TaxService } from '@/services/tax-service';
import { TaxSummary } from './TaxBreakdown';

interface OrderDashboardProps {
  organizationId: string;
  venueId?: string;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  totalTaxCollected: number;
  averageOrderValue: number;
  taxExemptOrders: number;
  taxInclusiveOrders: number;
}

export const OrderDashboard: React.FC<OrderDashboardProps> = ({
  organizationId,
  venueId,
}) => {
  const [dateRange, setDateRange] = useState('today');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return {
          start: startOfDay(now).toISOString(),
          end: endOfDay(now).toISOString(),
        };
      case 'week':
        return {
          start: startOfDay(subDays(now, 7)).toISOString(),
          end: endOfDay(now).toISOString(),
        };
      case 'month':
        return {
          start: startOfDay(subDays(now, 30)).toISOString(),
          end: endOfDay(now).toISOString(),
        };
      default:
        return {
          start: startOfDay(now).toISOString(),
          end: endOfDay(now).toISOString(),
        };
    }
  };

  // Fetch orders
  const {
    data: ordersResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['orders-dashboard', organizationId, venueId, dateRange, statusFilter],
    queryFn: async () => {
      const { start, end } = getDateRange();
      const filters = {
        organizationId,
        ...(venueId && { venueId }),
        createdAfter: start,
        createdBefore: end,
        ...(statusFilter !== 'all' && { status: statusFilter as OrderStatus }),
      };
      return OrderService.getFiltered(filters);
    },
  });

  const orders = ordersResponse?.data || [];

  // Calculate statistics
  const stats: OrderStats = React.useMemo(() => {
    if (!orders.length) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalTaxCollected: 0,
        averageOrderValue: 0,
        taxExemptOrders: 0,
        taxInclusiveOrders: 0,
      };
    }

    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const totalTaxCollected = orders.reduce((sum, order) => {
      if (order.taxAmount && !order.isTaxExempt) {
        return sum + parseFloat(order.taxAmount);
      }
      return sum;
    }, 0);

    const taxExemptOrders = orders.filter(order => order.isTaxExempt).length;
    const taxInclusiveOrders = orders.filter(order => order.isPriceInclusive).length;

    return {
      totalOrders: orders.length,
      totalRevenue,
      totalTaxCollected,
      averageOrderValue: totalRevenue / orders.length,
      taxExemptOrders,
      taxInclusiveOrders,
    };
  }, [orders]);

  const formatCurrency = (amount: number) => TaxService.formatCurrency(amount);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-destructive">Failed to load order data</div>
          <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {Object.values(OrderStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(stats.averageOrderValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Collected</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalTaxCollected)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.taxExemptOrders} exempt orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Summary</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Exempt:</span>
                <span>{stats.taxExemptOrders}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Inclusive:</span>
                <span>{stats.taxInclusiveOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                No orders match the selected filters
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 10).map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">
                        Order #{order.id.substring(0, 8)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName || 'Anonymous'} • {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {order.status}
                      </Badge>
                      {order.isTaxExempt && (
                        <Badge variant="secondary">Tax Exempt</Badge>
                      )}
                      {order.isPriceInclusive && (
                        <Badge variant="outline">Tax Inclusive</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {order.items?.length || 0} items • {order.table?.name || 'No table'}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <TaxSummary order={order} className="text-sm" />
                    </div>
                  </div>
                </div>
              ))}
              
              {orders.length > 10 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing 10 of {orders.length} orders
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
