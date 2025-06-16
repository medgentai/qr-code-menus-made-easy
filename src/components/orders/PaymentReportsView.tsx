import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  CreditCard,
  Wallet,
  Smartphone,
  Banknote,
  PieChart
} from 'lucide-react';
import { format, startOfDay, endOfDay, isToday, isYesterday, subDays } from 'date-fns';
import { Order, OrderPaymentStatus, PaymentMethod } from '@/services/order-service';
import OrderService from '@/services/order-service';

interface PaymentReportsViewProps {
  orders: Order[];
}

export const PaymentReportsView: React.FC<PaymentReportsViewProps> = ({ orders }) => {
  const paymentAnalytics = useMemo(() => {
    const paidOrders = orders.filter(order => order.paymentStatus === OrderPaymentStatus.PAID);
    const unpaidOrders = orders.filter(order => order.paymentStatus === OrderPaymentStatus.UNPAID);

    // Payment method breakdown
    const paymentMethodStats = paidOrders.reduce((acc, order) => {
      if (order.paymentMethod) {
        const method = order.paymentMethod;
        if (!acc[method]) {
          acc[method] = { count: 0, amount: 0 };
        }
        acc[method].count += 1;
        acc[method].amount += parseFloat(order.totalAmount);
      }
      return acc;
    }, {} as Record<PaymentMethod, { count: number; amount: number }>);

    // Daily payment trends (last 7 days)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayOrders = paidOrders.filter(order => {
        const orderDate = new Date(order.paidAt || order.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });

      const dayAmount = dayOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      
      dailyStats.push({
        date,
        count: dayOrders.length,
        amount: dayAmount,
        label: isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMM d')
      });
    }

    // Today's stats
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const todayPaidOrders = paidOrders.filter(order => {
      const orderDate = new Date(order.paidAt || order.createdAt);
      return orderDate >= todayStart && orderDate <= todayEnd;
    });
    const todayUnpaidOrders = unpaidOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= todayStart && orderDate <= todayEnd;
    });

    const todayPaidAmount = todayPaidOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const todayUnpaidAmount = todayUnpaidOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    // Collection rate
    const totalOrders = orders.length;
    const collectionRate = totalOrders > 0 ? (paidOrders.length / totalOrders) * 100 : 0;

    return {
      paidOrders: paidOrders.length,
      unpaidOrders: unpaidOrders.length,
      totalPaidAmount: paidOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      totalUnpaidAmount: unpaidOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      paymentMethodStats,
      dailyStats,
      todayPaidOrders: todayPaidOrders.length,
      todayUnpaidOrders: todayUnpaidOrders.length,
      todayPaidAmount,
      todayUnpaidAmount,
      collectionRate
    };
  }, [orders]);

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return <Banknote className="h-4 w-4" />;
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        return <CreditCard className="h-4 w-4" />;
      case PaymentMethod.UPI:
      case PaymentMethod.MOBILE_PAYMENT:
        return <Smartphone className="h-4 w-4" />;
      case PaymentMethod.WALLET:
        return <Wallet className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Today's Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {OrderService.formatCurrency(paymentAnalytics.todayPaidAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paymentAnalytics.todayPaidOrders} orders paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-red-500" />
              Today's Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {OrderService.formatCurrency(paymentAnalytics.todayUnpaidAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paymentAnalytics.todayUnpaidOrders} orders unpaid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4 text-blue-500" />
              Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {paymentAnalytics.collectionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paymentAnalytics.paidOrders} of {orders.length} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {OrderService.formatCurrency(paymentAnalytics.totalPaidAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {paymentAnalytics.paidOrders} paid orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Breakdown</CardTitle>
          <CardDescription>
            Analysis of payment methods used by customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(paymentAnalytics.paymentMethodStats).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment data available
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(paymentAnalytics.paymentMethodStats)
                    .sort(([,a], [,b]) => b.amount - a.amount)
                    .map(([method, stats]) => {
                      const percentage = (stats.amount / paymentAnalytics.totalPaidAmount) * 100;
                      return (
                        <TableRow key={method}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(method as PaymentMethod)}
                              <span>{OrderService.getPaymentMethodDisplayName(method as PaymentMethod)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{stats.count}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {OrderService.formatCurrency(stats.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">
                              {percentage.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Payment Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Payment Trends (Last 7 Days)</CardTitle>
          <CardDescription>
            Daily collection amounts and order counts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Orders Paid</TableHead>
                  <TableHead className="text-right">Amount Collected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentAnalytics.dailyStats.map((day, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {day.label}
                      <div className="text-xs text-muted-foreground">
                        {format(day.date, 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{day.count}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {OrderService.formatCurrency(day.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
