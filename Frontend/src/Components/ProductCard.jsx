import { ShoppingCart, Flame, Users, MapPin } from 'lucide-react';
import React, { useCallback, memo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import ExpiryCountdown from './ui/ExpiryCountdown';

const PLACEHOLDER_IMAGE = '/placeholder-food.svg';

const ProductCard = memo(({ product }) => {
  const { addToCart, removeFromCart, cartItems, setSearchQuery } = useAppContext();
  const navigate = useNavigate();

  if (!product) return null;

  const price = product.price || 0;
  const offerPrice = product.offerPrice || price;
  const discountPercent = price > 0 ? Math.round(((price - offerPrice) / price) * 100) : 0;

  // Urgency signals
  const qty = product.quantity || 0;
  const isLowStock = qty > 0 && qty <= 3;
  const totalQty = product.totalQuantity || qty;
  const soldPercent = totalQty > 0 ? (product.soldCount || 0) / totalQty : 0;
  const isSellingFast = soldPercent >= 0.5 && qty > 0;
  const cartCount = product.cartCount || 0;

  // Show expiry if within 12 hours
  const showExpiry = product.availableUntil
    ? new Date(product.availableUntil) - Date.now() < 12 * 60 * 60 * 1000
    : false;

  const handleProductClick = () => {
    setSearchQuery('');
    const category = product.category?.toLowerCase() || 'all';
    navigate(`/shop/${category}/${product._id}`);
    window.scrollTo(0, 0);
  };

  return (
    <article
      aria-label={`${product.name || 'Product'}, RWF ${(offerPrice || 0).toLocaleString()}${discountPercent > 0 ? `, ${discountPercent}% off` : ''}`}
      className="relative border rounded-xl bg-white w-full shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden focus-within:ring-2 focus-within:ring-green-500 group"
      style={{ borderColor: '#E5E5E5' }}
    >
      {/* ── Image ── */}
      <div className="relative h-32 md:h-40 overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          src={product.image?.[0] || PLACEHOLDER_IMAGE}
          alt=""
          width="400"
          height="300"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            if (!e.currentTarget.src.endsWith(PLACEHOLDER_IMAGE)) {
              e.currentTarget.src = PLACEHOLDER_IMAGE;
            }
          }}
        />

        {/* Discount badge – top right */}
        {discountPercent > 0 && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold text-white z-10"
            style={{ backgroundColor: 'var(--color-solidOne)' }}
          >
            -{discountPercent}%
          </div>
        )}

        {/* Selling fast badge – top left */}
        {isSellingFast && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white z-10"
            style={{ backgroundColor: 'var(--color-solidOne)' }}
          >
            <Flame className="w-3 h-3" />
            Selling fast
          </div>
        )}

        {/* Expired / out of stock overlay */}
        {product.status !== 'active' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">
              {product.status === 'expired' ? 'Expired' : 'Sold Out'}
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-3 md:px-4 pb-3 pt-2">
        {/* The title is the card's link; its ::after stretches over the whole card
            so the card is one big tap target while the cart buttons stay separate. */}
        <a
          href={`/shop/${product.category?.toLowerCase() || 'all'}/${product._id}`}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
            e.preventDefault();
            handleProductClick();
          }}
          className="block font-semibold text-sm md:text-base truncate mb-0.5 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          style={{ color: 'var(--color-textColor)' }}
        >
          {product.name || 'Product'}
        </a>

        <div
          className="flex items-center gap-1 text-xs mb-0.5"
          style={{ color: 'var(--color-moringa-muted)' }}
        >
          <span className="truncate">{product.vendor || 'Unknown Vendor'}</span>
          {product.distance != null && (
            <span className="flex items-center gap-0.5 shrink-0 whitespace-nowrap">
              <span aria-hidden="true">·</span>
              <MapPin className="w-3 h-3" aria-hidden="true" />
              {product.distance} km
            </span>
          )}
        </div>

        {/* Pickup time row */}
        <p className="text-xs mb-1.5" style={{ color: 'var(--color-moringa-muted)' }}>
          Pickup at {product.pickupTime || 'Flexible'}
        </p>

        {/* Urgency row: expiry countdown OR low-stock OR cart-count */}
        {showExpiry ? (
          <div className="mb-2">
            <ExpiryCountdown until={product.availableUntil} variant="pill" />
          </div>
        ) : isLowStock ? (
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-solidOne)' }}>
            ⚠ Only {qty} left
          </p>
        ) : cartCount >= 3 ? (
          <div
            className="flex items-center gap-1 text-xs font-medium mb-2"
            style={{ color: 'var(--color-solidOne)' }}
          >
            <Users className="w-3 h-3" />
            <span>{cartCount} people eyeing this</span>
          </div>
        ) : null}

        {/* Price + cart control */}
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="md:text-base text-sm font-bold" style={{ color: 'var(--color-solid)' }}>
              RWF {(offerPrice || 0).toLocaleString()}
            </p>
            {price > offerPrice && (
              <p className="text-xs line-through" style={{ color: 'var(--color-moringa-muted)' }}>
                RWF {price.toLocaleString()}
              </p>
            )}
          </div>

          <div className="relative z-10 w-full sm:w-auto">
            {!cartItems[product._id] || cartItems[product._id] === 0 ? (
              <button
                className="flex items-center justify-center gap-1 border w-full sm:w-20 h-11 md:h-[34px] rounded-lg font-semibold cursor-pointer hover:opacity-90 active:scale-95 transition-all text-white text-xs"
                style={{ backgroundColor: 'var(--color-solid)', borderColor: 'var(--color-solid)' }}
                onClick={() => addToCart(product._id)}
                disabled={product.status !== 'active'}
                aria-label={`Add ${product.name || 'product'} to cart`}
              >
                <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
                Add
              </button>
            ) : (
              <div
                className="flex items-center justify-between w-full sm:w-24 h-11 md:h-[34px] rounded-lg select-none"
                style={{ backgroundColor: 'rgba(0, 168, 107, 0.15)' }}
              >
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="cursor-pointer text-lg md:text-base px-3 md:px-2 h-full font-bold hover:opacity-70 transition"
                  style={{ color: 'var(--color-solid)' }}
                  aria-label={`Remove one ${product.name || 'item'} from cart`}
                >
                  -
                </button>
                <span
                  className="w-5 text-center font-semibold text-sm"
                  style={{ color: 'var(--color-textColor)' }}
                  aria-live="polite"
                >
                  {cartItems[product._id]}
                </span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="cursor-pointer text-lg md:text-base px-3 md:px-2 h-full font-bold hover:opacity-70 transition"
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

ProductCard.displayName = 'ProductCard';
export default ProductCard;
