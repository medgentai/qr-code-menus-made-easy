import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { TaxService } from '@/services/tax-service';
import {
  TaxConfiguration,
  TaxType,
  ServiceType,
  TaxTypeLabels,
  CreateTaxConfigurationDto,
  UpdateTaxConfigurationDto,
} from '@/types/tax';

// Form validation schema
const taxConfigurationSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be at most 100 characters' }),
  description: z.string()
    .max(500, { message: 'Description must be at most 500 characters' })
    .optional(),
  taxType: z.nativeEnum(TaxType, {
    errorMap: () => ({ message: 'Please select a valid tax type' }),
  }),
  taxRate: z.string()
    .min(1, { message: 'Tax rate is required' })
    .refine((val) => {
      // Allow "0" or "0.00"
      if (val === '0' || val === '0.00') {
        return true;
      }

      // For other values, require a valid number
      const num = parseFloat(val);
      return !isNaN(num) && isFinite(num);
    }, { message: 'Tax rate must be a valid decimal number' })
    .refine((val) => {
      const num = parseFloat(val);
      return num >= 0;
    }, { message: 'Tax rate cannot be negative' })
    .refine((val) => {
      const num = parseFloat(val);
      return num <= 100;
    }, { message: 'Tax rate cannot exceed 100%' }),
  // Service type removed - tax rates are same for all service types per Indian GST regulations
  isActive: z.boolean(),
  isTaxExempt: z.boolean(),
  isPriceInclusive: z.boolean(),
  applicableRegion: z.string()
    .max(100, { message: 'Applicable region must be at most 100 characters' })
    .optional(),
}).superRefine((data, ctx) => {
  // Cross-field validation: if tax exempt, tax rate should be 0
  if (data.isTaxExempt && data.taxRate !== '0' && data.taxRate !== '0.00') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tax rate must be 0 for tax exempt configurations',
      path: ['taxRate'],
    });
  }

  // Cross-field validation: can't be price inclusive if tax exempt
  if (data.isTaxExempt && data.isPriceInclusive) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Cannot have tax inclusive pricing for tax exempt configurations',
      path: ['isPriceInclusive'],
    });
  }
});

type FormValues = z.infer<typeof taxConfigurationSchema>;

interface TaxConfigurationFormProps {
  organizationId: string;
  organizationType: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingConfig?: TaxConfiguration | null;
}

