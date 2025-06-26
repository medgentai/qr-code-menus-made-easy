import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  ChefHat,
  CheckCircle,
  CreditCard,
  List,
  AlertCircle,
  PlayCircle,
  Utensils,
  Truck,
  XCircle,
  DollarSign
} from 'lucide-react';
import { Order, OrderStatus, OrderPaymentStatus } from '@/services/order-service';

export type FilterType = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled' | 'unpaid';

interface OrderFiltersProps {
  orders: Order[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  userRole?: string;
  userStaffType?: string;
  className?: string;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  orders,
  activeFilter,
  onFilterChange,
  userRole,
  userStaffType,
  className = '',
}) => {
  // Calculate counts for each filter - Simple and direct
  const getCounts = () => {
    const counts = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      served: 0,
      completed: 0,
      cancelled: 0,
      unpaid: 0,
    };

    orders.forEach(order => {
      // Count by exact status
      switch (order.status) {
        case OrderStatus.PENDING:
          counts.pending++;
          break;
        case OrderStatus.CONFIRMED:
          counts.confirmed++;
          break;
        case OrderStatus.PREPARING:
          counts.preparing++;
          break;
        case OrderStatus.READY:
          counts.ready++;
          break;
        case OrderStatus.SERVED:
          counts.served++;
          break;
        case OrderStatus.COMPLETED:
          counts.completed++;
          break;
        case OrderStatus.CANCELLED:
          counts.cancelled++;
          break;
      }

      // Count unpaid orders (regardless of status, except cancelled)
      if (order.paymentStatus === OrderPaymentStatus.UNPAID && order.status !== OrderStatus.CANCELLED) {
        counts.unpaid++;
      }
    });

    return counts;
  };

  const counts = getCounts();

  // Define role-based filter configurations
  const getAllFilters = () => [
    {
      key: 'all' as FilterType,
      label: 'All',
      icon: List,
      count: counts.all,
      color: 'text-gray-600',
      description: 'All orders',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      key: 'pending' as FilterType,
      label: 'Pending',
      icon: Clock,
      count: counts.pending,
      color: 'text-yellow-600',
      description: 'Awaiting confirmation',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      priority: counts.pending > 0
    },
    {
      key: 'confirmed' as FilterType,
      label: 'Confirmed',
      icon: PlayCircle,
      count: counts.confirmed,
      color: 'text-blue-600',
      description: 'Order confirmed',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      key: 'preparing' as FilterType,
      label: 'Preparing',
      icon: ChefHat,
      count: counts.preparing,
      color: 'text-orange-600',
      description: 'Being prepared',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      key: 'ready' as FilterType,
      label: 'Ready',
      icon: CheckCircle,
      count: counts.ready,
      color: 'text-green-600',
      description: 'Ready to serve',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      priority: counts.ready > 0
    },
    {
      key: 'served' as FilterType,
      label: 'Served',
      icon: Utensils,
      count: counts.served,
      color: 'text-purple-600',
      description: 'Served to customer',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      key: 'completed' as FilterType,
      label: 'Completed',
      icon: CheckCircle,
      count: counts.completed,
      color: 'text-emerald-600',
      description: 'Order completed',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      key: 'cancelled' as FilterType,
      label: 'Cancelled',
      icon: XCircle,
      count: counts.cancelled,
      color: 'text-red-600',
      description: 'Cancelled orders',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      key: 'unpaid' as FilterType,
      label: 'Unpaid',
      icon: DollarSign,
      count: counts.unpaid,
      color: 'text-red-600',
      description: 'Payment pending',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      priority: counts.unpaid > 0
    }
  ];

  // Front of House filters - Simple and focused
  const getFrontOfHouseFilters = () => [
    {
      key: 'all' as FilterType,
      label: 'All',
      icon: List,
      count: counts.all,
      color: 'text-gray-600',
      description: 'All orders',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      key: 'pending' as FilterType,
      label: 'Pending',
      icon: Clock,
      count: counts.pending,
      color: 'text-yellow-600',
      description: 'Awaiting confirmation',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      priority: counts.pending > 0
    },
    {
      key: 'ready' as FilterType,
      label: 'Ready',
      icon: CheckCircle,
      count: counts.ready,
      color: 'text-green-600',
      description: 'Ready to serve',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      priority: counts.ready > 0
    },
    {
      key: 'served' as FilterType,
      label: 'Served',
      icon: Utensils,
      count: counts.served,
      color: 'text-purple-600',
      description: 'Served to customer',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      key: 'completed' as FilterType,
      label: 'Completed',
      icon: CheckCircle,
      count: counts.completed,
      color: 'text-emerald-600',
      description: 'Order completed',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      key: 'unpaid' as FilterType,
      label: 'Unpaid',
      icon: DollarSign,
      count: counts.unpaid,
      color: 'text-red-600',
      description: 'Payment pending',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      priority: counts.unpaid > 0
    }
  ];

  // Kitchen filters - Focus on preparation workflow
  const getKitchenFilters = () => [
    {
      key: 'all' as FilterType,
      label: 'All',
      icon: List,
      count: counts.all,
      color: 'text-gray-600',
      description: 'All orders',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      key: 'pending' as FilterType,
      label: 'Pending',
      icon: Clock,
      count: counts.pending,
      color: 'text-yellow-600',
      description: 'Awaiting confirmation',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      priority: counts.pending > 0
    },
    {
      key: 'confirmed' as FilterType,
      label: 'Confirmed',
      icon: PlayCircle,
      count: counts.confirmed,
      color: 'text-blue-600',
      description: 'Order confirmed',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      key: 'preparing' as FilterType,
      label: 'Preparing',
      icon: ChefHat,
      count: counts.preparing,
      color: 'text-orange-600',
      description: 'Being prepared',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      key: 'ready' as FilterType,
      label: 'Ready',
      icon: CheckCircle,
      count: counts.ready,
      color: 'text-green-600',
      description: 'Ready to serve',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  // Select filters based on user role
  const filters = (() => {
    if (userRole === 'STAFF' && userStaffType === 'FRONT_OF_HOUSE') {
      return getFrontOfHouseFilters();
    } else if (userRole === 'STAFF' && userStaffType === 'KITCHEN') {
      return getKitchenFilters();
    } else {
      // Managers, Admins, Owners get all filters
      return getAllFilters();
    }
  })();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Mobile: Horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.key;
          const hasItems = filter.count > 0;
          const isPriority = filter.priority && !isActive;

          return (
            <Button
              key={filter.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange(filter.key)}
              className={`
                flex items-center gap-2 whitespace-nowrap min-w-fit transition-all duration-200
                ${isActive ? `${filter.bgColor} ${filter.borderColor} ${filter.color} shadow-sm border-2` : 'hover:shadow-sm'}
                ${isPriority ? `ring-2 ring-offset-1 ${filter.borderColor.replace('border-', 'ring-')} ${filter.bgColor} ${filter.color}` : ''}
                ${!hasItems && !isActive ? 'opacity-50' : ''}
                ${hasItems && !isActive ? `hover:${filter.bgColor} hover:${filter.color}` : ''}
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{filter.label}</span>
              {hasItems && (
                <Badge
                  variant="secondary"
                  className={`
                    ml-1 px-1.5 py-0.5 text-xs font-bold min-w-[20px] h-5 flex items-center justify-center
                    ${isActive ? 'bg-white/90 text-gray-800 border-white/50' : `${filter.bgColor} ${filter.color} border-current`}
                  `}
                >
                  {filter.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Active filter description */}
      {activeFilter !== 'all' && (
        <div className="text-sm text-gray-600 px-1">
          {filters.find(f => f.key === activeFilter)?.description}
          {counts[activeFilter] > 0 && (
            <span className="ml-1 font-medium">
              ({counts[activeFilter]} {counts[activeFilter] === 1 ? 'order' : 'orders'})
            </span>
          )}
        </div>
      )}

      {/* Priority alerts */}
      {(counts.ready > 0 || counts.unpaid > 0) && activeFilter !== 'ready' && activeFilter !== 'unpaid' && (
        <div className="flex gap-2 text-sm">
          {counts.ready > 0 && (
            <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{counts.ready} order{counts.ready !== 1 ? 's' : ''} ready to serve</span>
            </div>
          )}
          {counts.unpaid > 0 && (
            <div className="flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded-md">
              <CreditCard className="h-4 w-4" />
              <span>{counts.unpaid} unpaid order{counts.unpaid !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
