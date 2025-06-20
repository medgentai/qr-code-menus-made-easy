import React, { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Clock,
  Calendar,
  User,

  FileText,
  RefreshCw,
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Utensils,
  Table as TableIcon,
  Store,
  Loader2,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import { usePermissions } from '@/contexts/permission-context';
import { useOrder } from '@/hooks/useOrder';
import { useRoleBasedOrders } from '@/hooks/useRoleBasedOrders';
import OrderService, { Order, OrderStatus, OrderPaymentStatus } from '@/services/order-service';
import { PaymentStatusDialog } from '@/components/orders/PaymentStatusDialog';
import { NewOrderCard } from '@/components/orders/NewOrderCard';
import { OrderFilters, FilterType } from '@/components/orders/OrderFilters';
import { toast } from 'sonner';
import {
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  orderKeys
} from '@/hooks/useOrderQuery';

const OrderList: React.FC = () => {
  const { id: organizationId } = useParams<{ id: string }>();
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { currentVenue, venues, fetchTablesForVenue } = useVenue();
  const { selectOrder } = useOrder();
  const { userRole, userVenueIds } = usePermissions();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [venueFilter, setVenueFilter] = useState<string>('');

  // Use role-based orders hook for automatic filtering with additional filters
  const {
    orders: roleBasedOrders,
    isLoading: roleBasedLoading,
    hasNextPage,
    fetchNextPage,
    canCreateOrder,
    canEditOrder,
    canDeleteOrder,
    canUpdateOrderStatus,
    availableStatusFilters,
    pageInfo,
    rawQuery: infiniteOrdersQuery
  } = useRoleBasedOrders({
    status: statusFilter === '' ? undefined : statusFilter,
    venueId: venueFilter === '' ? undefined : venueFilter
  });

  // Update mutations
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const deleteOrderMutation = useDeleteOrderMutation();

  // Use role-based orders as the main data source
  const infiniteOrders = roleBasedOrders;

  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [paymentDialogOrder, setPaymentDialogOrder] = useState<Order | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');


  // State to track orders with pending status updates - for immediate UI updates
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState<Record<string, OrderStatus>>({});

  // Use role-based loading state
  const isLoading = roleBasedLoading;

  // Filter venues based on user permissions
  const accessibleVenues = useMemo(() => {
    if (!venues) return [];

    // For staff members, only show venues they have access to
    if (userRole === 'STAFF' && userVenueIds && userVenueIds.length > 0) {
      return venues.filter(venue => userVenueIds.includes(venue.id));
    }

    // For non-staff roles, show all venues
    return venues;
  }, [venues, userRole, userVenueIds]);

  // Order statistics - using infinite query data for consistency
  const orderStats = useMemo(() => {
    // Use the infinite orders data for statistics
    const total = infiniteOrders.length;
    const pending = infiniteOrders.filter((o: Order) => o.status === OrderStatus.PENDING).length;
    const confirmed = infiniteOrders.filter((o: Order) => o.status === OrderStatus.CONFIRMED).length;
    const preparing = infiniteOrders.filter((o: Order) => o.status === OrderStatus.PREPARING).length;
    const ready = infiniteOrders.filter((o: Order) => o.status === OrderStatus.READY).length;
    const served = infiniteOrders.filter((o: Order) => o.status === OrderStatus.SERVED).length;
    const completed = infiniteOrders.filter((o: Order) => o.status === OrderStatus.COMPLETED).length;
    const cancelled = infiniteOrders.filter((o: Order) => o.status === OrderStatus.CANCELLED).length;

    // Payment statistics - exclude cancelled orders from unpaid count
    const paid = infiniteOrders.filter((o: Order) => o.paymentStatus === OrderPaymentStatus.PAID).length;
    const unpaid = infiniteOrders.filter((o: Order) =>
      o.paymentStatus === OrderPaymentStatus.UNPAID &&
      o.status !== OrderStatus.CANCELLED
    ).length;

    const totalAmount = infiniteOrders.reduce((sum: number, order: Order) => {
      return sum + parseFloat(order.totalAmount);
    }, 0);

    const paidAmount = infiniteOrders
      .filter((o: Order) => o.paymentStatus === OrderPaymentStatus.PAID)
      .reduce((sum: number, order: Order) => {
        return sum + parseFloat(order.totalAmount);
      }, 0);

    const unpaidAmount = infiniteOrders
      .filter((o: Order) =>
        o.paymentStatus === OrderPaymentStatus.UNPAID &&
        o.status !== OrderStatus.CANCELLED
      )
      .reduce((sum: number, order: Order) => {
        return sum + parseFloat(order.totalAmount);
      }, 0);

    return {
      total,
      pending,
      confirmed,
      preparing,
      ready,
      served,
      completed,
      cancelled,
      totalAmount,
      paid,
      unpaid,
      paidAmount,
      unpaidAmount
    };
  }, [infiniteOrders]);  // Refresh function - always refetch when user explicitly clicks refresh
  const handleRefresh = useCallback(async () => {
    // Prevent refresh if already refreshing
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      // Clear any pending status updates before refreshing
      setPendingStatusUpdates({});
      
      // Always refetch when user explicitly clicks refresh
      await infiniteOrdersQuery.refetch();
    } finally {
      // Use setTimeout to prevent UI flicker
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  }, [infiniteOrdersQuery, isRefreshing]);

  // Function to load more orders - memoized to prevent unnecessary re-renders
  const handleLoadMore = useCallback(async () => {
    if (hasNextPage && !infiniteOrdersQuery.isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, infiniteOrdersQuery.isFetchingNextPage, fetchNextPage]);

  const handleCreateOrder = () => {
    if (venueId) {
      navigate(`/organizations/${organizationId}/venues/${venueId}/orders/create`);
    } else {
      navigate(`/organizations/${organizationId}/orders/create`);
    }
  };

  const handleViewOrder = (orderId: string) => {
    if (venueId) {
      navigate(`/organizations/${organizationId}/venues/${venueId}/orders/${orderId}`);
    } else {
      navigate(`/organizations/${organizationId}/orders/${orderId}`);
    }
  };

  const handleEditOrder = (orderId: string) => {
    // Find the order in our existing data
    const orderToEdit = filteredInfiniteOrders.find(order => order.id === orderId);

    // If we found the order, set it as the current order to avoid fetching it again
    if (orderToEdit) {
      console.log('Using existing order data for edit:', orderToEdit.id);

      // IMPORTANT: Set the order in the cache with the detail query key
      // This ensures it's available when the edit page loads
      queryClient.setQueryData(
        orderKeys.detail(orderToEdit.id),
        orderToEdit
      );

      // Also set it in the context
      selectOrder(orderToEdit);

      // Prefetch tables for the venue if the order has a table
      if (orderToEdit.table?.venue?.id) {
        const venueIdToUse = orderToEdit.table.venue.id;

        // Check if tables are already in the cache
        const tablesQueryKey = ['tables', 'venue', venueIdToUse];
        const cachedTables = queryClient.getQueryData(tablesQueryKey);

        if (!cachedTables) {
          console.log('Prefetching tables for venue:', venueIdToUse);
          // Prefetch tables for this venue to avoid an API call when the edit page loads
          // Use fetchQuery instead of prefetchQuery to ensure it completes before navigation
          queryClient.fetchQuery({
            queryKey: tablesQueryKey,
            queryFn: () => fetchTablesForVenue(venueIdToUse),
            staleTime: 10 * 60 * 1000 // 10 minutes
          });
        } else {
          console.log('Tables for venue already in cache:', venueIdToUse);
        }
      }

      // Disable automatic refetching for organization orders
      // This prevents the unnecessary API calls when navigating
      if (organizationId) {
        const orgOrdersKey = orderKeys.organization(organizationId);
        const paginatedOrgOrdersKey = [...orgOrdersKey, { page: 1, limit: 100 }];

        // Set a longer stale time for these queries to prevent automatic refetching
        queryClient.setQueryDefaults(orgOrdersKey, {
          staleTime: 10 * 60 * 1000 // 10 minutes
        });

        queryClient.setQueryDefaults(paginatedOrgOrdersKey, {
          staleTime: 10 * 60 * 1000 // 10 minutes
        });
      }
    }

    // Navigate to the edit page
    if (venueId) {
      navigate(`/organizations/${organizationId}/venues/${venueId}/orders/${orderId}/edit`);
    } else {
      navigate(`/organizations/${organizationId}/orders/${orderId}/edit`);
    }
  };

  const confirmDelete = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteOrder = async () => {
    if (orderToDelete) {
      deleteOrderMutation.mutate(orderToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setOrderToDelete(null);
        }
      });
    }
  };

  const handlePaymentStatusClick = (order: Order) => {
    setPaymentDialogOrder(order);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentStatusChanged = (updatedOrder: Order) => {
    // Update the order in the cache using a predicate to match all filtered infinite queries
    queryClient.setQueriesData(
      {
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            queryKey[0] === 'orders' &&
            queryKey[1] === 'list' &&
            queryKey[2] === 'filtered' &&
            queryKey[queryKey.length - 1] === 'infinite'
          );
        }
      },
      (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            if (!page || !page.data) return page;

            return {
              ...page,
              data: page.data.map((order: Order) =>
                order.id === updatedOrder.id ? updatedOrder : order
              )
            };
          })
        };
      }
    );
  };

  // Filter infinite orders - status filtering is now handled by the backend
  const filteredInfiniteOrders = useMemo(() => {
    return infiniteOrders.filter((order: Order) => {
      if (!order || !order.id) {
        return false;
      }

      // Only filter by search term since status filtering is now done at the backend
      const matchesSearch =
        !searchTerm ||
        (order.customerName ? order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (order.customerPhone ? order.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (order.customerEmail ? order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.table?.name ? order.table.name.toLowerCase().includes(searchTerm.toLowerCase()) : false);

      return matchesSearch;
    });
  }, [infiniteOrders, searchTerm]);

  // Filter orders based on active filter
  const displayOrders = useMemo(() => {
    let filtered = filteredInfiniteOrders;

    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(order =>
          ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.status)
        );
        break;
      case 'ready':
        filtered = filtered.filter(order => order.status === 'READY');
        break;
      case 'kitchen':
        filtered = filtered.filter(order =>
          ['CONFIRMED', 'PREPARING'].includes(order.status)
        );
        break;
      case 'unpaid':
        filtered = filtered.filter(order =>
          order.paymentStatus === OrderPaymentStatus.UNPAID &&
          order.status !== OrderStatus.CANCELLED
        );
        break;
      case 'completed':
        filtered = filtered.filter(order =>
          ['SERVED', 'COMPLETED'].includes(order.status)
        );
        break;
      case 'all':
      default:
        // Show all orders
        break;
    }

    // Sort by priority: READY first, then by creation time (newest first)
    return filtered.sort((a, b) => {
      // Priority 1: READY orders first
      if (a.status === 'READY' && b.status !== 'READY') return -1;
      if (b.status === 'READY' && a.status !== 'READY') return 1;

      // Priority 2: Unpaid orders next (if not filtering by payment)
      if (activeFilter !== 'unpaid') {
        if (a.paymentStatus === OrderPaymentStatus.UNPAID && b.paymentStatus === OrderPaymentStatus.PAID) return -1;
        if (b.paymentStatus === OrderPaymentStatus.UNPAID && a.paymentStatus === OrderPaymentStatus.PAID) return 1;
      }

      // Priority 3: By creation time (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredInfiniteOrders, activeFilter]);

  // Handle status change - defined after filteredInfiniteOrders to avoid reference error
  const handleStatusChange = useCallback(async (orderId: string, status: OrderStatus) => {
    // Find the order in our data to show optimistic UI feedback
    const orderToUpdate = filteredInfiniteOrders.find(order => order.id === orderId);
    const oldStatus = orderToUpdate?.status;

    // Show a loading toast that we'll dismiss on success
    const loadingToastId = toast.loading(`Updating order status to ${status}...`);

    // Immediately update the UI with the new status using React state
    // This ensures the component re-renders with the new status
    setPendingStatusUpdates(prev => ({
      ...prev,
      [orderId]: status
    }));

    // Also update the order in the cache directly for immediate UI update
    if (orderToUpdate) {
      const updatedOrder = { ...orderToUpdate, status };

      // Update the order in the infinite query cache using a predicate to match all filtered infinite queries
      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const queryKey = query.queryKey;
            return (
              Array.isArray(queryKey) &&
              queryKey[0] === 'orders' &&
              queryKey[1] === 'list' &&
              queryKey[2] === 'filtered' &&
              queryKey[queryKey.length - 1] === 'infinite'
            );
          }
        },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => {
              if (!page || !page.data) return page;

              return {
                ...page,
                data: page.data.map((order: Order) =>
                  order.id === orderId ? updatedOrder : order
                )
              };
            })
          };
        }
      );
    }

    // The mutation will handle cache updates through its onMutate/onSuccess/onError handlers
    updateOrderStatusMutation.mutate(
      { id: orderId, status },
      {
        onSuccess: () => {
          // Dismiss the loading toast - the success toast is shown by the mutation
          toast.dismiss(loadingToastId);

          // Keep the updated status in our state to ensure the UI stays updated
          setPendingStatusUpdates(prev => ({
            ...prev,
            [orderId]: status
          }));
        },
        onError: (error) => {
          // Dismiss the loading toast and show error
          toast.dismiss(loadingToastId);
          toast.error(`Failed to update status: ${error.message || 'Unknown error'}`);

          // Log the error for debugging
          console.error('Error updating order status:', error);

          // Remove the pending status update to revert the UI
          setPendingStatusUpdates(prev => {
            const newUpdates = { ...prev };
            delete newUpdates[orderId];
            return newUpdates;
          });

          // Revert the optimistic update in the cache if there was an error
          if (orderToUpdate && oldStatus) {
            // Revert the order in the cache
            const revertedOrder = { ...orderToUpdate, status: oldStatus };

            // Update the order in the infinite query cache using a predicate to match all filtered infinite queries
            queryClient.setQueriesData(
              {
                predicate: (query) => {
                  const queryKey = query.queryKey;
                  return (
                    Array.isArray(queryKey) &&
                    queryKey[0] === 'orders' &&
                    queryKey[1] === 'list' &&
                    queryKey[2] === 'filtered' &&
                    queryKey[queryKey.length - 1] === 'infinite'
                  );
                }
              },
              (oldData: any) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  pages: oldData.pages.map((page: any) => {
                    if (!page || !page.data) return page;

                    return {
                      ...page,
                      data: page.data.map((order: Order) =>
                        order.id === orderId ? revertedOrder : order
                      )
                    };
                  })
                };
              }
            );
          }
        }
      }
    );
  }, [updateOrderStatusMutation, filteredInfiniteOrders, toast, queryClient]);

  const getStatusBadgeClass = (status: OrderStatus) => {
    return OrderService.getStatusColor(status);
  };

  const formatCurrency = (amount: string) => {
    return OrderService.formatCurrency(amount);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with title and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{pageInfo.title}</h1>
            <p className="text-muted-foreground">
              {pageInfo.description} {currentVenue?.name ? `at ${currentVenue.name}` : currentOrganization?.name ? `for ${currentOrganization.name}` : ''}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 w-10"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            {canCreateOrder && (
              <Button onClick={handleCreateOrder} className="w-full sm:w-auto h-10">
                <Plus className="mr-2 h-4 w-4" /> Create Order
              </Button>
            )}
          </div>
        </div>

        {/* Simplified Order Management */}
        {/* Responsive Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <Card className="bg-card">
            <CardHeader className="pb-1 pt-2 px-3">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">Total Orders</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="text-lg sm:text-xl font-bold">{orderStats.total}</div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {formatCurrency(orderStats.totalAmount.toFixed(2))} total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-1 pt-2 px-3">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">Active Orders</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="text-lg sm:text-xl font-bold">
                {orderStats.pending + orderStats.confirmed + orderStats.preparing + orderStats.ready}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-1 pt-2 px-3">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">Paid Orders</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="text-lg sm:text-xl font-bold text-green-600">{orderStats.paid}</div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {formatCurrency(orderStats.paidAmount.toFixed(2))} collected
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-1 pt-2 px-3">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">Unpaid Orders</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="text-lg sm:text-xl font-bold text-red-600">{orderStats.unpaid}</div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {formatCurrency(orderStats.unpaidAmount.toFixed(2))} outstanding
              </p>
            </CardContent>
          </Card>
        </div>



        {/* New Simple Filters */}
        <div className="space-y-4">
          {/* Order Filters */}
          <OrderFilters
            orders={filteredInfiniteOrders}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {/* Search, Venue Filter, and View Mode - All in one line */}
          <div className="flex flex-col gap-4">
            {/* Search and Venue Filter - Always on same line */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Venue Filter Dropdown - Only show on organization page and if user has access to multiple venues */}
              {organizationId && !venueId && accessibleVenues.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-shrink-0 justify-start min-w-[120px]">
                      <Store className="mr-2 h-4 w-4" />
                      <span className="truncate">
                        {venueFilter ? `${accessibleVenues.find(v => v.id === venueFilter)?.name || 'Selected Venue'}` : 'All Venues'}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filter by Venue</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setVenueFilter('')}
                    >
                      All Accessible Venues
                    </DropdownMenuItem>
                    {accessibleVenues.map((venue) => (
                      <DropdownMenuItem
                        key={venue.id}
                        onClick={() => setVenueFilter(venue.id)}
                      >
                        <Store className="mr-2 h-4 w-4" />
                        {venue.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* View Mode Buttons */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="w-full sm:w-auto"
              >
                <BarChart3 className="mr-2 h-4 w-4" /> Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="w-full sm:w-auto"
              >
                <TableIcon className="mr-2 h-4 w-4" /> Table
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col min-h-[280px]">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 mt-auto">
                  <Skeleton className="h-9 w-20" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredInfiniteOrders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No orders found</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {searchTerm || statusFilter
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Create your first order to start managing your business.'}
              </p>
              {!searchTerm && !statusFilter && canCreateOrder && (
                <Button onClick={handleCreateOrder}>Create Order</Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'table' ? (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInfiniteOrders.map((order: Order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                      <TableCell>
                        {order.customerName || 'N/A'}
                        {order.customerPhone && (
                          <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{format(new Date(order.createdAt), 'MMM d, yyyy')}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(order.createdAt), 'h:mm a')}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {order.table?.name || 'No Table'}
                          {/* Show party size and table capacity */}
                          {order.partySize && (
                            <div className="text-xs text-muted-foreground">
                              <Users className="h-3 w-3 inline mr-1" />
                              {order.partySize} guests
                              {order.table?.capacity && ` (${order.table.capacity} max)`}
                            </div>
                          )}
                          {/* Show venue name when viewing at organization level */}
                          {organizationId && !venueId && !venueFilter && (
                            <div className="text-xs text-muted-foreground">
                              <Store className="h-3 w-3 inline mr-1" />
                              {order.venue?.name || order.table?.venue?.name || 'Unknown Venue'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{order.items?.length || 0}</TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeClass(pendingStatusUpdates[order.id] || order.status)}>
                          {pendingStatusUpdates[order.id] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${order.status !== OrderStatus.CANCELLED ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${OrderService.getPaymentStatusColor(order.paymentStatus)}`}
                          onClick={() => order.status !== OrderStatus.CANCELLED && handlePaymentStatusClick(order)}
                        >
                          {order.paymentStatus === OrderPaymentStatus.PAID ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewOrder(order.id)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            {canEditOrder(order.status) && (
                              <DropdownMenuItem onClick={() => handleEditOrder(order.id)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Order
                              </DropdownMenuItem>
                            )}
                            {canUpdateOrderStatus(order.status) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                {availableStatusFilters.map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() => handleStatusChange(order.id, status)}
                                    disabled={order.status === status}
                                  >
                                    <Badge variant="outline" className={`mr-2 ${getStatusBadgeClass(status)}`}>
                                      {status}
                                    </Badge>
                                    {status}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                            {canDeleteOrder(order.status) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => confirmDelete(order)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete Order
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Loading indicator for fetching next page */}
            <div className="h-10 flex items-center justify-center">
              {infiniteOrdersQuery.isFetchingNextPage && (
                <div className="text-sm text-muted-foreground">Loading more orders...</div>
              )}
            </div>
          </div>
        ) : (
          /* New Simple Cards View - Mobile-First Design */
          <div className="space-y-3">
            {displayOrders.map((order: Order) => (
              <NewOrderCard
                key={order.id}
                order={order}
                onViewOrder={handleViewOrder}
                onEditOrder={handleEditOrder}
                onDeleteOrder={confirmDelete}
                onStatusChange={handleStatusChange}
                onPaymentStatusClick={handlePaymentStatusClick}
                canEditOrder={canEditOrder}
                canDeleteOrder={canDeleteOrder}
                canUpdateOrderStatus={canUpdateOrderStatus}
                availableStatusFilters={availableStatusFilters}
                pendingStatusUpdates={pendingStatusUpdates}
              />
            ))}

            {/* Pagination info and View More button */}
            <div className="mt-6 flex flex-col items-center gap-2">
              {/* Pagination info */}
              {displayOrders.length > 0 && (
                <div className="text-sm text-muted-foreground mb-2">
                  Showing {displayOrders.length} orders
                  {infiniteOrdersQuery.hasNextPage && " (more available)"}
                  {infiniteOrdersQuery.data?.pages && infiniteOrdersQuery.data.pages.length > 0 && (
                    <span className="ml-1">- Page {infiniteOrdersQuery.data.pages.length} of results</span>
                  )}
                </div>
              )}

              {/* View More button or status */}
              {infiniteOrdersQuery.isFetchingNextPage ? (
                <div className="flex items-center gap-2 py-4 px-6 bg-muted rounded-md">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading next 100 orders...</span>
                </div>
              ) : infiniteOrdersQuery.hasNextPage ? (
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleLoadMore}
                  className="px-8"
                >
                  View Next 100 Orders
                </Button>
              ) : displayOrders.length > 0 ? (
                <div className="text-sm text-muted-foreground py-4 px-6 bg-muted/50 rounded-md">
                  You've reached the end of the list
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the order and all its items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PaymentStatusDialog
        order={paymentDialogOrder}
        isOpen={isPaymentDialogOpen}
        onClose={() => {
          setIsPaymentDialogOpen(false);
          setPaymentDialogOrder(null);
        }}
        onPaymentStatusChanged={handlePaymentStatusChanged}
      />
    </>
  );
};

export default OrderList;
