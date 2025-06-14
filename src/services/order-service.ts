import { api, ApiResponse } from '@/lib/api';

// Order interfaces
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum OrderItemStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItemModifier {
  id: string;
  orderItemId: string;
  modifierId: string;
  price: string;
  modifier?: {
    id: string;
    name: string;
    price: string;
  };
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  notes?: string | null;
  status: OrderItemStatus;
  createdAt: string;
  updatedAt: string;
  menuItem?: {
    id: string;
    name: string;
    description?: string | null;
    price: string;
    discountPrice?: string | null;
    imageUrl?: string | null;
  };
  modifiers?: OrderItemModifier[];
}

export interface Order {
  id: string;
  venueId?: string | null;
  tableId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  roomNumber?: string | null;
  partySize?: number | null;
  status: OrderStatus;
  subtotalAmount?: string;
  taxAmount?: string;
  taxRate?: number;
  taxType?: string;
  serviceType?: string;
  totalAmount: string;
  isTaxExempt?: boolean;
  isPriceInclusive?: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  items?: OrderItem[];
  venue?: {
    id: string;
    name: string;
  };
  table?: {
    id: string;
    name: string;
    capacity?: number | null;
    venue?: {
      id: string;
      name: string;
    };
  };
}

// DTOs
export interface CreateOrderItemModifierDto {
  modifierId: string;
}

export interface CreateOrderItemDto {
  menuItemId: string;
  quantity: number;
  notes?: string;
  modifiers?: CreateOrderItemModifierDto[];
}

export interface CreateOrderDto {
  venueId: string;
  tableId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  roomNumber?: string;
  partySize?: number;
  notes?: string;
  items: CreateOrderItemDto[];
  status?: OrderStatus;
}

export interface UpdateOrderItemQuantityDto {
  itemId: string;
  quantity: number;
  notes?: string;
}

export interface UpdateOrderDto {
  tableId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  roomNumber?: string;
  partySize?: number;
  notes?: string;
  status?: OrderStatus;
  addItems?: CreateOrderItemDto[];
  removeItemIds?: string[];
  updateItems?: UpdateOrderItemQuantityDto[];
}

export interface UpdateOrderItemDto {
  quantity?: number;
  notes?: string;
  status?: OrderItemStatus;
  addModifiers?: CreateOrderItemModifierDto[];
  removeModifierIds?: string[];
}

export interface FilterOrdersDto {
  organizationId?: string;
  venueId?: string;
  tableId?: string;
  status?: OrderStatus;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  roomNumber?: string;
  createdAfter?: string;
  createdBefore?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedOrdersResponse extends PaginatedResponse<Order> {
  data: Order[];
}

// Type guard to check if response is paginated
export function isPaginatedResponse(response: any): response is PaginatedOrdersResponse {
  return response &&
         typeof response === 'object' &&
         Array.isArray(response.data) &&
         typeof response.total === 'number' &&
         typeof response.page === 'number';
}

// Order service
const OrderService = {
  // Order operations
  getAll: async (filters?: FilterOrdersDto): Promise<PaginatedOrdersResponse> => {
    let url = '/orders';
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    const response = await api.get<PaginatedOrdersResponse>(url);
    return response.data;
  },

  getAllForVenue: async (venueId: string, page?: number, limit?: number, status?: OrderStatus): Promise<PaginatedOrdersResponse | Order[]> => {
    // Return empty array if venueId is empty to prevent 404 errors
    if (!venueId) {
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false };
    }

    let url = `/orders/venue/${venueId}`;
    const params = new URLSearchParams();

    if (page !== undefined) {
      params.append('page', String(page));
    }

    if (limit !== undefined) {
      params.append('limit', String(limit));
    }

    if (status !== undefined) {
      params.append('status', status);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    try {
      const response = await api.get<PaginatedOrdersResponse | Order[]>(url);

      // Check if response is an array or paginated response
      if (Array.isArray(response.data)) {
        return response.data;
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllForOrganization: async (organizationId: string, page?: number, limit?: number, status?: OrderStatus): Promise<PaginatedOrdersResponse | Order[]> => {
    // Return empty array if organizationId is empty to prevent 404 errors
    if (!organizationId) {
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false };
    }

    let url = `/orders/organization/${organizationId}`;
    const params = new URLSearchParams();

    if (page !== undefined) {
      params.append('page', String(page));
    }

    if (limit !== undefined) {
      params.append('limit', String(limit));
    }

    if (status !== undefined) {
      params.append('status', status);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    try {
      const response = await api.get<PaginatedOrdersResponse | Order[]>(url);

      // Check if response is an array or paginated response
      if (Array.isArray(response.data)) {
        return response.data;
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string): Promise<Order> => {
    try {
      const response = await api.get<Order>(`/orders/${id}`);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (data: CreateOrderDto): Promise<Order> => {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  update: async (id: string, data: UpdateOrderDto): Promise<Order> => {
    console.log('OrderService.update called with ID:', id);
    console.log('Update data:', data);
    try {
      const response = await api.patch<Order>(`/orders/${id}`, data);
      console.log('Update API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error in OrderService.update:', error);
      throw error;
    }
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    // Ensure status is a valid OrderStatus enum value
    if (!Object.values(OrderStatus).includes(status)) {
      throw new Error(`Invalid order status: ${status}`);
    }

    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  // Combined filtering endpoint
  getFiltered: async (filters: FilterOrdersDto): Promise<ApiResponse<Order[]>> => {
    // Return empty response if no filters are provided
    if (!filters.organizationId && !filters.venueId) {
      return {
        data: [],
        statusCode: 200,
        message: 'Success',
        timestamp: new Date().toISOString(),
        path: '/orders/filtered'
      };
    }

    let url = '/orders/filtered';
    const params = new URLSearchParams();

    // Add all non-empty filters to the query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    // The API returns a response with the structure:
    // { data: Order[], statusCode, message, timestamp, path }
    const response = await api.get<Order[]>(url);

    return response;
  },

  // Order item operations
  updateOrderItem: async (
    orderId: string,
    itemId: string,
    data: UpdateOrderItemDto
  ): Promise<OrderItem> => {
    const response = await api.patch<OrderItem>(
      `/orders/${orderId}/items/${itemId}`,
      data
    );
    return response.data;
  },

  // Helper functions
  getStatusColor: (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.PREPARING:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case OrderStatus.READY:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case OrderStatus.DELIVERED:
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  },

  getItemStatusColor: (status: OrderItemStatus): string => {
    switch (status) {
      case OrderItemStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderItemStatus.PREPARING:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case OrderItemStatus.READY:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case OrderItemStatus.DELIVERED:
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case OrderItemStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case OrderItemStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  },

  formatCurrency: (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(num);
  },
};

export default OrderService;
