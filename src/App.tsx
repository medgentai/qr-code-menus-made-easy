
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

// Public pages
import Index from "./pages/Index";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import UseCases from "./pages/UseCases";
import RestaurantUseCase from "./pages/RestaurantUseCase";
import HotelUseCase from "./pages/HotelUseCase";
import CafeUseCase from "./pages/CafeUseCase";
import FoodTruckUseCase from "./pages/FoodTruckUseCase";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import GetStarted from "./pages/GetStarted";
import About from "./pages/About";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Dashboard pages
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/profile/Profile";

// Staff Dashboard pages
import KitchenDashboard from "./pages/staff/KitchenDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import Subscriptions from "./pages/subscriptions/Subscriptions";
import SubscriptionManage from "./pages/subscriptions/SubscriptionManage";


// Organization pages
import OrganizationList from "./pages/organizations/OrganizationList";
import OrganizationCreate from "./pages/organizations/OrganizationCreate";
import OrganizationCreateWithPayment from "./pages/organizations/OrganizationCreateWithPayment";
import OrganizationDetails from "./pages/organizations/OrganizationDetails";
import OrganizationSettings from "./pages/organizations/OrganizationSettings";
import OrganizationMembers from "./pages/organizations/OrganizationMembers";
import OrganizationQrCodes from "./pages/organizations/OrganizationQrCodes";

// Invitation pages
import InvitationAccept from "./pages/invitation/InvitationAccept";

// Venue pages
import VenueList from "./pages/venues/VenueList";
import VenueCreate from "./pages/venues/VenueCreate";
import VenueCreateWithPayment from "./pages/venues/VenueCreateWithPayment";
import VenueDetails from "./pages/venues/VenueDetails";
import VenueEdit from "./pages/venues/VenueEdit";
import VenueTables from "./pages/venues/VenueTables";
import VenueSettings from "./pages/venues/VenueSettings";
import TableCreate from "./pages/venues/TableCreate";
import TableEdit from "./pages/venues/TableEdit";

// Menu pages
import MenuList from "./pages/menus/MenuList";
import MenuCreate from "./pages/menus/MenuCreate";
import MenuDetails from "./pages/menus/MenuDetails";
import MenuEdit from "./pages/menus/MenuEdit";
import CategoryCreate from "./pages/menus/CategoryCreate";
import CategoryEdit from "./pages/menus/CategoryEdit";
import MenuItemCreate from "./pages/menus/MenuItemCreate";
import MenuItemEdit from "./pages/menus/MenuItemEdit";
import MenuPreview from "./pages/menus/MenuPreview";

// QR Code pages
import QrCodeCreate from "./pages/qr-codes/QrCodeCreate";
import QrCodeDetails from "./pages/qr-codes/QrCodeDetails";
import QrCodeEdit from "./pages/qr-codes/QrCodeEdit";

// Order pages
import OrderList from "./pages/orders/OrderList";
import OrderDetails from "./pages/orders/OrderDetails";
import OrderCreate from "./pages/orders/OrderCreate";
import OrderEdit from "./pages/orders/OrderEdit";

// Public Menu pages
import PublicMenuWrapper from "./pages/public/PublicMenuWrapper";

// Create React Query client with optimized options to reduce unnecessary API calls
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1, // Only retry failed queries once
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh for 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes - keep unused data in cache for 15 minutes
      refetchOnMount: false, // Don't automatically refetch on mount to prevent cascading API calls
      refetchOnReconnect: false, // Don't refetch on reconnect to reduce API calls
      refetchInterval: false, // Disable periodic refetching
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
              <Route path="/:slug" element={<PublicMenuWrapper />} />

              {/* Authentication routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Keep the /auth/* routes for backward compatibility */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/verify-otp" element={<VerifyOtp />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
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

              {/* Staff Dashboard routes */}
              <Route
                path="/kitchen-dashboard"
                element={
                  <ProtectedRoute>
                    <KitchenDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/staff-dashboard"
                element={
                  <ProtectedRoute>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Organization routes */}
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
                    <OrganizationDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/settings"
                element={
                  <ProtectedRoute>
                    <OrganizationSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/members"
                element={
                  <ProtectedRoute>
                    <OrganizationMembers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations/:id/qrcodes"
                element={
                  <ProtectedRoute>
                    <OrganizationQrCodes />
                  </ProtectedRoute>
                }
              />

              {/* Venue routes */}
              <Route
                path="/organizations/:id/venues"
                element={
                  <ProtectedRoute>
                    <VenueList />
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
