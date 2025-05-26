import { api } from '@/lib/api';
import {
  RazorpayConfig,
  PaymentOrder,
  CreateOrganizationPaymentDto,
  CreateVenuePaymentDto,
  PaymentVerificationDto,
  PaymentResponse,
  Plan,
} from '@/types/payment';

const PaymentService = {
  // Get Razorpay configuration
  getConfig: async (): Promise<RazorpayConfig> => {
    const response = await api.get<RazorpayConfig>('/payments/config', { withAuth: false });
    return response.data;
  },

  // Get all plans
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get<Plan[]>('/plans');
    return response.data;
  },

  // Get plans by organization type
  getPlansByType: async (organizationType: string): Promise<Plan[]> => {
    const response = await api.get<Plan[]>(`/plans?type=${organizationType}`);
    return response.data;
  },

  // Create payment order for organization setup
  createOrganizationPaymentOrder: async (
    data: CreateOrganizationPaymentDto
  ): Promise<PaymentOrder> => {
    const response = await api.post<PaymentOrder>(
      '/payments/organization/create-order',
      data
    );
    return response.data;
  },

  // Complete organization payment
  completeOrganizationPayment: async (
    data: PaymentVerificationDto
  ): Promise<PaymentResponse> => {
    const response = await api.post<PaymentResponse>(
      '/payments/organization/complete-payment',
      data
    );
    return response.data;
  },

  // Create payment order for venue creation
  createVenuePaymentOrder: async (
    data: CreateVenuePaymentDto
  ): Promise<PaymentOrder> => {
    const response = await api.post<PaymentOrder>(
      '/payments/venue/create-order',
      data
    );
    return response.data;
  },

  // Complete venue payment
  completeVenuePayment: async (
    data: PaymentVerificationDto
  ): Promise<PaymentResponse> => {
    const response = await api.post<PaymentResponse>(
      '/payments/venue/complete-payment',
      data
    );
    return response.data;
  },

  // Verify payment
  verifyPayment: async (data: PaymentVerificationDto): Promise<PaymentResponse> => {
    const response = await api.post<PaymentResponse>('/payments/verify', data);
    return response.data;
  },

  // Load Razorpay script
  loadRazorpayScript: (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  },
};

export default PaymentService;
