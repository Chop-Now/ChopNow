import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import LiveCapture from '../../../components/Camera/LiveCapture';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const CreateListing = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();
    const [photo, setPhoto] = useState(null);

    const base64ToBlob = (base64) => {
        const parts = base64.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: contentType });
    };

    const onSubmit = async (data) => {
        if (!photo) {
            toast.error("Please take a photo of the item!");
            return;
        }

        try {
            // Step 1: Create Listing (JSON)
            const listingPayload = {
                ...data,
                // In a real app, business ID would come from user context or be inferred by backend
                // For now, ensuring numerical values are parsed
                pricing: {
                    price: parseFloat(data.price),
                    originalPrice: parseFloat(data.originalPrice)
                },
                timeWindow: {
                    pickupEnd: data.pickupEndTime,
                    availableFrom: new Date().toISOString(), // Default to now
                    availableUntil: new Date(new Date().setHours(23, 59, 0, 0)).toISOString() // Default to end of day
                },
                category: data.category || 'meals', // Default if not selected
                fulfillment: 'pickup',
                inventory: {
                    quantity: parseInt(data.quantity)
                }
            };

            // Clean up flat fields that are now nested
            delete listingPayload.price;
            delete listingPayload.originalPrice;
            delete listingPayload.quantity;
            delete listingPayload.pickupEndTime;

            // Sending JSON
            const res = await api.post('/api/listings', listingPayload);
            const listingId = res.data._id;

            // Step 2: Upload Photo (FormData)
            const formData = new FormData();
            const blob = base64ToBlob(photo);
            formData.append('photos', blob, 'capture.jpg');

            await api.post(`/api/listings/${listingId}/photos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Listing created successfully!");
            navigate('/business/listings');

        } catch (error) {
            console.error("Creation failed", error);
            toast.error(error.response?.data?.message || "Failed to create listing");
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Listing</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white shadow rounded-lg p-6">

                {/* Photo Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Photo</label>
                    <p className="text-xs text-gray-500 mb-2">Please take a clear, real-time photo of the item.</p>
                    <LiveCapture onCapture={setPhoto} />
                </div>

                {/* Basic Details */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input {...register("title", { required: "Title is required" })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="e.g. Surprise Bakery Bag" />
                    {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea {...register("description", { required: "Description is required" })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" rows={3} />
                    {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select {...register("category")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                        <option value="meals">Meals</option>
                        <option value="bakery">Bakery</option>
                        <option value="groceries">Groceries</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Original Price (RWF)</label>
                        <input type="number" {...register("originalPrice", { required: true })} className="block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Discounted Price (RWF)</label>
                        <input type="number" {...register("price", { required: true })} className="block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-orange-50" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input type="number" {...register("quantity", { required: true, min: 1 })} defaultValue={1} className="block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pickup End Time</label>
                        <input type="time" {...register("pickupEndTime", { required: true })} className="block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                </div>

                <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-orange-600 text-white rounded font-bold shadow hover:bg-orange-700 disabled:opacity-50">
                    {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                </button>
            </form>
        </div>
    );
};

export default CreateListing;
