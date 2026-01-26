import { dummyProducts } from '@/assets/assets'
import React, { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import authService from '@/services/authService'
import listingService from '@/services/listingService'

export const AppContext = createContext()

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider')
  }
  return context
}

const AppContextProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState({})

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const storedToken = authService.getToken()
      const storedUser = authService.getCurrentUser()
      
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(storedUser)
        setIsAuthenticated(true)
      }
      setLoading(false)
    }
    
    initAuth()
  }, [])

  // fetch all products (listings)
  const fetchProducts = async () => {
    try {
      // Try to fetch from backend
      const response = await listingService.getListings({ limit: 100 })
      
      // Handle different response formats
      const listings = response.listings || response.data || response || []
      
      // Transform backend listings to match frontend format
      const transformedListings = listings.map(listing => ({
        _id: listing._id,
        name: listing.title,
        category: listing.category,
        vendor: listing.business?.businessName || 'Unknown',
        rating: listing.business?.averageRating || 0,
        quantity: listing.inventory?.quantityAvailable || 0,
        location: listing.business?.address?.location,
        pickupTime: `${formatTime(listing.timeWindow?.startTime)} - ${formatTime(listing.timeWindow?.endTime)}`,
        price: listing.pricing?.originalPrice || 0,
        offerPrice: listing.pricing?.offerPrice || 0,
        image: listing.photos?.length > 0 ? listing.photos : ['/placeholder.jpg'],
        description: listing.description?.split('\n') || [],
        dietary_information: listing.dietaryInfo || [],
        ingredients_allergens: listing.allergens ? [
          { ingredient: listing.allergens.ingredients || '' },
          { contains: listing.allergens.contains || '' }
        ] : [],
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        inStock: listing.inventory?.quantityAvailable > 0,
      }))
      
      setProducts(transformedListings)
    } catch (error) {
      console.error('Error fetching listings, using dummy data:', error)
      // Fallback to dummy data if API fails
      setProducts(dummyProducts)
    }
  }

  // Helper function to format time
  const formatTime = (time) => {
    if (!time) return ''
    const date = new Date(time)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      setToken(response.token)
      setUser(response) // Backend returns user data directly
      setIsAuthenticated(true)
      toast.success('Login successful!')
      return response
    } catch (error) {
      toast.error(error.message || 'Login failed')
      throw error
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      setToken(response.token)
      setUser(response) // Backend returns user data directly
      setIsAuthenticated(true)
      toast.success('Registration successful!')
      return response
    } catch (error) {
      toast.error(error.message || 'Registration failed')
      throw error
    }
  }

  // Logout function
  const logout = () => {
    authService.logout()
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    setCartItems({})
    toast.success('Logged out successfully')
  }

  // Update user profile
  const updateUserProfile = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData)
      setUser(updatedUser)
      toast.success('Profile updated successfully')
      return updatedUser
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
      throw error
    }
  }

  //add product to cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);

    if(cartData[itemId]){

        cartData[itemId] += 1;
    } else {
        cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to cart");
  }

  // update cart item quantity
  const updateCartItem = (itemId, quantity) =>{
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Cart updated");
  }

  // Remove Product from cart
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if(cartData[itemId]){
        cartData[itemId] -= 1;
        if(cartData[itemId] <= 0){
            delete cartData[itemId];
        }
    }
    toast.success("Removed from cart");
    setCartItems(cartData);
  }

  // Remove all items of a product from cart
  const removeAllFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if(cartData[itemId]){
        delete cartData[itemId];
        toast.success("Removed from cart");
    }
    setCartItems(cartData);
  }

  // Get total cart items count
  const getTotalCartItems = () => {
    let totalItems = 0
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItems += cartItems[item]
      }
    }
    return totalItems
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Get Cart Total Amount
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems){
      let itemInfo = products.find((product) => product_.id === items);
      if(cartItems[items] > 0){
        totalAmount += itemInfo.offerPrice * cartItems[items]
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  }

  const value = {
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
    // Auth related
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    fetchProducts,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContextProvider
