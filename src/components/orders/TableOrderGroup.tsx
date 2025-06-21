import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Users, 
  DollarSign,
  Table as TableIcon,
  User,
  Phone,
  Eye,
  CheckCircle,
  AlertCircle,
  Timer
} from 'lucide-react';
import { Order, OrderStatus } from '@/services/order-service';
import OrderService from '@/services/order-service';
import { SimpleOrderCard } from './SimpleOrderCard';

interface TableOrderGroupProps {
  orders: Order[];
  tableInfo: {
    tableName?: string;
    customerName?: string;
    customerPhone?: string;
  };
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

export const TableOrderGroup: React.FC<TableOrderGroupProps> = ({
  orders,
  tableInfo,
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
  const [isExpanded, setIsExpanded] = useState(true);

  // Sort orders by creation time (newest first)
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate group statistics
  const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const activeOrders = orders.filter(order => 
    ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.status)
  );
  const completedOrders = orders.filter(order => 
    ['SERVED', 'COMPLETED'].includes(order.status)
  );
  const unpaidOrders = orders.filter(order => order.paymentStatus === 'UNPAID');

  // Get group status
  const getGroupStatus = () => {
    if (activeOrders.length === 0) {
      return { 
        text: 'All Complete', 
        icon: CheckCircle, 
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }
    
    const hasReady = activeOrders.some(order => order.status === 'READY');
    const hasPreparing = activeOrders.some(order => order.status === 'PREPARING');
    const hasConfirmed = activeOrders.some(order => order.status === 'CONFIRMED');
    const hasPending = activeOrders.some(order => order.status === 'PENDING');

    if (hasReady) {
      return { 
        text: 'Ready to Serve', 
        icon: AlertCircle, 
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    }
    if (hasPreparing) {
      return { 
        text: 'Preparing', 
        icon: Timer, 
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }
    if (hasConfirmed) {
      return { 
        text: 'Confirmed', 
        icon: CheckCircle, 
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      };
    }
    if (hasPending) {
      return { 
        text: 'Pending', 
        icon: Clock, 
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }

    return { 
      text: 'Mixed Status', 
      icon: Clock, 
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const groupStatus = getGroupStatus();
  const StatusIcon = groupStatus.icon;

  const formatCurrency = (amount: number) => {
    return OrderService.formatCurrency(amount);
  };

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-all duration-200 ${groupStatus.bgColor} ${groupStatus.borderColor} border-2`}>
      {/* Group Header - Mobile Optimized */}
      <CardHeader
        className="pb-2 pt-3 px-3 cursor-pointer hover:bg-white/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Mobile Layout: Stack everything vertically */}
        <div className="space-y-3">
          {/* Top Row: Title and Status */}
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-1 sm:gap-2">
                {tableInfo.tableName && (
                  <TableIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                )}
                <span className="text-gray-900 truncate">
                  {tableInfo.tableName || 'Walk-in'}
                  {tableInfo.customerName && (
                    <span className="hidden sm:inline"> - {tableInfo.customerName}</span>
                  )}
                </span>
              </CardTitle>

              {/* Customer name on mobile (separate line) */}
              {tableInfo.customerName && (
                <div className="text-xs text-muted-foreground mt-1 sm:hidden">
                  {tableInfo.customerName}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${groupStatus.bgColor} ${groupStatus.borderColor} border`}>
                <StatusIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${groupStatus.color}`} />
                <span className={`text-xs sm:text-sm font-medium ${groupStatus.color} hidden sm:inline`}>
                  {groupStatus.text}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Second Row: Details and Amount */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
              {tableInfo.customerPhone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span className="truncate">{tableInfo.customerPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="truncate">
                  <span className="sm:hidden">{format(new Date(sortedOrders[0].createdAt), 'h:mm a')}</span>
                  <span className="hidden sm:inline">Latest: {format(new Date(sortedOrders[0].createdAt), 'MMM d, h:mm a')}</span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-base sm:text-lg font-bold text-gray-900">
                {formatCurrency(totalAmount)}
              </div>
              <div className="text-xs text-muted-foreground">
                {orders.length} order{orders.length !== 1 ? 's' : ''}
                {activeOrders.length > 0 && (
                  <span className="ml-1">({activeOrders.length} active)</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Bar - Mobile Optimized */}
          <div className="flex gap-3 sm:gap-4 pt-2 border-t border-white/50">
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{completedOrders.length} <span className="hidden sm:inline">Complete</span></span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{activeOrders.length} <span className="hidden sm:inline">Active</span></span>
            </div>
            {unpaidOrders.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{unpaidOrders.length} <span className="hidden sm:inline">Unpaid</span></span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Individual Orders - Mobile Optimized */}
      {isExpanded && (
        <CardContent className="px-2 sm:px-4 py-2 space-y-2 sm:space-y-3">
          {sortedOrders.map((order, index) => (
            <div key={order.id} className="relative">
              {index === 0 && orders.length > 1 && (
                <div className="absolute -top-1 -left-1 z-10">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 border border-blue-200">
                    Latest
                  </Badge>
                </div>
              )}
              <div className={`${index === 0 ? 'ring-1 sm:ring-2 ring-blue-200 ring-opacity-50' : ''} rounded-lg`}>
                <SimpleOrderCard
                  order={order}
                  onViewOrder={onViewOrder}
                  onEditOrder={onEditOrder}
                  onDeleteOrder={onDeleteOrder}
                  onStatusChange={onStatusChange}
                  onPaymentStatusClick={onPaymentStatusClick}
                  canEditOrder={canEditOrder}
                  canDeleteOrder={canDeleteOrder}
                  canUpdateOrderStatus={canUpdateOrderStatus}
                  availableStatusFilters={availableStatusFilters}
                  pendingStatusUpdates={pendingStatusUpdates}
                  organizationId={organizationId}
                  venueId={venueId}
                  venueFilter={venueFilter}
                />
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
};
