import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Login from '../pages/Login';
import Register from '../pages/Auth/Register';
import SignUp from '../pages/SignUp';
import Profile from '../pages/Profile/Profile';
import Settings from '../pages/Profile/Settings';
import BusinessRoutes from './BusinessRoutes';
import AdminDashboard from '../pages/Admin/Dashboard';
import NotFound from '../Components/NotFound';

import HomePage from '../pages/Consumer/HomePage';
import SearchPage from '../pages/Consumer/SearchPage';
import Cart from '../pages/Consumer/Cart';
import Checkout from '../pages/Consumer/Checkout';
import OrderSuccess from '../pages/Consumer/OrderSuccess';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes */}
            <Route
                path="/checkout"
                element={
                    <ProtectedRoute>
                        <Checkout />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/order-success"
                element={
                    <ProtectedRoute>
                        <OrderSuccess />
                    </ProtectedRoute>
                }
            />

            {/* Protected User Routes */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                }
            />

            {/* Business Routes */}
            <Route
                path="/business/*"
                element={
                    <ProtectedRoute allowedRoles={['business_owner', 'business', 'admin']}>
                        <BusinessRoutes />
                    </ProtectedRoute>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
