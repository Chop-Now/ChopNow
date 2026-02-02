import React, { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authService, api } from '../services'
import axios from 'axios'

export const AppContext = createContext()

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider')
  }
  return context
}

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState({})

  // Check for existing session
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Login function
  const login = async (email, password, role) => {
    try {
      const data = await authService.login({ email, password });

      // Verify role matches if needed
      if (role && data.user.role !== role && data.user.role !== 'admin') {
        // Log warning but proceed for now
        console.warn(`User role ${data.user.role} does not match selected role ${role}`);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error("Login Check failed", error);
      throw error;
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);

      // Auto-login after registration
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  }

  // Google Login function
  const googleAuth = async (accessToken) => {
    try {
      const { data } = await api.post('/api/users/google-login', { accessToken });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return data;
    } catch (error) {
      console.error("Google Login failed", error);
      toast.error(error.response?.data?.message || 'Google Login failed');
      throw error;
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  }

  // Fetch products (placeholder - replace with actual product service later if needed)
  const fetchProducts = async () => {
    try {
      const { dummyProducts } = await import('../assets/assets');
      setProducts(dummyProducts);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Cart Logic (Local state for now, can be moved to backend later)
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to cart");
  }

  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Cart updated");
  }

  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] <= 0) {
        delete cartData[itemId];
      }
    }
    toast.success("Removed from cart");
    setCartItems(cartData);
  }

  const removeAllFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      delete cartData[itemId];
      toast.success("Removed from cart");
    }
    setCartItems(cartData);
  }

  const getTotalCartItems = () => {
    let totalItems = 0
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItems += cartItems[item]
      }
    }
    return totalItems
  }

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (itemInfo && cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items]
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    googleAuth,
    logout,
    products,
    searchQuery,
    setSearchQuery,
    addToCart,
    updateCartItem,
    removeFromCart,
    removeAllFromCart,
    cartItems,
    getTotalCartItems,
    getCartAmount,
    placeOrder: async (orderData) => {
      try {
        // api instance handles headers automatically via interceptor if token exists
        const { data } = await api.post('/api/orders', orderData);

        // Clear cart after successful order
        setCartItems({});
        toast.success('Order placed successfully!');
        return data;
      } catch (error) {
        console.error("Order placement failed", error);
        toast.error(error.response?.data?.message || 'Failed to place order');
        throw error;
      }
    }
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContextProvider
