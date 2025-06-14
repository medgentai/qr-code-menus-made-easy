import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { Order } from '@/services/order-service';
import { TaxService } from '@/services/tax-service';
import { TaxTypeLabels, ServiceTypeLabels } from '@/types/tax';

interface OrderReceiptProps {
  order: Order;
  organizationName?: string;
  organizationAddress?: string;
  showActions?: boolean;
  className?: string;
}

export const OrderReceipt: React.FC<OrderReceiptProps> = ({
  order,
  organizationName = 'Restaurant Name',
  organizationAddress,
  showActions = true,
  className = '',
}) => {
  const formatCurrency = (amount: string | number | undefined): string => {
    if (!amount) return TaxService.formatCurrency(0);
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return TaxService.formatCurrency(num);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a new window with the receipt content for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - Order #${order.id.substring(0, 8)}</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .order-info { margin-bottom: 20px; }
              .items { margin-bottom: 20px; }
              .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .totals { border-top: 1px solid #ccc; padding-top: 10px; }
              .total-line { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .final-total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #000; padding-top: 5px; }
              .tax-info { margin-top: 15px; font-size: 0.9em; color: #666; }
            </style>
          </head>
          <body>
            ${printWindow.document.getElementById('receipt-content')?.innerHTML || ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card className={`max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">Receipt</CardTitle>
        {showActions && (
          <div className="flex gap-2 justify-center print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent id="receipt-content">
        {/* Organization Header */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold">{organizationName}</h2>
          {organizationAddress && (
            <p className="text-sm text-muted-foreground">{organizationAddress}</p>
          )}
        </div>

        <Separator className="mb-4" />

        {/* Order Information */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Order #:</span>
            <span className="font-mono">{order.id.substring(0, 8)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Date:</span>
            <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Time:</span>
            <span>{format(new Date(order.createdAt), 'h:mm a')}</span>
          </div>
          {order.table && (
            <div className="flex justify-between text-sm">
              <span>Table:</span>
              <span>{order.table.name}</span>
            </div>
          )}
          {order.customerName && (
            <div className="flex justify-between text-sm">
              <span>Customer:</span>
              <span>{order.customerName}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Status:</span>
            <Badge variant="outline" className="text-xs">
              {order.status}
            </Badge>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Order Items */}
        <div className="space-y-3 mb-4">
          <h3 className="font-medium">Items</h3>
          {order.items?.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex justify-between">
                <div className="flex-1">
                  <span className="font-medium">{item.quantity}x </span>
                  <span>{item.menuItem?.name}</span>
                </div>
                <span className="font-mono text-sm">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
              
              {item.modifiers && item.modifiers.length > 0 && (
                <div className="ml-6 space-y-1">
                  {item.modifiers.map((mod) => (
                    <div key={mod.id} className="flex justify-between text-xs text-muted-foreground">
                      <span>+ {mod.modifier?.name}</span>
                      <span className="font-mono">
                        {formatCurrency(mod.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {item.notes && (
                <div className="ml-6 text-xs text-muted-foreground">
                  Note: {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator className="mb-4" />

        {/* Order Totals */}
        <div className="space-y-2">
          {order.subtotalAmount && (
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrency(order.subtotalAmount)}</span>
            </div>
          )}

          {/* Tax Information */}
          {order.isTaxExempt ? (
            <div className="flex justify-between text-sm">
              <span>Tax:</span>
              <span className="text-muted-foreground">Exempt</span>
            </div>
          ) : order.taxAmount && parseFloat(order.taxAmount) > 0 ? (
            <div className="flex justify-between text-sm">
              <span>
                Tax ({order.taxRate ? `${order.taxRate.toFixed(2)}%` : '0%'}):
              </span>
              <span className="font-mono">{formatCurrency(order.taxAmount)}</span>
            </div>
          ) : null}

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="font-mono">{formatCurrency(order.totalAmount)}</span>
          </div>

          {order.isPriceInclusive && (
            <div className="text-xs text-muted-foreground text-center">
              * Tax inclusive pricing
            </div>
          )}
        </div>

        {/* Tax Details */}
        {(order.taxType || order.serviceType) && (
          <>
            <Separator className="my-4" />
            <div className="space-y-1 text-xs text-muted-foreground">
              <h4 className="font-medium text-foreground">Tax Details</h4>
              {order.taxType && (
                <div className="flex justify-between">
                  <span>Tax Type:</span>
                  <span>{TaxTypeLabels[order.taxType as keyof typeof TaxTypeLabels] || order.taxType}</span>
                </div>
              )}
              {order.serviceType && (
                <div className="flex justify-between">
                  <span>Service Type:</span>
                  <span>{ServiceTypeLabels[order.serviceType as keyof typeof ServiceTypeLabels] || order.serviceType}</span>
                </div>
              )}
              {order.isTaxExempt && (
                <div className="text-center mt-2">
                  <Badge variant="outline" className="text-xs">Tax Exempt Order</Badge>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Thank you for your business!
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(), 'PPP')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
