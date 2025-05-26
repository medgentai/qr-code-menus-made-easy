import { api } from '@/lib/api';
import { Subscription, SubscriptionSummary } from '@/types/subscription';

const SubscriptionService = {
  // Get all subscriptions for the current user
  getAll: async (): Promise<Subscription[]> => {
    const response = await api.get<Subscription[]>('/subscriptions');
    return response.data;
  },

  // Get subscription by ID
  getById: async (id: string): Promise<Subscription> => {
    const response = await api.get<Subscription>(`/subscriptions/${id}`);
    return response.data;
  },

  // Get subscription by organization ID
  getByOrganizationId: async (organizationId: string): Promise<Subscription | null> => {
    const response = await api.get<Subscription | null>(`/subscriptions/organization/${organizationId}`);
    return response.data;
  },

  // Get subscription summary (includes usage, billing info, etc.)
  getSummary: async (subscriptionId: string): Promise<SubscriptionSummary> => {
    const response = await api.get<SubscriptionSummary>(`/subscriptions/${subscriptionId}/summary`);
    return response.data;
  },

  // Get subscription summary by organization ID
  getSummaryByOrganization: async (organizationId: string): Promise<SubscriptionSummary | null> => {
    const response = await api.get<SubscriptionSummary | null>(`/subscriptions/organization/${organizationId}/summary`);
    return response.data;
  },

  // Cancel subscription
  cancel: async (subscriptionId: string, data: { cancelAtPeriodEnd: boolean }): Promise<Subscription> => {
    const response = await api.post<Subscription>(`/subscriptions/${subscriptionId}/cancel`, data);
    return response.data;
  },

  // Reactivate subscription
  reactivate: async (subscriptionId: string): Promise<Subscription> => {
    const response = await api.post<Subscription>(`/subscriptions/${subscriptionId}/reactivate`);
    return response.data;
  },

  // Update billing cycle
  updateBillingCycle: async (subscriptionId: string, data: { billingCycle: 'MONTHLY' | 'ANNUAL' }): Promise<Subscription> => {
    const response = await api.patch<Subscription>(`/subscriptions/${subscriptionId}/billing-cycle`, data);
    return response.data;
  },

  // Get billing history
  getBillingHistory: async (subscriptionId: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/subscriptions/${subscriptionId}/billing-history`);
    return response.data;
  },

  // Get upcoming invoice
  getUpcomingInvoice: async (subscriptionId: string): Promise<any> => {
    const response = await api.get<any>(`/subscriptions/${subscriptionId}/upcoming-invoice`);
    return response.data;
  },

  // Download invoice
  downloadInvoice: async (subscriptionId: string, invoiceId: string): Promise<Blob> => {
    const response = await api.get(`/subscriptions/${subscriptionId}/invoices/${invoiceId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default SubscriptionService;
