/**
 * This file provides a direct replacement for the useOrder hook from the order-context.
 * It uses React Query under the hood for efficient data fetching and caching.
 */

import { useOrderContext } from './useOrderContext';
import type { OrderContextType } from '@/contexts/order-context';

/**
 * Hook to use order functionality
 * This is a direct replacement for the useOrder hook from order-context
 */
export const useOrder = (): OrderContextType => {
  return useOrderContext();
};

export default useOrder;
