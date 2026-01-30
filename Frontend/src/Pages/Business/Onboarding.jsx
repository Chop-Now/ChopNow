import React from 'react';
import { useForm } from 'react-hook-form';

const Onboarding = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log(data);
        // Submit KYC data
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Business Registration</h1>
            <div className="bg-white shadow rounded-lg p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Business Name</label>
                        <input {...register("businessName", { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2" />
                        {errors.businessName && <span className="text-red-500 text-xs">This field is required</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Business Type</label>
                        <select {...register("businessType")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2">
                            <option value="restaurant">Restaurant</option>
                            <option value="bakery">Bakery</option>
                            <option value="supermarket">Supermarket</option>
                            <option value="hotel">Hotel</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tax Identification Number (TIN)</label>
                        <input {...register("tin", { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2" />
                        {errors.tin && <span className="text-red-500 text-xs">This field is required</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Registration Document</label>
                        <input type="file" {...register("document")} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                            Submit for Verification
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
