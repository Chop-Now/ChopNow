import { dummyProducts } from '@/assets/assets'
import React, { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

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

  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState({})

  // fetch all products
  const fetchProducts = async () =>{
    setProducts(dummyProducts)
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

  const value = {
    products,
    searchQuery,
    setSearchQuery,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    getTotalCartItems
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContextProvider
