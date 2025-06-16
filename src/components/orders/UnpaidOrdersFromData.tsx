import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  RefreshCw,
  Store
} from 'lucide-react';
import { format } from 'date-fns';
import { Order, OrderPaymentStatus, OrderStatus } from '@/services/order-service';
import OrderService from '@/services/order-service';
import { PaymentStatusDialog } from './PaymentStatusDialog';

interface UnpaidOrdersFromDataProps {
  orders: Order[];
  onRefresh?: () => void;
  onPaymentStatusChanged: (updatedOrder: Order) => void;
}

export const UnpaidOrdersFromData: React.FC<UnpaidOrdersFromDataProps> = ({
  orders,
  onRefresh,
  onPaymentStatusChanged
}) => {
  const [paymentDialogOrder, setPaymentDialogOrder] = useState<Order | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handlePaymentStatusClick = (order: Order) => {
    setPaymentDialogOrder(order);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentStatusChanged = (updatedOrder: Order) => {
    onPaymentStatusChanged(updatedOrder);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // Calculate totals
  const totalUnpaidAmount = useMemo(() => {
    return orders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount);
    }, 0);
  }, [orders]);

  const oldestOrder = useMemo(() => {
    return orders.length > 0 
      ? orders.reduce((oldest, order) => {
          return new Date(order.createdAt) < new Date(oldest.createdAt) ? order : oldest;
        })
      : null;
  }, [orders]);

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
                {orders.length}
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
                {OrderService.formatCurrency(totalUnpaidAmount)}
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
                {oldestOrder ? (
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
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
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
                      <TableHead>Venue/Table</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
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
                          <div>
                            {order.venue?.name && (
                              <div className="flex items-center gap-2 text-sm">
                                <Store className="h-3 w-3 text-muted-foreground" />
                                <span>{order.venue.name}</span>
                              </div>
                            )}
                            {order.table?.name && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Table: {order.table.name}
                              </div>
                            )}
                            {!order.venue?.name && !order.table?.name && (
                              <span className="text-muted-foreground">No venue/table</span>
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
                          {order.status !== OrderStatus.CANCELLED ? (
                            <Button
                              size="sm"
                              onClick={() => handlePaymentStatusClick(order)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Mark Paid
                            </Button>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-600">
                              Cancelled
                            </Badge>
                          )}
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
