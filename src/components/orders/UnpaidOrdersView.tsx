import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  DollarSign,
  Clock,
  User,
  Phone,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import OrderService, { Order, OrderPaymentStatus } from '@/services/order-service';
import { PaymentStatusDialog } from './PaymentStatusDialog';
import { toast } from 'sonner';

interface UnpaidOrdersViewProps {
  venueId: string;
  onRefresh?: () => void;
}

export const UnpaidOrdersView: React.FC<UnpaidOrdersViewProps> = ({
  venueId,
  onRefresh
}) => {
  const [paymentDialogOrder, setPaymentDialogOrder] = useState<Order | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const {
    data: unpaidOrders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders', 'unpaid', venueId],
    queryFn: () => OrderService.getUnpaidOrders(venueId),
    enabled: !!venueId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handlePaymentStatusClick = (order: Order) => {
    setPaymentDialogOrder(order);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentStatusChanged = (updatedOrder: Order) => {
    // Refetch the unpaid orders list
    refetch();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleRefresh = () => {
    refetch();
    if (onRefresh) {
      onRefresh();
    }
  };

  // Calculate totals
  const totalUnpaidAmount = unpaidOrders.reduce((sum, order) => {
    return sum + parseFloat(order.totalAmount);
  }, 0);

  const oldestOrder = unpaidOrders.length > 0 
    ? unpaidOrders.reduce((oldest, order) => {
        return new Date(order.createdAt) < new Date(oldest.createdAt) ? order : oldest;
      })
    : null;

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Failed to load unpaid orders</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Unpaid Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {isLoading ? <Skeleton className="h-8 w-16" /> : unpaidOrders.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Orders awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-red-500" />
                Outstanding Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  OrderService.formatCurrency(totalUnpaidAmount)
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total amount due
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Oldest Unpaid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : oldestOrder ? (
                  format(new Date(oldestOrder.createdAt), 'MMM d')
                ) : (
                  'N/A'
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {oldestOrder ? format(new Date(oldestOrder.createdAt), 'h:mm a') : 'No unpaid orders'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Unpaid Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Unpaid Orders</CardTitle>
                <CardDescription>
                  Orders that require payment processing
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : unpaidOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="rounded-full bg-green-100 p-3 mx-auto mb-4 w-fit">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">All orders are paid!</h3>
                <p className="text-muted-foreground">
                  Great job! There are no outstanding payments at the moment.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpaidOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id.substring(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span>{order.customerName || 'N/A'}</span>
                            </div>
                            {order.customerPhone && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Phone className="h-3 w-3" />
                                <span>{order.customerPhone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(order.createdAt), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(order.createdAt), 'h:mm a')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">
                            {OrderService.formatCurrency(order.totalAmount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.items?.length || 0} items
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={OrderService.getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handlePaymentStatusClick(order)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Mark Paid
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PaymentStatusDialog
        order={paymentDialogOrder}
        isOpen={isPaymentDialogOpen}
        onClose={() => {
          setIsPaymentDialogOpen(false);
          setPaymentDialogOrder(null);
        }}
        onPaymentStatusChanged={handlePaymentStatusChanged}
      />
    </>
  );
};
