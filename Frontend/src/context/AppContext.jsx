import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { authService, api, listingService, userService, cartService } from '../services';
import { transformListingToProduct } from '../utils/transforms';

export const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};

// Helper: decode JWT payload without a library
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// Helper: check if a JWT token is expired (with 60s buffer)
const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now() - 60000;
};

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Initialize cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cartItems');
      return savedCart ? JSON.parse(savedCart) : {};
    } catch {
      return {};
    }
  });

  // Multi-role state
  const [activeRole, setActiveRole] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);

  // Cart sync refs
  const syncTimeoutRef = useRef(null);
  const isSyncingRef = useRef(false);

  // Clear all auth state helper
  const clearAuthState = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setActiveRole(null);
    setAvailableRoles([]);
  }, []);

  // Check for existing session and validate token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
          // No stored session
          setIsLoading(false);
          return;
        }

        let userData;
        try {
          userData = JSON.parse(storedUser);
        } catch {
          // Corrupted stored user data
          clearAuthState();
          setIsLoading(false);
          return;
        }

        // Check if access token is expired
        if (isTokenExpired(token)) {
          // Try to refresh
          if (refreshToken && !isTokenExpired(refreshToken)) {
            try {
              const { data } = await api.post('/api/users/refresh-token', { refreshToken });
              localStorage.setItem('token', data.token);
              if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
              }
              // Validate by fetching fresh profile
              try {
                const profile = await authService.getProfile();
                const freshUser = { ...userData, ...profile };
                localStorage.setItem('user', JSON.stringify(freshUser));
                setUser(freshUser);
                setIsAuthenticated(true);
                setActiveRole(freshUser.activeRole || freshUser.role || 'consumer');
                setAvailableRoles(freshUser.roles || [freshUser.role || 'consumer']);
              } catch {
                // Profile fetch failed but token refreshed -- use stored data
                setUser(userData);
                setIsAuthenticated(true);
                setActiveRole(userData.activeRole || userData.role || 'consumer');
                setAvailableRoles(userData.roles || [userData.role || 'consumer']);
              }
            } catch {
              // Refresh failed -- session is dead
              clearAuthState();
            }
          } else {
            // No valid refresh token -- session is dead
            clearAuthState();
          }
        } else {
          // Access token still valid -- restore session from storage
          setUser(userData);
          setIsAuthenticated(true);
          setActiveRole(userData.activeRole || userData.role || 'consumer');
          setAvailableRoles(userData.roles || [userData.role || 'consumer']);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setAuthError(err);
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [clearAuthState]);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cartItems]);

  // Debounced sync cart to backend (for authenticated users)
  const syncCartToBackend = useCallback(
    async (cart) => {
      if (!isAuthenticated || isSyncingRef.current) return;

      // Clear any pending sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Debounce: wait 1 second before syncing to avoid excessive API calls
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          isSyncingRef.current = true;
          await cartService.setCart(cart);
        } catch (error) {
          console.error('Failed to sync cart to backend:', error);
        } finally {
          isSyncingRef.current = false;
        }
      }, 1000);
    },
    [isAuthenticated]
  );

  // Sync cart changes to backend when authenticated
  useEffect(() => {
    if (isAuthenticated && Object.keys(cartItems).length >= 0) {
      syncCartToBackend(cartItems);
    }
  }, [cartItems, isAuthenticated, syncCartToBackend]);

  // Sync local cart with backend on login
  const syncCartOnLogin = useCallback(async () => {
    try {
      const localCart = localStorage.getItem('cartItems');
      const parsedCart = localCart ? JSON.parse(localCart) : {};

      if (Object.keys(parsedCart).length > 0) {
        // Merge local cart with server cart
        const result = await cartService.syncCart(parsedCart);
        if (result.cart) {
          // result.cart is already { listingId: quantity } format
          setCartItems(result.cart);
        }
      } else {
        // No local cart, fetch from server
        const result = await cartService.getCart();
        if (result.cart) {
          // result.cart is already { listingId: quantity } format
          setCartItems(result.cart);
        }
      }
    } catch (error) {
      console.error('Failed to sync cart on login:', error);
      // Keep local cart if sync fails
    }
  }, []);

  // Login function
  const login = async (email, password, preferredRole) => {
    try {
      const data = await authService.login({ email, password });

      // Extract user data (everything except token and refreshToken)
      const { token, refreshToken, ...userData } = data;

      // Set role state from response
      const userRoles = userData.roles || [userData.role || 'consumer'];
      const userActiveRole = userData.activeRole || userData.role || userRoles[0];

      // If user has preferred role and has it available, switch to it
      if (preferredRole && userRoles.includes(preferredRole) && preferredRole !== userActiveRole) {
        // Switch role after login
        try {
          const switchResult = await userService.switchRole(preferredRole);
          userData.activeRole = switchResult.activeRole;
          userData.roles = switchResult.roles;
        } catch (switchError) {
          console.warn('Could not switch to preferred role:', switchError);
        }
      }

      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setAuthError(null);
      setActiveRole(userData.activeRole || userActiveRole);
      setAvailableRoles(userData.roles || userRoles);

      // Sync cart with backend after login
      await syncCartOnLogin();

      return { user: userData, token };
    } catch (error) {
      console.error('Login Check failed', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);

      // Extract user data (everything except token, refreshToken, and message)
      const { token, refreshToken, message, ...userInfo } = data;

      // Auto-login after registration
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
      setIsAuthenticated(true);
      setAuthError(null);

      // Set role state
      const userRoles = userInfo.roles || [userInfo.role || 'consumer'];
      const userActiveRole = userInfo.activeRole || userInfo.role || userRoles[0];
      setActiveRole(userActiveRole);
      setAvailableRoles(userRoles);

      // Sync cart with backend after registration
      await syncCartOnLogin();

      return { user: userInfo, token, message };
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  };

  // Google Login function
  const googleAuth = async (accessToken) => {
    try {
      const { data } = await api.post('/api/users/google-login', { accessToken });

      // Extract user data (everything except token and refreshToken)
      const { token, refreshToken, ...userData } = data;

      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setAuthError(null);

      // Set role state
      const userRoles = userData.roles || [userData.role || 'consumer'];
      const userActiveRole = userData.activeRole || userData.role || userRoles[0];
      setActiveRole(userActiveRole);
      setAvailableRoles(userRoles);

      // Sync cart with backend after Google login
      await syncCartOnLogin();

      toast.success('Login successful!');
      return { user: userData, token };
    } catch (error) {
      console.error('Google Login failed', error);
      toast.error(error.response?.data?.message || 'Google Login failed');
      throw error;
    }
  };

  // Switch active role
  const switchRole = async (newRole) => {
    try {
      const result = await userService.switchRole(newRole);

      // Update local state with all user data from result
      const updatedUser = {
        ...user,
        ...result.user,
        activeRole: result.activeRole,
        role: result.activeRole, // Ensure role is also updated for backward compatibility
        roles: result.roles || user.roles,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setActiveRole(result.activeRole);
      setAvailableRoles(result.roles || user.roles || []);

      // Only show toast for consumer/business switch, not admin
      if (newRole !== 'admin') {
        toast.success(`Switched to ${newRole === 'consumer' ? 'Buyer' : 'Business'} mode`);
      }
      return result;
    } catch (error) {
      console.error('Role switch failed', error);
      toast.error(error.message || 'Failed to switch role');
      throw error;
    }
  };

  // Add business role to existing consumer
  const addBusinessRole = async (switchToNew = true) => {
    try {
      const result = await userService.addRole('business_owner', switchToNew);

      // Update local state
      const updatedUser = { ...user, ...result.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAvailableRoles(result.roles);
      if (switchToNew) {
        setActiveRole(result.activeRole);
      }

      toast.success('Business role added successfully!');
      return result;
    } catch (error) {
      console.error('Add role failed', error);
      toast.error(error.message || 'Failed to add business role');
      throw error;
    }
  };

  // Add rider role to existing consumer
  const addRiderRole = async (switchToNew = true) => {
    try {
      const result = await userService.addRole('rider', switchToNew);

      // Update local state
      const updatedUser = { ...user, ...result.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAvailableRoles(result.roles);
      if (switchToNew) {
        setActiveRole(result.activeRole);
      }

      toast.success('Rider role activated successfully!');
      return result;
    } catch (error) {
      console.error('Add rider role failed', error);
      toast.error(error.message || 'Failed to activate rider role');
      throw error;
    }
  };

  // Refresh fresh user data
  const refreshUser = async () => {
    try {
      const profile = await authService.getProfile();
      const freshUser = { ...user, ...profile };
      localStorage.setItem('user', JSON.stringify(freshUser));
      setUser(freshUser);
      setAvailableRoles(freshUser.roles || [freshUser.role || 'consumer']);
      return freshUser;
    } catch (error) {
      console.error('Refresh user failed', error);
      throw error;
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return availableRoles.includes(role);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('cartItems'); // Clear cart on logout
    setUser(null);
    setIsAuthenticated(false);
    setActiveRole(null);
    setAvailableRoles([]);
    setCartItems({}); // Clear cart state
    setAuthError(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  // Clear cart function
  const clearCart = async () => {
    setCartItems({});
    localStorage.removeItem('cartItems');
    // Clear backend cart if authenticated
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (error) {
        console.error('Failed to clear backend cart:', error);
      }
    }
  };

  // Fetch products from backend API
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      // silent: true — this is a background prefetch; errors are handled below,
      // no toast needed (avoids false "no connection" popup on mobile cold-starts)
      const response = await listingService.getListings({ status: 'active' }, { silent: true });
      // Transform backend listing format to frontend product format using utility
      const listings = response.listings || response || [];
      const transformedProducts = listings
        .map((listing) => {
          const transformed = transformListingToProduct(listing);
          // Skip null/invalid transforms
          if (!transformed) return null;
          return {
            _id: transformed.id,
            name: transformed.name || 'Unknown Product',
            description: transformed.description || '',
            category: transformed.category || 'other',
            price: transformed.originalPrice || transformed.price || 0,
            offerPrice: transformed.price || 0,
            image: transformed.images || [],
            vendor: transformed.businessName || 'Unknown Vendor',
            vendorId: transformed.businessId,
            quantity: transformed.quantity || 0,
            inStock: transformed.isAvailable !== false,
            status: transformed.status || 'active',
            pickupTime:
              transformed.pickupFrom && transformed.pickupTo
                ? `${new Date(transformed.pickupFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(transformed.pickupTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Flexible',
            fulfillmentType: 'pickup',
            dietary: [],
            rating: transformed.rating || 0,
            reviews: transformed.reviewCount || 0,
            availableUntil: transformed.availableUntil || null,
            cartCount: transformed.cartCount || 0,
            soldCount: transformed.soldCount || 0,
            totalQuantity: transformed.totalQuantity || 0,
            createdAt: transformed.createdAt,
          };
        })
        .filter(Boolean); // Remove null entries
      setProducts(transformedProducts);
    } catch (e) {
      console.error('Error fetching products:', e);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Cart Logic (Local state for now, can be moved to backend later)
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success('Added to cart');
  };

  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success('Cart updated');
  };

  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] <= 0) {
        delete cartData[itemId];
      }
    }
    toast.success('Removed from cart');
    setCartItems(cartData);
  };

  const removeAllFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      delete cartData[itemId];
      toast.success('Removed from cart');
    }
    setCartItems(cartData);
  };

  const getTotalCartItems = () => {
    let totalItems = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItems += cartItems[item];
      }
    }
    return totalItems;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (itemInfo && cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    register,
    googleAuth,
    logout,
    // Multi-role support
    activeRole,
    availableRoles,
    switchRole,
    addBusinessRole,
    addRiderRole,
    refreshUser,
    hasRole,
    // Products
    products,
    productsLoading,
    refreshProducts: fetchProducts,
    searchQuery,
    setSearchQuery,
    addToCart,
    updateCartItem,
    removeFromCart,
    removeAllFromCart,
    cartItems,
    getTotalCartItems,
    getCartAmount,
    clearCart,
    placeOrder: async (orderData) => {
      try {
        // api instance handles headers automatically via interceptor if token exists
        const { data } = await api.post('/api/orders', orderData);

        // Clear cart after successful order
        clearCart();
        toast.success('Order placed successfully!');
        return data;
      } catch (error) {
        console.error('Order placement failed', error);
        toast.error(error.response?.data?.message || 'Failed to place order');
        throw error;
      }
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
