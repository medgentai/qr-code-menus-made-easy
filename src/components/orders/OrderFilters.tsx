import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  ChefHat, 
  CheckCircle, 
  CreditCard,
  List,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, OrderPaymentStatus } from '@/services/order-service';

export type FilterType = 'all' | 'active' | 'ready' | 'kitchen' | 'unpaid' | 'completed';

interface OrderFiltersProps {
  orders: Order[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  className?: string;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  orders,
  activeFilter,
  onFilterChange,
  className = '',
}) => {
  // Calculate counts for each filter
  const getCounts = () => {
    const counts = {
      all: orders.length,
      active: 0,
      ready: 0,
      kitchen: 0,
      unpaid: 0,
      completed: 0,
    };

    orders.forEach(order => {
      // Active orders (pending, confirmed, preparing, ready)
      if (['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.status)) {
        counts.active++;
      }

      // Ready orders (ready to serve)
      if (order.status === 'READY') {
        counts.ready++;
      }

      // Kitchen orders (confirmed and preparing)
      if (['CONFIRMED', 'PREPARING'].includes(order.status)) {
        counts.kitchen++;
      }

      // Unpaid orders
      if (order.paymentStatus === OrderPaymentStatus.UNPAID && order.status !== OrderStatus.CANCELLED) {
        counts.unpaid++;
      }

      // Completed orders
      if (['SERVED', 'COMPLETED'].includes(order.status)) {
        counts.completed++;
      }
    });

    return counts;
  };

  const counts = getCounts();

  const filters = [
    {
      key: 'all' as FilterType,
      label: 'All',
      icon: List,
      count: counts.all,
      color: 'text-gray-600',
      description: 'All orders'
    },
    {
      key: 'active' as FilterType,
      label: 'Active',
      icon: Clock,
      count: counts.active,
      color: 'text-blue-600',
      description: 'Orders in progress'
    },
    {
      key: 'ready' as FilterType,
      label: 'Ready',
      icon: CheckCircle,
      count: counts.ready,
      color: 'text-green-600',
      description: 'Ready to serve',
      priority: counts.ready > 0 // Highlight if there are ready orders
    },
    {
      key: 'kitchen' as FilterType,
      label: 'Kitchen',
      icon: ChefHat,
      count: counts.kitchen,
      color: 'text-orange-600',
      description: 'In kitchen'
    },
    {
      key: 'unpaid' as FilterType,
      label: 'Unpaid',
      icon: CreditCard,
      count: counts.unpaid,
      color: 'text-red-600',
      description: 'Payment pending',
      priority: counts.unpaid > 0 // Highlight if there are unpaid orders
    }
  ];

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
                flex items-center gap-2 whitespace-nowrap min-w-fit
                ${isActive ? 'shadow-sm' : ''}
                ${isPriority ? 'ring-2 ring-orange-200 border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100' : ''}
                ${!hasItems && !isActive ? 'opacity-60' : ''}
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{filter.label}</span>
              {hasItems && (
                <Badge 
                  variant={isActive ? 'secondary' : 'outline'} 
                  className={`
                    ml-1 px-1.5 py-0.5 text-xs font-bold min-w-[20px] h-5 flex items-center justify-center
                    ${isActive ? 'bg-white/20 text-white border-white/30' : ''}
                    ${isPriority ? 'bg-orange-200 text-orange-800 border-orange-300' : ''}
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
