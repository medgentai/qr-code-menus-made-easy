import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, MapPin, Clock, CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { OrderStatus, OrderPaymentStatus } from '@/services/order-service';

interface ActiveOrder {
  orderId: string;
  tableId: string;
  tableName: string;
  venueName: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  createdAt: string;
  totalAmount: number;
}

interface TableChangeConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  currentOrders: ActiveOrder[];
  newTable: {
    tableId: string;
    tableName: string;
    venueName?: string;
  };
  customerPhone: string;
}

const TableChangeConfirmationDialog: React.FC<TableChangeConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  currentOrders,
  newTable,
  customerPhone,
}) => {
  const formatOrderStatus = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.CONFIRMED:
        return 'Confirmed';
      case OrderStatus.PREPARING:
        return 'Preparing';
      case OrderStatus.READY:
        return 'Ready';
      case OrderStatus.SERVED:
        return 'Served';
      default:
        return status;
    }
  };

  const formatPaymentStatus = (status: OrderPaymentStatus) => {
    switch (status) {
      case OrderPaymentStatus.UNPAID:
        return 'Unpaid';
      case OrderPaymentStatus.PAID:
        return 'Paid';
      case OrderPaymentStatus.PARTIALLY_PAID:
        return 'Partially Paid';
      case OrderPaymentStatus.REFUNDED:
        return 'Refunded';
      default:
        return status;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'text-yellow-600';
      case OrderStatus.CONFIRMED:
        return 'text-blue-600';
      case OrderStatus.PREPARING:
        return 'text-orange-600';
      case OrderStatus.READY:
        return 'text-green-600';
      case OrderStatus.SERVED:
        return 'text-purple-600';
      case OrderStatus.COMPLETED:
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPaymentStatusColor = (status: OrderPaymentStatus) => {
    switch (status) {
      case OrderPaymentStatus.PAID:
        return 'text-green-600';
      case OrderPaymentStatus.UNPAID:
        return 'text-red-600';
      case OrderPaymentStatus.PARTIALLY_PAID:
        return 'text-yellow-600';
      case OrderPaymentStatus.REFUNDED:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Table Change Detected
          </DialogTitle>
          <DialogDescription>
            You have active orders at other tables. Please review before proceeding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Orders */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Your Active Orders:</h4>
            <div className="space-y-2">
              {currentOrders.map((order) => (
                <div key={order.orderId} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{order.tableName}</span>
                        <span className="text-xs text-gray-500">({order.venueName})</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className={getStatusColor(order.status)}>
                            {formatOrderStatus(order.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          <span className={getPaymentStatusColor(order.paymentStatus)}>
                            {formatPaymentStatus(order.paymentStatus)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatPrice(order.totalAmount)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Table */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Switching to:</h4>
            <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">{newTable.tableName}</span>
                {newTable.venueName && (
                  <span className="text-xs text-blue-700">({newTable.venueName})</span>
                )}
              </div>
            </div>
          </div>

          {/* Warning */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              <strong>Important:</strong> You can only place new orders after your current orders are served and paid. 
              However, you can continue adding items to existing orders from the same table.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Stay at Current Table
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Switch to {newTable.tableName}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TableChangeConfirmationDialog;
