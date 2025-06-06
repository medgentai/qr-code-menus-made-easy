import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Clock, Info, Leaf, Wheat, Flame, Search, X, Plus, Minus, ShoppingCart, Menu, Receipt, ArrowLeft } from 'lucide-react';
import { usePublicMenu } from '@/contexts/public-menu-context';
import { useCart } from '@/contexts/cart-context';
import { MenuItem } from '@/services/menu-service';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SpicyLevelLabels } from '@/types/menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import CheckoutForm from '@/components/public/checkout-form';
import OrderConfirmation from '@/components/public/order-confirmation';
import TrackOrder from '@/components/public/track-order';
import { OrderStatus } from '@/services/order-service';
import { publicOrderService, CreatePublicOrderDto } from '@/services/public-order-service';

// View states for the public menu
enum ViewState {
  MENU = 'menu',
  CART = 'cart',
  CHECKOUT = 'checkout',
  CONFIRMATION = 'confirmation',
  TRACK_ORDER = 'track_order',
}

// Footer navigation tabs
enum FooterTab {
  MENU = 'menu',
  CART = 'cart',
  TRACK = 'track',
}

// Mobile Header Component
interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightAction?: React.ReactNode;
  subtitle?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBackButton = false,
  onBackClick,
  rightAction,
  subtitle
}) => (
  <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackClick}
            className="h-9 w-9 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-900 transition-colors">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 transition-colors">{subtitle}</p>
          )}
        </div>
      </div>
      {rightAction && (
        <div className="flex items-center">
          {rightAction}
        </div>
      )}
    </div>
  </div>
);

