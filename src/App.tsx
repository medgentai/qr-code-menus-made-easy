
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { OrganizationProvider } from "@/contexts/organization-context";
import { VenueProvider } from "@/contexts/venue-context";
import { MenuProvider } from "@/contexts/menu-context";
import { NotificationProvider } from "@/contexts/notification-context";
import ErrorBoundary from "@/components/error-boundary";
import ProtectedRoute from "@/components/protected-route";

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


// Organization pages
import OrganizationList from "./pages/organizations/OrganizationList";
import OrganizationCreate from "./pages/organizations/OrganizationCreate";
import OrganizationDetails from "./pages/organizations/OrganizationDetails";
import OrganizationSettings from "./pages/organizations/OrganizationSettings";
import OrganizationMembers from "./pages/organizations/OrganizationMembers";

// Venue pages
import VenueList from "./pages/venues/VenueList";
import VenueCreate from "./pages/venues/VenueCreate";
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

// Create React Query client with optimized options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <OrganizationProvider>
            <VenueProvider>
              <MenuProvider>
                <NotificationProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
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
                    <VenueCreate />
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

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
              </TooltipProvider>
                </NotificationProvider>
              </MenuProvider>
            </VenueProvider>
          </OrganizationProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
