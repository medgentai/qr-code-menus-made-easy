import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Edit, 
  MoreHorizontal,
  Clock,
  CreditCard,
  User,
  MapPin
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

interface NewOrderCardProps {
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
}

// Food emojis mapping for common items
const getFoodEmoji = (itemName: string): string => {
  const name = itemName.toLowerCase();
  if (name.includes('burger') || name.includes('sandwich')) return '🍔';
  if (name.includes('pizza')) return '🍕';
  if (name.includes('fries') || name.includes('chips')) return '🍟';
  if (name.includes('salad')) return '🥗';
  if (name.includes('drink') || name.includes('soda') || name.includes('juice')) return '🥤';
  if (name.includes('coffee')) return '☕';
  if (name.includes('beer')) return '🍺';
  if (name.includes('wine')) return '🍷';
  if (name.includes('pasta') || name.includes('spaghetti')) return '🍝';
  if (name.includes('soup')) return '🍲';
  if (name.includes('chicken')) return '🍗';
  if (name.includes('fish')) return '🐟';
  if (name.includes('steak') || name.includes('beef')) return '🥩';
  if (name.includes('dessert') || name.includes('cake') || name.includes('ice cream')) return '🍰';
  return '🍽️'; // Default food emoji
};

export const NewOrderCard: React.FC<NewOrderCardProps> = ({
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
}) => {
  // Get status color and styling
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          indicator: 'bg-yellow-400',
          text: 'text-yellow-800'
        };
      case 'PREPARING':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          indicator: 'bg-blue-400',
          text: 'text-blue-800'
        };
      case 'READY':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          indicator: 'bg-green-400',
          text: 'text-green-800'
        };
      case 'SERVED':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          indicator: 'bg-purple-400',
          text: 'text-purple-800'
        };
      case 'COMPLETED':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          indicator: 'bg-green-400',
          text: 'text-green-800'
        };
      case 'CANCELLED':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          indicator: 'bg-red-400',
          text: 'text-red-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          indicator: 'bg-gray-400',
          text: 'text-gray-600'
        };
    }
  };

  const currentStatus = pendingStatusUpdates[order.id] || order.status;
  const statusStyle = getStatusStyle(currentStatus);

  const formatCurrency = (amount: string) => {
    return OrderService.formatCurrency(amount);
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const orderTime = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return format(orderTime, 'MMM d');
  };

  // Get display name for customer/table
  const getDisplayName = () => {
    if (order.table?.name && order.customerName) {
      return `${order.table.name} - ${order.customerName}`;
    }
    if (order.table?.name) {
      return order.table.name;
    }
    if (order.customerName) {
      return order.customerName;
    }
    return 'Walk-in Order';
  };

  // Get item preview with emojis
  const getItemPreview = () => {
    if (!order.items || order.items.length === 0) return '🍽️ No items';
    
    const preview = order.items
      .slice(0, 3) // Show max 3 items
      .map(item => `${getFoodEmoji(item.menuItem?.name || '')} ${item.menuItem?.name}`)
      .join(', ');
    
    if (order.items.length > 3) {
      return `${preview}, +${order.items.length - 3} more`;
    }
    
    return preview;
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${statusStyle.bg} ${statusStyle.border} border-l-4`}
      onClick={() => onViewOrder(order.id)}
    >
      <CardContent className="p-4">
        {/* Status Indicator & Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusStyle.indicator}`}></div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base leading-tight">
                {getDisplayName()}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <span className="font-mono">#{order.id.substring(0, 8)}</span>
                <span>•</span>
                <span>{order.items?.length || 0} items</span>
                <span>•</span>
                <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onViewOrder(order.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {canEditOrder(order.status) && (
                  <DropdownMenuItem onClick={() => onEditOrder(order.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Order
                  </DropdownMenuItem>
                )}
                {canUpdateOrderStatus(order.status) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    {availableStatusFilters.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => onStatusChange(order.id, status)}
                        disabled={order.status === status}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                {canDeleteOrder(order.status) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteOrder(order)}
                      className="text-destructive focus:text-destructive"
                    >
                      Delete Order
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Items Preview */}
        <div className="mb-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            {getItemPreview()}
          </p>
        </div>

        {/* Status & Payment Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`${statusStyle.text} ${statusStyle.bg} border-0 font-medium`}
            >
              {currentStatus}
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer transition-colors ${
                order.paymentStatus === OrderPaymentStatus.PAID 
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (order.status !== OrderStatus.CANCELLED) {
                  onPaymentStatusClick(order);
                }
              }}
            >
              <CreditCard className="mr-1 h-3 w-3" />
              {order.paymentStatus === OrderPaymentStatus.PAID ? 'PAID' : 'UNPAID'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{getTimeAgo(order.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
