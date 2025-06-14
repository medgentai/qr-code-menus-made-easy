import { api } from '@/lib/api';
import {
  TaxConfiguration,
  CreateTaxConfigurationDto,
  UpdateTaxConfigurationDto,
  CalculateTaxDto,
  OrderTotals,
  TaxPreview,
  ServiceType,
  TaxType,
} from '@/types/tax';

export class TaxService {
  private static readonly BASE_PATH = '';

  /**
   * Get all tax configurations for an organization
   */
  static async getTaxConfigurations(organizationId: string): Promise<TaxConfiguration[]> {
    try {
      const response = await api.get(`${this.BASE_PATH}/organizations/${organizationId}/tax-configurations`);
      console.log('Tax configurations response:', response.data);

      // Ensure tax rates are numbers
      const configurations = Array.isArray(response.data) ? response.data : [];
      return configurations.map(config => ({
        ...config,
        taxRate: typeof config.taxRate === 'string' ? parseFloat(config.taxRate) : config.taxRate,
      }));
    } catch (error) {
      console.error('Error fetching tax configurations:', error);
      throw error;
    }
  }

  /**
   * Get a specific tax configuration
   */
  static async getTaxConfiguration(organizationId: string, configId: string): Promise<TaxConfiguration> {
    const response = await api.get(`${this.BASE_PATH}/organizations/${organizationId}/tax-configurations/${configId}`);
    return response.data;
  }

