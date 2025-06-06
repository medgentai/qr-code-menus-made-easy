# Order Management Components

This directory contains components for managing orders in the application.

## Components

### PaginatedOrderList

A component that displays a paginated list of orders with manual pagination controls. It uses the `useOrder` hook to fetch and display orders with Next/Previous buttons.

#### Usage

```tsx
import { PaginatedOrderList } from '@/components/orders/PaginatedOrderList';

// Basic usage
<PaginatedOrderList />

// With order selection callback
<PaginatedOrderList onSelectOrder={(order) => handleOrderSelection(order)} />

// With status filter
<PaginatedOrderList filterStatus={OrderStatus.PENDING} />
```

#### Props

- `onSelectOrder`: Optional callback function that is called when an order is selected
- `filterStatus`: Optional filter to show only orders with a specific status

## Pagination Implementation

The order management system now uses React Query's `useInfiniteQuery` for efficient pagination. This provides several benefits:

1. **Reduced API Calls**: Only fetches the data needed for the current page
2. **Manual Pagination**: Supports loading more data with explicit user actions
3. **Caching**: Efficiently caches fetched pages to reduce redundant API calls
4. **Optimistic Updates**: Updates the UI immediately while waiting for API responses

### How Pagination Works

1. The backend returns paginated responses with metadata:
   - `data`: Array of orders for the current page
   - `total`: Total number of orders across all pages
   - `page`: Current page number
   - `limit`: Number of items per page
   - `totalPages`: Total number of pages
   - `hasNextPage`: Whether there are more pages after the current one
   - `hasPreviousPage`: Whether there are pages before the current one

2. The frontend uses `useInfiniteQuery` to fetch and manage paginated data:
   - `fetchNextPage`: Loads the next page of data
   - `fetchPreviousPage`: Loads the previous page of data
   - `hasNextPage`: Whether there are more pages to load
   - `hasPreviousPage`: Whether there are previous pages to load
   - `isFetchingNextPage`: Whether the next page is currently being fetched

3. The `useOrderContext` hook provides a unified interface for working with paginated orders:
   - `infiniteOrders`: All orders from all fetched pages
   - `paginationInfo`: Metadata about the current pagination state
   - `fetchNextPage`: Function to load the next page
   - `fetchPreviousPage`: Function to load the previous page

## Migration from Context API to React Query

The order management system has been migrated from using React Context API to React Query for better performance, caching, and state management. The `useOrder` hook now uses React Query under the hood but maintains the same interface for backward compatibility.

### Benefits

1. **Reduced API Calls**: React Query's caching prevents redundant API calls
2. **Automatic Refetching**: Queries are automatically refetched when needed
3. **Optimistic Updates**: UI updates immediately while waiting for API responses
4. **Better Error Handling**: Consistent error handling across all operations
5. **Improved Performance**: Reduced re-renders and better state management

### Usage

```tsx
import { useOrder } from '@/hooks/useOrder';

function OrderComponent() {
  const {
    orders,
    infiniteOrders,
    fetchNextPage,
    paginationInfo,
    isLoading
  } = useOrder();

  // Use orders or infiniteOrders depending on your needs
  // orders: All orders from the current page
  // infiniteOrders: All orders from all fetched pages

  return (
    <div>
      {/* Display orders */}
      {infiniteOrders?.map(order => (
        <div key={order.id}>{order.id}</div>
      ))}

      {/* Pagination controls */}
      <button
        onClick={() => fetchNextPage()}
        disabled={!paginationInfo?.hasNextPage || isLoading}
      >
        Load More
      </button>
    </div>
  );
}
```

## Role-Based Access Control

The order management system now includes comprehensive role-based access control that automatically filters orders and actions based on user roles and staff types.

### Role-Based Filtering

Different user roles see different orders based on their responsibilities and venue assignments:

