import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './Pages/Home'
import Login from './Pages/Login'
import SignUp from './Pages/SignUp'
import Shop from './Pages/Shop'
import CategoryPage from './Pages/CategoryPage'
import { Toaster } from 'react-hot-toast'
import ProductDetails from './Pages/ProductDetails'
import Cart from './Pages/Cart'
import MyOrders from './Pages/MyOrders'
import MyImpact from './Pages/MyImpact'
import Notification from './Pages/Notification'
import MyProfile from './Pages/MyProfile'
import BusinessVerification from './Pages/BusinessVerification'
import PendingReview from './Pages/PendingReview'
import FAQ from './Pages/FAQ'
import ContactUs from './Pages/ContactUs'
import TermsOfService from './Pages/TermsOfService'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import Dashboard from './admin/Dashboard'
import AdminDashboard from './admin/AdminDashboard'
import AdminLogin from './Pages/AdminLogin'
import NotFound from './Components/NotFound'
import MaintenanceMode from './Components/MaintenanceMode'
import { usePlatformSettings } from './context/PlatformSettingsContext'
import { useAppContext } from './context/AppContext'

const App = () => {
  const { settings } = usePlatformSettings();
  const { user, isLoading } = useAppContext();
  const location = useLocation();

  // Check if user is admin (check all possible fields)
  const isAdmin = user && (
    user.activeRole === 'admin' ||
    user.role === 'admin' ||
    (Array.isArray(user.roles) && user.roles.includes('admin'))
  );

  // Check if current path is admin-related (allow access during maintenance)
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/login';

  // Show maintenance mode for non-admin users on non-admin routes
  // But always allow admin routes and login page so admins can access the dashboard
  if (settings.maintenanceMode && !isAdmin && !isAdminRoute && !isLoading) {
    return <MaintenanceMode />;
  }

  return (
    <main className='overflow-x-hidden text-textColor'>

      <Toaster />
     
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/business-verification' element={<BusinessVerification />} />
        <Route path='/pending-review' element={<PendingReview />} />
        <Route path='/shop' element={<Shop />} />
        <Route path='/shop/:category' element={<CategoryPage />} />
        <Route path='/shop/:category/:id' element={<ProductDetails />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/my-orders' element={<MyOrders />} />
        <Route path='/my-impact' element={<MyImpact />} />
        <Route path='/my-profile' element={<MyProfile />} />
        <Route path='/notifications' element={<Notification />} />
        <Route path='/faq' element={<FAQ />} />
        <Route path='/contact-us' element={<ContactUs />} />
        <Route path='/terms-of-service' element={<TermsOfService />} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  )
}

export default App
