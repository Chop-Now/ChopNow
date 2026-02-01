import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Cart = () => {
    // Mock cart items for now, or use context if fully wired
    const { cartItems, products } = useAppContext(); // Assuming context is available but might need adjustment

    // Hardcoded for demo if context isn't fully populated with products yet
    const cartList = [
        { id: 1, title: 'Mystery Bakery Box', price: 2000, quantity: 1, store: 'Kigali Heights Bakery' }
    ];

    const total = cartList.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

            {cartList.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {cartList.map((item) => (
                            <li key={item.id} className="padding-4 py-4 px-4 flex justify-between items-center bg-white hover:bg-gray-50">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-gray-500">{item.store}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-900 font-semibold">{item.price} RWF</span>
                                    <div className="flex items-center border rounded">
                                        <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200">-</button>
                                        <span className="px-3">{item.quantity}</span>
                                        <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200">+</button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-gray-50 px-4 py-6 sm:px-6 flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">Total: {total} RWF</span>
                        <Link to="/checkout" className="bg-orange-600 text-white px-6 py-3 rounded-md font-medium hover:bg-orange-700">
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
