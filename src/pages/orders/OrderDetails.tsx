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
  OrderItemStatus
} from '@/services/order-service';
import {
  useOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderItemMutation,
  useDeleteOrderMutation
} from '@/hooks/useOrderQuery';

const OrderDetails: React.FC = () => {
  const { id: organizationId, venueId, orderId } = useParams<{
    id: string;
    venueId?: string;
    orderId: string
  }>();
  const navigate = useNavigate();
  // Use React Query hooks
  const {
    data: currentOrder,
    isLoading,
    refetch
  } = useOrderQuery(orderId || '');

  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const updateOrderItemMutation = useUpdateOrderItemMutation();
  const deleteOrderMutation = useDeleteOrderMutation();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
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
    updateOrderStatusMutation.mutate(
      { id: orderId!, status },
      {
        onSuccess: () => {
          refetch(); // Refresh the order data
        }
      }
    );
  };

  const handleItemStatusChange = async (itemId: string, status: OrderItemStatus) => {
    updateOrderItemMutation.mutate({
      orderId: orderId!,
      itemId,
      data: { status }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    return OrderService.getStatusColor(status);
  };

  const getItemStatusBadgeClass = (status: OrderItemStatus) => {
    return OrderService.getItemStatusColor(status);
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

  if (!currentOrder) {
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
            <h1 className="text-2xl font-bold">Order #{currentOrder.id.substring(0, 8)}</h1>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="print:hidden">
                  Status: {currentOrder.status}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.values(OrderStatus).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={currentOrder.status === status}
                  >
                    <Badge variant="outline" className={`mr-2 ${getStatusBadgeClass(status)}`}>
                      {status}
                    </Badge>
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
            Order #{currentOrder.id.substring(0, 8)}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <CardTitle>Order Information</CardTitle>
              <Badge variant="outline" className={getStatusBadgeClass(currentOrder.status)}>
                {currentOrder.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date:</span>
                  <span>{format(new Date(currentOrder.createdAt), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Time:</span>
                  <span>{format(new Date(currentOrder.createdAt), 'h:mm a')}</span>
                </div>
                {currentOrder.completedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Completed:</span>
                    <span>
                      {format(new Date(currentOrder.completedAt), 'MMMM d, yyyy')} at {format(new Date(currentOrder.completedAt), 'h:mm a')}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {currentOrder.table && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Table:</span>
                    <span>{currentOrder.table.name}</span>
                  </div>
                )}
                {currentOrder.table?.venue && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Venue:</span>
                    <span>{currentOrder.table.venue.name}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-medium">Customer Information</h3>
              {currentOrder.customerName ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {currentOrder.customerName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Name:</span>
                        <span>{currentOrder.customerName}</span>
                      </div>
                    )}
                    {currentOrder.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Phone:</span>
                        <span>{currentOrder.customerPhone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {currentOrder.customerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span>{currentOrder.customerEmail}</span>
                      </div>
                    )}
                    {currentOrder.roomNumber && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Room:</span>
                        <span>{currentOrder.roomNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No customer information provided</p>
              )}
            </div>

            {currentOrder.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Order Notes</h3>
                  <p>{currentOrder.notes}</p>
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
            {currentOrder.items && currentOrder.items.length > 0 ? (
              <div className="space-y-4">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="border rounded-md p-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.quantity}x</span>
                        <span className="text-lg">{item.menuItem?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getItemStatusBadgeClass(item.status)}>
                          {item.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 print:hidden">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {Object.values(OrderItemStatus).map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => handleItemStatusChange(item.id, status)}
                                disabled={item.status === status}
                              >
                                <Badge variant="outline" className={`mr-2 ${getItemStatusBadgeClass(status)}`}>
                                  {status}
                                </Badge>
                                {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
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

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg">{formatCurrency(currentOrder.totalAmount)}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No items in this order</p>
            )}
          </CardContent>
        </Card>

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
      </div>
    </>
  );
};

export default OrderDetails;
