import React from 'react';
import { Link } from 'react-router-dom';

const ListingList = () => {
    // Mock data
    const listings = [
        { id: 1, title: 'Morning Pastries Box', price: 2000, originalPrice: 5000, quantity: 3, status: 'Active' },
        { id: 2, title: 'Vegetable Mix', price: 1500, originalPrice: 3000, quantity: 0, status: 'Sold Out' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                <Link to="/business/listings/create" className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">
                    + New Listing
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {listings.map((listing) => (
                        <li key={listing.id}>
                            <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex flex-col">
                                    <p className="text-sm font-medium text-orange-600 truncate">{listing.title}</p>
                                    <p className="flex items-center text-sm text-gray-500">
                                        Qty: {listing.quantity} | {listing.price} RWF
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${listing.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {listing.status}
                                    </span>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ListingList;
