import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import businessService from '../../services/businessService';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAppContext();
    const [stats, setStats] = useState([
        { name: 'Active Listings', value: '0', color: 'bg-green-100 text-green-800' },
        { name: 'Orders Today', value: '0', color: 'bg-blue-100 text-blue-800' },
        { name: 'Total Revenue', value: 'RWF 0', color: 'bg-orange-100 text-orange-800' },
        { name: 'Impact (Meals Saved)', value: '0', color: 'bg-purple-100 text-purple-800' },
    ]);
    const [loading, setLoading] = useState(true);
    const [myBusinesses, setMyBusinesses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Get user's businesses
                const businesses = await businessService.getMyBusinesses();
                setMyBusinesses(businesses);
                
                // If user has businesses, get stats for the first one
                if (businesses && businesses.length > 0) {
                    const businessId = businesses[0]._id || businesses[0].id;
                    const businessStats = await businessService.getBusinessStats(businessId);
                    
                    setStats([
                        { name: 'Active Listings', value: String(businessStats.activeListings || 0), color: 'bg-green-100 text-green-800' },
                        { name: 'Orders Today', value: String(businessStats.ordersToday || 0), color: 'bg-blue-100 text-blue-800' },
                        { name: 'Total Revenue', value: `RWF ${(businessStats.totalRevenue || 0).toLocaleString()}`, color: 'bg-orange-100 text-orange-800' },
                        { name: 'Impact (Meals Saved)', value: String(businessStats.mealsSaved || 0), color: 'bg-purple-100 text-purple-800' },
                    ]);
                }
            } catch (error) {
                console.error('Failed to fetch business stats:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
                <Link to="/business/listings/create" className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">
                    + Create Listing
                </Link>
            </div>

            {myBusinesses.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-gray-500 mb-4">You don't have any businesses yet.</p>
                    <Link to="/business/create" className="text-orange-600 hover:text-orange-500 font-medium">
                        Create your first business →
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((item) => (
                            <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                                    <dd className={`mt-1 text-3xl font-semibold ${item.color.split(' ')[1]}`}>{item.value}</dd>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
                    <div className="border-t border-gray-200">
                        {/* Placeholder for orders list */}
                        <p className="py-4 text-gray-500 text-sm">No recent orders.</p>
                    </div>
                    <div className="mt-4">
                        <Link to="/business/orders" className="text-orange-600 hover:text-orange-500 font-medium text-sm">
                            View all orders &rarr;
                        </Link>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/business/profile" className="flex items-center justify-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700">
                            Edit Store Profile
                        </Link>
                        <Link to="/business/inventory" className="flex items-center justify-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700">
                            Manage Inventory
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
