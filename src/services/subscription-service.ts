import { api, API_BASE_URL, API_PREFIX } from '@/lib/api';
import { Subscription, SubscriptionSummary, BillingHistoryItem } from '@/types/subscription';

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

  // Cancel subscription (always cancels at period end)
  cancel: async (subscriptionId: string): Promise<Subscription> => {
    const response = await api.post<Subscription>(`/subscriptions/${subscriptionId}/cancel`, {});
    return response.data;
  },

  // Reactivate subscription
  reactivate: async (subscriptionId: string): Promise<Subscription> => {
    const response = await api.post<Subscription>(`/subscriptions/${subscriptionId}/reactivate`, {});
    return response.data;
  },

  // Update billing cycle
  updateBillingCycle: async (subscriptionId: string, data: { billingCycle: 'MONTHLY' | 'ANNUAL' }): Promise<Subscription> => {
    const response = await api.patch<Subscription>(`/subscriptions/${subscriptionId}/billing-cycle`, data);
    return response.data;
  },

  // Get billing history
  getBillingHistory: async (subscriptionId: string): Promise<BillingHistoryItem[]> => {
    const response = await api.get<BillingHistoryItem[]>(`/subscriptions/${subscriptionId}/billing-history`);
    return response.data;
  },

  // Get upcoming invoice
  getUpcomingInvoice: async (subscriptionId: string): Promise<any> => {
    const response = await api.get<any>(`/subscriptions/${subscriptionId}/upcoming-invoice`);
    return response.data;
  },

  // Download receipt
  downloadReceipt: async (subscriptionId: string, paymentId: string): Promise<Blob> => {
    // Use fetch directly for blob responses since the custom API client doesn't support blob responseType
    const token = window.accessToken;

    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/subscriptions/${subscriptionId}/payments/${paymentId}/receipt/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (response.status === 404) {
        throw new Error('Receipt not found or not accessible.');
      }
      throw new Error(`Failed to download receipt: ${response.statusText}`);
    }

    return response.blob();
  },
};

export default SubscriptionService;
