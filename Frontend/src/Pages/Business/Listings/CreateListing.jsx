import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import LiveCapture from '../../../components/Camera/LiveCapture';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CreateListing = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [photo, setPhoto] = useState(null);

    const onSubmit = (data) => {
        if (!photo) {
            toast.error("Please take a photo of the item!");
            return;
        }
        const listingData = { ...data, photo };
        console.log("Creating listing:", listingData);
        toast.success("Listing created successfully!");
        navigate('/business/listings');
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
                    <label className="block text-sm font-medium text-gray-700">Item Title</label>
                    <input
                        {...register("title", { required: "Title is required" })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g. Surprise Bakery Bag"
                    />
                    {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        {...register("description", { required: "Description is required" })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-orange-500 focus:border-orange-500"
                        rows={3}
                        placeholder="What's in the bag? Mention key items or allergens."
                    />
                    {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Original Price (RWF)</label>
                        <input
                            type="number"
                            {...register("originalPrice", { required: "Required" })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Discounted Price (RWF)</label>
                        <input
                            type="number"
                            {...register("price", { required: "Required" })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-orange-50"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity Available</label>
                        <input
                            type="number"
                            {...register("quantity", { required: true, min: 1 })}
                            defaultValue={1}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pickup End Time</label>
                        <input
                            type="time"
                            {...register("pickupEndTime", { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Publish Listing
                </button>
            </form>
        </div>
    );
};

export default CreateListing;
