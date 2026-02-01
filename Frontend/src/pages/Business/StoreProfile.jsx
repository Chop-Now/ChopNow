import React from 'react';
import { useForm } from 'react-hook-form';

const StoreProfile = () => {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            name: 'Generic Bakery',
            address: 'KG 123 St, Kigali',
            phone: '+250 788 123 456'
        }
    });

    const onSubmit = (data) => {
        console.log("Updating profile", data);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Store Profile</h1>
            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Store Name</label>
                            <input {...register("name")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Contact</label>
                            <input {...register("phone")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea {...register("address")} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Store Logo</label>
                        <div className="mt-1 flex items-center">
                            <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                                <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </span>
                            <button type="button" className="ml-5 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                                Change
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StoreProfile;
