import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  ListFilter,
  CalendarRange,
  Utensils,
  Table as TableIcon,
  DollarSign
} from 'lucide-react';
import { format, subDays } from 'date-fns';
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
  AlertDialogTrigger,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import OrderService, { Order, OrderStatus, FilterOrdersDto } from '@/services/order-service';
import {
  useVenueOrdersQuery,
  useOrganizationOrdersQuery,
  useInfiniteVenueOrdersQuery,
  useInfiniteOrganizationOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation
} from '@/hooks/useOrderQuery';
import { PaginatedOrderList } from '@/components/orders/PaginatedOrderList';

const OrderList: React.FC = () => {
  const { id: organizationId } = useParams<{ id: string }>();
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { currentVenue } = useVenue();

  // Use React Query hooks for data fetching
  const venueOrdersQuery = useVenueOrdersQuery(venueId || '');
  const organizationOrdersQuery = useOrganizationOrdersQuery(organizationId || '');

  // Use infinite query hooks for pagination
  const infiniteVenueOrdersQuery = useInfiniteVenueOrdersQuery(venueId || '', {
    enabled: !!venueId
  });
  const infiniteOrganizationOrdersQuery = useInfiniteOrganizationOrdersQuery(organizationId || '', {
    enabled: !!organizationId
  });

  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const deleteOrderMutation = useDeleteOrderMutation();

  // Determine which query to use based on the route
  const {
    data: orders = [],
    isLoading,
    refetch: refetchOrders
  } = venueId ? venueOrdersQuery : organizationOrdersQuery;

  // Determine which infinite query to use
  const infiniteOrdersQuery = venueId
    ? infiniteVenueOrdersQuery
    : organizationId
      ? infiniteOrganizationOrdersQuery
      : {
          data: undefined,
          hasNextPage: false,
          hasPreviousPage: false,
          fetchNextPage: async () => {},
          fetchPreviousPage: async () => {},
          isFetchingNextPage: false,
          refetch: async () => {}
        };

  // Extract all orders from infinite query pages
  const infiniteOrders = useMemo(() => {
    if (!infiniteOrdersQuery.data) {
      return [];
    }

    // Handle case where pages might be arrays directly
    const extractedOrders = infiniteOrdersQuery.data.pages
      .flatMap(page => {
        // If page is an array, it means the backend returned an array directly
        if (Array.isArray(page)) {
          return page;
        }

        // Otherwise, extract data from the paginated response
        return page?.data || [];
      })
      .filter(order => order && order.id);

    return extractedOrders;
  }, [infiniteOrdersQuery.data]);

  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Order statistics
  const orderStats = useMemo(() => {
    // Handle both array and paginated response types
    const orderArray = Array.isArray(orders) ? orders : orders.data;

    const total = orderArray.length;
    const pending = orderArray.filter(o => o.status === OrderStatus.PENDING).length;
    const confirmed = orderArray.filter(o => o.status === OrderStatus.CONFIRMED).length;
    const preparing = orderArray.filter(o => o.status === OrderStatus.PREPARING).length;
    const ready = orderArray.filter(o => o.status === OrderStatus.READY).length;
    const delivered = orderArray.filter(o => o.status === OrderStatus.DELIVERED).length;
    const completed = orderArray.filter(o => o.status === OrderStatus.COMPLETED).length;
    const cancelled = orderArray.filter(o => o.status === OrderStatus.CANCELLED).length;

    const totalAmount = orderArray.reduce((sum, order) => {
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
  }, [orders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchOrders();
    await infiniteOrdersQuery.refetch();
    setIsRefreshing(false);
  };

  // Function to load more orders
  const handleLoadMore = async () => {
    if (infiniteOrdersQuery.hasNextPage && !infiniteOrdersQuery.isFetchingNextPage) {
      await infiniteOrdersQuery.fetchNextPage();
    }
  };

  // Set up intersection observer for infinite scrolling
  const observerTarget = useRef(null);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [infiniteOrdersQuery.hasNextPage, infiniteOrdersQuery.isFetchingNextPage]);

  // Trigger initial data fetch when component mounts
  useEffect(() => {
    // Force a refetch of the infinite query
    if (venueId) {
      infiniteVenueOrdersQuery.refetch();
    } else if (organizationId) {
      infiniteOrganizationOrdersQuery.refetch();
    }
  }, [venueId, organizationId]);

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
          refetchOrders(); // Refresh the order data
        }
      }
    );
  };

  // Filter regular orders
  const filteredOrders = useMemo(() => {
    // Handle both array and paginated response types
    const orderArray = Array.isArray(orders) ? orders : orders.data;

    return orderArray.filter(order => {
      if (!order || !order.id) return false;

      const matchesSearch =
        !searchTerm ||
        (order.customerName ? order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (order.customerPhone ? order.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (order.customerEmail ? order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.table?.name ? order.table.name.toLowerCase().includes(searchTerm.toLowerCase()) : false);

      const matchesStatus = !statusFilter || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Filter infinite orders
  const filteredInfiniteOrders = useMemo(() => {
    return infiniteOrders.filter(order => {
      if (!order || !order.id) {
        return false;
      }

      const matchesSearch =
        !searchTerm ||
        (order.customerName ? order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (order.customerPhone ? order.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (order.customerEmail ? order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.table?.name ? order.table.name.toLowerCase().includes(searchTerm.toLowerCase()) : false);

      const matchesStatus = !statusFilter || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [infiniteOrders, searchTerm, statusFilter]);

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
                <DropdownMenuItem onClick={() => setStatusFilter('')}>
                  All Statuses
                </DropdownMenuItem>
                {Object.values(OrderStatus).map((status) => (
                  <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                    <Badge variant="outline" className={`mr-2 ${getStatusBadgeClass(status)}`}>
                      {status}
                    </Badge>
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
                  {filteredInfiniteOrders.map((order) => (
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
                      <TableCell>{order.table?.name || 'N/A'}</TableCell>
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

            {/* Intersection observer target for infinite scrolling */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
              {infiniteOrdersQuery.isFetchingNextPage && (
                <div className="text-sm text-muted-foreground">Loading more orders...</div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInfiniteOrders.map((order) => (
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

            {/* Intersection observer target for infinite scrolling */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center mt-4">
              {infiniteOrdersQuery.isFetchingNextPage && (
                <div className="text-sm text-muted-foreground">Loading more orders...</div>
              )}
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