// Loading Spinner Component
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-primary`} />
  );
};

const PublicMenu: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');
  const venueId = searchParams.get('venue');

  const { menu, isLoading, error, activeCategory, setActiveCategory, loadMenuByOrganizationSlug } = usePublicMenu();
  const {
    items,
    addItem,
    clearCart,
    setCustomerName,
    setCustomerEmail,
    setCustomerPhone,
    setTableId: setCartTableId,
    setRoomNumber,
    setPartySize,
    totalAmount,
    totalItems,
    removeItem,
    updateQuantity
  } = useCart();

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [viewState, setViewState] = useState<ViewState>(ViewState.MENU);
  const [activeFooterTab, setActiveFooterTab] = useState<FooterTab>(FooterTab.MENU);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    orderItems: {
      name: string;
      quantity: number;
      price: string;
      notes?: string;
    }[];
    orderTotal: number;
    customerName: string;
  } | null>(null);

  useEffect(() => {
    if (slug) {
      loadMenuByOrganizationSlug(slug, tableId || undefined, venueId || undefined);
    }
  }, [slug, tableId, venueId, loadMenuByOrganizationSlug]);

  useEffect(() => {
    // Set table ID in cart context if available
    if (tableId) {
      setCartTableId(tableId);
    }

    // Use venue ID from URL if available
  }, [tableId, venueId, setCartTableId]);

  useEffect(() => {
    if (menu && menu.categories) {
      const allItems: MenuItem[] = [];
      menu.categories.forEach(category => {
        if (category.items) {
          allItems.push(...category.items);
        }
      });

      if (searchQuery.trim() !== '') {
        const filtered = allItems.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredItems(filtered);
      } else {
        setFilteredItems([]);
      }
    }
  }, [searchQuery, menu]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setItemQuantity(1);
    setItemNotes('');
  };

  const handleSearchFocus = () => {
    setIsSearching(true);
    setActiveCategory(null);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    if (menu?.categories && menu.categories.length > 0) {
      setActiveCategory(menu.categories[0].id);
    }
  };

  const handleAddToCart = async () => {
    if (selectedItem && !isAddingToCart) {
      setIsAddingToCart(true);

      // Add a small delay for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 300));

      addItem(selectedItem, itemQuantity, itemNotes);
      toast.success(`Added ${itemQuantity} ${selectedItem.name} to cart`);
      setSelectedItem(null);
      setIsAddingToCart(false);
    }
  };

  // Handle footer tab changes
  const handleFooterTabChange = (tab: FooterTab) => {
    setActiveFooterTab(tab);
    if (tab === FooterTab.MENU) {
      setViewState(ViewState.MENU);
    } else if (tab === FooterTab.CART) {
      setViewState(ViewState.CART);
    } else if (tab === FooterTab.TRACK) {
      setViewState(ViewState.TRACK_ORDER);
    }
  };

  const handleCheckout = () => {
    setViewState(ViewState.CHECKOUT);
  };

  const handleBackToMenu = () => {
    setViewState(ViewState.MENU);
    setActiveFooterTab(FooterTab.MENU);
  };

  const handleTrackOrder = () => {
    setViewState(ViewState.TRACK_ORDER);
    setActiveFooterTab(FooterTab.TRACK);
  };

  const handlePlaceOrder = async (formData: {
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    roomNumber?: string;
    partySize?: number;
    notes?: string;
  }) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update customer info in cart context
      setCustomerName(formData.customerName);
      setCustomerEmail(formData.customerEmail || '');
      setCustomerPhone(formData.customerPhone);
      setRoomNumber(formData.roomNumber || '');
      setPartySize(formData.partySize);

      // Create public order DTO
      const orderData: CreatePublicOrderDto = {
        tableId: tableId || undefined,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone,
        roomNumber: formData.roomNumber || undefined,
        partySize: formData.partySize,
        notes: formData.notes || undefined,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes || undefined,
          modifiers: item.modifiers || undefined,
        })),
      };

      // Submit order - the backend will extract the venueId from the tableId if needed
      const response = await publicOrderService.createOrder(orderData);

      // Save order items and total before clearing cart
      const orderItems = items.map(item => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.menuItem.price,
        notes: item.notes,
      }));

      // Set confirmed order with saved items and total
      setConfirmedOrder({
        id: response.id,
        orderNumber: response.id.substring(0, 8).toUpperCase(),
        status: response.status,
        orderItems: orderItems,
        orderTotal: totalAmount,
        customerName: formData.customerName,
      });

      // Clear cart
      clearCart();

      // Show confirmation
      setViewState(ViewState.CONFIRMATION);

    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state when initially loading or when menu is not yet loaded
  if (isLoading || (!menu && !error)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Loading Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-sm text-gray-600">Loading menu...</span>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex-1 p-4">
          <div className="container mx-auto max-w-md">
            <Skeleton className="h-20 w-full mb-4 rounded-xl" />
            <Skeleton className="h-12 w-full mb-4 rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only show error state when there's actually an error AND not loading
  if (error || (!isLoading && !menu)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h1 className="text-xl font-bold text-red-600 mb-3">Menu Not Found</h1>
            <p className="text-gray-600 mb-4 text-sm">
              Sorry, we couldn't find the menu you're looking for.
            </p>
            <p className="text-xs text-gray-500">
              Please check the URL or scan the QR code again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render different views based on the current state
  if (viewState === ViewState.CHECKOUT) {
    return (
      <CheckoutForm
        venueId={venueId || ''}
        tableId={tableId}
        tableCapacity={menu?.table?.capacity}
        onBack={handleBackToMenu}
        onSubmit={handlePlaceOrder}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (viewState === ViewState.CONFIRMATION && confirmedOrder) {
    return (
      <OrderConfirmation
        orderId={confirmedOrder.id}
        orderNumber={confirmedOrder.orderNumber}
        status={confirmedOrder.status}
        items={confirmedOrder.orderItems}
        totalAmount={confirmedOrder.orderTotal}
        customerName={confirmedOrder.customerName}
        onBackToMenu={handleBackToMenu}
        onTrackOrder={handleTrackOrder}
      />
    );
  }

  if (viewState === ViewState.TRACK_ORDER) {
    return (
      <TrackOrder onBackToMenu={handleBackToMenu} />
    );
  }

  if (viewState === ViewState.CART) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 animate-in fade-in duration-300">
        {/* Mobile Header */}
        <MobileHeader
          title="Your Cart"
          subtitle={`${items.length} ${items.length === 1 ? 'item' : 'items'} • ${formatPrice(totalAmount)}`}
          showBackButton={true}
          onBackClick={() => handleFooterTabChange(FooterTab.MENU)}
          rightAction={
            items.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearCart()}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            ) : null
          }
        />

        <div className="container mx-auto px-4 py-4 max-w-md">

          {/* Cart Items */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="bg-white rounded-xl p-8 text-center shadow-sm max-w-sm">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Your cart is empty</h3>
                <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                  Looks like you haven't added any items to your cart yet. Browse our delicious menu to get started!
                </p>
                <Button
                  onClick={() => handleFooterTabChange(FooterTab.MENU)}
                  className="rounded-full px-8 py-3 text-base font-medium"
                  size="lg"
                >
                  Browse Menu
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {items.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.menuItem.name}</h3>
                      {item.notes && (
                        <p className="text-xs text-gray-500 mt-1">Note: {item.notes}</p>
                      )}
                    </div>
                    <div className="text-lg font-bold text-primary ml-2">
                      {formatPrice((parseFloat(item.menuItem.price) * item.quantity).toString())}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Checkout Section */}
          {items.length > 0 && (
            <div className="space-y-3">
              {/* Continue Shopping Button */}
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => handleFooterTabChange(FooterTab.MENU)}
              >
                Continue Shopping
              </Button>

              {/* Checkout Card */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(totalAmount)}</span>
                </div>
                <Button
                  className="w-full rounded-full"
                  size="lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Ensure menu is loaded before rendering
  if (!menu) {
    return null;
  }

  const activeItems = isSearching
    ? filteredItems
    : activeCategory
      ? menu.categories?.find(c => c.id === activeCategory)?.items || []
      : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-16 animate-in fade-in duration-300">
      {/* Mobile Header */}
      <MobileHeader
        title={menu.name}
        subtitle={menu.organization?.name}
        rightAction={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFooterTabChange(FooterTab.TRACK)}
            className="h-9 w-9 rounded-full hover:bg-gray-100 transition-all duration-200"
          >
            <Receipt className="h-5 w-5" />
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-4 max-w-md">
        {/* Restaurant Info Card */}
        {menu.description && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <p className="text-gray-600 text-sm leading-relaxed">{menu.description}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search menu items..."
              className="pl-10 pr-10 rounded-xl border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={clearSearch}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation */}
        {!isSearching && menu.categories && menu.categories.length > 0 && (
          <ScrollArea className="w-full whitespace-nowrap mb-4">
            <div className="flex space-x-2 pb-2">
              {menu.categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryClick(category.id)}
                  className="flex-shrink-0 rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Search Results */}
        {isSearching && (
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2">
              {filteredItems.length > 0
                ? `Search Results (${filteredItems.length})`
                : 'No items found'}
            </h2>
            {searchQuery && filteredItems.length === 0 && (
              <p className="text-gray-500 text-sm">
                No items match your search. Try a different term or browse by category.
              </p>
            )}
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-3">
          {activeItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex">
                {item.imageUrl && (
                  <div className="w-20 h-20 flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-l-xl"
                    />
                  </div>
                )}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</h3>
                    <div className="ml-2 flex-shrink-0">
                      {item.discountPrice ? (
                        <div className="text-right">
                          <div className="text-primary font-bold text-sm">{formatPrice(item.discountPrice)}</div>
                          <div className="text-xs line-through text-gray-400">{formatPrice(item.price)}</div>
                        </div>
                      ) : (
                        <div className="text-primary font-bold text-sm">{formatPrice(item.price)}</div>
                      )}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2 leading-relaxed">{item.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {item.isVegetarian && (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-1.5 py-0.5">
                        <Leaf className="h-2.5 w-2.5 mr-1" /> Veg
                      </Badge>
                    )}
                    {item.isVegan && (
                      <Badge variant="outline" className="text-green-700 border-green-700 text-xs px-1.5 py-0.5">
                        <Leaf className="h-2.5 w-2.5 mr-1" /> Vegan
                      </Badge>
                    )}
                    {item.isGlutenFree && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600 text-xs px-1.5 py-0.5">
                        <Wheat className="h-2.5 w-2.5 mr-1" /> GF
                      </Badge>
                    )}
                    {item.preparationTime && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs px-1.5 py-0.5">
                        <Clock className="h-2.5 w-2.5 mr-1" /> {item.preparationTime}m
                      </Badge>
                    )}
                    {item.spicyLevel && item.spicyLevel > 0 && (
                      <Badge variant="outline" className="text-red-600 border-red-600 text-xs px-1.5 py-0.5">
                        <Flame className="h-2.5 w-2.5 mr-1" /> {SpicyLevelLabels[item.spicyLevel]}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Item Detail Sheet */}
        <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full">
            <SheetHeader className="p-6 pb-4 border-b">
              <SheetTitle className="text-left">{selectedItem?.name}</SheetTitle>
              <SheetDescription className="text-left">
                {selectedItem?.description}
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1 px-6">
              <div className="py-4 space-y-4">
                {selectedItem?.imageUrl && (
                  <div className="rounded-xl overflow-hidden">
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="font-medium">Price</span>
                  <div className="text-lg font-semibold">
                    {selectedItem?.discountPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-primary">{formatPrice(selectedItem.discountPrice)}</span>
                        <span className="text-sm line-through text-gray-400">{formatPrice(selectedItem?.price)}</span>
                      </div>
                    ) : (
                      <span className="text-primary">{formatPrice(selectedItem?.price)}</span>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-2">
                  {selectedItem?.preparationTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedItem.preparationTime} min prep time</span>
                    </div>
                  )}

                  {selectedItem?.calories && (
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedItem.calories} calories</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedItem?.isVegetarian && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Leaf className="h-3 w-3 mr-1" /> Vegetarian
                    </Badge>
                  )}

                  {selectedItem?.isVegan && (
                    <Badge variant="outline" className="text-green-700 border-green-700">
                      <Leaf className="h-3 w-3 mr-1" /> Vegan
                    </Badge>
                  )}

                  {selectedItem?.isGlutenFree && (
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      <Wheat className="h-3 w-3 mr-1" /> Gluten Free
                    </Badge>
                  )}

                  {selectedItem?.spicyLevel && selectedItem.spicyLevel > 0 && (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      <Flame className="h-3 w-3 mr-1" /> {SpicyLevelLabels[selectedItem.spicyLevel]} Spicy
                    </Badge>
                  )}
                </div>

                {selectedItem?.allergens && (
                  <div>
                    <h4 className="font-medium mb-1">Allergens</h4>
                    <p className="text-sm text-gray-600">{selectedItem.allergens}</p>
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Quantity</h4>
                    <div className="flex items-center justify-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                        className="h-10 w-10 rounded-full"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-6 w-8 text-center font-semibold text-lg">{itemQuantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setItemQuantity(itemQuantity + 1)}
                        className="h-10 w-10 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Special Instructions</h4>
                    <Textarea
                      placeholder="Any special requests? (e.g., no onions)"
                      value={itemNotes}
                      onChange={(e) => setItemNotes(e.target.value)}
                      className="resize-none rounded-xl border-gray-200"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Add some bottom padding to ensure content is not cut off */}
                <div className="pb-4"></div>
              </div>
            </ScrollArea>

            <div className="border-t bg-white p-6">
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full rounded-full"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Adding to Cart...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart - {formatPrice((parseFloat(selectedItem?.price || '0') * itemQuantity).toString())}
                    </>
                  )}
                </Button>
                <SheetClose asChild>
                  <Button variant="outline" className="w-full rounded-full" disabled={isAddingToCart}>
                    Cancel
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>

      </div>

      {/* Mobile Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-3 py-1.5 z-50 shadow-lg">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {/* Menu Tab */}
          <button
            onClick={() => handleFooterTabChange(FooterTab.MENU)}
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 min-w-[56px] ${
              activeFooterTab === FooterTab.MENU
                ? 'text-primary bg-primary/10 scale-105'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
            }`}
            style={{ minHeight: '44px' }}
          >
            <Menu className="h-4 w-4 mb-0.5" />
            <span className="text-xs font-medium">Menu</span>
          </button>

          {/* Cart Tab */}
          <button
            onClick={() => handleFooterTabChange(FooterTab.CART)}
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 relative min-w-[56px] ${
              activeFooterTab === FooterTab.CART
                ? 'text-primary bg-primary/10 scale-105'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
            }`}
            style={{ minHeight: '44px' }}
          >
            <div className="relative">
              <ShoppingCart className="h-4 w-4 mb-0.5" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
                >
                  {totalItems}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium truncate max-w-[48px]">
              {totalItems > 0 ? formatPrice(totalAmount) : 'Cart'}
            </span>
          </button>

          {/* Track Tab */}
          <button
            onClick={() => handleFooterTabChange(FooterTab.TRACK)}
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 min-w-[56px] ${
              activeFooterTab === FooterTab.TRACK
                ? 'text-primary bg-primary/10 scale-105'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
            }`}
            style={{ minHeight: '44px' }}
          >
            <Receipt className="h-4 w-4 mb-0.5" />
            <span className="text-xs font-medium">Track</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicMenu;
