import { ShoppingCart } from 'lucide-react';
import React, { useCallback, memo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = memo(({ product }) => {
  const { addToCart, removeFromCart, cartItems, setSearchQuery } = useAppContext();
  const navigate = useNavigate();

  // Guard against undefined product
  if (!product) return null;

  // Calculate discount percentage safely
  const price = product.price || 0;
  const offerPrice = product.offerPrice || price;
  const discountPercent = price > 0 ? Math.round(((price - offerPrice) / price) * 100) : 0;

  const handleProductClick = () => {
    setSearchQuery(''); // Clear search query before navigating
    const category = product.category?.toLowerCase() || 'all';
    navigate(`/shop/${category}/${product._id}`);
    window.scrollTo(0, 0);
  };

  return (
    <article
      onClick={handleProductClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleProductClick();
        }
      }}
      aria-label={`${product.name || 'Product'} - RWF ${(offerPrice || 0).toLocaleString()}${discountPercent > 0 ? `, ${discountPercent}% off` : ''}`}
      className="relative border rounded-xl bg-white w-full shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
      style={{ borderColor: '#E5E5E5' }}
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div
          className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white z-10"
          style={{ backgroundColor: 'var(--color-solidOne)' }}
        >
          {discountPercent}% OFF
        </div>
      )}

      <div className="relative cursor-pointer h-32 md:h-40 overflow-hidden">
        <img
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          src={product.image?.[0] || '/placeholder-food.jpg'}
          alt={product.name || 'Product'}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="text-sm px-3 md:px-4 pb-3 pt-2">
        <p
          className="font-medium text-base truncate w-full mb-0.5"
          style={{ color: 'var(--color-textColor)' }}
        >
          {product.name || 'Product'}
        </p>
        <div
          className="flex items-center gap-1 text-xs mb-0.5"
          style={{ color: 'var(--color-gray-50)' }}
        >
          <span>{product.vendor || 'Unknown Vendor'}</span>
          <span>•</span>
          <span className="font-medium" style={{ color: 'var(--color-solid)' }}>
            {product.location?.Near === 'True' ? '1km' : '5km'}
          </span>
        </div>
        <p className="text-xs mb-1.5" style={{ color: 'var(--color-gray-50)' }}>
          Pickup at {product.pickupTime || 'Flexible'}
        </p>
        <div className="flex items-end justify-between mt-2">
          <div>
            <p
              className="md:text-lg text-base font-semibold"
              style={{ color: 'var(--color-solid)' }}
            >
              RWF {(offerPrice || 0).toLocaleString()}
            </p>
            <p
              className="md:text-xs text-xs line-through"
              style={{ color: 'var(--color-gray-50)' }}
            >
              RWF {(price || 0).toLocaleString()}
            </p>
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {!cartItems[product._id] || cartItems[product._id] === 0 ? (
              <button
                className="flex items-center justify-center gap-1 border md:w-20 w-16 h-[34px] rounded font-medium cursor-pointer hover:opacity-80 transition-opacity text-white text-xs"
                style={{ backgroundColor: 'var(--color-solid)', borderColor: 'var(--color-solid)' }}
                onClick={() => addToCart(product._id)}
                aria-label={`Add ${product.name || 'product'} to cart`}
              >
                <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
                Add
              </button>
            ) : (
              <div
                className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] rounded select-none"
                style={{ backgroundColor: 'rgba(0, 168, 107, 0.2)' }}
              >
                <button
                  onClick={() => {
                    removeFromCart(product._id);
                  }}
                  className="cursor-pointer text-md px-2 h-full font-semibold"
                  style={{ color: 'var(--color-solid)' }}
                  aria-label={`Remove one ${product.name || 'item'} from cart`}
                >
                  -
                </button>
                <span
                  className="w-5 text-center font-medium"
                  style={{ color: 'var(--color-textColor)' }}
                  aria-live="polite"
                  aria-label={`${cartItems[product._id]} in cart`}
                >
                  {cartItems[product._id]}
                </span>
                <button
                  onClick={() => {
                    addToCart(product._id);
                  }}
                  className="cursor-pointer text-md px-2 h-full font-semibold"
                  style={{ color: 'var(--color-solid)' }}
                  aria-label={`Add another ${product.name || 'item'} to cart`}
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

export default ProductCard;
