import React, { Suspense } from 'react';
import lazyWithRetry from './utils/lazyWithRetry';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MaintenanceMode from './Components/MaintenanceMode';
import { usePlatformSettings } from './context/PlatformSettingsContext';
import { useAppContext } from './context/AppContext';
import LoadingSpinner from './Components/ui/LoadingSpinner';
import { ProtectedRoute, RoleRoute } from './Components/ProtectedRoute';
import useMediaQuery from './utils/useMediaQuery';
import DialogEnhancer from './Components/DialogEnhancer';
import GoogleAuthProvider from './Components/GoogleAuthProvider';
import AccessibilityEnhancer from './Components/AccessibilityEnhancer';
import HomeRoute from './Components/HomeRoute';
import ConfirmHost from './Components/ConfirmHost';
import RouteMeta from './Components/RouteMeta';

// Lazy-loaded page components for code splitting
const Home = lazyWithRetry(() => import('./Pages/Home'));
const Login = lazyWithRetry(() => import('./Pages/Login'));
const SignUp = lazyWithRetry(() => import('./Pages/SignUp'));
const Shop = lazyWithRetry(() => import('./Pages/Shop'));
const CategoryPage = lazyWithRetry(() => import('./Pages/CategoryPage'));
const ProductDetails = lazyWithRetry(() => import('./Pages/ProductDetails'));
const Cart = lazyWithRetry(() => import('./Pages/Cart'));
const MyOrders = lazyWithRetry(() => import('./Pages/MyOrders'));
const MyImpact = lazyWithRetry(() => import('./Pages/MyImpact'));
const Favorites = lazyWithRetry(() => import('./Pages/Favorites'));
const Notification = lazyWithRetry(() => import('./Pages/Notification'));
const MyProfile = lazyWithRetry(() => import('./Pages/MyProfile'));
const BusinessVerification = lazyWithRetry(() => import('./Pages/BusinessVerification'));
const RiderVerification = lazyWithRetry(() => import('./Pages/RiderRegistration'));
const RiderDashboard = lazyWithRetry(() => import('./Pages/RiderDashboard'));
const PendingReview = lazyWithRetry(() => import('./Pages/PendingReview'));
const FAQ = lazyWithRetry(() => import('./Pages/FAQ'));
const ContactUs = lazyWithRetry(() => import('./Pages/ContactUs'));
const TermsOfService = lazyWithRetry(() => import('./Pages/TermsOfService'));
const PrivacyPolicy = lazyWithRetry(() => import('./Pages/PrivacyPolicy'));
const ImpactMethodology = lazyWithRetry(() => import('./Pages/ImpactMethodology'));
const Dashboard = lazyWithRetry(() => import('./admin/Dashboard'));
const AdminDashboard = lazyWithRetry(() => import('./admin/AdminDashboard'));
const AdminLogin = lazyWithRetry(() => import('./Pages/AdminLogin'));
const ForgotPassword = lazyWithRetry(() => import('./Pages/ForgotPassword'));
const VerifyEmail = lazyWithRetry(() => import('./Pages/VerifyEmail'));
const NotFound = lazyWithRetry(() => import('./Components/NotFound'));

const App = () => {
  const isPhone = useMediaQuery('(max-width: 767px)');
  const { settings } = usePlatformSettings();
  const { user, isLoading } = useAppContext();
  const location = useLocation();

  // Check if user is admin (check all possible fields)
  const isAdmin =
    user &&
    (user.activeRole === 'admin' ||
      user.role === 'admin' ||
      (Array.isArray(user.roles) && user.roles.includes('admin')));

  // Check if current path is admin-related (allow access during maintenance)
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/login';

  // Show maintenance mode for non-admin users on non-admin routes
  // But always allow admin routes and login page so admins can access the dashboard
  if (settings.maintenanceMode && !isAdmin && !isAdminRoute && !isLoading) {
    return <MaintenanceMode />;
  }

  return (
    <div className="overflow-x-clip text-textColor">
      {/* Skip to content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:px-4 focus:py-2 focus:bg-green-700 focus:text-white focus:rounded-lg"
      >
        Skip to content
      </a>

      {/* On phones, toasts sit above the bottom tab bar (and the home indicator) rather than over the header. */}
      <RouteMeta />
      <DialogEnhancer />
      <ConfirmHost />
      <AccessibilityEnhancer />
      <Toaster
        position="top-center"
        // On a phone the bottom edge is where the tab bar, the sticky checkout bar and bottom
        // sheets keep their buttons, so a toast there covers what the person is about to tap.
        // Park it just under the top bar instead.
        containerStyle={isPhone ? { top: 'calc(4.25rem + env(safe-area-inset-top))' } : undefined}
        toastOptions={{ style: { maxWidth: 'calc(100vw - 2rem)' } }}
      />

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <main id="main-content">
          <Routes>
            {/* ===== Public Routes ===== */}
            <Route
              path="/"
              element={
                <HomeRoute>
                  <Home />
                </HomeRoute>
              }
            />
            <Route
              path="/login"
              element={
                <GoogleAuthProvider>
                  <Login />
                </GoogleAuthProvider>
              }
            />
            <Route
              path="/signup"
              element={
                <GoogleAuthProvider>
                  <SignUp />
                </GoogleAuthProvider>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:category" element={<CategoryPage />} />
            <Route path="/shop/:category/:id" element={<ProductDetails />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/how-we-calculate-impact" element={<ImpactMethodology />} />

            {/* ===== Authenticated Routes ===== */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-impact"
              element={
                <ProtectedRoute>
                  <MyImpact />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notification />
                </ProtectedRoute>
              }
            />

            {/* ===== Business Routes ===== */}
            <Route
              path="/business-verification"
              element={
                <ProtectedRoute>
                  <BusinessVerification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pending-review"
              element={
                <ProtectedRoute>
                  <PendingReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleRoute roles={['business_owner', 'admin']}>
                    <Dashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ===== Rider Routes ===== */}
            <Route
              path="/rider-verification"
              element={
                <ProtectedRoute>
                  <RiderVerification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rider-dashboard"
              element={
                <ProtectedRoute>
                  <RoleRoute roles={['rider', 'admin']}>
                    <RiderDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ===== Admin Routes ===== */}
            <Route
              path="/admin/login"
              element={
                <GoogleAuthProvider>
                  <AdminLogin />
                </GoogleAuthProvider>
              }
            />
            <Route path="/login/admin" element={<Navigate to="/admin/login" replace />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleRoute roles="admin" fallback="/login">
                    <AdminDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ===== Catch-all ===== */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Suspense>
    </div>
  );
};

export default App;
