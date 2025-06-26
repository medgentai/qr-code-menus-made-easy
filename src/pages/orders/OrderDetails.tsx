import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  FileText,
  ChevronDown,
  Printer,
  RefreshCw,
  CheckCircle,
  CreditCard,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import OrderService, {
  OrderStatus,
  OrderPaymentStatus,
  Order
} from '@/services/order-service';
import {
  useOrderQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation
} from '@/hooks/useOrderQuery';
import { useRoleBasedRealTimeOrders } from '@/hooks/useRoleBasedRealTimeOrders';
import { TaxBreakdown } from '@/components/orders/TaxBreakdown';
import { TaxService } from '@/services/tax-service';
import { usePermissions } from '@/contexts/permission-context';
import { MemberRole } from '@/types/organization';
import { PaymentStatusDialog } from '@/components/orders/PaymentStatusDialog';

const OrderDetails: React.FC = () => {
  const { id: organizationId, venueId, orderId } = useParams<{
    id: string;
    venueId?: string;
    orderId: string
  }>();
  const navigate = useNavigate();

  // Get user permissions first
  const { userRole, userStaffType } = usePermissions();

  // Use real-time orders hook to get the specific order
  const {
    orders: realTimeOrders,
    isLoading: realTimeLoading,
    updateOrderStatus: realTimeUpdateOrderStatus,
    refetch: realTimeRefetch
  } = useRoleBasedRealTimeOrders({
    venueId: venueId,
  });

  // Find the specific order from real-time orders
  const currentOrder = realTimeOrders.find(order => order.id === orderId);

  // Fallback to regular query if not found in real-time orders
  const {
    data: fallbackOrder,
    isLoading: fallbackLoading,
    refetch: fallbackRefetch
  } = useOrderQuery(orderId || '', {
    enabled: !currentOrder && !realTimeLoading // Only fetch if not found in real-time
  });

  // Use real-time order if available, otherwise fallback
  const order = currentOrder || fallbackOrder;
  const isLoading = realTimeLoading || (fallbackLoading && !currentOrder);

  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const deleteOrderMutation = useDeleteOrderMutation();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (currentOrder) {
      // Use real-time refetch if order is from real-time
      await realTimeRefetch();
    } else {
      // Use fallback refetch if order is from fallback query
      await fallbackRefetch();
    }
    setIsRefreshing(false);
  };

  const handleBack = () => {
    if (venueId) {
      navigate(`/organizations/${organizationId}/venues/${venueId}/orders`);
    } else {
      navigate(`/organizations/${organizationId}/orders`);
    }
  };

  const handleEdit = () => {
    if (venueId) {
      navigate(`/organizations/${organizationId}/venues/${venueId}/orders/${orderId}/edit`);
    } else {
      navigate(`/organizations/${organizationId}/orders/${orderId}/edit`);
    }
  };

  const handleDelete = async () => {
    deleteOrderMutation.mutate(orderId!, {
      onSuccess: () => {
        handleBack();
      }
    });
  };

  const handleStatusChange = async (status: OrderStatus) => {
    if (currentOrder && realTimeUpdateOrderStatus) {
      // Use real-time update for better synchronization
      await realTimeUpdateOrderStatus(orderId!, status);
    } else {
      // Fallback to regular mutation
      updateOrderStatusMutation.mutate(
        { id: orderId!, status },
        {
          onSuccess: () => {
            handleRefresh(); // Refresh the order data
          }
        }
      );
    }
  };



  const handlePrint = () => {
    window.print();
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    return OrderService.getStatusColor(status);
  };

  // Get available status transitions based on role and payment status
  const getAvailableStatusTransitions = (order: Order) => {
    const currentStatus = order.status;
    const isPaid = order.paymentStatus === OrderPaymentStatus.PAID;

    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.SERVED, OrderStatus.CANCELLED],
      [OrderStatus.SERVED]: isPaid ? [OrderStatus.COMPLETED] : [], // Can only complete if paid
      [OrderStatus.COMPLETED]: [], // No transitions from completed
      [OrderStatus.CANCELLED]: [] // No transitions from cancelled
    };

    let availableTransitions = statusFlow[currentStatus] || [];

    // Filter based on user role and staff type
    if (userRole === MemberRole.STAFF) {
      if (userStaffType === 'FRONT_OF_HOUSE') {
        // Front of house staff only see customer-facing statuses
        availableTransitions = availableTransitions.filter(status =>
          ![OrderStatus.PREPARING, OrderStatus.READY].includes(status)
        );
      }
      // Staff can't cancel orders, only managers and admins can
      availableTransitions = availableTransitions.filter(status => status !== OrderStatus.CANCELLED);
    }

    return availableTransitions;
  };

  // Handle payment status click
  const handlePaymentStatusClick = () => {
    if (order && order.status !== OrderStatus.CANCELLED) {
      setIsPaymentDialogOpen(true);
    }
  };

  // Handle payment status change
  const handlePaymentStatusChanged = () => {
    // Refetch the order to get the latest data
    handleRefresh();
    setIsPaymentDialogOpen(false);
  };



  const formatCurrency = (amount: string) => {
    return OrderService.formatCurrency(amount);
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Skeleton className="h-8 w-48" />
          </div>
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
    );
  }

  if (!order) {
    return (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Order Not Found</h1>
          </div>
          <Card>
            <CardContent className="py-10 flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-destructive/10 p-3 mb-4">
                <FileText className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Order not found</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                The order you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={handleBack}>Back to Orders</Button>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
    <>
      <div className="space-y-6 print:space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack} className="print:hidden">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Order #{order.id.substring(0, 8)}</h1>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="print:hidden"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="print:hidden"
            >
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            {/* Payment Status Button */}
            <Button
              variant="outline"
              onClick={handlePaymentStatusClick}
              className={`print:hidden ${
                order.paymentStatus === OrderPaymentStatus.PAID
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              }`}
              disabled={order.status === OrderStatus.CANCELLED}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {order.paymentStatus === OrderPaymentStatus.PAID ? 'PAID' : 'UNPAID'}
            </Button>

            {/* Only show status dropdown if there are available transitions or special cases */}
            {(() => {
              const availableTransitions = getAvailableStatusTransitions(order);
              const hasUnpaidServedCase = order.status === OrderStatus.SERVED && order.paymentStatus !== OrderPaymentStatus.PAID;
              const canChangeStatus = availableTransitions.length > 0 || hasUnpaidServedCase;

              if (!canChangeStatus) {
                // Show a disabled button for final states (COMPLETED, CANCELLED)
                return (
                  <Button
                    variant="outline"
                    disabled
                    className="print:hidden opacity-50 cursor-not-allowed"
                  >
                    Status: {order.status} (Final)
                  </Button>
                );
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="print:hidden">
                      Status: {order.status}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {availableTransitions.length > 0 ? (
                      availableTransitions.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className="flex items-center gap-2"
                        >
                          <span className={`w-2 h-2 rounded-full ${
                            status === OrderStatus.PENDING ? 'bg-yellow-500' :
                            status === OrderStatus.CONFIRMED ? 'bg-blue-500' :
                            status === OrderStatus.PREPARING ? 'bg-orange-500' :
                            status === OrderStatus.READY ? 'bg-green-500' :
                            status === OrderStatus.SERVED ? 'bg-purple-500' :
                            status === OrderStatus.COMPLETED ? 'bg-gray-500' :
                            status === OrderStatus.CANCELLED ? 'bg-red-500' : 'bg-gray-400'
                          }`} />
                          {status}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled className="text-muted-foreground">
                        No status changes available
                      </DropdownMenuItem>
                    )}
                    {/* Show disabled COMPLETED option with explanation if order is SERVED but not paid */}
                    {hasUnpaidServedCase && (
                      <DropdownMenuItem
                        disabled
                        className="flex items-center gap-2 opacity-50 cursor-not-allowed"
                      >
                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                        <div className="flex flex-col">
                          <span>COMPLETED</span>
                          <span className="text-xs text-muted-foreground">Payment required</span>
                        </div>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}
            <Button onClick={handleEdit} className="print:hidden">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="print:hidden"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        <div className="hidden print:block">
          <h1 className="text-3xl font-bold text-center">Order Receipt</h1>
          <p className="text-center text-muted-foreground">
            Order #{order.id.substring(0, 8)}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <CardTitle>Order Information</CardTitle>
              <Badge variant="outline" className={getStatusBadgeClass(order.status)}>
                {order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date:</span>
                  <span>{format(new Date(order.createdAt), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Time:</span>
                  <span>{format(new Date(order.createdAt), 'h:mm a')}</span>
                </div>
                {order.completedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Completed:</span>
                    <span>
                      {format(new Date(order.completedAt), 'MMMM d, yyyy')} at {format(new Date(order.completedAt), 'h:mm a')}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {order.table && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Table:</span>
                    <span>{order.table.name}</span>
                  </div>
                )}
                {order.table?.venue && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Venue:</span>
                    <span>{order.table.venue.name}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-medium">Customer Information</h3>
              {order.customerName ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {order.customerName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Name:</span>
                        <span>{order.customerName}</span>
                      </div>
                    )}
                    {order.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Phone:</span>
                        <span>{order.customerPhone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {order.customerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span>{order.customerEmail}</span>
                      </div>
                    )}
                    {order.roomNumber && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Room:</span>
                        <span>{order.roomNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No customer information provided</p>
              )}
            </div>

            {order.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Order Notes</h3>
                  <p>{order.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="border rounded-md p-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.quantity}x</span>
                        <span className="text-lg">{item.menuItem?.name}</span>
                      </div>

                    </div>
                    {item.menuItem?.description && (
                      <p className="text-sm text-muted-foreground mb-2">{item.menuItem.description}</p>
                    )}
                    {item.notes && (
                      <div className="mb-2">
                        <span className="text-sm font-medium">Notes: </span>
                        <span className="text-sm">{item.notes}</span>
                      </div>
                    )}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium">Modifiers: </span>
                        <div className="ml-4">
                          {item.modifiers.map((mod) => (
                            <div key={mod.id} className="text-sm flex justify-between">
                              <span>{mod.modifier?.name}</span>
                              <span>{formatCurrency(mod.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-medium">
                      <span>Unit Price: {formatCurrency(item.unitPrice)}</span>
                      <span>Total: {formatCurrency(item.totalPrice)}</span>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t space-y-3">
                  {/* Tax Breakdown */}
                  <div className="space-y-2">
                    {order.subtotalAmount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-mono">{formatCurrency(order.subtotalAmount)}</span>
                      </div>
                    )}

                    {order.isTaxExempt ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax:</span>
                        <span className="text-muted-foreground">Exempt</span>
                      </div>
                    ) : order.taxAmount && parseFloat(order.taxAmount) > 0 ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Tax ({TaxService.formatTaxRate(order.taxRate)}):
                        </span>
                        <span className="font-mono">{formatCurrency(order.taxAmount)}</span>
                      </div>
                    ) : null}

                    <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span className="font-mono">{formatCurrency(order.totalAmount)}</span>
                    </div>

                    {order.isPriceInclusive && (
                      <div className="text-xs text-muted-foreground text-right">
                        * Tax inclusive pricing
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No items in this order</p>
            )}
          </CardContent>
        </Card>

        {/* Tax Breakdown Card */}
        {(order.taxType || order.taxAmount || order.isTaxExempt) && (
          <TaxBreakdown order={order} />
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the order and all its items. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Payment Status Dialog */}
        {order && (
          <PaymentStatusDialog
            order={order}
            isOpen={isPaymentDialogOpen}
            onClose={() => setIsPaymentDialogOpen(false)}
            onPaymentStatusChanged={handlePaymentStatusChanged}
          />
        )}
      </div>
    </>
  );
};

export default OrderDetails;
