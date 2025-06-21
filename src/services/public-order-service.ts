import { api } from '@/lib/api';
import { OrderStatus, OrderPaymentStatus } from './order-service';

// Public order response interface
export interface PublicOrderResponse {
  id: string;
  orderNumber?: string;
  status: OrderStatus;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  tableId?: string;
  venueId?: string;
  roomNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Public order DTO interface
export interface CreatePublicOrderDto {
  venueId?: string;
  tableId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  roomNumber?: string;
  partySize?: number;
  notes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
    modifiers?: {
      modifierId: string;
    }[];
  }[];
}

// Customer search response interface
export interface CustomerSearchResponse {
  found: boolean;
  customer: {
    name: string;
    email: string;
    phone: string;
  } | null;
  activeOrders: {
    orderId: string;
    tableId: string;
    tableName: string;
    venueName: string;
    status: OrderStatus;
    paymentStatus: OrderPaymentStatus;
    createdAt: string;
    totalAmount: number;
  }[];
  canOrder: boolean;
  restrictionMessage?: string;
}

// Table ordering validation response interface
export interface TableOrderValidation {
  canOrder: boolean;
  reason?: 'ACTIVE_ORDER_SAME_TABLE' | 'ACTIVE_ORDER_DIFFERENT_TABLE' | 'NO_RESTRICTIONS';
  activeOrder?: {
    orderId: string;
    tableId: string;
    tableName: string;
    status: OrderStatus;
    paymentStatus: OrderPaymentStatus;
  };
  requiresConfirmation: boolean;
}

// Public order service for guest users
class PublicOrderService {
  /**
   * Create a new order as a guest user
   * @param orderData Order data
   * @returns Created order
   */
  async createOrder(orderData: CreatePublicOrderDto): Promise<PublicOrderResponse> {
    try {
      // Use the simple endpoint - the backend will extract the venueId from the tableId if needed
      const endpoint = '/public/orders';

      const response = await api.post<PublicOrderResponse>(endpoint, orderData, { withAuth: false });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new order for a specific venue
   * @param orderData Order data
   * @param venueId Venue ID
   * @returns Created order
   */
  async createOrderForVenue(orderData: CreatePublicOrderDto, venueId: string): Promise<PublicOrderResponse> {
    try {
      const endpoint = `/public/venues/${venueId}/orders`;

      const response = await api.post<PublicOrderResponse>(endpoint, orderData, { withAuth: false });
      return response.data;
    } catch (error) {
      console.error('Error creating order for venue:', error);
      throw error;
    }
  }

  /**
   * Get order status by ID
   * @param orderId Order ID
   * @returns Order status
   */
  async getOrderStatus(orderId: string): Promise<{ status: OrderStatus }> {
    try {
      const response = await api.get<{ status: OrderStatus }>(`/public/orders/${orderId}/status`, { withAuth: false });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get orders by phone number
   * @param phoneNumber Customer phone number
   * @returns List of orders
   */
  async getOrdersByPhone(phoneNumber: string): Promise<PublicOrderResponse[]> {
    try {
      const response = await api.get<PublicOrderResponse[]>(`/public/orders/phone/${phoneNumber}`, { withAuth: false });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search customer by phone number and check ordering restrictions
   * @param phoneNumber Customer phone number
   * @param tableId Optional table ID to check restrictions against
   * @returns Customer search response with ordering restrictions
   */
  async searchCustomerByPhone(phoneNumber: string, tableId?: string): Promise<CustomerSearchResponse> {
    try {
      const url = tableId
        ? `/public/customers/search/${phoneNumber}?tableId=${tableId}`
        : `/public/customers/search/${phoneNumber}`;
      const response = await api.get<CustomerSearchResponse>(url, { withAuth: false });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if customer can order from specific table
   * @param phoneNumber Customer phone number
   * @param tableId Table ID to check
   * @returns Table ordering validation response
   */
  async canOrderFromTable(phoneNumber: string, tableId: string): Promise<TableOrderValidation> {
    try {
      const response = await api.get<TableOrderValidation>(`/public/customers/${phoneNumber}/can-order-from-table/${tableId}`, { withAuth: false });
      return response.data;
    } catch (error) {
      throw error;
    }
  }


}

// Create a singleton instance
export const publicOrderService = new PublicOrderService();