export const TaxConfigurationForm: React.FC<TaxConfigurationFormProps> = ({
  organizationId,
  organizationType,
  isOpen,
  onClose,
  onSuccess,
  editingConfig,
}) => {
  const isEditing = !!editingConfig;

  const form = useForm<FormValues>({
    resolver: zodResolver(taxConfigurationSchema),
    defaultValues: {
      name: '',
      description: '',
      taxType: TaxType.GST,
      taxRate: '5.00',
      isActive: true,
      isTaxExempt: false,
      isPriceInclusive: false,
      applicableRegion: '',
    },
  });

  // Reset form when dialog opens/closes or editing config changes
  useEffect(() => {
    if (isOpen) {
      if (editingConfig) {
        form.reset({
          name: editingConfig.name,
          description: editingConfig.description || '',
          taxType: editingConfig.taxType,
          taxRate: editingConfig.taxRate.toString(),
          isActive: editingConfig.isActive,
          isTaxExempt: editingConfig.isTaxExempt,
          isPriceInclusive: editingConfig.isPriceInclusive,
          applicableRegion: editingConfig.applicableRegion || '',
        });
      } else {
        // Set default values for new configuration
        const defaultConfig = TaxService.getDefaultTaxConfiguration(organizationType, ServiceType.DINE_IN);
        form.reset({
          name: defaultConfig.name || '',
          description: defaultConfig.description || '',
          taxType: defaultConfig.taxType || TaxType.GST,
          taxRate: defaultConfig.taxRate?.toString() || '5.00',
          isActive: defaultConfig.isActive || true,
          isTaxExempt: defaultConfig.isTaxExempt || false,
          isPriceInclusive: defaultConfig.isPriceInclusive || false,
          applicableRegion: '',
        });
      }
    }
  }, [isOpen, editingConfig, organizationType, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateTaxConfigurationDto) =>
      TaxService.createTaxConfiguration(organizationId, data),
    onSuccess: () => {
      toast.success('Tax configuration created successfully');
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Create tax configuration error:', error);
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'Failed to create tax configuration';
      toast.error(errorMessage);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateTaxConfigurationDto) =>
      TaxService.updateTaxConfiguration(organizationId, editingConfig!.id, data),
    onSuccess: () => {
      toast.success('Tax configuration updated successfully');
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Update tax configuration error:', error);
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'Failed to update tax configuration';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log('Form data before submission:', data);

    // Validate and convert tax rate
    let taxRateValue = 0;

    if (data.isTaxExempt) {
      // For tax exempt, set rate to 0 (but backend might not accept 0, so we'll handle this in the service)
      taxRateValue = 0;
    } else {
      // Ensure tax rate is provided for non-exempt configurations
      if (!data.taxRate || data.taxRate.trim() === '') {
        toast.error('Tax rate is required for non-exempt configurations.');
        return;
      }

      taxRateValue = parseFloat(data.taxRate);
      if (isNaN(taxRateValue) || !isFinite(taxRateValue)) {
        toast.error('Invalid tax rate. Please enter a valid decimal number.');
        return;
      }

      if (taxRateValue < 0) {
        toast.error('Tax rate cannot be negative.');
        return;
      }

      if (taxRateValue > 100) {
        toast.error('Tax rate cannot exceed 100%.');
        return;
      }
    }

    // Round to 2 decimal places to avoid floating point precision issues
    const roundedTaxRate = Math.round(taxRateValue * 100) / 100;

    const submitData = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      organizationType,
      taxType: data.taxType,
      taxRate: roundedTaxRate,
      isActive: data.isActive,
      isTaxExempt: data.isTaxExempt,
      isPriceInclusive: data.isPriceInclusive && !data.isTaxExempt, // Can't be price inclusive if tax exempt
      applicableRegion: data.applicableRegion?.trim() || undefined,
    };

    console.log('Submitting tax configuration:', submitData);

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Tax Configuration' : 'Create Tax Configuration'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the tax configuration settings below.'
              : 'Configure tax rates and settings for your organization.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuration Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Restaurant GST - Dine In"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this tax configuration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe when this tax configuration applies..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Additional details about this tax configuration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taxType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tax type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(TaxTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Service Type field removed - GST rates are same for all service types per Indian regulations */}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder={form.watch('isTaxExempt') ? '0.00' : '5.00'}
                          {...field}
                          disabled={form.watch('isTaxExempt')}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Tax rate as a percentage (0-100%)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicableRegion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applicable Region (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Delhi, India"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Geographic region where this tax applies
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tax Configuration Switches */}
              <div className="space-y-4 border rounded-lg p-4">
                <h4 className="font-medium">Tax Configuration Options</h4>
                
                {/* Removed default configuration toggle - system now uses most recent active configuration */}

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Enable this tax configuration for use
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isTaxExempt"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Tax Exempt</FormLabel>
                        <FormDescription>
                          No tax will be applied with this configuration
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              // When tax exempt is enabled, set rate to 0 and disable price inclusive
                              form.setValue('taxRate', '0.00');
                              form.setValue('isPriceInclusive', false);
                            } else {
                              // When tax exempt is disabled, set a default rate if it's 0
                              const currentRate = form.getValues('taxRate');
                              if (currentRate === '0' || currentRate === '0.00') {
                                form.setValue('taxRate', '5.00');
                              }
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPriceInclusive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Tax Inclusive Pricing</FormLabel>
                        <FormDescription>
                          Tax is already included in the displayed menu prices
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={form.watch('isTaxExempt')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update Configuration' : 'Create Configuration')
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
