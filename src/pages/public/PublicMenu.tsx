import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Clock, Info, Leaf, Wheat, Flame, Search, X, Plus, Minus, ShoppingCart, Menu, Timer, ArrowLeft, Filter } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
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

// Dietary filter options
enum DietaryFilter {
  ALL = 'all',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  NON_VEGETARIAN = 'non_vegetarian',
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
  <div className="sticky top-0 z-40 bg-gradient-to-r from-white via-white to-orange-50/30 backdrop-blur-md border-b border-gray-100 px-4 py-4 transition-all duration-300 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackClick}
            className="h-10 w-10 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900 transition-colors">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 transition-colors font-medium">{subtitle}</p>
          )}
        </div>
      </div>
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
  const navigate = useNavigate();
  const location = useLocation();
  const tableId = searchParams.get('table');
  const venueId = searchParams.get('venue');

  // Determine current view from URL path
  const getCurrentView = (): ViewState => {
    const path = location.pathname.split('/').pop();
    switch (path) {
      case 'cart':
        return ViewState.CART;
      case 'checkout':
        return ViewState.CHECKOUT;
      case 'confirmation':
        return ViewState.CONFIRMATION;
      case 'track':
        return ViewState.TRACK_ORDER;
      default:
        return ViewState.MENU;
    }
  };

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
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>(DietaryFilter.ALL);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');

  const viewState = getCurrentView();
  const [activeFooterTab, setActiveFooterTab] = useState<FooterTab>(() => {
    // Set initial footer tab based on current view
    switch (viewState) {
      case ViewState.CART:
        return FooterTab.CART;
      case ViewState.TRACK_ORDER:
        return FooterTab.TRACK;
      default:
        return FooterTab.MENU;
    }
  });
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

  // Update footer tab when URL changes
  useEffect(() => {
    switch (viewState) {
      case ViewState.CART:
        setActiveFooterTab(FooterTab.CART);
        break;
      case ViewState.TRACK_ORDER:
        setActiveFooterTab(FooterTab.TRACK);
        break;
      default:
        setActiveFooterTab(FooterTab.MENU);
        break;
    }
  }, [viewState]);

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

  // Filter items based on dietary preferences
  const filterItemsByDietary = (items: MenuItem[]): MenuItem[] => {
    if (dietaryFilter === DietaryFilter.ALL) {
      return items;
    } else if (dietaryFilter === DietaryFilter.VEGETARIAN) {
      return items.filter(item => item.isVegetarian);
    } else if (dietaryFilter === DietaryFilter.VEGAN) {
      return items.filter(item => item.isVegan);
    } else if (dietaryFilter === DietaryFilter.NON_VEGETARIAN) {
      return items.filter(item => !item.isVegetarian && !item.isVegan);
    }
    return items;
  };

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

  const clearAllFilters = () => {
    setSearchQuery('');
    setIsSearching(false);
    setDietaryFilter(DietaryFilter.ALL);
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
    const searchParamsString = searchParams.toString();
    const queryString = searchParamsString ? `?${searchParamsString}` : '';

    if (tab === FooterTab.MENU) {
      navigate(`/${slug}${queryString}`);
    } else if (tab === FooterTab.CART) {
      navigate(`/${slug}/cart${queryString}`);
    } else if (tab === FooterTab.TRACK) {
      navigate(`/${slug}/track${queryString}`);
    }
  };

  const handleCheckout = () => {
    const searchParamsString = searchParams.toString();
    const queryString = searchParamsString ? `?${searchParamsString}` : '';
    navigate(`/${slug}/checkout${queryString}`);
  };

  const handleBackToMenu = () => {
    setActiveFooterTab(FooterTab.MENU);
    const searchParamsString = searchParams.toString();
    const queryString = searchParamsString ? `?${searchParamsString}` : '';
    navigate(`/${slug}${queryString}`);
  };

  const handleTrackOrder = () => {
    setActiveFooterTab(FooterTab.TRACK);
    const searchParamsString = searchParams.toString();
    const queryString = searchParamsString ? `?${searchParamsString}` : '';
    navigate(`/${slug}/track${queryString}`);
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

      // Navigate to confirmation
      const searchParamsString = searchParams.toString();
      const queryString = searchParamsString ? `?${searchParamsString}` : '';
      navigate(`/${slug}/confirmation${queryString}`);

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

  const activeItems = filterItemsByDietary(
    isSearching
      ? filteredItems
      : activeCategory
        ? menu.categories?.find(c => c.id === activeCategory)?.items || []
        : []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 pb-20 animate-in fade-in duration-300">
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
            <Timer className="h-5 w-5" />
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-4 max-w-md">
        {/* Restaurant Info Card */}
        {menu.description && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-500 text-sm">ℹ️</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">{menu.description}</p>
            </div>
          </div>
        )}

        {/* Search Bar and Filter */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search delicious items..."
              className="pl-10 pr-10 h-11 rounded-xl border-gray-200 bg-white shadow-sm focus:shadow-md transition-all duration-200 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                onClick={clearSearch}
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            )}
          </div>

          {/* Dietary Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`h-11 w-11 rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 relative flex-shrink-0 ${
                  dietaryFilter !== DietaryFilter.ALL
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'bg-white text-gray-600'
                }`}
              >
                <Filter className="h-4 w-4" />
                {dietaryFilter !== DietaryFilter.ALL && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full"></div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Dietary Preferences
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDietaryFilter(DietaryFilter.ALL)}
                className={`cursor-pointer ${dietaryFilter === DietaryFilter.ALL ? 'bg-primary/10 text-primary' : ''}`}
              >
                <span className="mr-2">🍽️</span>
                All Items
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDietaryFilter(DietaryFilter.VEGETARIAN)}
                className={`cursor-pointer ${dietaryFilter === DietaryFilter.VEGETARIAN ? 'bg-green-50 text-green-700' : ''}`}
              >
                <Leaf className="h-4 w-4 mr-2 text-green-600" />
                Vegetarian
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDietaryFilter(DietaryFilter.VEGAN)}
                className={`cursor-pointer ${dietaryFilter === DietaryFilter.VEGAN ? 'bg-green-50 text-green-700' : ''}`}
              >
                <Leaf className="h-4 w-4 mr-2 text-green-700" />
                Vegan
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDietaryFilter(DietaryFilter.NON_VEGETARIAN)}
                className={`cursor-pointer ${dietaryFilter === DietaryFilter.NON_VEGETARIAN ? 'bg-red-50 text-red-700' : ''}`}
              >
                <span className="mr-2">🥩</span>
                Non-Vegetarian
              </DropdownMenuItem>
              {(dietaryFilter !== DietaryFilter.ALL || searchQuery) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={clearAllFilters}
                    className="cursor-pointer text-gray-600 hover:text-gray-800"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Category Navigation */}
        {!isSearching && menu.categories && menu.categories.length > 0 && (
          <div className="sticky top-[88px] z-30 bg-gray-50/95 backdrop-blur-sm py-3 -mx-4 px-4 mb-4">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-3 pb-2 min-w-max">
                {menu.categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex-shrink-0 rounded-full px-4 py-2 font-medium transition-all duration-200 whitespace-nowrap ${
                      activeCategory === category.id
                        ? 'bg-primary text-white shadow-md scale-105'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:scale-105'
                    }`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filter Status and Search Results */}
        {(dietaryFilter !== DietaryFilter.ALL || isSearching) && (
          <div className="mb-4 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSearching && (
                  <h2 className="text-base font-medium text-gray-700">
                    {filteredItems.length > 0
                      ? `Search Results (${activeItems.length})`
                      : 'No items found'}
                  </h2>
                )}
                {dietaryFilter !== DietaryFilter.ALL && (
                  <Badge className={`${
                    dietaryFilter === DietaryFilter.VEGETARIAN
                      ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100'
                      : dietaryFilter === DietaryFilter.VEGAN
                      ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
                      : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100'
                  }`}>
                    <Filter className="h-3 w-3 mr-1" />
                    {dietaryFilter === DietaryFilter.VEGETARIAN && 'Showing Vegetarian Items'}
                    {dietaryFilter === DietaryFilter.VEGAN && 'Showing Vegan Items'}
                    {dietaryFilter === DietaryFilter.NON_VEGETARIAN && 'Showing Non-Vegetarian Items'}
                  </Badge>
                )}
              </div>
              {(dietaryFilter !== DietaryFilter.ALL || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-500 hover:text-gray-700 h-8 px-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            {searchQuery && activeItems.length === 0 && (
              <p className="text-gray-500 text-sm mt-2">
                No items match your search and filter criteria. Try adjusting your search or filter.
              </p>
            )}
          </div>
        )}

        {/* Menu Items */}
        {activeItems.length === 0 && !isSearching && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-orange-400 text-3xl">🍽️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to {menu.name}!</h3>
            <p className="text-gray-600 text-center text-sm leading-relaxed mb-4">
              Select a category above to explore our delicious menu items.
            </p>
            {menu.categories && menu.categories.length > 0 && (
              <Button
                onClick={() => handleCategoryClick(menu.categories[0].id)}
                className="rounded-full px-6"
              >
                Browse {menu.categories[0].name}
              </Button>
            )}
          </div>
        )}

        <div className="space-y-3">
          {activeItems.map((item, index) => {
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className="flex p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => handleItemClick(item)}
                >
                  {/* Image Section */}
                  {item.imageUrl ? (
                    <div className="w-20 h-20 flex-shrink-0 relative rounded-xl overflow-hidden shadow-sm">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100 rounded-xl flex items-center justify-center shadow-sm border border-orange-200">
                      <span className="text-orange-500 text-2xl">🍽️</span>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="flex-1 ml-4 min-w-0">
                    {/* Header with name and price */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">
                          {item.name}
                        </h3>
                      </div>
                      <div className="flex-shrink-0 ml-3 text-right">
                        {item.discountPrice ? (
                          <div>
                            <div className="text-primary font-bold text-lg">{formatPrice(item.discountPrice)}</div>
                            <div className="text-sm line-through text-gray-400">{formatPrice(item.price)}</div>
                          </div>
                        ) : (
                          <div className="text-primary font-bold text-lg">{formatPrice(item.price)}</div>
                        )}
                      </div>
                    </div>

                    {/* Badges and info row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Dietary badges */}
                        {item.isVegetarian && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Veg
                          </span>
                        )}
                        {item.isVegan && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
                            Vegan
                          </span>
                        )}
                        {!item.isVegetarian && !item.isVegan && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                            Non-Veg
                          </span>
                        )}
                        {item.isGlutenFree && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                            GF
                          </span>
                        )}
                      </div>

                      {/* Time and spicy info */}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {item.preparationTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.preparationTime}m</span>
                          </div>
                        )}
                        {item.spicyLevel && item.spicyLevel > 0 && (
                          <div className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-red-500" />
                            <span className="text-red-600 font-medium">{SpicyLevelLabels[item.spicyLevel]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
      <div className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-md border-t border-gray-100 px-4 py-2 z-50 shadow-2xl">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {/* Menu Tab */}
          <button
            onClick={() => handleFooterTabChange(FooterTab.MENU)}
            className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 min-w-[64px] ${
              activeFooterTab === FooterTab.MENU
                ? 'text-primary bg-primary/15 scale-110 shadow-lg'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
            }`}
            style={{ minHeight: '52px' }}
          >
            <Menu className="h-5 w-5 mb-1" />
            <span className="text-xs font-semibold">Menu</span>
          </button>

          {/* Cart Tab */}
          <button
            onClick={() => handleFooterTabChange(FooterTab.CART)}
            className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 relative min-w-[64px] ${
              activeFooterTab === FooterTab.CART
                ? 'text-primary bg-primary/15 scale-110 shadow-lg'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
            }`}
            style={{ minHeight: '52px' }}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 mb-1" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
                >
                  {totalItems}
                </Badge>
              )}
            </div>
            <span className="text-xs font-semibold truncate max-w-[52px]">
              {totalItems > 0 ? formatPrice(totalAmount) : 'Cart'}
            </span>
          </button>

          {/* Track Tab */}
          <button
            onClick={() => handleFooterTabChange(FooterTab.TRACK)}
            className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 min-w-[64px] ${
              activeFooterTab === FooterTab.TRACK
                ? 'text-primary bg-primary/15 scale-110 shadow-lg'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
            }`}
            style={{ minHeight: '52px' }}
          >
            <Timer className="h-5 w-5 mb-1" />
            <span className="text-xs font-semibold">Track</span>
          </button>
        </div>
      </div>


    </div>
  );
};

export default PublicMenu;
