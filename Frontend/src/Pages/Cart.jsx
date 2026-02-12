import { useAppContext } from '../context/AppContext'
import PageNavbar from '../Components/PageNavbar'
import Footer from '../Components/Footer'
import LocationPicker from '../Components/maps/LocationPicker'
import { MoveLeft, X, MapPin, ExternalLink, Leaf, Calendar, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Cart = () => {

    const navigate = useNavigate()
    const { products, cartItems, removeFromCart, addToCart, getTotalCartItems,
        getCartAmount, updateCartItem, placeOrder } = useAppContext()

    const [cartArray, setCartArray] = useState([])
    const [fulfillmentMethod, setFulfillmentMethod] = useState('Pickup') // 'Pickup' or 'Delivery'
    const [deliveryLocation, setDeliveryLocation] = useState(null)
    const [deliveryAddress, setDeliveryAddress] = useState('')
    const [showMapEdit, setShowMapEdit] = useState(false)

    // Get vendor address from the first product in cart (products should be from same vendor)
    const getVendorInfo = () => {
        if (cartArray.length > 0) {
            const firstProduct = cartArray[0]
            // Get vendor info from product's business data
            const businessAddress = firstProduct.business?.address || {}
            return {
                name: firstProduct.vendor || firstProduct.business?.name || 'Vendor',
                address: businessAddress.street
                    ? `${businessAddress.street}, ${businessAddress.city || ''}, ${businessAddress.country || 'Rwanda'}`.trim()
                    : 'Address not available',
                coordinates: businessAddress.coordinates || { lat: -1.9441, lng: 30.0619 } // Default to Kigali
            }
        }
        return {
            name: 'Vendor',
            address: 'Address not available',
            coordinates: { lat: -1.9441, lng: 30.0619 }
        }
    }

    const vendorAddress = getVendorInfo()

    const getCart = () => {
        let tempArray = []
        for (const key in cartItems) {
            const product = products.find((item) => item._id === key)
            if (product) {
                tempArray.push({ ...product, cartQuantity: cartItems[key] })
            }
        }
        setCartArray(tempArray)
    }

    useEffect(() => {
        if (products.length > 0 && cartItems) {
            getCart()
        }
    }, [products, cartItems])

    const calculateSubtotal = () => {
        return cartArray.reduce((total, product) => total + (product.offerPrice * product.cartQuantity), 0)
    }

    // Get delivery fee from business settings, or use default
    const getDeliveryFee = () => {
        if (fulfillmentMethod !== 'Delivery') return 0
        if (cartArray.length > 0) {
            const firstProduct = cartArray[0]
            return firstProduct.business?.deliverySettings?.fee || 2000 // Default 2000 RWF
        }
        return 2000
    }
    const deliveryFee = getDeliveryFee()
    const discount = 0 // Will be calculated later
    const subtotal = calculateSubtotal()
    const total = subtotal - discount + deliveryFee

    const handleLocationSelect = (location) => {
        setDeliveryLocation(location)
        // In a real app, you'd reverse geocode this to get address
        setDeliveryAddress(`Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`)
        setShowMapEdit(false)
    }

    const openInGoogleMaps = () => {
        const coords = vendorAddress.coordinates
        window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank')
    }

    return (
        <div className='bg-white min-h-screen pt-20'>
            <PageNavbar />
            <div className="max-w-7xl mx-auto px-6 py-8">
                {getTotalCartItems() === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-xl font-semibold mb-4" style={{ color: 'var(--color-textColor)' }}>Your cart is empty</p>
                        <button
                            onClick={() => { navigate("/shop"); window.scrollTo(0, 0) }}
                            className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition cursor-pointer"
                            style={{ backgroundColor: 'var(--color-solid)' }}
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Side - Cart Items */}
                        <div className='flex-1'>
                            <h1 className="text-xl md:text-2xl font-semibold mb-6" style={{ color: 'var(--color-textColor)' }}>
                                Shopping Cart <span className="text-sm font-normal" style={{ color: 'var(--color-gray-50)' }}>({getTotalCartItems()} Items)</span>
                            </h1>

                            <div className="space-y-4">
                                {cartArray.map((product, index) => (
                                    <div key={index} className="flex gap-4 p-4 border rounded-xl" style={{ borderColor: '#E5E5E5' }}>
                                        <div
                                            onClick={() => { navigate(`/shop/${(product.category || 'all').toLowerCase()}/${product._id}`); window.scrollTo(0, 0) }}
                                            className="cursor-pointer w-24 h-24 shrink-0 rounded-lg overflow-hidden border"
                                            style={{ borderColor: '#E5E5E5' }}
                                        >
                                            <img className="w-full h-full object-cover" src={product.image?.[0] || '/placeholder-food.jpg'} alt={product.name || 'Product'} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h3 className="font-semibold text-sm" style={{ color: 'var(--color-textColor)' }}>{product.name}</h3>
                                                <p className="font-semibold text-base" style={{ color: 'var(--color-solid)' }}>
                                                    RWF {(product.offerPrice * product.cartQuantity).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs" style={{ color: 'var(--color-gray-50)' }}>{product.vendor}</p>
                                                <button
                                                    onClick={() => removeFromCart(product._id)}
                                                    className="group text-xs transition cursor-pointer flex items-center justify-center"
                                                    style={{ color: 'var(--color-gray-50)' }}
                                                >
                                                    <Trash2 className="w-5 h-5 group-hover:stroke-solidOne transition" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => removeFromCart(product._id)}
                                                    className="w-7 h-7 rounded flex items-center justify-center font-semibold cursor-pointer"
                                                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-solid)' }}
                                                >
                                                    -
                                                </button>
                                                <span className="font-medium text-sm" style={{ color: 'var(--color-textColor)' }}>{product.cartQuantity}</span>
                                                <button
                                                    onClick={() => addToCart(product._id)}
                                                    disabled={product.cartQuantity >= product.quantity}
                                                    className="w-7 h-7 rounded flex items-center justify-center font-semibold disabled:opacity-50 cursor-pointer"
                                                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-solid)' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => { navigate("/shop"); window.scrollTo(0, 0) }}
                                className="group flex items-center mt-6 gap-2 text-sm font-medium hover:opacity-70 transition cursor-pointer"
                                style={{ color: 'var(--color-solid)' }}
                            >
                                <MoveLeft className='group-hover:-translate-x-1 transition' />
                                Continue Shopping
                            </button>

                            {/* Positive Impact Banner */}
                            <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-primary)' }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Leaf className="w-5 h-5" style={{ color: 'var(--color-solid)' }} />
                                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-textColor)' }}>Your Positive Impact</h3>
                                </div>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-gray-50)' }}>
                                    This order prevents <strong style={{ color: 'var(--color-solid)' }}>2.5kg</strong> of food waste and saves <strong style={{ color: 'var(--color-solid)' }}>6.2kg</strong> of CO₂ emissions. Thank you!
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Fulfillment & Summary */}
                        <div className="lg:w-96 shrink-0">
                            {/* 1. Fulfillment Method */}
                            <div className="p-5 rounded-xl border mb-6" style={{ borderColor: '#E5E5E5' }}>
                                <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-textColor)' }}>
                                    1. Fulfillment Method
                                </h3>
                                <div className="p-1 rounded-lg" style={{ backgroundColor: '#E5E5E5' }}>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setFulfillmentMethod('Pickup')}
                                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2 ${fulfillmentMethod === 'Pickup' ? 'shadow-md' : ''}`}
                                            style={{
                                                backgroundColor: fulfillmentMethod === 'Pickup' ? 'white' : 'transparent',
                                                color: '#2E2E2E'
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
                                                color: '#2E2E2E'
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
                                <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-textColor)' }}>
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
                                            <p className="font-medium text-xs mb-1" style={{ color: 'var(--color-textColor)' }}>{vendorAddress.name}</p>
                                            <p className="text-xs" style={{ color: 'var(--color-gray-50)' }}>{vendorAddress.address}</p>
                                        </div>
                                        <div className="h-48 rounded-lg overflow-hidden mb-3 border" style={{ borderColor: '#E5E5E5' }}>
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

                            {/* Order Summary */}
                            <div className="p-5 rounded-xl border" style={{ borderColor: '#E5E5E5', backgroundColor: 'var(--color-primary)' }}>
                                <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-textColor)' }}>Order Summary</h3>

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
                                        <span style={{ color: 'var(--color-textColor)' }}>RWF {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--color-gray-50)' }}>Discount</span>
                                        <span style={{ color: 'var(--color-textColor)' }}>RWF {discount.toLocaleString()}</span>
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
                                                // Cart is empty
                                                return;
                                            }

                                            // Using first item as primary listing ref
                                            const primaryItem = cartArray[0];

                                            // Ensure delivery details are valid
                                            // If delivery address is empty, maybe throw error or just send 'Not Provided'
                                            // The backend requires address for delivery orders.

                                            const orderData = {
                                                listing: primaryItem._id,
                                                items: cartArray.map(item => ({
                                                    quantity: item.cartQuantity,
                                                    unitPrice: item.offerPrice,
                                                    name: item.name,
                                                    productId: item._id
                                                })),
                                                fulfillmentType: fulfillmentMethod.toLowerCase(),
                                                deliveryDetails: fulfillmentMethod === 'Delivery' ? {
                                                    address: deliveryAddress || 'Address not specified',
                                                    location: deliveryLocation || { lat: -1.9441, lng: 30.0619 } // Default to Kigali if missing
                                                } : undefined,
                                                pickupDetails: fulfillmentMethod === 'Pickup' ? {
                                                    pickupTime: primaryItem.pickupTime
                                                } : undefined,
                                                payment: {
                                                    method: 'cod',
                                                    status: 'pending'
                                                }
                                            };

                                            await placeOrder(orderData);
                                            // Using a small timeout to let toast show before nav navigating?
                                            // Actually placeOrder awaits so it's fine.
                                            navigate('/myorders');
                                        } catch (error) {
                                            console.error("Checkout execution failed", error);
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
            <Footer />
        </div>
    )
}

export default Cart
