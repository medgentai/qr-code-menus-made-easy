export interface RazorpayConfig {
  key_id: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  planDetails?: {
    id: string;
    name: string;
    billingCycle: 'MONTHLY' | 'ANNUAL';
    venuesIncluded: number;
  };
  organizationName?: string;
  planName?: string;
}

export interface CreateOrganizationPaymentDto {
  organizationName: string;
  organizationType: 'RESTAURANT' | 'HOTEL' | 'CAFE' | 'FOOD_TRUCK' | 'BAR' | 'OTHER';
  planId?: string;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  venueName: string;
  venueDescription?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  imageUrl?: string;
}

export interface CreateVenuePaymentDto {
  organizationId: string;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  venueName: string;
  venueDescription?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  imageUrl?: string;
}

export interface PaymentVerificationDto {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentResponse {
  success: boolean;
  organization?: any;
  venue?: any;
  subscription?: any;
  message?: string;
  error?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  organizationType: 'RESTAURANT' | 'HOTEL' | 'CAFE';
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  venuesIncluded: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayInstance {
  open(): void;
  on(event: string, handler: Function): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
