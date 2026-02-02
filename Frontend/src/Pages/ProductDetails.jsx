import PageNavbar from '../Components/PageNavbar';
import Footer from '../Components/Footer';
import ProductCard from '../Components/ProductCard';
import React, { useEffect, useState, useRef } from 'react'
import { useAppContext } from '../context/AppContext';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Home, Star, ShoppingCart, Send, Trash2, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetails = () => {

    const { products, addToCart, cartItems, removeAllFromCart } = useAppContext()
    const navigate = useNavigate()
    const { id } = useParams()
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [review, setReview] = useState({ rating: 0, comment: '' });
    const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
    const [showMagnifier, setShowMagnifier] = useState(false);
    const imgRef = useRef(null);

    const product = products.find((item) => item._id === id);

    useEffect(() => {
        if (products.length > 0 && product) {
            let productsCopy = products.slice();
            productsCopy = productsCopy.filter((item) => product.category === item.category && item._id !== product._id)
            setRelatedProducts(productsCopy.slice(0, 5))
        }
    }, [products, product])

    useEffect(() => {
        setThumbnail(product?.image[0] ? product.image[0] : null)
    }, [product])

    if (!product) {
        return (
            <div className='bg-white min-h-screen pt-20'>
                <PageNavbar />
                <div className="max-w-6xl mx-auto px-6 py-12 text-center">
                    <p className="text-xl" style={{ color: 'var(--color-textColor)' }}>Product not found</p>
                    <button
                        onClick={() => navigate('/shop')}
                        className="mt-4 px-6 py-2 rounded-lg text-white font-medium"
                        style={{ backgroundColor: 'var(--color-solid)' }}
                    >
                        Back to Shop
                    </button>
                </div>
                <Footer />
            </div>
        )
    }

    const handleAddToCart = () => {
        const currentQuantity = cartItems[product._id] || 0;
        if (currentQuantity >= product.quantity) {
            toast.error(`Only ${product.quantity} items available in stock`);
            return;
        }
        addToCart(product._id);
    };

    const handleRemoveFromCart = () => {
        removeAllFromCart(product._id);
    };

    const handleBuyNow = () => {
        const currentQuantity = cartItems[product._id] || 0;
        if (currentQuantity >= product.quantity) {
            toast.error(`Only ${product.quantity} items available in stock`);
            return;
        }
        addToCart(product._id);
        navigate("/cart");
    };

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMagnifierPosition({ x, y });
    };

    const handleShareProduct = () => {
        const productUrl = window.location.href;
        navigator.clipboard.writeText(productUrl).then(() => {
            toast.success('Product link copied to clipboard!');
        }).catch(() => {
            toast.error('Failed to copy link');
        });
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (review.rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        if (!review.comment.trim()) {
            toast.error('Please write a review');
            return;
        }
        toast.success('Review submitted successfully!');
        setReview({ rating: 0, comment: '' });
    };

    const discountPercent = Math.round(((product.price - product.offerPrice) / product.price) * 100);
    const currentCartQuantity = cartItems[product._id] || 0;

    return (
        <div className='bg-white min-h-screen pt-20'>
            <PageNavbar />
            <div className="max-w-6xl mx-auto px-6 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--color-gray-50)' }}>
                    <Link to="/" className="hover:opacity-70"><Home className="w-4 h-4" /></Link>
                    <span>/</span>
                    <Link to="/shop" className="hover:opacity-70">Shop</Link>
                    <span>/</span>
                    <Link to={`/shop/${product.category.toLowerCase()}`} className="hover:opacity-70">{product.category}</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--color-solid)' }}>{product.name}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Left Side - Images */}
                    <div className="flex gap-4 lg:w-1/2">
                        <div className="flex flex-col gap-3">
                            {product.image.map((image, index) => (
                                <div
                                    key={index}
                                    onClick={() => setThumbnail(image)}
                                    className={`border rounded-lg overflow-hidden cursor-pointer hover:border-solid transition w-20 h-20 ${thumbnail === image ? 'border-2' : ''}`}
                                    style={{ borderColor: thumbnail === image ? 'var(--color-solid)' : '#E5E5E5' }}
                                >
                                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>

                        <div
                            className="flex-1 border rounded-lg overflow-hidden relative cursor-crosshair"
                            style={{ borderColor: '#E5E5E5' }}
                            onMouseEnter={() => setShowMagnifier(true)}
                            onMouseLeave={() => setShowMagnifier(false)}
                            onMouseMove={handleMouseMove}
                            ref={imgRef}
                        >
                            <img src={thumbnail} alt="Selected product" className="w-full h-full object-contain max-h-96" />

                            {/* Magnifier Glass */}
                            {showMagnifier && (
                                <div
                                    className="absolute pointer-events-none border-2 rounded-full"
                                    style={{
                                        borderColor: 'var(--color-solid)',
                                        width: '150px',
                                        height: '150px',
                                        top: `${magnifierPosition.y}%`,
                                        left: `${magnifierPosition.x}%`,
                                        transform: 'translate(-50%, -50%)',
                                        backgroundImage: `url(${thumbnail})`,
                                        backgroundSize: '400%',
                                        backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                                        backgroundColor: 'white',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                        zIndex: 10
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Right Side - Details */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-2xl md:text-3xl font-semibold" style={{ color: 'var(--color-textColor)' }}>{product.name}</h1>
                            <button
                                onClick={handleShareProduct}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                                style={{ border: '1px solid var(--color-gray-50)', color: 'var(--color-textColor)' }}
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Share</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <p className="text-sm" style={{ color: 'var(--color-gray-50)' }}>{product.vendor}</p>
                            <span style={{ color: 'var(--color-gray-50)' }}>•</span>
                            <p className="text-sm font-medium" style={{ color: 'var(--color-solid)' }}>
                                {product.location?.Near === 'True' ? '1km away' : '5km away'}
                            </p>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-4">
                            {Array(5).fill('').map((_, i) => (
                                <Star
                                    key={i}
                                    className='w-5 h-5'
                                    fill={product.rating && product.rating > i ? 'var(--color-solidOne)' : 'none'}
                                    stroke={product.rating && product.rating > i ? 'var(--color-solidOne)' : 'var(--color-gray-50)'}
                                />
                            ))}
                            {product.rating && <span className="text-sm ml-2" style={{ color: 'var(--color-gray-50)' }}>({product.rating})</span>}
                        </div>

                        {/* Price */}
                        <div className="mb-4">
                            <div className="flex items-center gap-3">
                                <p className="text-3xl font-bold" style={{ color: 'var(--color-solid)' }}>
                                    RWF {product.offerPrice.toLocaleString()}
                                </p>
                                {discountPercent > 0 && (
                                    <span
                                        className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                                        style={{ backgroundColor: 'var(--color-solidOne)' }}
                                    >
                                        {discountPercent}% OFF
                                    </span>
                                )}
                            </div>
                            <p className="text-sm line-through mt-1" style={{ color: 'var(--color-gray-50)' }}>
                                RWF {product.price.toLocaleString()}
                            </p>
                        </div>

                        {/* Stock Info */}
                        <div className="mb-6">
                            <p className="text-sm font-medium" style={{ color: product.quantity <= 5 ? 'var(--color-solidOne)' : 'var(--color-solid)' }}>
                                {product.quantity > 0 ? `Only ${product.quantity} remaining in stock` : 'Out of stock'}
                            </p>
                            {currentCartQuantity > 0 && (
                                <p className="text-xs mt-1" style={{ color: 'var(--color-gray-50)' }}>
                                    {currentCartQuantity} in your cart
                                </p>
                            )}
                        </div>

                        {/* Pickup Time */}
                        <div className="mb-6 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
                            <p className="text-sm font-medium" style={{ color: 'var(--color-textColor)' }}>
                                🕐 Pickup: {product.pickupTime}
                            </p>
                        </div>

                        {/* Dietary Information */}
                        {product.dietary_information && product.dietary_information.length > 0 && (
                            <div className="mb-6">
                                <p className="text-base font-semibold mb-2" style={{ color: 'var(--color-textColor)' }}>Dietary Information</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.dietary_information.map((diet, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 rounded-full text-xs font-medium"
                                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-solid)' }}
                                        >
                                            {diet}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Ingredients & Allergens */}
                        {product.ingredients_allergens && product.ingredients_allergens.length > 0 && (
                            <div className="mb-6">
                                <p className="text-base font-semibold mb-2" style={{ color: 'var(--color-textColor)' }}>Ingredients & Allergens</p>
                                {product.ingredients_allergens.map((item, index) => (
                                    <div key={index} className="text-sm mb-2" style={{ color: 'var(--color-gray-50)' }}>
                                        {item.ingredient && <p><strong>Ingredients:</strong> {item.ingredient}</p>}
                                        {item.contains && <p><strong>Contains:</strong> {item.contains}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* About Product */}
                        <div className="mb-6">
                            <p className="text-base font-semibold mb-2" style={{ color: 'var(--color-textColor)' }}>About Product</p>
                            <ul className="list-disc ml-5 space-y-1 text-sm" style={{ color: 'var(--color-gray-50)' }}>
                                {product.description.map((desc, index) => (
                                    <li key={index}>{desc}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            {currentCartQuantity > 0 ? (
                                <button
                                    onClick={handleRemoveFromCart}
                                    className="flex-1 py-3 rounded-lg font-medium transition-opacity flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
                                    style={{
                                        backgroundColor: 'var(--color-solidOne)',
                                        color: 'white'
                                    }}
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Remove from Cart ({currentCartQuantity})
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.quantity === 0}
                                    className="flex-1 py-3 rounded-lg font-medium transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'var(--color-solid)',
                                        border: '2px solid var(--color-solid)'
                                    }}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </button>
                            )}
                            <button
                                onClick={handleBuyNow}
                                disabled={product.quantity === 0 || currentCartQuantity >= product.quantity}
                                className="flex-1 py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: 'var(--color-solid)' }}
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-textColor)' }}>Related Products</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {relatedProducts.map((relProduct) => (
                                <ProductCard key={relProduct._id} product={relProduct} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Customer Reviews Section */}
                <div className="mt-12 border-t pt-8" style={{ borderColor: '#E5E5E5' }}>
                    <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-textColor)' }}>Customer Reviews</h2>

                    {/* Write a Review */}
                    <div className="mb-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-primary)' }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-textColor)' }}>Write a Review</h3>
                        <form onSubmit={handleSubmitReview}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-textColor)' }}>
                                    Your Rating
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className="w-8 h-8 cursor-pointer transition-transform hover:scale-110"
                                            fill={review.rating >= star ? 'var(--color-solidOne)' : 'none'}
                                            stroke={review.rating >= star ? 'var(--color-solidOne)' : 'var(--color-gray-50)'}
                                            onClick={() => setReview({ ...review, rating: star })}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-textColor)' }}>
                                    Your Review
                                </label>
                                <textarea
                                    value={review.comment}
                                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
                                    style={{ borderColor: '#E5E5E5', color: 'var(--color-textColor)' }}
                                    rows="4"
                                    placeholder="Share your thoughts about this product..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: 'var(--color-solid)' }}
                            >
                                <Send className="w-4 h-4" />
                                Submit Review
                            </button>
                        </form>
                    </div>

                    {/* Sample Reviews */}
                    <div className="space-y-4">
                        <div className="p-5 rounded-lg border" style={{ borderColor: '#E5E5E5' }}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-semibold" style={{ color: 'var(--color-textColor)' }}>John Doe</p>
                                    <div className="flex gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className="w-4 h-4" fill="var(--color-solidOne)" stroke="var(--color-solidOne)" />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs" style={{ color: 'var(--color-gray-50)' }}>2 days ago</p>
                            </div>
                            <p className="text-sm" style={{ color: 'var(--color-gray-50)' }}>
                                Great product! Fresh and exactly as described. Highly recommend!
                            </p>
                        </div>

                        <div className="p-5 rounded-lg border" style={{ borderColor: '#E5E5E5' }}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-semibold" style={{ color: 'var(--color-textColor)' }}>Jane Smith</p>
                                    <div className="flex gap-1 mt-1">
                                        {[1, 2, 3, 4].map((star) => (
                                            <Star key={star} className="w-4 h-4" fill="var(--color-solidOne)" stroke="var(--color-solidOne)" />
                                        ))}
                                        <Star className="w-4 h-4" fill="none" stroke="var(--color-gray-50)" />
                                    </div>
                                </div>
                                <p className="text-xs" style={{ color: 'var(--color-gray-50)' }}>1 week ago</p>
                            </div>
                            <p className="text-sm" style={{ color: 'var(--color-gray-50)' }}>
                                Good quality and reasonable price. Will order again!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ProductDetails
