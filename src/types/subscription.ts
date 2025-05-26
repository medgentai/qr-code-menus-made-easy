export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  userId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  venuesIncluded: number;
  venuesUsed: number;
  amount: number;
  currency: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;

  // Relations
  organization?: {
    id: string;
    name: string;
    type: string;
  };
  plan?: {
    id: string;
    name: string;
    description: string;
    organizationType: string;
    monthlyPrice: number;
    annualPrice: number;
    features: string[];
    venuesIncluded: number;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  TRIAL = 'TRIAL',
  PAST_DUE = 'PAST_DUE',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

export interface SubscriptionUsage {
  venuesUsed: number;
  venuesIncluded: number;
  venuesRemaining: number;
  usagePercentage: number;
}

export interface SubscriptionBilling {
  nextBillingDate: string;
  lastBillingDate?: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
}

export interface SubscriptionSummary {
  subscription: Subscription;
  usage: SubscriptionUsage;
  billing: SubscriptionBilling;
  isTrialActive: boolean;
  trialDaysRemaining?: number;
  canUpgrade: boolean;
  canDowngrade: boolean;
  canCancel: boolean;
}

export interface BillingHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentType: string;
  paymentMethod: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  receipt?: string;
  notes?: string;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
    type: string;
  };
  venue?: {
    id: string;
    name: string;
  };
  metadata?: any;
  description: string;
}

// Status labels for display
export const SubscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'Active',
  [SubscriptionStatus.INACTIVE]: 'Inactive',
  [SubscriptionStatus.CANCELLED]: 'Cancelled',
  [SubscriptionStatus.EXPIRED]: 'Expired',
  [SubscriptionStatus.TRIAL]: 'Trial',
  [SubscriptionStatus.PAST_DUE]: 'Past Due',
};

// Status colors for UI
export const SubscriptionStatusColors: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'text-green-600 bg-green-50 border-green-200',
  [SubscriptionStatus.INACTIVE]: 'text-gray-600 bg-gray-50 border-gray-200',
  [SubscriptionStatus.CANCELLED]: 'text-red-600 bg-red-50 border-red-200',
  [SubscriptionStatus.EXPIRED]: 'text-red-600 bg-red-50 border-red-200',
  [SubscriptionStatus.TRIAL]: 'text-blue-600 bg-blue-50 border-blue-200',
  [SubscriptionStatus.PAST_DUE]: 'text-orange-600 bg-orange-50 border-orange-200',
};

// Billing cycle labels
export const BillingCycleLabels: Record<BillingCycle, string> = {
  [BillingCycle.MONTHLY]: 'Monthly',
  [BillingCycle.ANNUAL]: 'Annual',
};
