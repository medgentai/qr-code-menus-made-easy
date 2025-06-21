import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Eye, 
  Edit, 
  MoreHorizontal,
  Table as TableIcon,
  User,
  Store,
  Utensils,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Order, OrderStatus, OrderPaymentStatus } from '@/services/order-service';
import OrderService from '@/services/order-service';

interface SimpleOrderCardProps {
  order: Order;
  onViewOrder: (orderId: string) => void;
  onEditOrder: (orderId: string) => void;
  onDeleteOrder: (order: Order) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onPaymentStatusClick: (order: Order) => void;
  canEditOrder: (status: OrderStatus) => boolean;
  canDeleteOrder: (status: OrderStatus) => boolean;
  canUpdateOrderStatus: (status: OrderStatus) => boolean;
  availableStatusFilters: OrderStatus[];
  pendingStatusUpdates: Record<string, OrderStatus>;
  organizationId?: string;
  venueId?: string;
  venueFilter?: string;
}

export const SimpleOrderCard: React.FC<SimpleOrderCardProps> = ({
  order,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onStatusChange,
  onPaymentStatusClick,
  canEditOrder,
  canDeleteOrder,
  canUpdateOrderStatus,
  availableStatusFilters,
  pendingStatusUpdates,
  organizationId,
  venueId,
  venueFilter,
}) => {
  const getStatusBadgeClass = (status: OrderStatus) => {
    return OrderService.getStatusColor(status);
  };

  const formatCurrency = (amount: string) => {
    return OrderService.formatCurrency(amount);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 pt-2 px-2 sm:pb-3 sm:pt-3 sm:px-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-semibold truncate">
              #{order.id.substring(0, 8)}
            </CardTitle>
            <CardDescription className="text-xs flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">{format(new Date(order.createdAt), 'h:mm a')}</span>
                <span className="hidden sm:inline">{format(new Date(order.createdAt), 'MMM d, h:mm a')}</span>
              </span>
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant="outline" className={`text-xs px-1 sm:px-1.5 py-0.5 ${getStatusBadgeClass(pendingStatusUpdates[order.id] || order.status)}`}>
              <span className="truncate">{pendingStatusUpdates[order.id] || order.status}</span>
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs px-1 sm:px-1.5 py-0.5 ${order.status !== OrderStatus.CANCELLED ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${OrderService.getPaymentStatusColor(order.paymentStatus)}`}
              onClick={() => order.status !== OrderStatus.CANCELLED && onPaymentStatusClick(order)}
            >
              {order.paymentStatus === OrderPaymentStatus.PAID ? 'Paid' : 'Unpaid'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 py-1 sm:px-3 sm:py-2">
        <div className="space-y-1 sm:space-y-2">
          {/* Customer and Table Info */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              {order.table ? (
                <>
                  <TableIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium truncate">{order.table.name}</span>
                  {order.partySize && (
                    <span className="text-muted-foreground hidden sm:inline">({order.partySize})</span>
                  )}
                </>
              ) : order.customerName ? (
                <>
                  <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium truncate">{order.customerName}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Walk-in</span>
              )}
            </div>

            {/* Show venue name when viewing at organization level */}
            {organizationId && !venueId && !venueFilter && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Store className="h-3 w-3 flex-shrink-0" />
                <span className="text-xs truncate max-w-[60px] sm:max-w-[80px]">{order.venue?.name || order.table?.venue?.name || 'Unknown'}</span>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Utensils className="h-3 w-3" />
              <span>{order.items?.length || 0} <span className="hidden sm:inline">items</span></span>
            </div>
            <div className="font-semibold text-sm">
              {formatCurrency(order.totalAmount)}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-1 p-1.5 sm:p-2 pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewOrder(order.id)}
          className="flex-1 h-6 sm:h-7 text-xs px-1 sm:px-2"
        >
          <Eye className="h-3 w-3" />
          <span className="hidden sm:inline ml-1">View</span>
        </Button>
        {canEditOrder(order.status) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditOrder(order.id)}
            className="flex-1 h-6 sm:h-7 text-xs px-1 sm:px-2"
          >
            <Edit className="h-3 w-3" />
            <span className="hidden sm:inline ml-1">Edit</span>
          </Button>
        )}
        {(canUpdateOrderStatus(order.status) || canDeleteOrder(order.status)) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex-1 h-6 sm:h-7 text-xs px-1 sm:px-2">
                <MoreHorizontal className="h-3 w-3" />
                <span className="hidden sm:inline ml-1">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canUpdateOrderStatus(order.status) && (
                <>
                  <DropdownMenuLabel className="text-xs">Change Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableStatusFilters.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => onStatusChange(order.id, status)}
                      disabled={order.status === status}
                      className="text-xs"
                    >
                      <Badge variant="outline" className={`mr-2 text-xs px-1 ${getStatusBadgeClass(status)}`}>
                        {status}
                      </Badge>
                      {status}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              {canDeleteOrder(order.status) && (
                <>
                  {canUpdateOrderStatus(order.status) && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => onDeleteOrder(order)}
                    className="text-destructive focus:text-destructive text-xs"
                  >
                    <Trash2 className="mr-2 h-3 w-3" /> Delete Order
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardFooter>
    </Card>
  );
};