  /**
   * Create a new tax configuration
   */
  static async createTaxConfiguration(
    organizationId: string,
    data: CreateTaxConfigurationDto
  ): Promise<TaxConfiguration> {
    console.log('Creating tax configuration with data:', data);
    console.log('Tax rate type:', typeof data.taxRate, 'Value:', data.taxRate);

    // Simple: just convert to number with proper decimal precision
    const taxRateNumber = Number(data.taxRate);
    const finalTaxRate = Math.round(taxRateNumber * 100) / 100; // Round to 2 decimal places

    const sanitizedData = {
      ...data,
      taxRate: finalTaxRate, // Send as number (e.g., 5.00, 0, 18.5)
    };

    console.log('Sanitized data:', sanitizedData);
    console.log('Final taxRate type:', typeof sanitizedData.taxRate, 'Value:', sanitizedData.taxRate);

    try {
      const response = await api.post(`${this.BASE_PATH}/organizations/${organizationId}/tax-configurations`, sanitizedData);
      return response.data;
    } catch (error: any) {
      console.error('Tax configuration creation failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors,
        data: error.response?.data,
        fullError: error
      });

      // If the endpoint doesn't exist (404), provide a helpful error message
      if (error.response?.status === 404) {
        throw new Error('Tax configuration endpoints are not yet implemented in the backend. The frontend is ready but waiting for backend integration.');
      }

      // If it's a conflict error (409), provide a helpful message
      if (error.response?.status === 409) {
        const message = error.response?.data?.message || error.message || 'A configuration with these settings already exists';
        throw new Error(message);
      }



      // If it's a validation error, provide the specific message
      if (error.response?.status === 400) {
        const errors = error.response?.data?.errors || [];
        const message = errors.length > 0 ? errors.join(', ') : (error.response?.data?.message || 'Invalid tax configuration data');
        throw new Error(`Validation failed: ${message}`);
      }

      throw error;
    }
  }

  /**
   * Update a tax configuration
   */
  static async updateTaxConfiguration(
    organizationId: string,
    configId: string,
    data: UpdateTaxConfigurationDto
  ): Promise<TaxConfiguration> {
    console.log('Updating tax configuration with data:', data);

    // Ensure taxRate is a proper number if provided
    const sanitizedData = {
      ...data,
      ...(data.taxRate !== undefined && { taxRate: Math.round(Number(data.taxRate) * 100) / 100 }),
    };

    console.log('Sanitized update data:', sanitizedData);

    try {
      const response = await api.patch(`${this.BASE_PATH}/organizations/${organizationId}/tax-configurations/${configId}`, sanitizedData);
      return response.data;
    } catch (error: any) {
      console.error('Tax configuration update failed:', error);

      // If it's a validation error, provide the specific message
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Invalid tax configuration data';
        throw new Error(message);
      }

      throw error;
    }
  }

  /**
   * Delete a tax configuration
   */
  static async deleteTaxConfiguration(organizationId: string, configId: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/organizations/${organizationId}/tax-configurations/${configId}`);
  }

  /**
   * Get tax preview for an organization
   */
  static async getTaxPreview(organizationId: string, serviceType?: ServiceType): Promise<TaxPreview> {
    try {
      const params = serviceType ? { serviceType } : {};
      const response = await api.get(`${this.BASE_PATH}/organizations/${organizationId}/tax-configurations/preview`, {
        params,
      });
      console.log('Tax preview response:', response.data);

      // Ensure tax rates are numbers in the preview
      const preview = response.data;
      if (preview.configuration && preview.configuration.taxRate) {
        preview.configuration.taxRate = typeof preview.configuration.taxRate === 'string'
          ? parseFloat(preview.configuration.taxRate)
          : preview.configuration.taxRate;
      }

      return preview;
    } catch (error) {
      console.error('Error fetching tax preview:', error);
      throw error;
    }
  }

  /**
   * Calculate tax for an order
   */
  static async calculateTax(data: CalculateTaxDto): Promise<OrderTotals> {
    const response = await api.post(`${this.BASE_PATH}/tax/calculate`, data);
    return response.data;
  }

  /**
   * Validate tax configuration data
   */
  static validateTaxConfiguration(data: CreateTaxConfigurationDto | UpdateTaxConfigurationDto): string[] {
    const errors: string[] = [];

    if ('name' in data && data.name) {
      if (data.name.length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
      if (data.name.length > 100) {
        errors.push('Name must be at most 100 characters long');
      }
    }

    if ('description' in data && data.description && data.description.length > 500) {
      errors.push('Description must be at most 500 characters long');
    }

    if ('taxRate' in data && data.taxRate !== undefined) {
      if (data.taxRate < 0) {
        errors.push('Tax rate cannot be negative');
      }
      if (data.taxRate > 100) {
        errors.push('Tax rate cannot exceed 100%');
      }
    }

    if ('applicableRegion' in data && data.applicableRegion && data.applicableRegion.length > 100) {
      errors.push('Applicable region must be at most 100 characters long');
    }

    return errors;
  }

  /**
   * Format tax rate for display
   */
  static formatTaxRate(rate: number | string | undefined): string {
    if (rate === undefined || rate === null) {
      return '0.00%';
    }

    const numRate = typeof rate === 'string' ? parseFloat(rate) : rate;

    if (isNaN(numRate)) {
      return '0.00%';
    }

    return `${numRate.toFixed(2)}%`;
  }

  /**
   * Format currency amount
   */
  static formatCurrency(amount: number | string | undefined, currency: string = '₹'): string {
    if (amount === undefined || amount === null) {
      return `${currency}0.00`;
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
      return `${currency}0.00`;
    }

    return `${currency}${numAmount.toFixed(2)}`;
  }

  /**
   * Get default tax configuration for organization type
   */
  static getDefaultTaxConfiguration(organizationType: string, serviceType: ServiceType): Partial<CreateTaxConfigurationDto> {
    const defaults: Record<string, Partial<CreateTaxConfigurationDto>> = {
      RESTAURANT: {
        name: `Restaurant GST - ${serviceType === ServiceType.ALL ? 'All Services' : serviceType.replace('_', ' ')}`,
        description: `Standard GST rate for restaurant ${serviceType.toLowerCase().replace('_', ' ')} service`,
        taxType: TaxType.GST,
        taxRate: 5.0,
        isDefault: serviceType === ServiceType.DINE_IN,
        isActive: true,
        isTaxExempt: false,
        isPriceInclusive: false,
        serviceType,
      },
      HOTEL: {
        name: 'Hotel GST - Standard',
        description: 'Standard GST rate for hotels',
        taxType: TaxType.GST,
        taxRate: 5.0,
        isDefault: true,
        isActive: true,
        isTaxExempt: false,
        isPriceInclusive: false,
        serviceType: ServiceType.DINE_IN,
      },
      CAFE: {
        name: 'Cafe GST',
        description: 'Standard GST rate for cafe services',
        taxType: TaxType.GST,
        taxRate: 5.0,
        isDefault: true,
        isActive: true,
        isTaxExempt: false,
        isPriceInclusive: false,
        serviceType: ServiceType.ALL,
      },
      FOOD_TRUCK: {
        name: 'Food Truck GST',
        description: 'Standard GST rate for food truck services',
        taxType: TaxType.GST,
        taxRate: 5.0,
        isDefault: true,
        isActive: true,
        isTaxExempt: false,
        isPriceInclusive: false,
        serviceType: ServiceType.ALL,
      },
      BAR: {
        name: 'Bar GST',
        description: 'Higher GST rate for establishments serving alcohol',
        taxType: TaxType.GST,
        taxRate: 18.0,
        isDefault: true,
        isActive: true,
        isTaxExempt: false,
        isPriceInclusive: false,
        serviceType: ServiceType.ALL,
      },
    };

    return defaults[organizationType] || defaults.RESTAURANT;
  }

  /**
   * Check if user can manage tax configurations
   */
  static canManageTaxConfigurations(userRole: string): boolean {
    return ['OWNER', 'ADMINISTRATOR', 'MANAGER'].includes(userRole);
  }

  /**
   * Get tax configuration status badge info
   */
  static getTaxConfigurationStatus(config: TaxConfiguration): {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    description: string;
  } {
    if (!config.isActive) {
      return {
        label: 'Inactive',
        variant: 'secondary',
        description: 'This tax configuration is currently disabled',
      };
    }

    if (config.isTaxExempt) {
      return {
        label: 'Tax Exempt',
        variant: 'outline',
        description: 'No tax will be applied with this configuration',
      };
    }

    if (config.isPriceInclusive) {
      return {
        label: 'Tax Inclusive',
        variant: 'default',
        description: 'Tax is included in the displayed prices',
      };
    }

    return {
      label: 'Active',
      variant: 'default',
      description: 'This tax configuration is active and available for use',
    };
  }
}
