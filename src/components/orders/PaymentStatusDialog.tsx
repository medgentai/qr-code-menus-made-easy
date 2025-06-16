import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard } from 'lucide-react';
import { Order, PaymentMethod, OrderPaymentStatus, OrderStatus, MarkOrderPaidDto, MarkOrderUnpaidDto } from '@/services/order-service';
import OrderService from '@/services/order-service';
import { useUpdatePaymentStatusMutation } from '@/hooks/useOrderQuery';
import { toast } from 'sonner';

interface PaymentStatusDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentStatusChanged: (updatedOrder: Order) => void;
}

export const PaymentStatusDialog: React.FC<PaymentStatusDialogProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentStatusChanged,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [unpaidReason, setUnpaidReason] = useState('');

  const updatePaymentStatusMutation = useUpdatePaymentStatusMutation();

  const handleMarkAsPaid = () => {
    if (!order) return;

    const paymentData: MarkOrderPaidDto = {
      paymentMethod: selectedPaymentMethod,
      paymentNotes: paymentNotes.trim() || undefined,
    };

    updatePaymentStatusMutation.mutate(
      { id: order.id, isPaid: true, data: paymentData },
      {
        onSuccess: (updatedOrder) => {
          onPaymentStatusChanged(updatedOrder);
          toast.success('Order marked as paid successfully');
          onClose();
        },
        onError: (error: any) => {
          console.error('Error marking order as paid:', error);
          // Don't show toast here - the mutation already handles error toasts
        }
      }
    );
  };

  const handleMarkAsUnpaid = () => {
    if (!order) return;

    const unpaidData: MarkOrderUnpaidDto = {
      reason: unpaidReason.trim() || undefined,
    };

    updatePaymentStatusMutation.mutate(
      { id: order.id, isPaid: false, data: unpaidData },
      {
        onSuccess: (updatedOrder) => {
          onPaymentStatusChanged(updatedOrder);
          toast.success('Order marked as unpaid');
          onClose();
        },
        onError: (error: any) => {
          console.error('Error marking order as unpaid:', error);
          // Don't show toast here - the mutation already handles error toasts
        }
      }
    );
  };

  const resetForm = () => {
    setSelectedPaymentMethod(PaymentMethod.CASH);
    setPaymentNotes('');
    setUnpaidReason('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!order) return null;

  const isPaid = order.paymentStatus === OrderPaymentStatus.PAID;
  const isCancelled = order.status === OrderStatus.CANCELLED;

  // Don't allow payment actions on cancelled orders
  if (isCancelled) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Status - Order #{order.id.substring(0, 8)}
            </DialogTitle>
            <DialogDescription>
              This order has been cancelled and cannot be processed for payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center">
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                  Order Cancelled
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Cancelled orders do not require payment processing.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Status - Order #{order.id.substring(0, 8)}
          </DialogTitle>
          <DialogDescription>
            Manage the payment status for this order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Payment Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Current Status</Label>
            <div className="flex items-center gap-3">
              <Badge className={OrderService.getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus === OrderPaymentStatus.PAID ? 'PAID' : 'UNPAID'}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {OrderService.formatCurrency(order.totalAmount)}
              </div>
            </div>
          </div>

          {/* Payment Details (if paid) */}
          {isPaid && (
            <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <Label className="text-sm font-medium text-green-800">Payment Confirmed</Label>
              <div className="space-y-2 text-sm">
                {order.paymentMethod && (
                  <div>Method: {OrderService.getPaymentMethodDisplayName(order.paymentMethod)}</div>
                )}
                {order.paidAt && (
                  <div>Paid: {new Date(order.paidAt).toLocaleString()}</div>
                )}
              </div>
            </div>
          )}

          {/* Payment Form */}
          {!isPaid ? (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Mark as Paid</Label>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="paymentMethod" className="text-sm">Payment Method</Label>
                  <Select value={selectedPaymentMethod} onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PaymentMethod).map((method) => (
                        <SelectItem key={method} value={method}>
                          {OrderService.getPaymentMethodDisplayName(method)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>



                <div>
                  <Label htmlFor="paymentNotes" className="text-sm">Notes (optional)</Label>
                  <Textarea
                    id="paymentNotes"
                    placeholder="Add any payment notes..."
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Mark as Unpaid</Label>
              <div>
                <Label htmlFor="unpaidReason" className="text-sm">Reason (optional)</Label>
                <Textarea
                  id="unpaidReason"
                  placeholder="Reason for marking as unpaid..."
                  value={unpaidReason}
                  onChange={(e) => setUnpaidReason(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={updatePaymentStatusMutation.isPending}>
            Cancel
          </Button>
          {!isPaid ? (
            <Button onClick={handleMarkAsPaid} disabled={updatePaymentStatusMutation.isPending}>
              {updatePaymentStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark as Paid
            </Button>
          ) : (
            <Button variant="destructive" onClick={handleMarkAsUnpaid} disabled={updatePaymentStatusMutation.isPending}>
              {updatePaymentStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark as Unpaid
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
