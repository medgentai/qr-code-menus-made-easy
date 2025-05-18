# Order Management Components

This directory contains components for managing orders in the application.

## Components

### PaginatedOrderList

A component that displays a paginated list of orders with infinite scrolling support. It uses the `useOrder` hook to fetch and display orders with pagination controls.

#### Usage

```tsx
import { PaginatedOrderList } from '@/components/orders/PaginatedOrderList';

// Basic usage
<PaginatedOrderList />

// With order selection callback
<PaginatedOrderList onSelectOrder={(order) => console.log('Selected order:', order)} />

// With status filter
<PaginatedOrderList filterStatus={OrderStatus.PENDING} />
```

#### Props

- `onSelectOrder`: Optional callback function that is called when an order is selected
- `filterStatus`: Optional filter to show only orders with a specific status

## Pagination Implementation

The order management system now uses React Query's `useInfiniteQuery` for efficient pagination. This provides several benefits:

1. **Reduced API Calls**: Only fetches the data needed for the current page
2. **Infinite Scrolling**: Supports loading more data as the user scrolls
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
