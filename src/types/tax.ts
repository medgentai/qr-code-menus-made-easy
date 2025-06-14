// Tax type enums - Simplified for Indian food service (GST replaced VAT, Service Tax, Sales Tax in July 2017)
export enum TaxType {
  GST = 'GST',  // Only applicable tax type for food service in India
}

export enum ServiceType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY',
  ALL = 'ALL',
}

// Tax type labels for display
export const TaxTypeLabels: Record<TaxType, string> = {
  [TaxType.GST]: 'GST (Goods & Services Tax)',
};

// Service type labels for display
export const ServiceTypeLabels: Record<ServiceType, string> = {
  [ServiceType.DINE_IN]: 'Dine In',
  [ServiceType.TAKEAWAY]: 'Takeaway',
  [ServiceType.DELIVERY]: 'Delivery',
  [ServiceType.ALL]: 'All Services',
};

// Tax configuration interface
export interface TaxConfiguration {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  organizationType: string;
  taxType: TaxType;
  taxRate: number;
  isDefault: boolean;
  isActive: boolean;
  isTaxExempt: boolean;
  isPriceInclusive: boolean;
  applicableRegion?: string;
  serviceType?: ServiceType;
  createdAt: string;
  updatedAt: string;
  organization?: {
    id: string;
    name: string;
    type: string;
  };
}

// Create tax configuration DTO
export interface CreateTaxConfigurationDto {
  name: string;
  description?: string;
  organizationType: string;
  taxType: TaxType;
  taxRate: number;
  isDefault?: boolean;
  isActive?: boolean;
  isTaxExempt?: boolean;
  isPriceInclusive?: boolean;
  applicableRegion?: string;
  serviceType?: ServiceType;
}

// Update tax configuration DTO
export interface UpdateTaxConfigurationDto {
  name?: string;
  description?: string;
  organizationType?: string;
  taxType?: TaxType;
  taxRate?: number;
  isDefault?: boolean;
  isActive?: boolean;
  isTaxExempt?: boolean;
  isPriceInclusive?: boolean;
  applicableRegion?: string;
  serviceType?: ServiceType;
}

// Tax calculation DTOs
export interface OrderItemForTax {
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  modifiersPrice?: number;
}

export interface CalculateTaxDto {
  organizationId: string;
  serviceType: ServiceType;
  items: OrderItemForTax[];
}

export interface TaxBreakdown {
  taxType: TaxType;
  taxRate: number;
  taxAmount: number;
  isPriceInclusive: boolean;
  isTaxExempt: boolean;
}

export interface OrderTotals {
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  serviceType: ServiceType;
  taxBreakdown: TaxBreakdown;
  displayMessage?: string;
}

// Tax preview interface
export interface TaxPreview {
  hasConfiguration: boolean;
  configuration?: {
    id: string;
    name: string;
    description?: string;
    taxType: TaxType;
    taxRate: number;
    isDefault: boolean;
    isActive: boolean;
    isTaxExempt: boolean;
    isPriceInclusive: boolean;
    serviceType?: ServiceType;
  };
  exampleCalculation?: {
    subtotal: number;
    taxAmount: number;
    total: number;
    message?: string;
  };
  message?: string;
}

// Tax configuration form data
export interface TaxConfigurationFormData {
  name: string;
  description: string;
  taxType: TaxType;
  taxRate: string; // String for form input, converted to number
  isDefault: boolean;
  isActive: boolean;
  isTaxExempt: boolean;
  isPriceInclusive: boolean;
  applicableRegion: string;
  serviceType: ServiceType;
}

// Default tax rates by organization type (for reference)
export const DefaultTaxRates = {
  RESTAURANT: {
    DINE_IN: 5.0,
    TAKEAWAY: 5.0,
    DELIVERY: 5.0,
  },
  HOTEL: {
    STANDARD: 5.0,
    PREMIUM: 18.0,
  },
  CAFE: {
    ALL: 5.0,
  },
  FOOD_TRUCK: {
    ALL: 5.0,
  },
  BAR: {
    ALL: 18.0,
  },
} as const;

// Tax configuration validation rules
export const TaxConfigurationRules = {
  name: {
    minLength: 2,
    maxLength: 100,
  },
  description: {
    maxLength: 500,
  },
  taxRate: {
    min: 0,
    max: 100,
    decimalPlaces: 2,
  },
  applicableRegion: {
    maxLength: 100,
  },
} as const;
