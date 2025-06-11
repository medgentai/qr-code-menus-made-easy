import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, DollarSign } from 'lucide-react';
import { PlanEntity, PlanFormData } from '@/types/plan-management';
import { OrganizationType } from '@/types/organization';

interface PlanFormProps {
  plan?: PlanEntity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PlanFormData) => void;
  isLoading?: boolean;
}

export function PlanForm({ plan, open, onOpenChange, onSubmit, isLoading }: PlanFormProps) {
  const isEditing = !!plan;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PlanFormData>({
    defaultValues: {
      name: '',
      description: '',
      organizationType: OrganizationType.RESTAURANT,
      monthlyPrice: '',
      annualPrice: '',
      features: [''],
      venuesIncluded: '1',
      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  });



  // Reset form when plan changes
  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name,
        description: plan.description || '',
        organizationType: plan.organizationType,
        monthlyPrice: plan.monthlyPrice.toString(),
        annualPrice: plan.annualPrice.toString(),
        features: plan.features.length > 0 ? plan.features : [''],
        venuesIncluded: plan.venuesIncluded.toString(),
        isActive: plan.isActive,
      });
    } else {
      reset({
        name: '',
        description: '',
        organizationType: OrganizationType.RESTAURANT,
        monthlyPrice: '',
        annualPrice: '',
        features: [''],
        venuesIncluded: '1',
        isActive: true,
      });
    }
  }, [plan, reset]);

  const handleFormSubmit = (data: PlanFormData) => {
    // Filter empty features and keep prices as rupees
    const processedData = {
      ...data,
      monthlyPrice: data.monthlyPrice,
      annualPrice: data.annualPrice,
      features: data.features.filter(feature => feature.trim() !== ''),
    };
    onSubmit(processedData);
  };

  const addFeature = () => {
    append('');
  };

  const removeFeature = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Plan' : 'Create New Plan'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the plan details and pricing configuration.'
              : 'Create a new pricing plan for organizations.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Plan name is required' })}
                    placeholder="e.g., Premium Restaurant Plan"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationType">Organization Type *</Label>
                  <Select
                    value={watch('organizationType')}
                    onValueChange={(value) => setValue('organizationType', value as OrganizationType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrganizationType.RESTAURANT}>Restaurant</SelectItem>
                      <SelectItem value={OrganizationType.HOTEL}>Hotel</SelectItem>
                      <SelectItem value={OrganizationType.CAFE}>Cafe</SelectItem>
                      <SelectItem value={OrganizationType.FOOD_TRUCK}>Food Truck</SelectItem>
                      <SelectItem value={OrganizationType.BAR}>Bar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe what this plan offers..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="monthlyPrice">Monthly Price (₹) *</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    step="0.01"
                    {...register('monthlyPrice', { 
                      required: 'Monthly price is required',
                      min: { value: 0, message: 'Price must be positive' }
                    })}
                    placeholder="799.00"
                  />
                  {errors.monthlyPrice && (
                    <p className="text-sm text-destructive">{errors.monthlyPrice.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualPrice">Annual Price (₹) *</Label>
                  <Input
                    id="annualPrice"
                    type="number"
                    step="0.01"
                    {...register('annualPrice', {
                      required: 'Annual price is required',
                      min: { value: 0, message: 'Price must be positive' }
                    })}
                    placeholder="17988.00"
                  />
                  {errors.annualPrice && (
                    <p className="text-sm text-destructive">{errors.annualPrice.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venuesIncluded">Venues Included *</Label>
                <Input
                  id="venuesIncluded"
                  type="number"
                  min="1"
                  {...register('venuesIncluded', { 
                    required: 'Number of venues is required',
                    min: { value: 1, message: 'Must include at least 1 venue' }
                  })}
                  placeholder="1"
                />
                {errors.venuesIncluded && (
                  <p className="text-sm text-destructive">{errors.venuesIncluded.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Plan Features</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Feature
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`features.${index}` as const)}
                    placeholder="Enter a feature..."
                    className="flex-1"
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isActive">Plan Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Active plans are visible to customers
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={watch('isActive')}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                  />
                  <Badge variant={watch('isActive') ? 'default' : 'secondary'}>
                    {watch('isActive') ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
