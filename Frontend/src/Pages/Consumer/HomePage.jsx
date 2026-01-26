import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const featuredListings = [
        { id: 1, title: 'Mystery Bakery Box', store: 'Kigali Heights Bakery', price: 2000, originalPrice: 5000, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop' },
        { id: 2, title: 'Fresh Veggies Pack', store: 'Green Farm', price: 1500, originalPrice: 3000, image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500&auto=format&fit=crop' },
        { id: 3, title: 'Lunch Special', store: 'Cafe Neo', price: 3000, originalPrice: 6000, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop' },
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Hero Header */}
            <div className="bg-orange-600 text-white px-4 py-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Save Food, Save Money</h1>
                <p className="text-orange-100 mb-6">Find surplus food near you at 50% off or more.</p>
                <Link to="/search" className="inline-block bg-white text-orange-600 px-6 py-3 rounded-full font-semibold shadow-md active:scale-95 transition">
                    Find Deals Nearby
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
                    <Link to="/search" className="text-orange-600 text-sm font-medium">View All</Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredListings.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                            <div className="h-48 w-full bg-gray-200 relative">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">50% OFF</span>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">{item.store}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <div>
                                        <span className="text-xl font-bold text-orange-600">{item.price} RWF</span>
                                        <span className="text-sm text-gray-400 line-through ml-2">{item.originalPrice} RWF</span>
                                    </div>
                                    <button className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-orange-200">
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Categories Scroller (Placeholder) */}
            <div className="max-w-7xl mx-auto px-4 mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Browse Categories</h2>
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {['Bakery', 'Meals', 'Groceries', 'Vegan', 'Dessert'].map((cat) => (
                        <div key={cat} className="flex-shrink-0 bg-white p-4 rounded-lg shadow w-32 text-center cursor-pointer hover:bg-orange-50">
                            <span className="block font-medium text-gray-700">{cat}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
