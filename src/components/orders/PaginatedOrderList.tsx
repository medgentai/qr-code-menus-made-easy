import React, { useEffect } from 'react';
import { useOrder } from '@/hooks/useOrder';
import { Order, OrderStatus } from '@/services/order-service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { TaxService } from '@/services/tax-service';

interface PaginatedOrderListProps {
  onSelectOrder?: (order: Order) => void;
  filterStatus?: OrderStatus;
}

export const PaginatedOrderList: React.FC<PaginatedOrderListProps> = ({
  onSelectOrder,
  filterStatus,
}) => {
  const {
    infiniteOrders,
    isLoading,
    isLoadingNextPage,
    fetchNextPage,
    fetchPreviousPage,
    paginationInfo,
    hasNextPage,
    hasPreviousPage,
    error,
  } = useOrder();
  
  const navigate = useNavigate();

  // Filter orders by status if needed
  const filteredOrders = React.useMemo(() => {
    if (!infiniteOrders) return [];
    if (!filterStatus) return infiniteOrders;
    return infiniteOrders.filter(order => order.status === filterStatus);
  }, [infiniteOrders, filterStatus]);

  // Handle order selection
  const handleSelectOrder = (order: Order) => {
    if (onSelectOrder) {
      onSelectOrder(order);
    } else {
      navigate(`/orders/${order.id}`);
    }
  };

  if (isLoading && !infiniteOrders?.length) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading orders: {error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!filteredOrders.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleSelectOrder(order)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">
                  {order.customerName || 'Anonymous Customer'}
                </h3>
                <p className="text-sm text-gray-500">
                  {order.table?.name ? `Table: ${order.table.name}` : 'No table assigned'}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <Badge variant="outline" className="mb-2">
                  {order.status}
                </Badge>
                <div className="text-right">
                  <span className="font-medium">
                    {TaxService.formatCurrency(parseFloat(order.totalAmount))}
                  </span>
                  {order.isTaxExempt && (
                    <div className="text-xs text-muted-foreground">Tax Exempt</div>
                  )}
                  {order.isPriceInclusive && (
                    <div className="text-xs text-muted-foreground">Tax Inclusive</div>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {order.items?.length || 0} items
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPreviousPage?.()}
          disabled={!hasPreviousPage || isLoadingNextPage}
        >
          Previous
        </Button>
        
        {paginationInfo && (
          <span className="text-sm text-gray-500">
            Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
            {paginationInfo.totalItems > 0 && ` (${paginationInfo.totalItems} total)`}
          </span>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchNextPage?.()}
          disabled={!hasNextPage || isLoadingNextPage}
        >
          {isLoadingNextPage ? 'Loading...' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default PaginatedOrderList;
