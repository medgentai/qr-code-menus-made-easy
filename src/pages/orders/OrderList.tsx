import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Phone,
  Mail,
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
  Loader2
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
import { Separator } from '@/components/ui/separator';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import OrderService, { Order, OrderStatus, FilterOrdersDto } from '@/services/order-service';
import {
  useInfiniteFilteredOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation
} from '@/hooks/useOrderQuery';

const OrderList: React.FC = () => {
  const { id: organizationId } = useParams<{ id: string }>();
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { currentVenue, venues, fetchVenuesForOrganization } = useVenue();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [venueFilter, setVenueFilter] = useState<string>('');

  // Fetch venues for the organization when component mounts
  useEffect(() => {
    if (organizationId) {
      fetchVenuesForOrganization(organizationId);
    }
  }, [organizationId, fetchVenuesForOrganization]);

  // Use a simple loading state instead of regular queries
  const [isLoading, setIsLoading] = useState(true);

  // Combined filters state
  const [filters, setFilters] = useState<FilterOrdersDto>({
    organizationId: organizationId || undefined,
    venueId: venueId || venueFilter || undefined,
    status: statusFilter || undefined
  });

  // Use the new infinite filtered query hook with combined filters
  const infiniteOrdersQuery = useInfiniteFilteredOrdersQuery(filters);

  // Update mutations
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const deleteOrderMutation = useDeleteOrderMutation();

  // Extract all orders from infinite query pages
  const infiniteOrders = useMemo(() => {
    if (!infiniteOrdersQuery.data) {
      return [];
    }

    // Extract data from the paginated response
    const extractedOrders = infiniteOrdersQuery.data.pages
      .flatMap((page: any) => {
        // Each page is a paginated response with a data property containing orders
        if (page && Array.isArray(page.data)) {
          return page.data;
        }

        // Fallback for any other structure
        return [];
      })
      .filter((order: any) => order && order.id);


    return extractedOrders;
  }, [infiniteOrdersQuery.data]);

  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Order statistics - using infinite query data for consistency
  const orderStats = useMemo(() => {
    // Use the infinite orders data for statistics
    const total = infiniteOrders.length;
    const pending = infiniteOrders.filter((o: Order) => o.status === OrderStatus.PENDING).length;
    const confirmed = infiniteOrders.filter((o: Order) => o.status === OrderStatus.CONFIRMED).length;
    const preparing = infiniteOrders.filter((o: Order) => o.status === OrderStatus.PREPARING).length;
    const ready = infiniteOrders.filter((o: Order) => o.status === OrderStatus.READY).length;
    const delivered = infiniteOrders.filter((o: Order) => o.status === OrderStatus.DELIVERED).length;
    const completed = infiniteOrders.filter((o: Order) => o.status === OrderStatus.COMPLETED).length;
    const cancelled = infiniteOrders.filter((o: Order) => o.status === OrderStatus.CANCELLED).length;

    const totalAmount = infiniteOrders.reduce((sum: number, order: Order) => {
      return sum + parseFloat(order.totalAmount);
    }, 0);

    return {
      total,
      pending,
      confirmed,
      preparing,
      ready,
      delivered,
      completed,
      cancelled,
      totalAmount
    };
  }, [infiniteOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);

    try {
      // Refresh the filtered query
      await infiniteOrdersQuery.refetch();
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // Function to load more orders - memoized to prevent unnecessary re-renders
  const handleLoadMore = useCallback(async () => {
    if (infiniteOrdersQuery.hasNextPage && !infiniteOrdersQuery.isFetchingNextPage) {
      await infiniteOrdersQuery.fetchNextPage();
    }
  }, [infiniteOrdersQuery.hasNextPage, infiniteOrdersQuery.isFetchingNextPage, infiniteOrdersQuery.fetchNextPage]);

  // Update filters when route params or filter selections change
  useEffect(() => {
    setFilters({
      organizationId: organizationId || undefined,
      venueId: venueId || venueFilter || undefined,
      status: statusFilter || undefined
    });
  }, [organizationId, venueId, venueFilter, statusFilter]);

  // Set loading state when filters change or query is fetching
  useEffect(() => {
    setIsLoading(infiniteOrdersQuery.isLoading || infiniteOrdersQuery.isFetching);
  }, [infiniteOrdersQuery.isLoading, infiniteOrdersQuery.isFetching]);

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

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    updateOrderStatusMutation.mutate(
      { id: orderId, status },
      {
        onSuccess: () => {
          // Refresh the infinite query data
          infiniteOrdersQuery.refetch();
        }
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

  const getStatusBadgeClass = (status: OrderStatus) => {
    return OrderService.getStatusColor(status);
  };

  const formatCurrency = (amount: string) => {
    return OrderService.formatCurrency(amount);
  };

  // Get status icon based on order status
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case OrderStatus.CONFIRMED:
        return <CheckCircle2 className="h-4 w-4" />;
      case OrderStatus.PREPARING:
        return <Utensils className="h-4 w-4" />;
      case OrderStatus.READY:
        return <CheckCircle2 className="h-4 w-4" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle2 className="h-4 w-4" />;
      case OrderStatus.COMPLETED:
        return <CheckCircle2 className="h-4 w-4" />;
      case OrderStatus.CANCELLED:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with title and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage orders for {currentVenue?.name || currentOrganization?.name || 'your business'}
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
            <Button onClick={handleCreateOrder} className="w-full sm:w-auto h-10">
              <Plus className="mr-2 h-4 w-4" /> Create Order
            </Button>
          </div>
        </div>

        {/* Order Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(orderStats.totalAmount.toFixed(2))} total value
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orderStats.pending + orderStats.confirmed + orderStats.preparing + orderStats.ready}
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className={getStatusBadgeClass(OrderStatus.PENDING)}>
                  {orderStats.pending} Pending
                </Badge>
                <Badge variant="outline" className={getStatusBadgeClass(OrderStatus.PREPARING)}>
                  {orderStats.preparing} Preparing
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium">Ready Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.ready}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className={getStatusBadgeClass(OrderStatus.READY)}>
                  Ready for Pickup/Delivery
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.completed}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className={getStatusBadgeClass(OrderStatus.COMPLETED)}>
                  Completed
                </Badge>
                <Badge variant="outline" className={getStatusBadgeClass(OrderStatus.CANCELLED)}>
                  {orderStats.cancelled} Cancelled
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Selector and Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter ? `Status: ${statusFilter}` : 'Filter by Status'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    // Only update if we're changing from a filtered state
                    if (statusFilter !== '') {
                      setStatusFilter('');
                      // Filter changes are now handled by the useEffect that updates filters
                    }
                  }}
                >
                  All Statuses
                </DropdownMenuItem>
                {Object.values(OrderStatus).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => {
                      // Only update if we're changing to a different status
                      if (statusFilter !== status) {
                        setStatusFilter(status);
                        // Filter changes are now handled by the useEffect that updates filters
                      }
                    }}
                  >
                    <Badge variant="outline" className={`mr-2 ${getStatusBadgeClass(status)}`}>
                      {status}
                    </Badge>
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Venue Filter Dropdown - Only show on organization page */}
            {organizationId && !venueId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Store className="mr-2 h-4 w-4" />
                    {venueFilter ? `Venue: ${venues.find(v => v.id === venueFilter)?.name || 'Selected'}` : 'All Venues'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Venue</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      // Only update if we're changing from a filtered state
                      if (venueFilter !== '') {
                        setVenueFilter('');
                        // Filter changes are now handled by the useEffect that updates filters
                      }
                    }}
                  >
                    All Venues
                  </DropdownMenuItem>
                  {venues.map((venue) => (
                    <DropdownMenuItem
                      key={venue.id}
                      onClick={() => {
                        // Only update if we're changing to a different venue
                        if (venueFilter !== venue.id) {
                          setVenueFilter(venue.id);
                          // Filter changes are now handled by the useEffect that updates filters
                        }
                      }}
                    >
                      <Store className="mr-2 h-4 w-4" />
                      {venue.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

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
              {!searchTerm && !statusFilter && (
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
                        {order.table?.name || 'N/A'}
                        {/* Show venue name when viewing at organization level */}
                        {organizationId && !venueId && !venueFilter && order.table?.venue?.name && (
                          <div className="text-xs text-muted-foreground">
                            <Store className="h-3 w-3 inline mr-1" />
                            {order.table.venue.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{order.items?.length || 0}</TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeClass(order.status)}>
                          {order.status}
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
                            <DropdownMenuItem onClick={() => handleEditOrder(order.id)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            {Object.values(OrderStatus).map((status) => (
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => confirmDelete(order)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Order
                            </DropdownMenuItem>
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInfiniteOrders.map((order: Order) => (
                <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col min-h-[280px]">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          Order #{order.id.substring(0, 8)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(order.createdAt), 'MMM d, yyyy')}
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3" />
                          {format(new Date(order.createdAt), 'h:mm a')}
                        </CardDescription>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className={getStatusBadgeClass(order.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(order.status)}
                                <span>{order.status}</span>
                              </div>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Current status: {order.status}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-2 flex-grow">
                    <div className="space-y-3 h-full">
                      <div className="flex flex-col gap-1">
                        {order.table && (
                          <div className="flex items-center gap-2 text-sm">
                            <TableIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{order.table.name}</span>

                            {/* Show venue name when viewing at organization level */}
                            {organizationId && !venueId && !venueFilter && order.table?.venue?.name && (
                              <span className="text-xs text-muted-foreground ml-1">
                                <Store className="h-3 w-3 inline mx-1" />
                                {order.table.venue.name}
                              </span>
                            )}
                          </div>
                        )}

                        {order.customerName && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>{order.customerName}</span>
                          </div>
                        )}

                        {order.customerPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{order.customerPhone}</span>
                          </div>
                        )}

                        {order.customerEmail && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{order.customerEmail}</span>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm">
                          <Utensils className="h-3 w-3 text-muted-foreground" />
                          <span>{order.items?.length || 0} items</span>
                        </div>
                        <div className="text-sm font-bold">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between gap-2 p-4 pt-2 pb-2 bg-muted/20 mt-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order.id)}
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Button>
                    <Separator orientation="vertical" className="h-8" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditOrder(order.id)}
                      className="flex-1"
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Separator orientation="vertical" className="h-8" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex-1">
                          <MoreHorizontal className="mr-2 h-4 w-4" /> More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.values(OrderStatus).map((status) => (
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => confirmDelete(order)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination info and View More button */}
            <div className="mt-6 flex flex-col items-center gap-2">
              {/* Pagination info */}
              {filteredInfiniteOrders.length > 0 && (
                <div className="text-sm text-muted-foreground mb-2">
                  Showing {filteredInfiniteOrders.length} orders
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
              ) : filteredInfiniteOrders.length > 0 ? (
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
    </>
  );
};

export default OrderList;
