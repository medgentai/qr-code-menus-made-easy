import { api } from '@/lib/api';
import { OrderStatus } from './order-service';

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
}

// Create a singleton instance
export const publicOrderService = new PublicOrderService();
