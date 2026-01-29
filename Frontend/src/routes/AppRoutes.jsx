import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Login from '../Pages/Auth/Login';
import Register from '../Pages/Auth/Register';
import SignUp from '../Pages/SignUp';
import Profile from '../Pages/Profile/Profile';
import Settings from '../Pages/Profile/Settings';
import BusinessRoutes from './BusinessRoutes';
import AdminDashboard from '../Pages/Admin/Dashboard';
import NotFound from '../Components/NotFound';

import HomePage from '../Pages/Consumer/HomePage';
import SearchPage from '../Pages/Consumer/SearchPage';
import Cart from '../Pages/Consumer/Cart';
import Checkout from '../Pages/Consumer/Checkout';
import OrderSuccess from '../Pages/Consumer/OrderSuccess';

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
