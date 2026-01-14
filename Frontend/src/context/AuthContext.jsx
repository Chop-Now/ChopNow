import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token and get user details
                    // Replace with actual endpoint: const { data } = await api.get('/auth/me');
                    // Mocking for now if backend isn't ready
                    // setUser({ name: 'Test User', role: 'consumer' }); 
                    // For now, let's assume if token exists we are logged in, but ideally we verify.
                    // If backend endpoint exists:
                    // const response = await api.get('/auth/me');
                    // setUser(response.data);

                    // Fallback until backend is connected:
                    const storedUser = localStorage.getItem('userData');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }

                } catch (error) {
                    console.error("Auth check failed", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('userData');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            // const response = await api.post('/auth/login', { email, password });
            // const { token, user } = response.data;

            // Mock login for frontend dev
            const token = "mock_token_" + Date.now();
            const mockUser = { id: 1, name: "Demo User", email, role: "consumer" }; // Default role

            localStorage.setItem('token', token);
            localStorage.setItem('userData', JSON.stringify(mockUser));
            setUser(mockUser);
            toast.success('Login successful!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            // await api.post('/auth/register', userData);
            toast.success('Registration successful! Please login.');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setUser(null);
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isBusiness: user?.role === 'business',
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
