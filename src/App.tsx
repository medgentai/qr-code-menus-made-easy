
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { OrganizationProvider } from "@/contexts/organization-context";
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

// Create React Query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <OrganizationProvider>
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

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </OrganizationProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
