/**
 * Virtualized Order List Component for handling large datasets efficiently
 */

import React, { useMemo, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Order } from '@/services/order-service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign } from 'lucide-react';

interface VirtualizedOrderListProps {
  orders: Order[];
  onOrderClick?: (order: Order) => void;
  height?: number;
  itemHeight?: number;
  className?: string;
}

interface OrderItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    orders: Order[];
    onOrderClick?: (order: Order) => void;
  };
}

// Memoized individual order item component
const OrderItem = memo<OrderItemProps>(({ index, style, data }) => {
  const { orders, onOrderClick } = data;
  const order = orders[index];

  if (!order) return null;

  const handleClick = () => {
    onOrderClick?.(order);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={style} className="px-2">
      <Card 
        className={`cursor-pointer hover:shadow-md transition-shadow ${
          onOrderClick ? 'hover:bg-gray-50' : ''
        }`}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">#{order.orderNumber || order.id.substring(0, 8)}</h3>
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">₹{Number(order.totalAmount).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(order.createdAt)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{order.customerName || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>{order.items?.length || 0} items</span>
            </div>
          </div>

          {order.specialInstructions && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
              <strong>Special Instructions:</strong> {order.specialInstructions}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  const prevOrder = prevProps.data.orders[prevProps.index];
  const nextOrder = nextProps.data.orders[nextProps.index];
  
  return (
    prevOrder?.id === nextOrder?.id &&
    prevOrder?.status === nextOrder?.status &&
    prevOrder?.updatedAt === nextOrder?.updatedAt &&
    prevProps.index === nextProps.index
  );
});

OrderItem.displayName = 'OrderItem';

// Main virtualized order list component
export const VirtualizedOrderList = memo<VirtualizedOrderListProps>(({
  orders,
  onOrderClick,
  height = 600,
  itemHeight = 120,
  className = '',
}) => {
  // Memoize the data object to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    orders,
    onOrderClick,
  }), [orders, onOrderClick]);

  // Memoize the list height calculation
  const listHeight = useMemo(() => {
    const maxHeight = Math.min(height, orders.length * itemHeight);
    return Math.max(200, maxHeight); // Minimum height of 200px
  }, [height, orders.length, itemHeight]);

  if (orders.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders found</h3>
          <p>Orders will appear here when customers place them.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        height={listHeight}
        itemCount={orders.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5} // Render 5 extra items for smooth scrolling
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {OrderItem}
      </List>
    </div>
  );
});

VirtualizedOrderList.displayName = 'VirtualizedOrderList';

// Hook for optimized order filtering and sorting
export const useOptimizedOrderList = (orders: Order[], filters?: {
  status?: string;
  search?: string;
  dateRange?: { start: Date; end: Date };
}) => {
  return useMemo(() => {
    let filteredOrders = [...orders];

    // Apply status filter
    if (filters?.status && filters.status !== 'all') {
      filteredOrders = filteredOrders.filter(order => 
        order.status.toLowerCase() === filters.status!.toLowerCase()
      );
    }

    // Apply search filter
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredOrders = filteredOrders.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm) ||
        order.customerName?.toLowerCase().includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm)
      );
    }

    // Apply date range filter
    if (filters?.dateRange) {
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= filters.dateRange!.start && orderDate <= filters.dateRange!.end;
      });
    }

    // Sort by creation date (newest first)
    filteredOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return filteredOrders;
  }, [orders, filters?.status, filters?.search, filters?.dateRange]);
};
