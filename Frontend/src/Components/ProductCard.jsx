import { ShoppingCart } from 'lucide-react';
import React, { useEffect } from 'react'
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({product}) => {

  const { addToCart, removeFromCart, cartItems } = useAppContext();
  
  // Calculate discount percentage
  const discountPercent = Math.round(((product.price - product.offerPrice) / product.price) * 100);

  return product && (
    <div className="relative border rounded-xl md:px-4 px-3 py-2 bg-white min-w-60 max-w-60 w-full shadow-md hover:shadow-xl transition-shadow" style={{ borderColor: '#E5E5E5' }}>
            {/* Discount Badge */}
            {discountPercent > 0 && (
                <div 
                    className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: 'var(--color-solidOne)' }}
                >
                    {discountPercent}% OFF
                </div>
            )}
            
            <div className="group cursor-pointer flex items-center justify-center px-2 py-1">
                <img className="group-hover:scale-105 transition max-w-24 md:max-w-32" src={product.image[0]} alt={product.name} />
            </div>
            <div className="text-sm">
                <p className="font-medium text-base truncate w-full mb-1" style={{ color: 'var(--color-textColor)' }}>{product.name}</p>
                <div className="flex items-center gap-1 text-xs mb-1" style={{ color: 'var(--color-gray-50)' }}>
                  <span>{product.vendor}</span>
                   <span>•</span>
                    <span className="font-medium" style={{ color: 'var(--color-solid)' }}>
                        {product.location?.Near === 'True' ? '1km' : '5km'}
                    </span>
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--color-gray-50)' }}>
                    Pickup at {product.pickupTime}
                </p>
                <div className="flex items-end justify-between mt-3">
                    <div>
                        <p className="md:text-lg text-base font-semibold" style={{ color: 'var(--color-solid)' }}>
                            RWF {product.offerPrice.toLocaleString()}
                        </p>
                        <p className="md:text-xs text-xs line-through" style={{ color: 'var(--color-gray-50)' }}>
                            RWF {product.price.toLocaleString()}
                        </p>
                    </div>
                    <div onClick={(e) => {e.stopPropagation(); }}>
                        {!cartItems[product._id] || cartItems[product._id] === 0 ? (
                            <button 
                                className="flex items-center justify-center gap-1 border md:w-20 w-16 h-[34px] rounded font-medium cursor-pointer hover:opacity-80 transition-opacity text-white text-xs" 
                                style={{ backgroundColor: 'var(--color-solid)', borderColor: 'var(--color-solid)' }}
                                onClick={() => addToCart(product._id)}
                            >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                Add
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] rounded select-none" style={{ backgroundColor: 'rgba(0, 168, 107, 0.2)' }}>
                                <button 
                                    onClick={() => {removeFromCart(product._id)}} 
                                    className="cursor-pointer text-md px-2 h-full font-semibold"
                                    style={{ color: 'var(--color-solid)' }}
                                >
                                    -
                                </button>
                                <span className="w-5 text-center font-medium" style={{ color: 'var(--color-textColor)' }}>
                                    {cartItems[product._id]}
                                </span>
                                <button 
                                    onClick={() => {addToCart(product._id)}} 
                                    className="cursor-pointer text-md px-2 h-full font-semibold"
                                    style={{ color: 'var(--color-solid)' }}
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
  )
}

export default ProductCard