- **KITCHEN Staff**: See orders that need kitchen attention (CONFIRMED, PREPARING, READY) from their assigned venues only
- **FRONT_OF_HOUSE Staff**: See the full service workflow (PENDING, CONFIRMED, READY, COMPLETED, CANCELLED) from their assigned venues only. Table information is integrated within the order management interface.
- **GENERAL Staff**: See all orders from their assigned venues but with limited actions
- **MANAGER+ Roles**: See all orders from all venues in the organization with full management capabilities

### Venue-Based Access Control

Staff members are assigned to specific venues and can only see orders from those venues:

- **Staff Venue Assignment**: Staff members have a `venueIds` array that specifies which venues they can access
- **Automatic Filtering**: Orders are automatically filtered to show only orders from assigned venues
- **Backend Enforcement**: Venue-level access control is enforced at the backend level for security
- **Context Awareness**: Page titles and descriptions reflect the venue context for staff members

### Permission-Based Actions

Actions are filtered based on user permissions:

- **Create Orders**: Front of house and general staff can create orders with table selection
- **Edit Orders**: Front of house staff and managers can edit orders
- **Update Status**: Role-specific status transitions
- **Delete Orders**: Only managers and administrators can delete orders
- **Table Integration**: Front of house staff see table information within orders (no separate table management)

### useRoleBasedOrders Hook

A new hook that provides automatic role-based filtering and permission checking:

```tsx
import { useRoleBasedOrders } from '@/hooks/useRoleBasedOrders';

function RoleBasedOrderComponent() {
  const {
    orders,
    isLoading,
    canCreateOrder,
    canEditOrder,
    canUpdateOrderStatus,
    availableStatusFilters,
    pageInfo
  } = useRoleBasedOrders();

  return (
    <div>
      <h1>{pageInfo.title}</h1>
      <p>{pageInfo.description}</p>

      {canCreateOrder && (
        <Button onClick={handleCreate}>Create Order</Button>
      )}

      {orders.map(order => (
        <div key={order.id}>
          {canEditOrder(order.status) && (
            <Button onClick={() => handleEdit(order.id)}>Edit</Button>
          )}
          {canUpdateOrderStatus(order.status) && (
            <StatusSelector order={order} />
          )}
        </div>
      ))}
    </div>
  );
}
```

### Role-Based Access Control Summary

| Role | View Orders | Create | Edit | Update Status | Delete |
|------|-------------|--------|------|---------------|--------|
| Kitchen Staff | Kitchen orders only | ❌ | ❌ | Kitchen workflow only | ❌ |
| Front of House | Full service workflow | ✅ | ✅ | Full service workflow | ❌ |
| General Staff | All orders | ✅ | ❌ | ❌ | ❌ |
| Manager | All orders | ✅ | ✅ | ✅ | ✅ |
| Administrator | All orders | ✅ | ✅ | ✅ | ✅ |
| Owner | All orders | ✅ | ✅ | ✅ | ✅ |

## Party Size and Table Capacity Management

The system now includes comprehensive party size tracking and table capacity management:

### Party Size Features

- **Order Party Size**: Orders can include party size information
- **Table Capacity Tracking**: Tables have capacity limits that are enforced
- **Occupancy Monitoring**: Real-time tracking of table occupancy vs capacity
- **Capacity Warnings**: Visual indicators when parties exceed table capacity

### Components

#### PartySizeInput
A specialized input component for selecting party size:

```tsx
import { PartySizeInput } from '@/components/orders/PartySizeInput';

<PartySizeInput
  value={partySize}
  onChange={setPartySize}
  tableCapacity={table?.capacity}
  required={true}
  showQuickButtons={true}
/>
```

#### TableCapacityStatus
A dashboard component showing table occupancy status:

```tsx
import { TableCapacityStatus } from '@/components/tables/TableCapacityStatus';

<TableCapacityStatus
  tables={tablesWithOccupancy}
  className="mt-6"
/>
```

### Usage Scenarios

1. **QR Code Ordering**: Customers specify party size when scanning QR codes
2. **Staff Order Taking**: Front of house staff can add/modify party size
3. **Capacity Management**: Service staff see which tables are at capacity
4. **Occupancy Analytics**: Real-time occupancy rates and guest counts
