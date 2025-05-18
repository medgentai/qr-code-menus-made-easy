# React Query Hooks

This directory contains React Query hooks for data fetching and state management.

## Order Management Hooks

### Migration from Context API to React Query

The order management system has been migrated from using React Context API to React Query for better performance, caching, and state management. This migration includes:

1. Removing the `OrderProvider` and `OrderContext` components
2. Creating React Query hooks for all order-related operations
3. Providing a drop-in replacement for the `useOrder` hook

### Available Hooks

- `useOrderQuery.ts`: Contains all the React Query hooks for order operations
  - `useOrdersQuery`: Fetch all orders with optional filters
  - `useVenueOrdersQuery`: Fetch orders for a specific venue
  - `useOrganizationOrdersQuery`: Fetch orders for a specific organization
  - `useOrderQuery`: Fetch a single order by ID
  - `useCreateOrderMutation`: Create a new order
  - `useUpdateOrderMutation`: Update an existing order
  - `useUpdateOrderStatusMutation`: Update an order's status
  - `useUpdateOrderItemMutation`: Update an order item
  - `useDeleteOrderMutation`: Delete an order

- `useOrderContext.ts`: Provides a comprehensive hook that combines all the React Query hooks
  - Implements the same interface as the original `useOrder` hook
  - Handles loading states, errors, and data fetching
  - Manages the current order selection

- `useOrder.ts`: A drop-in replacement for the original `useOrder` hook
  - Simply re-exports the `useOrderContext` hook
  - Ensures backward compatibility with existing components

### Benefits of the Migration

1. **Reduced API Calls**: React Query's caching mechanism prevents redundant API calls
2. **Optimistic Updates**: Mutations include optimistic updates for better user experience
3. **Automatic Refetching**: Queries are automatically refetched when needed
4. **Better Error Handling**: Consistent error handling across all operations
5. **Improved Performance**: Reduced re-renders and better state management

### Usage

Replace imports from the context:

```typescript
// Old import
import { useOrder } from '@/contexts/order-context';

// New import
import { useOrder } from '@/hooks/useOrder';
```

For more granular control, you can use the specific hooks:

```typescript
import { 
  useOrderQuery, 
  useUpdateOrderMutation 
} from '@/hooks/useOrderQuery';

// In your component
const { data: order, isLoading } = useOrderQuery(orderId);
const updateOrderMutation = useUpdateOrderMutation();

// Update an order
const handleUpdate = async (data) => {
  await updateOrderMutation.mutateAsync({ id: orderId, data });
};
```

## Future Improvements

1. **Pagination**: Implement pagination for large datasets
2. **Infinite Queries**: Use `useInfiniteQuery` for infinite scrolling
3. **WebSocket Integration**: Better integrate WebSocket events with React Query's cache
4. **Selective Refetching**: Implement more granular refetching strategies
