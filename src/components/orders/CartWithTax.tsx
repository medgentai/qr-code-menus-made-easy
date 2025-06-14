import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Calculator, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TaxService } from '@/services/tax-service';
import { ServiceType, ServiceTypeLabels, OrderItemForTax } from '@/types/tax';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CartItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiersPrice?: number;
  notes?: string;
}

interface CartWithTaxProps {
  organizationId: string;
  items: CartItem[];
  onServiceTypeChange?: (serviceType: ServiceType) => void;
  onCheckout?: () => void;
  className?: string;
}

export const CartWithTax: React.FC<CartWithTaxProps> = ({
  organizationId,
  items,
  onServiceTypeChange,
  onCheckout,
  className = '',
}) => {
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.DINE_IN);

  // Convert cart items to tax calculation format
  const taxItems: OrderItemForTax[] = useMemo(() => {
    return items.map(item => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      modifiersPrice: item.modifiersPrice,
    }));
  }, [items]);

  // Calculate tax when items or service type changes
  const {
    data: taxCalculation,
    isLoading: isCalculatingTax,
    error: taxError,
    refetch: recalculateTax,
  } = useQuery({
    queryKey: ['cart-tax-calculation', organizationId, serviceType, taxItems],
    queryFn: () => TaxService.calculateTax({
      organizationId,
      serviceType,
      items: taxItems,
    }),
    enabled: items.length > 0 && !!organizationId,
    staleTime: 30000, // Cache for 30 seconds
  });

  const handleServiceTypeChange = (newServiceType: ServiceType) => {
    setServiceType(newServiceType);
    onServiceTypeChange?.(newServiceType);
  };

  const formatCurrency = (amount: number): string => {
    return TaxService.formatCurrency(amount);
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const modifiersTotal = item.modifiersPrice || 0;
      return sum + itemTotal + modifiersTotal;
    }, 0);
  }, [items]);

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground">Add some items to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({items.length} item{items.length !== 1 ? 's' : ''})
          </CardTitle>
          <Select value={serviceType} onValueChange={handleServiceTypeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ServiceTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`${item.menuItemId}-${index}`} className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium">
                  {item.quantity}x {item.name}
                </div>
                {item.notes && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Note: {item.notes}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(item.unitPrice)} each
                  {item.modifiersPrice && item.modifiersPrice > 0 && (
                    <span> + {formatCurrency(item.modifiersPrice)} modifiers</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatCurrency(item.quantity * item.unitPrice + (item.modifiersPrice || 0))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Tax Calculation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calculator className="h-4 w-4" />
            Order Summary
          </div>

          {isCalculatingTax ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Separator />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          ) : taxError ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to calculate tax. Using subtotal only.
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto ml-2"
                  onClick={() => recalculateTax()}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : taxCalculation ? (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-mono">{formatCurrency(taxCalculation.subtotalAmount)}</span>
              </div>

              {taxCalculation.taxBreakdown.isTaxExempt ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="text-muted-foreground">Exempt</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax ({TaxService.formatTaxRate(taxCalculation.taxBreakdown.taxRate)}):
                  </span>
                  <span className="font-mono">{formatCurrency(taxCalculation.taxAmount)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span className="font-mono">{formatCurrency(taxCalculation.totalAmount)}</span>
              </div>

              {taxCalculation.taxBreakdown.isPriceInclusive && (
                <div className="text-xs text-muted-foreground">
                  * Tax inclusive pricing
                </div>
              )}

              {taxCalculation.displayMessage && (
                <div className="text-xs text-muted-foreground">
                  {taxCalculation.displayMessage}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Tax will be calculated at checkout
              </div>
            </div>
          )}
        </div>

        {/* Service Type Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Service Type:</span>
          <Badge variant="outline" className="text-xs">
            {ServiceTypeLabels[serviceType]}
          </Badge>
        </div>

        {/* Checkout Button */}
        {onCheckout && (
          <Button 
            onClick={onCheckout} 
            className="w-full" 
            disabled={items.length === 0}
          >
            Proceed to Checkout
            {taxCalculation && (
              <span className="ml-2">
                {formatCurrency(taxCalculation.totalAmount)}
              </span>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
