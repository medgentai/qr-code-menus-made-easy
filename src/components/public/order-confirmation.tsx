import React from 'react';
import { CheckCircle, ArrowLeft, Clock, Info, Receipt, Timer, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { OrderStatus } from '@/services/order-service';

interface OrderConfirmationProps {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  items: {
    name: string;
    quantity: number;
    price: string;
    notes?: string;
  }[];
  totalAmount: number;
  customerName: string;
  estimatedTime?: string;
  onBackToMenu: () => void;
  onTrackOrder?: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  orderNumber,
  status,
  items,
  customerName,
  estimatedTime = '15-20 minutes',
  onBackToMenu,
  onTrackOrder,
}) => {
  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.PREPARING:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case OrderStatus.READY:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case OrderStatus.SERVED:
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToMenu}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg h-8 px-2"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              <span className="text-sm">Back</span>
            </Button>
            <h1 className="text-base font-semibold text-gray-900">Order Receipt</h1>
            <div className="w-12" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-3 py-4">
        {/* Compact Receipt Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">

          {/* Compact Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-white">Order Confirmed</h2>
            </div>
            <p className="text-orange-100 text-sm">
              Thank you, <span className="font-semibold text-white">{customerName}</span>
            </p>
          </div>

          {/* Compact Order Info */}
          <div className="px-4 py-3 border-b border-orange-100 bg-orange-50/50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-orange-600 font-medium mb-1">Order #</p>
                <p className="text-sm font-bold text-orange-900">{orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-orange-600 font-medium mb-1">Status</p>
                <Badge className={`${getStatusColor()} text-xs px-2 py-0.5`}>
                  {status}
                </Badge>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-orange-700 bg-white/70 rounded px-2 py-1.5">
              <Clock className="h-3 w-3 text-orange-600" />
              <span className="text-xs">Est. time: <span className="font-semibold">{estimatedTime}</span></span>
            </div>
          </div>
          {/* Compact Order Items */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Order Details</h3>
              <div className="flex items-center gap-1 text-orange-600 bg-orange-50 rounded px-2 py-1">
                <Receipt className="h-3 w-3" />
                <span className="text-xs font-medium">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
              </div>
            </div>

            {/* Compact Items List */}
            <div className="space-y-0 border border-orange-200 rounded-lg overflow-hidden">
              {items.map((item, index) => (
                <div key={index} className={`${index !== items.length - 1 ? 'border-b border-orange-100' : ''}`}>
                  <div className="px-3 py-2.5 hover:bg-orange-50/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-xs font-bold text-white">{item.quantity}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</h4>
                            {item.notes && (
                              <p className="text-xs text-orange-600 mt-1 italic">{item.notes}</p>
                            )}
                            <div className="mt-1 text-xs text-orange-600">
                              {formatPrice(parseFloat(item.price))} × {item.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="font-bold text-gray-900 text-sm">
                          {formatPrice(parseFloat(item.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Compact Total with GST */}
            <div className="mt-3 space-y-1.5">
              {/* Calculate subtotal from items */}
              {(() => {
                const subtotal = items.reduce((total, item) => {
                  return total + (parseFloat(item.price) * item.quantity);
                }, 0);
                // No GST calculation
                const finalTotal = subtotal;

                return (
                  <>
                    <div className="flex justify-between items-center py-1 border-b border-orange-200">
                      <span className="text-gray-600 text-sm">Subtotal</span>
                      <span className="font-semibold text-gray-900 text-sm">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg px-3">
                      <span className="text-sm font-bold text-white">Total</span>
                      <span className="text-lg font-bold text-white">{formatPrice(finalTotal)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          {/* Compact Footer */}
          <div className="bg-orange-50 px-4 py-3 border-t border-orange-200">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-1 text-orange-700">
                <Star className="h-3 w-3 fill-current text-orange-500" />
                <span className="text-xs font-medium">Thank you for your order!</span>
                <Star className="h-3 w-3 fill-current text-orange-500" />
              </div>

              <div className="text-xs text-orange-600">
                <p>{new Date().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Action Buttons */}
        <div className="mt-4 space-y-3">
          {onTrackOrder && (
            <Button
              variant="outline"
              onClick={onTrackOrder}
              className="w-full h-10 rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 text-sm font-medium"
            >
              <Timer className="mr-2 h-4 w-4" />
              Track Order
            </Button>
          )}

          <Button
            onClick={onBackToMenu}
            className="w-full h-10 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 text-sm font-medium"
          >
            Continue Browsing
          </Button>
        </div>

        {/* Compact Info */}
        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-orange-700">
              <p className="font-medium mb-1">Order Status</p>
              <p>Your order is being prepared. You'll receive updates as it progresses.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
