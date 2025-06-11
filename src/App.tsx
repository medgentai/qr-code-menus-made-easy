
import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { OrganizationProvider } from "@/contexts/organization-context";
import { VenueProvider } from "@/contexts/venue-context";
import { MenuProvider } from "@/contexts/menu-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { PermissionProvider } from "@/contexts/permission-context";
import { NavigationProvider } from "@/contexts/navigation-context";
import ErrorBoundary from "@/components/error-boundary";
import ProtectedRoute from "@/components/protected-route";
import TokenRefreshManager from "@/components/TokenRefreshManager";
import OrganizationGuard from "@/components/organization-guard";
import { AdminGuard } from "@/components/admin-guard";

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Critical path pages (immediate load)
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import NotFound from "./pages/NotFound";

// Lazy loaded public pages
const Features = lazy(() => import("./pages/Features"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const UseCases = lazy(() => import("./pages/UseCases"));
const RestaurantUseCase = lazy(() => import("./pages/RestaurantUseCase"));
const HotelUseCase = lazy(() => import("./pages/HotelUseCase"));
const CafeUseCase = lazy(() => import("./pages/CafeUseCase"));
const FoodTruckUseCase = lazy(() => import("./pages/FoodTruckUseCase"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Contact = lazy(() => import("./pages/Contact"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));

// Lazy loaded auth pages
const VerifyOtp = lazy(() => import("./pages/auth/VerifyOtp"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const AccountSuspended = lazy(() => import("./pages/AccountSuspended"));

// Lazy loaded dashboard pages
const Profile = lazy(() => import("./pages/profile/Profile"));

// Lazy loaded staff dashboard pages
const KitchenDashboard = lazy(() => import("./pages/staff/KitchenDashboard"));
const Subscriptions = lazy(() => import("./pages/subscriptions/Subscriptions"));
const SubscriptionManage = lazy(() => import("./pages/subscriptions/SubscriptionManage"));

// Lazy loaded admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const OrganizationManagement = lazy(() => import("./pages/admin/OrganizationManagement"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(module => ({ default: module.AdminLayout })));

// Lazy loaded organization pages
const OrganizationList = lazy(() => import("./pages/organizations/OrganizationList"));
const OrganizationCreate = lazy(() => import("./pages/organizations/OrganizationCreate"));
const OrganizationCreateWithPayment = lazy(() => import("./pages/organizations/OrganizationCreateWithPayment"));
const OrganizationDetails = lazy(() => import("./pages/organizations/OrganizationDetails"));
const OrganizationSettings = lazy(() => import("./pages/organizations/OrganizationSettings"));
const OrganizationMembers = lazy(() => import("./pages/organizations/OrganizationMembers"));
const OrganizationQrCodes = lazy(() => import("./pages/organizations/OrganizationQrCodes"));

// Lazy loaded invitation pages
const InvitationAccept = lazy(() => import("./pages/invitation/InvitationAccept"));

// Lazy loaded venue pages
const VenueList = lazy(() => import("./pages/venues/VenueList"));
const VenueCreateWithPayment = lazy(() => import("./pages/venues/VenueCreateWithPayment"));
const VenueDetails = lazy(() => import("./pages/venues/VenueDetails"));
const VenueEdit = lazy(() => import("./pages/venues/VenueEdit"));
const VenueTables = lazy(() => import("./pages/venues/VenueTables"));
const VenueSettings = lazy(() => import("./pages/venues/VenueSettings"));
const TableCreate = lazy(() => import("./pages/venues/TableCreate"));
const TableEdit = lazy(() => import("./pages/venues/TableEdit"));

// Lazy loaded menu pages
const MenuList = lazy(() => import("./pages/menus/MenuList"));
const MenuCreate = lazy(() => import("./pages/menus/MenuCreate"));
const MenuDetails = lazy(() => import("./pages/menus/MenuDetails"));
const MenuEdit = lazy(() => import("./pages/menus/MenuEdit"));
const CategoryCreate = lazy(() => import("./pages/menus/CategoryCreate"));
const CategoryEdit = lazy(() => import("./pages/menus/CategoryEdit"));
const MenuItemCreate = lazy(() => import("./pages/menus/MenuItemCreate"));
const MenuItemEdit = lazy(() => import("./pages/menus/MenuItemEdit"));
const MenuPreview = lazy(() => import("./pages/menus/MenuPreview"));

// Lazy loaded QR code pages
const QrCodeCreate = lazy(() => import("./pages/qr-codes/QrCodeCreate"));
const QrCodeDetails = lazy(() => import("./pages/qr-codes/QrCodeDetails"));
const QrCodeEdit = lazy(() => import("./pages/qr-codes/QrCodeEdit"));

// Lazy loaded order pages
const OrderList = lazy(() => import("./pages/orders/OrderList"));
const OrderDetails = lazy(() => import("./pages/orders/OrderDetails"));
const OrderCreate = lazy(() => import("./pages/orders/OrderCreate"));
const OrderEdit = lazy(() => import("./pages/orders/OrderEdit"));

// Lazy loaded public menu pages
const PublicMenuWrapper = lazy(() => import("./pages/public/PublicMenuWrapper"));
const PublicMenu = lazy(() => import("./pages/public/PublicMenu"));

// Create React Query client with highly optimized options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2; // Only retry server errors twice
      },
      staleTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
      gcTime: 30 * 60 * 1000, // 30 minutes - keep data longer in cache
      refetchOnMount: 'stale', // Only refetch if data is stale
      refetchOnReconnect: 'stale', // Only refetch stale data on reconnect
      refetchInterval: false, // Disable periodic refetching
      networkMode: 'online', // Only run queries when online
    },
    mutations: {
      retry: 1, // Retry mutations once on failure
      networkMode: 'online',
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TokenRefreshManager />
          <OrganizationProvider>
            <VenueProvider>
              <MenuProvider>
                <PermissionProvider>
                  <NavigationProvider>
                    <NotificationProvider>
                      <TooltipProvider>
                    <Toaster />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/use-cases" element={<UseCases />} />
                  <Route path="/use-cases/restaurants" element={<RestaurantUseCase />} />
                  <Route path="/use-cases/hotels" element={<HotelUseCase />} />
                  <Route path="/use-cases/cafes" element={<CafeUseCase />} />
                  <Route path="/use-cases/food-trucks" element={<FoodTruckUseCase />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/get-started" element={<GetStarted />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Blog />} />

              {/* Public Menu routes */}
              <Route path="/:slug" element={<PublicMenuWrapper />}>
                <Route index element={<PublicMenu />} />
                <Route path="cart" element={<PublicMenu />} />
                <Route path="checkout" element={<PublicMenu />} />
                <Route path="confirmation" element={<PublicMenu />} />
                <Route path="track" element={<PublicMenu />} />
              </Route>

              {/* Authentication routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/account-suspended" element={<AccountSuspended />} />

              {/* Keep the /auth/* routes for backward compatibility */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/verify-otp" element={<VerifyOtp />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <OrganizationGuard>
                      <Dashboard />
                    </OrganizationGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscriptions"
                element={
                  <ProtectedRoute>
                    <Subscriptions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscriptions/:id/manage"
                element={
                  <ProtectedRoute>
                    <SubscriptionManage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Dashboard routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminGuard>
                      <AdminLayout />
                    </AdminGuard>
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="organizations" element={<OrganizationManagement />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Staff Dashboard routes */}
              <Route
                path="/kitchen-dashboard"
                element={
                  <ProtectedRoute>
                    <KitchenDashboard />
                  </ProtectedRoute>
                }
              />              {/* Organization routes */}
              <Route
                path="/organizations"
                element={
                  <ProtectedRoute>
                    <OrganizationList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/create"
                element={
                  <ProtectedRoute>
                    <OrganizationCreateWithPayment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/create-simple"
                element={
                  <ProtectedRoute>
                    <OrganizationCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id"
                element={
                  <ProtectedRoute>
                    <OrganizationGuard>
                      <OrganizationDetails />
                    </OrganizationGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/settings"
                element={
                  <ProtectedRoute>
                    <OrganizationGuard>
                      <OrganizationSettings />
                    </OrganizationGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/members"
                element={
                  <ProtectedRoute>
                    <OrganizationGuard>
                      <OrganizationMembers />
                    </OrganizationGuard>
                  </ProtectedRoute>
                }
              />              <Route
                path="/organizations/:id/qrcodes"
                element={
                  <ProtectedRoute>
                    <OrganizationGuard>
                      <OrganizationQrCodes />
                    </OrganizationGuard>
                  </ProtectedRoute>
                }
              />

              {/* Venue routes */}
              <Route
                path="/organizations/:id/venues"
                element={
                  <ProtectedRoute>
                    <OrganizationGuard>
                      <VenueList />
                    </OrganizationGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/venues/create"
                element={
                  <ProtectedRoute>
                    <VenueCreateWithPayment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/venues/:venueId"
                element={
                  <ProtectedRoute>
                    <VenueDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/venues/:venueId/edit"
                element={
                  <ProtectedRoute>
                    <VenueEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/venues/:venueId/tables/create"
                element={
                  <ProtectedRoute>
                    <TableCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/venues/:venueId/tables/:tableId/edit"
                element={
                  <ProtectedRoute>
                    <TableEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/venues/:venueId/tables"
                element={
                  <ProtectedRoute>
                    <VenueTables />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/venues/:venueId/settings"
                element={
                  <ProtectedRoute>
                    <VenueSettings />
                  </ProtectedRoute>
                }
              />

              {/* QR Code routes */}
              <Route
                path="/organizations/:id/venues/:venueId/qrcodes/create"
                element={
                  <ProtectedRoute>
                    <QrCodeCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/venues/:venueId/qrcodes/:qrCodeId"
                element={
                  <ProtectedRoute>
                    <QrCodeDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/venues/:venueId/qrcodes/:qrCodeId/edit"
                element={
                  <ProtectedRoute>
                    <QrCodeEdit />
                  </ProtectedRoute>
                }
              />

              {/* Menu routes */}
              <Route
                path="/organizations/:id/menus"
                element={
                  <ProtectedRoute>
                    <MenuList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/menus/create"
                element={
                  <ProtectedRoute>
                    <MenuCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/menus/:menuId"
                element={
                  <ProtectedRoute>
                    <MenuDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/menus/:menuId/edit"
                element={
                  <ProtectedRoute>
                    <MenuEdit />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizations/:id/menus/:menuId/categories/create"
                element={
                  <ProtectedRoute>
                    <CategoryCreate />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizations/:id/menus/:menuId/categories/:categoryId/edit"
                element={
                  <ProtectedRoute>
                    <CategoryEdit />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizations/:id/menus/:menuId/categories/:categoryId/items/create"
                element={
                  <ProtectedRoute>
                    <MenuItemCreate />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizations/:id/menus/:menuId/categories/:categoryId/items/:itemId/edit"
                element={
                  <ProtectedRoute>
                    <MenuItemEdit />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizations/:id/menus/:menuId/preview"
                element={
                  <ProtectedRoute>
                    <MenuPreview />
                  </ProtectedRoute>
                }
              />

              {/* Order routes - Organization level */}
              <Route
                path="/organizations/:id/orders"
                element={
                  <ProtectedRoute>
                    <OrderList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/orders/create"
                element={
                  <ProtectedRoute>
                    <OrderCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/orders/:orderId/edit"
                element={
                  <ProtectedRoute>
                    <OrderEdit />
                  </ProtectedRoute>
                }
              />

              {/* Order routes - Venue level */}
              <Route
                path="/organizations/:id/venues/:venueId/orders"
                element={
                  <ProtectedRoute>
                    <OrderList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/venues/:venueId/orders/create"
                element={
                  <ProtectedRoute>
                    <OrderCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/venues/:venueId/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/venues/:venueId/orders/:orderId/edit"
                element={
                  <ProtectedRoute>
                    <OrderEdit />
                  </ProtectedRoute>
                }
              />

              {/* Invitation routes */}
              <Route path="/invitation" element={<InvitationAccept />} />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              </TooltipProvider>
                </NotificationProvider>
                  </NavigationProvider>
                </PermissionProvider>
              </MenuProvider>
            </VenueProvider>
          </OrganizationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
