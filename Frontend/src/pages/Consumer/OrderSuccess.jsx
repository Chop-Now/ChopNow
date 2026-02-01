import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
                <p className="text-gray-500 mb-8">Thank you for rescuing food. Your order is ready.</p>

                <div className="bg-gray-100 p-6 rounded-lg mb-6 flex flex-col items-center">
                    <p className="text-sm font-bold text-gray-700 mb-2">PICKUP CODE</p>
                    {/* Placeholder for QR Code */}
                    <div className="h-32 w-32 bg-white border-2 border-gray-300 mb-2 flex items-center justify-center">
                        <span className="text-xs text-gray-400">QR CODE</span>
                    </div>
                    <p className="text-2xl font-mono font-bold tracking-widest text-orange-600">8392</p>
                </div>

                <div className="space-y-3">
                    <Link to="/myorders" className="block w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition">
                        View Order Details
                    </Link>
                    <Link to="/" className="block w-full text-orange-600 font-medium hover:text-orange-500">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
