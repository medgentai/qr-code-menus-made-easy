/**
 * Memoized components to prevent unnecessary re-renders
 */

import React, { memo, useMemo } from 'react';
import { Order, OrderStatus } from '@/services/order-service';
import { Venue } from '@/services/venue-service';
import { Menu } from '@/services/menu-service';
import { Organization } from '@/services/organization-service';

// Memoized Order Card Component
interface OrderCardProps {
  order: Order;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  onViewDetails?: (orderId: string) => void;
  className?: string;
}

export const MemoizedOrderCard = memo<OrderCardProps>(
  ({ order, onStatusChange, onViewDetails, className }) => {
    const handleStatusChange = useMemo(
      () => onStatusChange ? () => onStatusChange(order.id, order.status) : undefined,
      [onStatusChange, order.id, order.status]
    );

    const handleViewDetails = useMemo(
      () => onViewDetails ? () => onViewDetails(order.id) : undefined,
      [onViewDetails, order.id]
    );

    return (
      <div className={className}>
        {/* Order card content */}
        <div className="p-4 border rounded-lg">
          <h3>Order #{order.orderNumber}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ₹{order.totalAmount}</p>
          {handleStatusChange && (
            <button onClick={handleStatusChange}>Change Status</button>
          )}
          {handleViewDetails && (
            <button onClick={handleViewDetails}>View Details</button>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (
      prevProps.order.id === nextProps.order.id &&
      prevProps.order.status === nextProps.order.status &&
      prevProps.order.updatedAt === nextProps.order.updatedAt &&
      prevProps.order.totalAmount === nextProps.order.totalAmount &&
      prevProps.className === nextProps.className
    );
  }
);

MemoizedOrderCard.displayName = 'MemoizedOrderCard';

// Memoized Venue Card Component
interface VenueCardProps {
  venue: Venue;
  onSelect?: (venue: Venue) => void;
  isSelected?: boolean;
  className?: string;
}

export const MemoizedVenueCard = memo<VenueCardProps>(
  ({ venue, onSelect, isSelected, className }) => {
    const handleSelect = useMemo(
      () => onSelect ? () => onSelect(venue) : undefined,
      [onSelect, venue]
    );

    return (
      <div className={`${className} ${isSelected ? 'selected' : ''}`}>
        <div className="p-4 border rounded-lg">
          <h3>{venue.name}</h3>
          <p>{venue.address}</p>
          <p>Type: {venue.type}</p>
          {handleSelect && (
            <button onClick={handleSelect}>Select Venue</button>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.venue.id === nextProps.venue.id &&
      prevProps.venue.name === nextProps.venue.name &&
      prevProps.venue.updatedAt === nextProps.venue.updatedAt &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.className === nextProps.className
    );
  }
);

MemoizedVenueCard.displayName = 'MemoizedVenueCard';

// Memoized Menu Item Component
interface MenuItemProps {
  item: any; // Menu item type
  onAddToCart?: (item: any) => void;
  quantity?: number;
  className?: string;
}

export const MemoizedMenuItem = memo<MenuItemProps>(
  ({ item, onAddToCart, quantity, className }) => {
    const handleAddToCart = useMemo(
      () => onAddToCart ? () => onAddToCart(item) : undefined,
      [onAddToCart, item]
    );

    return (
      <div className={className}>
        <div className="p-4 border rounded-lg">
          <h4>{item.name}</h4>
          <p>{item.description}</p>
          <p>₹{item.price}</p>
          {quantity && <span>Qty: {quantity}</span>}
          {handleAddToCart && (
            <button onClick={handleAddToCart}>Add to Cart</button>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.price === nextProps.item.price &&
      prevProps.item.isAvailable === nextProps.item.isAvailable &&
      prevProps.quantity === nextProps.quantity &&
      prevProps.className === nextProps.className
    );
  }
);

MemoizedMenuItem.displayName = 'MemoizedMenuItem';

// Memoized Organization Selector
interface OrganizationSelectorProps {
  organizations: Organization[];
  currentOrganization?: Organization;
  onSelect: (org: Organization) => void;
  className?: string;
}

export const MemoizedOrganizationSelector = memo<OrganizationSelectorProps>(
  ({ organizations, currentOrganization, onSelect, className }) => {
    const organizationOptions = useMemo(
      () => organizations.map(org => ({
        id: org.id,
        name: org.name,
        isSelected: org.id === currentOrganization?.id,
      })),
      [organizations, currentOrganization?.id]
    );

    return (
      <div className={className}>
        <select
          value={currentOrganization?.id || ''}
          onChange={(e) => {
            const selectedOrg = organizations.find(org => org.id === e.target.value);
            if (selectedOrg) onSelect(selectedOrg);
          }}
        >
          <option value="">Select Organization</option>
          {organizationOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.organizations.length === nextProps.organizations.length &&
      prevProps.currentOrganization?.id === nextProps.currentOrganization?.id &&
      prevProps.organizations.every((org, index) => 
        org.id === nextProps.organizations[index]?.id &&
        org.name === nextProps.organizations[index]?.name
      )
    );
  }
);

MemoizedOrganizationSelector.displayName = 'MemoizedOrganizationSelector';

// Memoized Data Table Component
interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
  }>;
  onRowClick?: (item: T) => void;
  className?: string;
}

export const MemoizedDataTable = memo<DataTableProps<any>>(
  ({ data, columns, onRowClick, className }) => {
    const tableRows = useMemo(
      () => data.map((item, index) => (
        <tr
          key={item.id || index}
          onClick={onRowClick ? () => onRowClick(item) : undefined}
          className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
        >
          {columns.map(column => (
            <td key={column.key} className="px-4 py-2">
              {column.render ? column.render(item) : item[column.key]}
            </td>
          ))}
        </tr>
      )),
      [data, columns, onRowClick]
    );

    return (
      <div className={className}>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.key} className="px-4 py-2 border bg-gray-100">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows}
          </tbody>
        </table>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.data.length === nextProps.data.length &&
      prevProps.columns.length === nextProps.columns.length &&
      prevProps.data.every((item, index) => 
        item.id === nextProps.data[index]?.id &&
        item.updatedAt === nextProps.data[index]?.updatedAt
      )
    );
  }
);

MemoizedDataTable.displayName = 'MemoizedDataTable';

// Memoized Loading Skeleton
interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

export const MemoizedLoadingSkeleton = memo<LoadingSkeletonProps>(
  ({ count = 3, height = '20px', className }) => {
    const skeletonItems = useMemo(
      () => Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
          style={{ height }}
        />
      )),
      [count, height, className]
    );

    return <div className="space-y-2">{skeletonItems}</div>;
  }
);

MemoizedLoadingSkeleton.displayName = 'MemoizedLoadingSkeleton';
