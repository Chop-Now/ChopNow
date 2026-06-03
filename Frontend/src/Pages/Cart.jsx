import { useAppContext } from '../context/AppContext';
import PageNavbar from '../Components/PageNavbar';
import Footer from '../Components/Footer';
import LocationPicker from '../Components/maps/LocationPicker';
import {
  MoveLeft,
  X,
  MapPin,
  ExternalLink,
  Leaf,
  Calendar,
  Trash2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpiryCountdown from '../Components/ui/ExpiryCountdown';
import api from '../services/api';
import socketService from '../services/socket';
import { toast } from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { products, cartItems, removeFromCart, addToCart, getTotalCartItems, placeOrder } =
    useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [fulfillmentMethod, setFulfillmentMethod] = useState('Pickup'); // 'Pickup' or 'Delivery'
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showMapEdit, setShowMapEdit] = useState(false);

  const { user } = useAppContext();
  const [paymentMethod, setPaymentMethod] = useState('momo'); // 'momo', 'airtel', 'cash'
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState('');
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentStatusText, setPaymentStatusText] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    if (user && user.phone) {
      setPaymentPhoneNumber(user.phone);
    }
  }, [user]);

  // Get vendor address from the first product in cart (products should be from same vendor)
  const getVendorInfo = () => {
    if (cartArray.length > 0) {
      const firstProduct = cartArray[0];
      // Get vendor info from product's business data
      const businessAddress = firstProduct.business?.address || {};
      return {
        name: firstProduct.vendor || firstProduct.business?.name || 'Vendor',
        address: businessAddress.street
          ? `${businessAddress.street}, ${businessAddress.city || ''}, ${businessAddress.country || 'Rwanda'}`.trim()
          : 'Address not available',
        coordinates: businessAddress.coordinates || { lat: -1.9441, lng: 30.0619 }, // Default to Kigali
      };
    }
    return {
      name: 'Vendor',
      address: 'Address not available',
      coordinates: { lat: -1.9441, lng: 30.0619 },
    };
  };

  const vendorAddress = getVendorInfo();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (products.length > 0 && cartItems) {
      let tempArray = [];
      for (const key in cartItems) {
        const product = products.find((item) => item._id === key);
        if (product) {
          tempArray.push({ ...product, cartQuantity: cartItems[key] });
        }
      }
      setCartArray(tempArray);
    }
  }, [products, cartItems]);

  // Items expiring within 1 hour
  const urgentItems = useMemo(
    () =>
      cartArray.filter(
        (p) => p.availableUntil && new Date(p.availableUntil) - Date.now() < 60 * 60 * 1000
      ),
    [cartArray]
  );

  const calculateSubtotal = () => {
    return cartArray.reduce(
      (total, product) => total + product.offerPrice * product.cartQuantity,
      0
    );
  };

  // Get delivery fee from business settings, or use default
  const getDeliveryFee = () => {
    if (fulfillmentMethod !== 'Delivery') return 0;
    if (cartArray.length > 0) {
      const firstProduct = cartArray[0];
      return firstProduct.business?.deliverySettings?.fee || 2000; // Default 2000 RWF
    }
    return 2000;
  };
  const deliveryFee = getDeliveryFee();
  const discount = 0; // Will be calculated later
  const subtotal = calculateSubtotal();
  const total = subtotal - discount + deliveryFee;

  const handleLocationSelect = (location) => {
    setDeliveryLocation(location);
    // In a real app, you'd reverse geocode this to get address
    setDeliveryAddress(`Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
    setShowMapEdit(false);
  };

  const openInGoogleMaps = () => {
    const coords = vendorAddress.coordinates;
    window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank');
  };

  const handleInitiateMobileMoney = async (order) => {
    if (!paymentPhoneNumber) {
      setPaymentError('Phone number is required');
      return;
    }

    let formattedPhone = paymentPhoneNumber.replace(/[\s+]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '250' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('250') || formattedPhone.length !== 12) {
      setPaymentError('Please enter a valid Rwandan number (e.g. 078xxxxxxx)');
      return;
    }

    setIsPaymentLoading(true);
    setPaymentError('');
    setPaymentStatusText('Initiating payment...');

    try {
      const response = await api.post('/api/payments/deposit', {
        orderId: order._id,
        phoneNumber: formattedPhone,
        correspondent: paymentMethod === 'momo' ? 'MTN_MOMO_RWA' : 'AIRTEL_RWA',
      });

      if (response.data && response.data.success) {
        setPaymentStatusText('Prompt sent! Enter PIN on your phone...');

        // Connect socket listener
        socketService.connect();
        let socketVerified = false;

        const handleStatusUpdate = (updatedOrder) => {
          if (
            updatedOrder._id === order._id &&
            (updatedOrder.status === 'paid' || updatedOrder.status === 'confirmed')
          ) {
            socketVerified = true;
            handlePaymentSuccess();
          }
        };

        socketService.on('order_status_updated', handleStatusUpdate);

        // Start polling fallback
        let pollCount = 0;
        const maxPolls = 20; // 60 seconds total (3s interval)
        const pollInterval = setInterval(async () => {
          if (socketVerified) {
            clearInterval(pollInterval);
            return;
          }
          pollCount++;

          try {
            const statusRes = await api.get(`/api/payments/status/${order._id}`);
            if (statusRes.data && statusRes.data.status === 'completed') {
              clearInterval(pollInterval);
              socketVerified = true;
              socketService.off('order_status_updated', handleStatusUpdate);
              handlePaymentSuccess();
            } else if (statusRes.data && statusRes.data.status === 'failed') {
              clearInterval(pollInterval);
              socketVerified = true;
              socketService.off('order_status_updated', handleStatusUpdate);
              setIsPaymentLoading(false);
              const failDesc = statusRes.data.failureReason?.description || 'Transaction failed';
              setPaymentError(`Payment failed: ${failDesc}`);
            }
          } catch {
            // Ignore polling errors
          }

          if (pollCount >= maxPolls && !socketVerified) {
            clearInterval(pollInterval);
            socketService.off('order_status_updated', handleStatusUpdate);
            setIsPaymentLoading(false);
            setPaymentError(
              'Payment confirmation timed out. Check your transaction status on your device.'
            );
          }
        }, 3000);
      } else {
        setIsPaymentLoading(false);
        setPaymentError('Payment initiation failed');
      }
    } catch (err) {
      setIsPaymentLoading(false);
      setPaymentError(err.response?.data?.message || err.message || 'Payment initiation failed');
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentStatusText('Payment successful! Redirecting...');
    toast.success('Payment completed successfully!');
    setTimeout(() => {
      setShowPaymentModal(false);
      navigate('/myorders');
    }, 2000);
  };

  return (
    <div className="bg-white min-h-screen pt-20">
      <PageNavbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {getTotalCartItems() === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl font-semibold mb-4" style={{ color: 'var(--color-textColor)' }}>
              Your cart is empty
            </p>
            <button
              onClick={() => {
                navigate('/shop');
                window.scrollTo(0, 0);
              }}
              className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition cursor-pointer"
              style={{ backgroundColor: 'var(--color-solid)' }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Cart Items */}
            <div className="flex-1">
              <h1
                className="text-xl md:text-2xl font-semibold mb-4"
                style={{ color: 'var(--color-textColor)' }}
              >
                Shopping Cart{' '}
                <span className="text-sm font-normal" style={{ color: 'var(--color-gray-50)' }}>
                  ({getTotalCartItems()} Items)
                </span>
              </h1>

              {/* Urgent expiry warning banner */}
              {urgentItems.length > 0 && (
                <div
                  className="flex items-start gap-3 p-4 rounded-xl mb-5 border"
                  style={{ backgroundColor: '#fff3e0', borderColor: '#ffb74d' }}
                >
                  <AlertTriangle
                    className="w-5 h-5 shrink-0 mt-0.5"
                    style={{ color: 'var(--color-solidOne)' }}
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#b45309' }}>
                      {urgentItems.length === 1
                        ? `"${urgentItems[0].name}" is expiring soon!`
                        : `${urgentItems.length} items in your cart are expiring soon!`}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#92400e' }}>
                      Complete your order before these time-sensitive deals are gone.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {cartArray.map((product, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 border rounded-xl"
                    style={{ borderColor: '#E5E5E5' }}
                  >
                    <div
                      onClick={() => {
                        navigate(
                          `/shop/${(product.category || 'all').toLowerCase()}/${product._id}`
                        );
                        window.scrollTo(0, 0);
                      }}
                      className="cursor-pointer w-24 h-24 shrink-0 rounded-lg overflow-hidden border"
                      style={{ borderColor: '#E5E5E5' }}
                    >
                      <img
                        className="w-full h-full object-cover"
                        src={product.image?.[0] || '/placeholder-food.jpg'}
                        alt={product.name || 'Product'}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3
                          className="font-semibold text-sm"
                          style={{ color: 'var(--color-textColor)' }}
                        >
                          {product.name}
                        </h3>
                        <p
                          className="font-semibold text-base"
                          style={{ color: 'var(--color-solid)' }}
                        >
                          RWF {(product.offerPrice * product.cartQuantity).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs" style={{ color: 'var(--color-gray-50)' }}>
                          {product.vendor}
                        </p>
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="group text-xs transition cursor-pointer flex items-center justify-center"
                          style={{ color: 'var(--color-gray-50)' }}
                        >
                          <Trash2 className="w-5 h-5 group-hover:stroke-solidOne transition" />
                        </button>
                      </div>
                      {/* Per-item expiry countdown */}
                      {product.availableUntil && (
                        <div className="mb-2">
                          <ExpiryCountdown until={product.availableUntil} variant="inline" />
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-semibold cursor-pointer hover:opacity-80 transition"
                          style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-solid)',
                          }}
                        >
                          -
                        </button>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: 'var(--color-textColor)' }}
                        >
                          {product.cartQuantity}
                        </span>
                        <button
                          onClick={() => addToCart(product._id)}
                          disabled={product.cartQuantity >= product.quantity}
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-semibold disabled:opacity-50 cursor-pointer hover:opacity-80 transition"
                          style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-solid)',
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  navigate('/shop');
                  window.scrollTo(0, 0);
                }}
                className="group flex items-center mt-6 gap-2 text-sm font-medium hover:opacity-70 transition cursor-pointer"
                style={{ color: 'var(--color-solid)' }}
              >
                <MoveLeft className="group-hover:-translate-x-1 transition" />
                Continue Shopping
              </button>

              {/* Positive Impact Banner */}
              <div
                className="mt-8 p-6 rounded-xl"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-5 h-5" style={{ color: 'var(--color-solid)' }} />
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-textColor)' }}>
                    Your Positive Impact
                  </h3>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-gray-50)' }}>
                  This order prevents <strong style={{ color: 'var(--color-solid)' }}>2.5kg</strong>{' '}
                  of food waste and saves{' '}
                  <strong style={{ color: 'var(--color-solid)' }}>6.2kg</strong> of CO₂ emissions.
                  Thank you!
                </p>
              </div>
            </div>

            {/* Right Side - Fulfillment & Summary */}
            <div className="lg:w-96 shrink-0">
              {/* 1. Fulfillment Method */}
              <div className="p-5 rounded-xl border mb-6" style={{ borderColor: '#E5E5E5' }}>
                <h3
                  className="text-base font-semibold mb-4"
                  style={{ color: 'var(--color-textColor)' }}
                >
                  1. Fulfillment Method
                </h3>
                <div className="p-1 rounded-lg" style={{ backgroundColor: '#E5E5E5' }}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFulfillmentMethod('Pickup')}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2 ${fulfillmentMethod === 'Pickup' ? 'shadow-md' : ''}`}
                      style={{
                        backgroundColor: fulfillmentMethod === 'Pickup' ? 'white' : 'transparent',
                        color: '#2E2E2E',
                      }}
                    >
                      <Calendar className="w-4 h-4" />
                      Pickup
                    </button>
                    <button
                      onClick={() => setFulfillmentMethod('Delivery')}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2 ${fulfillmentMethod === 'Delivery' ? 'shadow-md' : ''}`}
                      style={{
                        backgroundColor: fulfillmentMethod === 'Delivery' ? 'white' : 'transparent',
                        color: '#2E2E2E',
                      }}
                    >
                      <Calendar className="w-4 h-4" />
                      Delivery
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Address Section */}
              <div className="p-5 rounded-xl border mb-6" style={{ borderColor: '#E5E5E5' }}>
                <h3
                  className="text-base font-semibold mb-4"
                  style={{ color: 'var(--color-textColor)' }}
                >
                  2. {fulfillmentMethod === 'Delivery' ? 'Delivery Address' : 'Vendor Address'}
                </h3>

                {fulfillmentMethod === 'Delivery' ? (
                  <>
                    <div className="mb-3">
                      <p className="text-xs mb-2" style={{ color: 'var(--color-gray-50)' }}>
                        {deliveryAddress || 'No delivery address set'}
                      </p>
                      <button
                        onClick={() => setShowMapEdit(!showMapEdit)}
                        className="text-xs font-medium hover:opacity-70 transition cursor-pointer"
                        style={{ color: 'var(--color-solid)' }}
                      >
                        {showMapEdit ? 'Cancel' : 'Change Address'}
                      </button>
                    </div>
                    {showMapEdit && (
                      <div className="mt-4">
                        <LocationPicker
                          selectedLocation={deliveryLocation}
                          onLocationSelect={handleLocationSelect}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <p
                        className="font-medium text-xs mb-1"
                        style={{ color: 'var(--color-textColor)' }}
                      >
                        {vendorAddress.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-gray-50)' }}>
                        {vendorAddress.address}
                      </p>
                    </div>
                    <div
                      className="h-48 rounded-lg overflow-hidden mb-3 border"
                      style={{ borderColor: '#E5E5E5' }}
                    >
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${vendorAddress.coordinates.lng - 0.01},${vendorAddress.coordinates.lat - 0.01},${vendorAddress.coordinates.lng + 0.01},${vendorAddress.coordinates.lat + 0.01}&layer=mapnik&marker=${vendorAddress.coordinates.lat},${vendorAddress.coordinates.lng}`}
                      />
                    </div>
                    <button
                      onClick={openInGoogleMaps}
                      className="flex items-center gap-2 text-xs font-medium hover:opacity-70 transition cursor-pointer"
                      style={{ color: 'var(--color-solid)' }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Google Maps
                    </button>
                  </>
                )}
              </div>

              {/* 3. Payment Method */}
              <div className="p-5 rounded-xl border mb-6" style={{ borderColor: '#E5E5E5' }}>
                <h3
                  className="text-base font-semibold mb-4"
                  style={{ color: 'var(--color-textColor)' }}
                >
                  3. Payment Method
                </h3>
                <div className="space-y-3">
                  <label
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'momo'
                        ? 'border-amber-400 bg-amber-50/50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setPaymentMethod('momo')}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📱</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">MTN Mobile Money</p>
                        <p className="text-xs text-gray-500">Pay securely with MoMo</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'momo'}
                      onChange={() => setPaymentMethod('momo')}
                      className="w-4 h-4 accent-amber-500"
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'airtel'
                        ? 'border-red-400 bg-red-50/50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setPaymentMethod('airtel')}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📲</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Airtel Money</p>
                        <p className="text-xs text-gray-500">Pay securely with Airtel</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'airtel'}
                      onChange={() => setPaymentMethod('airtel')}
                      className="w-4 h-4 accent-red-500"
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💵</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {fulfillmentMethod === 'Delivery' ? 'Cash on Delivery' : 'Cash on Pickup'}
                        </p>
                        <p className="text-xs text-gray-500">Pay in person</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                </div>
              </div>

              {/* Order Summary */}
              <div
                className="p-5 rounded-xl border"
                style={{ borderColor: '#E5E5E5', backgroundColor: 'var(--color-primary)' }}
              >
                <h3
                  className="text-base font-semibold mb-4"
                  style={{ color: 'var(--color-textColor)' }}
                >
                  Order Summary
                </h3>

                {/* Products */}
                <div className="space-y-2 mb-4">
                  {cartArray.map((product, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span style={{ color: 'var(--color-gray-50)' }}>
                        {product.name} x{product.cartQuantity}
                      </span>
                      <span style={{ color: 'var(--color-textColor)' }}>
                        RWF {(product.offerPrice * product.cartQuantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="my-4" style={{ borderColor: '#E5E5E5' }} />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-gray-50)' }}>Subtotal</span>
                    <span style={{ color: 'var(--color-textColor)' }}>
                      RWF {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-gray-50)' }}>Discount</span>
                    <span style={{ color: 'var(--color-textColor)' }}>
                      RWF {discount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-gray-50)' }}>Delivery Fee</span>
                    <span style={{ color: 'var(--color-textColor)' }}>
                      {deliveryFee === 0 ? 'Free' : `RWF ${deliveryFee.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <hr className="my-4" style={{ borderColor: '#E5E5E5' }} />

                <div className="flex justify-between text-base font-semibold mb-6">
                  <span style={{ color: 'var(--color-textColor)' }}>Total</span>
                  <span style={{ color: 'var(--color-solid)' }}>RWF {total.toLocaleString()}</span>
                </div>

                <button
                  onClick={async () => {
                    try {
                      if (getTotalCartItems() === 0) {
                        return;
                      }

                      const primaryItem = cartArray[0];

                      const orderData = {
                        listing: primaryItem._id,
                        items: cartArray.map((item) => ({
                          listing: item._id,
                          title: item.name,
                          quantity: item.cartQuantity,
                          unitPrice: item.offerPrice,
                          subtotal: item.offerPrice * item.cartQuantity,
                        })),
                        fulfillmentType: fulfillmentMethod.toLowerCase(),
                        deliveryDetails:
                          fulfillmentMethod === 'Delivery'
                            ? {
                                address: deliveryAddress || 'Address not specified',
                                location: deliveryLocation || { lat: -1.9441, lng: 30.0619 },
                              }
                            : undefined,
                        pickupDetails:
                          fulfillmentMethod === 'Pickup'
                            ? {
                                pickupTime: primaryItem.pickupTime,
                              }
                            : undefined,
                        payment: {
                          paymentMethod: paymentMethod === 'cash' ? 'cash' : 'mobile_money',
                          paymentStatus: 'pending',
                        },
                      };

                      const order = await placeOrder(orderData);

                      if (paymentMethod === 'cash') {
                        navigate('/myorders');
                      } else {
                        // Show payment modal — user confirms their phone number then clicks "Confirm & Pay"
                        setActiveOrder(order);
                        setShowPaymentModal(true);
                        // Do NOT auto-fire payment — wait for user to confirm phone number
                      }
                    } catch (error) {
                      console.error('Checkout execution failed', error);
                    }
                  }}
                  className="w-full py-3 rounded-lg text-sm text-white font-medium hover:opacity-90 transition cursor-pointer"
                  style={{ backgroundColor: 'var(--color-solid)' }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* pawaPay Mobile Money Checkout Modal */}
      {showPaymentModal && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {!isPaymentLoading && (
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  navigate('/myorders');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            {/* Provider Logo Header */}
            <div className="mb-4 mt-2">
              {paymentMethod === 'momo' ? (
                <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center text-2xl font-black text-blue-900 shadow-md">
                  MoMo
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-2xl font-black text-white shadow-md">
                  Airtel
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {paymentMethod === 'momo' ? 'MTN Mobile Money' : 'Airtel Money'} Payment
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Complete your rescue order for a total of{' '}
              <strong className="text-gray-800">
                RWF {(activeOrder?.pricing?.total ?? 0).toLocaleString()}
              </strong>
            </p>

            {isPaymentLoading ? (
              <div className="py-8 flex flex-col items-center gap-4 w-full">
                <div
                  className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin animate-infinite"
                  style={{
                    borderColor: 'var(--color-solid) transparent var(--color-solid) transparent',
                  }}
                ></div>
                <p className="text-sm font-semibold text-gray-700">{paymentStatusText}</p>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                  Please check your phone for a PIN prompt to authorize the transaction of RWF{' '}
                  {(activeOrder?.pricing?.total ?? 0).toLocaleString()}.
                </p>
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div className="text-left">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="078xxxxxxx"
                    value={paymentPhoneNumber}
                    onChange={(e) => setPaymentPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>

                {paymentError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold text-left flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <button
                  onClick={() => handleInitiateMobileMoney(activeOrder)}
                  className="w-full py-3 rounded-xl text-white font-semibold shadow-md transition-all hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: paymentMethod === 'momo' ? '#EAB308' : '#DC2626' }}
                >
                  Confirm & Pay RWF {(activeOrder?.pricing?.total ?? 0).toLocaleString()}
                </button>

                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    navigate('/myorders');
                  }}
                  className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Pay Later from History
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Cart;
