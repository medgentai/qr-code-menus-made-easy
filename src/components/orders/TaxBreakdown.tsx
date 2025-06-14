import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Info, Receipt } from 'lucide-react';
import { Order } from '@/services/order-service';
import { TaxService } from '@/services/tax-service';
import { TaxTypeLabels, ServiceTypeLabels } from '@/types/tax';

interface TaxBreakdownProps {
  order: Order;
  showCard?: boolean;
  className?: string;
}

export const TaxBreakdown: React.FC<TaxBreakdownProps> = ({ 
  order, 
  showCard = true, 
  className = '' 
}) => {
  const formatCurrency = (amount: string | number | undefined): string => {
    if (!amount) return TaxService.formatCurrency(0);
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return TaxService.formatCurrency(num);
  };

  const getTaxDisplayInfo = () => {
    if (order.isTaxExempt) {
      return {
        badge: <Badge variant="outline">Tax Exempt</Badge>,
        message: 'This order is exempt from tax charges',
        showBreakdown: false,
      };
    }

    if (order.isPriceInclusive) {
      return {
        badge: <Badge variant="secondary">Tax Inclusive</Badge>,
        message: 'Tax is included in the item prices',
        showBreakdown: true,
      };
    }

    return {
      badge: <Badge variant="default">Tax Applied</Badge>,
      message: 'Tax calculated and added to order total',
      showBreakdown: true,
    };
  };

  const taxInfo = getTaxDisplayInfo();

  const content = (
    <div className={`space-y-4 ${className}`}>
      {/* Tax Status and Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Tax Information</span>
        </div>
        {taxInfo.badge}
      </div>

      {/* Tax Details */}
      {order.taxType && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Tax Type:</span>
            <div className="font-medium">
              {order.taxType && TaxTypeLabels[order.taxType as keyof typeof TaxTypeLabels] || order.taxType}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Service Type:</span>
            <div className="font-medium">
              {order.serviceType && ServiceTypeLabels[order.serviceType as keyof typeof ServiceTypeLabels] || 'Standard'}
            </div>
          </div>
          {!order.isTaxExempt && (
            <>
              <div>
                <span className="text-muted-foreground">Tax Rate:</span>
                <div className="font-medium font-mono">
                  {order.taxRate ? TaxService.formatTaxRate(order.taxRate) : '0.00%'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Tax Amount:</span>
                <div className="font-medium font-mono">
                  {formatCurrency(order.taxAmount)}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tax Breakdown */}
      {taxInfo.showBreakdown && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Order Breakdown</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {order.isPriceInclusive ? 'Total (Tax Inclusive):' : 'Subtotal:'}
                </span>
                <span className="font-mono">
                  {formatCurrency(order.subtotalAmount || order.totalAmount)}
                </span>
              </div>
              
              {!order.isTaxExempt && !order.isPriceInclusive && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax ({order.taxRate ? TaxService.formatTaxRate(order.taxRate) : '0%'}):
                  </span>
                  <span className="font-mono">
                    {formatCurrency(order.taxAmount)}
                  </span>
                </div>
              )}

              {order.isPriceInclusive && !order.isTaxExempt && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    (Includes tax of {order.taxRate ? TaxService.formatTaxRate(order.taxRate) : '0%'}:
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {formatCurrency(order.taxAmount)})
                  </span>
                </div>
              )}
              
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Amount:</span>
                <span className="font-mono">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tax Message */}
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          {taxInfo.message}
          {order.taxType && ` Tax type: ${TaxTypeLabels[order.taxType as keyof typeof TaxTypeLabels] || order.taxType}.`}
        </p>
      </div>
    </div>
  );

  if (showCard) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tax Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
};

// Simplified tax summary for inline display
interface TaxSummaryProps {
  order: Order;
  className?: string;
}

export const TaxSummary: React.FC<TaxSummaryProps> = ({ order, className = '' }) => {
  const formatCurrency = (amount: string | number | undefined): string => {
    if (!amount) return TaxService.formatCurrency(0);
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return TaxService.formatCurrency(num);
  };

  if (order.isTaxExempt) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        <Badge variant="outline" className="mr-2">Tax Exempt</Badge>
        No tax applied to this order
      </div>
    );
  }

  return (
    <div className={`space-y-1 text-sm ${className}`}>
      {order.subtotalAmount && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-mono">{formatCurrency(order.subtotalAmount)}</span>
        </div>
      )}
      
      {!order.isTaxExempt && order.taxAmount && parseFloat(order.taxAmount) > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Tax ({order.taxRate ? TaxService.formatTaxRate(order.taxRate) : '0%'}):
          </span>
          <span className="font-mono">{formatCurrency(order.taxAmount)}</span>
        </div>
      )}
      
      <div className="flex justify-between font-medium border-t pt-1">
        <span>Total:</span>
        <span className="font-mono">{formatCurrency(order.totalAmount)}</span>
      </div>
      
      {order.isPriceInclusive && (
        <div className="text-xs text-muted-foreground">
          * Tax inclusive pricing
        </div>
      )}
    </div>
  );
};
