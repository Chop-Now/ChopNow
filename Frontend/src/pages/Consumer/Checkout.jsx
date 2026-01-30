import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const { register, handleSubmit, watch } = useForm();
    const navigate = useNavigate();
    const deliveryMethod = watch('deliveryMethod', 'pickup');

    const onSubmit = (data) => {
        console.log("Processing order:", data);
        toast.success("Order confirmed! Validating payment...");
        setTimeout(() => {
            navigate('/order-success');
        }, 2000);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {/* Delivery Method */}
                <div className="bg-white p-6 shadow rounded-lg">
                    <h2 className="text-lg font-medium mb-4">1. Fulfillment Method</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center hover:bg-orange-50 ${deliveryMethod === 'pickup' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                            <input type="radio" value="pickup" {...register('deliveryMethod')} className="sr-only" />
                            <span className="font-bold">Pickup</span>
                            <span className="text-xs text-gray-500">Go to store</span>
                        </label>
                        <label className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center hover:bg-orange-50 ${deliveryMethod === 'delivery' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                            <input type="radio" value="delivery" {...register('deliveryMethod')} className="sr-only" />
                            <span className="font-bold">Delivery</span>
                            <span className="text-xs text-gray-500">+1000 RWF</span>
                        </label>
                    </div>

                    {deliveryMethod === 'delivery' && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
                            <textarea {...register('address', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" rows="2" placeholder="Street, landmark, etc."></textarea>
                        </div>
                    )}
                </div>

                {/* Payment Method */}
                <div className="bg-white p-6 shadow rounded-lg">
                    <h2 className="text-lg font-medium mb-4">2. Payment Method</h2>
                    <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                            <input type="radio" value="mpesa" {...register('paymentMethod', { required: true })} className="h-4 w-4 text-orange-600 focus:ring-orange-500" />
                            <span className="text-gray-900">Mobile Money (M-Pesa / MTN)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                            <input type="radio" value="card" {...register('paymentMethod', { required: true })} className="h-4 w-4 text-orange-600 focus:ring-orange-500" />
                            <span className="text-gray-900">Credit / Debit Card</span>
                        </label>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Phone Number (for payment)</label>
                        <input type="tel" {...register('phone', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="+250 788..." />
                    </div>
                </div>

                <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 shadow-lg">
                    Pay & Confirm Order
                </button>

            </form>
        </div>
    );
};

export default Checkout;
