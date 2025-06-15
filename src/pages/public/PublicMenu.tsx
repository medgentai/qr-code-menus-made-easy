import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Clock, Info, Leaf, Wheat, Flame, Search, X, Plus, Minus, ShoppingCart, ArrowLeft, Filter } from 'lucide-react';
import { usePublicMenu } from '@/contexts/public-menu-context';
import { useCart } from '@/contexts/cart-context';
import { MenuItem } from '@/services/menu-service';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SpicyLevelLabels } from '@/types/menu';
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

  // Check if view-only mode is enabled
  const isViewOnlyMode = menu?.viewOnlyMode || false;
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
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

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

  // Separate useEffect for expanding first category
  useEffect(() => {
    if (menu && menu.categories && menu.categories.length > 0 && expandedCategories.length === 0) {
      setExpandedCategories([menu.categories[0].id]);
    }
  }, [menu, expandedCategories.length]);

  // Handle scroll behavior for sliding header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const mainHeader = document.getElementById('main-header');
      const searchHeader = document.getElementById('search-header');

      if (mainHeader && searchHeader) {
        if (currentScrollY > 80) {
          // Hide main header and make search sticky
          mainHeader.style.transform = 'translateY(-100%)';
          searchHeader.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        } else {
          // Show main header
          mainHeader.style.transform = 'translateY(0)';
          searchHeader.style.boxShadow = 'none';
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
    // Don't allow item selection in view-only mode
    if (isViewOnlyMode) {
      return;
    }
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

  const toggleCategoryExpansion = (categoryId: string, isOpen?: boolean) => {
    setExpandedCategories(prev => {
      if (isOpen !== undefined) {
        // If isOpen is provided, use it directly
        return isOpen
          ? [...prev.filter(id => id !== categoryId), categoryId]
          : prev.filter(id => id !== categoryId);
      } else {
        // Toggle behavior
        return prev.includes(categoryId)
          ? prev.filter(id => id !== categoryId)
          : [...prev, categoryId];
      }
    });
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
        price: item.menuItem.discountPrice || item.menuItem.price,
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
    // Redirect to menu if in view-only mode
    if (isViewOnlyMode) {
      const searchParamsString = searchParams.toString();
      const queryString = searchParamsString ? `?${searchParamsString}` : '';
      navigate(`/${slug}${queryString}`, { replace: true });
      return null;
    }

    return (
      <CheckoutForm
        venueId={venueId || ''}
        tableId={tableId}
        tableCapacity={menu?.table?.capacity}
        organizationId={menu?.organization?.id || ''}
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
    // Redirect to menu if in view-only mode
    if (isViewOnlyMode) {
      const searchParamsString = searchParams.toString();
      const queryString = searchParamsString ? `?${searchParamsString}` : '';
      navigate(`/${slug}${queryString}`, { replace: true });
      return null;
    }

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
                      {formatPrice((parseFloat(item.menuItem.discountPrice || item.menuItem.price) * item.quantity).toString())}
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

  // Get all items from all categories for search
  const allItems = menu?.categories?.reduce((acc: MenuItem[], category) => {
    if (category.items) {
      acc.push(...category.items);
    }
    return acc;
  }, []) || [];

  const activeItems = filterItemsByDietary(
    isSearching
      ? searchQuery.trim() !== ''
        ? filteredItems
        : allItems // Show all items when searching but no query entered yet
      : activeCategory
        ? menu.categories?.find(c => c.id === activeCategory)?.items || []
        : []
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-300">
      {/* Professional Header - Slides away on scroll */}
      <div className="bg-white border-b border-gray-100 transition-transform duration-300" id="main-header">
        <div className="container mx-auto px-4 py-4 max-w-md">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              {/* Restaurant Logo */}
              {menu.organization?.logoUrl ? (
                <div className="w-12 h-12 rounded-full overflow-hidden shadow-md border-2 border-gray-100">
                  <img
                    src={menu.organization.logoUrl}
                    alt={`${menu.organization.name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-xl">🍽️</span>
                </div>
              )}
              <div className="text-center">
                <h1 className="text-lg font-bold text-gray-900">{menu.organization?.name}</h1>
                <p className="text-sm text-gray-600">{menu.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Search Bar with Categories - Becomes sticky when header slides away */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 transition-all duration-300" id="search-header">
        <div className="container mx-auto px-4 py-3 max-w-md">
          {/* Search Bar and Filters */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search item"
                className="pl-10 pr-10 h-10 rounded-lg border-gray-200 bg-white text-sm"
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

            {/* Filters Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-10 px-3 rounded-lg border-gray-200 text-sm relative ${
                    dietaryFilter !== DietaryFilter.ALL
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'bg-white text-gray-600'
                  }`}
                >
                  Filters
                  <Filter className="h-3 w-3 ml-1" />
                  {dietaryFilter !== DietaryFilter.ALL && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
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

          {/* Category Tabs with Images - Also sticky */}
          {!isSearching && menu.categories && menu.categories.length > 0 && (
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-4 pb-2 min-w-max px-1">
                {/* Items Tab */}
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`flex flex-col items-center py-2 transition-all duration-200 min-w-[80px] ${
                    activeCategory === null
                      ? 'text-orange-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span className="text-sm font-medium mb-2">Items</span>
                  <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    activeCategory === null
                      ? 'border-orange-500'
                      : 'border-gray-200'
                  }`}>
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xl">📋</span>
                    </div>
                  </div>
                </button>

                {menu.categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex flex-col items-center py-2 transition-all duration-200 min-w-[80px] ${
                      activeCategory === category.id
                        ? 'text-orange-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="text-sm font-medium mb-2 truncate max-w-[75px]">{category.name}</span>
                    <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'border-orange-500'
                        : 'border-gray-200'
                    }`}>
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xl">🍽️</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View-Only Mode Banner */}
      {isViewOnlyMode && (
        <div className="bg-orange-50 border-b border-orange-200">
          <div className="container mx-auto px-4 py-3 max-w-md">
            <div className="flex items-center gap-3 p-3 bg-orange-100 rounded-lg border border-orange-200">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-orange-800">View-Only Mode</h3>
                <p className="text-xs text-orange-700 mt-1">
                  You can browse the menu and track orders, but ordering is currently disabled.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4 max-w-md">
        {/* Filter Status and Search Results */}
        {(dietaryFilter !== DietaryFilter.ALL || isSearching) && (
          <div className="mb-4 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSearching && searchQuery.trim() !== '' && (
                  <h2 className="text-base font-medium text-gray-700">
                    {filteredItems.length > 0
                      ? `Search Results (${activeItems.length})`
                      : 'No items found'}
                  </h2>
                )}
                {isSearching && searchQuery.trim() === '' && (
                  <h2 className="text-base font-medium text-gray-700">
                    All Items ({activeItems.length})
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
              {(dietaryFilter !== DietaryFilter.ALL || searchQuery || isSearching) && (
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

        {/* Menu Categories - Collapsible Style */}
        {!isSearching && activeCategory === null && menu.categories && menu.categories.length > 0 && (
          <div className="space-y-2">
            {menu.categories.map((category) => {
              const categoryItems = filterItemsByDietary(category.items || []);
              const isExpanded = expandedCategories.includes(category.id);

              return (
                <Collapsible
                  key={category.id}
                  open={isExpanded}
                  onOpenChange={(open) => toggleCategoryExpansion(category.id, open)}
                  className="bg-white rounded-lg border border-gray-200"
                >
                  {/* Category Header */}
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900 text-base">{category.name}</h3>
                      <span className="text-sm text-gray-500">({categoryItems.length})</span>
                    </div>
                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </CollapsibleTrigger>

                  {/* Category Items */}
                  <CollapsibleContent className="border-t border-gray-100">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex p-4 transition-colors duration-200 border-b border-gray-50 last:border-b-0 ${
                          isViewOnlyMode
                            ? 'cursor-default'
                            : 'cursor-pointer hover:bg-gray-50'
                        }`}
                        onClick={() => handleItemClick(item)}
                      >
                        {/* Item Image */}
                        {item.imageUrl ? (
                          <div className="w-20 h-20 flex-shrink-0 relative rounded-lg overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xl">🍽️</span>
                          </div>
                        )}

                        {/* Item Content */}
                        <div className="flex-1 ml-4 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900 text-base leading-tight">
                              {item.name}
                            </h4>
                            <div className="flex-shrink-0 ml-3 text-right">
                              {item.discountPrice ? (
                                <div>
                                  <div className="text-orange-600 font-bold text-base">{formatPrice(item.discountPrice)}</div>
                                  <div className="text-sm line-through text-gray-400">{formatPrice(item.price)}</div>
                                </div>
                              ) : (
                                <div className="text-orange-600 font-bold text-base">{formatPrice(item.price)}</div>
                              )}
                            </div>
                          </div>

                          {/* Item Badges */}
                          <div className="flex items-center gap-2">
                            {item.isVegetarian && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                Veg
                              </span>
                            )}
                            {!item.isVegetarian && !item.isVegan && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                Non-Veg
                              </span>
                            )}
                            {item.preparationTime && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{item.preparationTime}m</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}

        {/* Single Category Items View */}
        {!isSearching && activeCategory && (
          <div className="space-y-3">
            {activeItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div
                  className={`flex p-4 transition-colors duration-200 ${
                    isViewOnlyMode
                      ? 'cursor-default'
                      : 'cursor-pointer hover:bg-gray-50'
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  {/* Image Section */}
                  {item.imageUrl ? (
                    <div className="w-20 h-20 flex-shrink-0 relative rounded-lg overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xl">🍽️</span>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="flex-1 ml-4 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight">
                          {item.name}
                        </h3>
                      </div>
                      <div className="flex-shrink-0 ml-3 text-right">
                        {item.discountPrice ? (
                          <div>
                            <div className="text-orange-600 font-bold text-base">{formatPrice(item.discountPrice)}</div>
                            <div className="text-sm line-through text-gray-400">{formatPrice(item.price)}</div>
                          </div>
                        ) : (
                          <div className="text-orange-600 font-bold text-base">{formatPrice(item.price)}</div>
                        )}
                      </div>
                    </div>

                    {/* Badges and info row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.isVegetarian && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Veg
                          </span>
                        )}
                        {!item.isVegetarian && !item.isVegan && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                            Non-Veg
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {item.preparationTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.preparationTime}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search Results */}
        {isSearching && (
          <div className="space-y-3">
            {searchQuery.trim() === '' ? (
              // Show all items when search is focused but empty
              <>
                <div className="mb-4 text-center">
                  <p className="text-gray-500 text-sm">Browse all items or start typing to search...</p>
                </div>
                {activeItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div
                      className={`flex p-4 transition-colors duration-200 ${
                        isViewOnlyMode
                          ? 'cursor-default'
                          : 'cursor-pointer hover:bg-gray-50'
                      }`}
                      onClick={() => handleItemClick(item)}
                    >
                      {item.imageUrl ? (
                        <div className="w-20 h-20 flex-shrink-0 relative rounded-lg overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xl">🍽️</span>
                        </div>
                      )}

                      <div className="flex-1 ml-4 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 text-base leading-tight">
                            {item.name}
                          </h4>
                          <div className="text-orange-600 font-bold text-base ml-3">
                            {formatPrice(item.discountPrice || item.price)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.isVegetarian && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              Veg
                            </span>
                          )}
                          {!item.isVegetarian && !item.isVegan && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                              Non-Veg
                            </span>
                          )}
                          {item.preparationTime && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{item.preparationTime}m</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : activeItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No items found matching your search.</p>
              </div>
            ) : (
              activeItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <div
                    className={`flex p-4 transition-colors duration-200 ${
                      isViewOnlyMode
                        ? 'cursor-default'
                        : 'cursor-pointer hover:bg-gray-50'
                    }`}
                    onClick={() => handleItemClick(item)}
                  >
                    {item.imageUrl ? (
                      <div className="w-20 h-20 flex-shrink-0 relative rounded-lg overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xl">🍽️</span>
                      </div>
                    )}

                    <div className="flex-1 ml-4 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 text-base leading-tight">
                          {item.name}
                        </h4>
                        <div className="text-orange-600 font-bold text-base ml-3">
                          {formatPrice(item.discountPrice || item.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.isVegetarian && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Veg
                          </span>
                        )}
                        {!item.isVegetarian && !item.isVegan && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                            Non-Veg
                          </span>
                        )}
                        {item.preparationTime && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{item.preparationTime}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Item Detail Sheet */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white">
            <ScrollArea className="flex-1">
              <div className="space-y-4">
                {/* Hero Image with Overlay Text - Now Scrollable */}
                {selectedItem?.imageUrl ? (
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay for text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Text overlay on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="flex justify-between items-end">
                        <div className="flex-1 min-w-0">
                          <h1 className="text-2xl font-bold leading-tight mb-1 drop-shadow-lg">{selectedItem?.name}</h1>
                          {selectedItem?.description && (
                            <p className="text-white/90 text-sm leading-relaxed drop-shadow-md">
                              {selectedItem.description}
                            </p>
                          )}
                        </div>
                        <div className="ml-4 text-right flex-shrink-0">
                          {selectedItem?.discountPrice ? (
                            <div>
                              <div className="text-2xl font-bold text-white drop-shadow-lg">{formatPrice(selectedItem.discountPrice)}</div>
                              <div className="text-sm line-through text-white/70 drop-shadow-md">{formatPrice(selectedItem?.price)}</div>
                            </div>
                          ) : (
                            <div className="text-2xl font-bold text-white drop-shadow-lg">{formatPrice(selectedItem?.price)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 h-48 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="text-center text-white relative z-10">
                      <div className="text-4xl mb-3">🍽️</div>
                      <h1 className="text-2xl font-bold mb-2 drop-shadow-lg">{selectedItem?.name}</h1>
                      {selectedItem?.description && (
                        <p className="text-white/90 text-sm drop-shadow-md max-w-xs">
                          {selectedItem.description}
                        </p>
                      )}
                      <div className="mt-3">
                        {selectedItem?.discountPrice ? (
                          <div>
                            <div className="text-2xl font-bold text-white drop-shadow-lg">{formatPrice(selectedItem.discountPrice)}</div>
                            <div className="text-sm line-through text-white/70 drop-shadow-md">{formatPrice(selectedItem?.price)}</div>
                          </div>
                        ) : (
                          <div className="text-2xl font-bold text-white drop-shadow-lg">{formatPrice(selectedItem?.price)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-4">
                {/* Quantity Selector - Priority Section */}
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Quantity</span>
                    <div className="text-sm text-gray-600">
                      Total: <span className="font-bold text-orange-600">
                        {formatPrice((parseFloat(selectedItem?.discountPrice || selectedItem?.price || '0') * itemQuantity).toString())}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      className="h-10 w-10 rounded-full border-orange-300 hover:bg-orange-100"
                      disabled={itemQuantity <= 1}
                    >
                      <Minus className="h-4 w-4 text-orange-600" />
                    </Button>
                    <div className="bg-white rounded-xl px-4 py-2 min-w-[3rem] text-center border border-orange-200">
                      <span className="text-xl font-bold text-orange-600">{itemQuantity}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setItemQuantity(itemQuantity + 1)}
                      className="h-10 w-10 rounded-full border-orange-300 hover:bg-orange-100"
                    >
                      <Plus className="h-4 w-4 text-orange-600" />
                    </Button>
                  </div>
                </div>

                {/* Compact Info Section */}
                {(selectedItem?.preparationTime || selectedItem?.calories || selectedItem?.isVegetarian || selectedItem?.isVegan || selectedItem?.isGlutenFree || (selectedItem?.spicyLevel && selectedItem.spicyLevel > 0)) && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedItem?.preparationTime && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 bg-white rounded-full px-2 py-1">
                          <Clock className="h-3 w-3" />
                          <span>{selectedItem.preparationTime}m</span>
                        </div>
                      )}
                      {selectedItem?.calories && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 bg-white rounded-full px-2 py-1">
                          <Info className="h-3 w-3" />
                          <span>{selectedItem.calories} cal</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem?.isVegetarian && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                          <Leaf className="h-2 w-2 mr-1" /> Veg
                        </Badge>
                      )}
                      {selectedItem?.isVegan && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                          <Leaf className="h-2 w-2 mr-1" /> Vegan
                        </Badge>
                      )}
                      {selectedItem?.isGlutenFree && (
                        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100">
                          <Wheat className="h-2 w-2 mr-1" /> GF
                        </Badge>
                      )}
                      {selectedItem?.spicyLevel && selectedItem.spicyLevel > 0 && (
                        <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 hover:bg-red-100">
                          <Flame className="h-2 w-2 mr-1" /> {SpicyLevelLabels[selectedItem.spicyLevel]}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Allergens Warning - Compact */}
                {selectedItem?.allergens && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600 text-sm">⚠️</span>
                      <div>
                        <span className="font-medium text-yellow-800 text-sm">Allergens: </span>
                        <span className="text-yellow-700 text-sm">{selectedItem.allergens}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Instructions - Compact */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                  <Textarea
                    placeholder="Any special requests? (e.g., no onions, extra spicy)"
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    className="resize-none border-gray-200 focus:border-orange-300 focus:ring-orange-200 rounded-lg text-sm"
                    rows={2}
                  />
                </div>
                </div>
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="bg-white border-t border-gray-100 p-4">
              {isViewOnlyMode ? (
                <div className="text-center">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                    <p className="text-sm text-orange-800 font-medium">
                      Ordering is currently disabled
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      You can view menu items but cannot place orders at this time.
                    </p>
                  </div>
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl h-12 border-gray-300 hover:bg-gray-50 font-medium"
                    >
                      Close
                    </Button>
                  </SheetClose>
                </div>
              ) : (
                <div className="flex gap-3">
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl h-12 border-gray-300 hover:bg-gray-50 font-medium"
                      disabled={isAddingToCart}
                    >
                      Cancel
                    </Button>
                  </SheetClose>
                  <Button
                    className="flex-1 rounded-xl h-12 bg-orange-600 hover:bg-orange-700 font-medium text-white"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Item Detail Sheet */}
        {/* Compact Mobile Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className={`flex items-center max-w-md mx-auto ${isViewOnlyMode ? 'justify-around' : 'justify-around'}`}>
          {/* Menu Tab */}
          <button
            onClick={() => handleFooterTabChange(FooterTab.MENU)}
            className={`flex flex-col items-center py-2 px-3 transition-all duration-200 min-w-[60px] ${
              activeFooterTab === FooterTab.MENU
                ? 'text-orange-600'
                : 'text-gray-500'
            }`}
          >
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-medium">Menu</span>
          </button>

          {/* Orders Tab */}
          <button
            onClick={() => handleFooterTabChange(FooterTab.TRACK)}
            className={`flex flex-col items-center py-2 px-3 transition-all duration-200 min-w-[60px] ${
              activeFooterTab === FooterTab.TRACK
                ? 'text-orange-600'
                : 'text-gray-500'
            }`}
          >
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9zm2 0a1 1 0 100 2h.01a1 1 0 100-2H11z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-medium">Orders</span>
          </button>

          {/* Cart Tab - Hidden in view-only mode */}
          {!isViewOnlyMode && (
            <button
              onClick={() => handleFooterTabChange(FooterTab.CART)}
              className={`flex flex-col items-center py-2 px-3 transition-all duration-200 relative min-w-[60px] ${
                activeFooterTab === FooterTab.CART
                  ? 'text-orange-600'
                  : 'text-gray-500'
              }`}
            >
              <div className="w-6 h-6 mb-1 flex items-center justify-center relative">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                {totalItems > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{totalItems}</span>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">Cart</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default PublicMenu;
