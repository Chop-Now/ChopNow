import { dummyOrders, assets } from '@/assets/assets'
import React, { useEffect, useState } from 'react'
import PageNavbar from '@/Components/PageNavbar'
import Footer from '@/Components/Footer'
import { Truck, Calendar, ChevronLeft, ChevronRight, X, Utensils, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MyOrders = () => {

    const navigate = useNavigate()
    const [myOrders, setMyOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [selectedVendor, setSelectedVendor] = useState('all')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [mobileStatusFilter, setMobileStatusFilter] = useState('processing')
    const [selectedDeliveryType, setSelectedDeliveryType] = useState('Delivery')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const itemsPerPage = 5

    const fetchMyOrders = async () =>{
        setMyOrders(dummyOrders)
        // Show all orders initially (desktop default is "all statuses")
        setFilteredOrders(dummyOrders)
    }

    useEffect(() =>{
        fetchMyOrders()
    }, [])

    // Apply mobile filters on mount for mobile view
    useEffect(() => {
        if (window.innerWidth < 768) {
            // On mobile, filter by processing + delivery by default
            const filtered = myOrders.filter(order => 
                order.status.toLowerCase() === 'processing' && order.type === 'Delivery'
            )
            setFilteredOrders(filtered)
        }
    }, [myOrders])

    // Handle mobile status filter change
    const handleMobileStatusChange = (status) => {
        setMobileStatusFilter(status)
        const filtered = myOrders.filter(order => 
            order.status.toLowerCase() === status.toLowerCase() && order.type === selectedDeliveryType
        )
        setFilteredOrders(filtered)
        setCurrentPage(1)
    }

    // Handle mobile delivery type change
    const handleDeliveryTypeChange = (type) => {
        setSelectedDeliveryType(type)
        const filtered = myOrders.filter(order => 
            order.type === type && order.status.toLowerCase() === mobileStatusFilter.toLowerCase()
        )
        setFilteredOrders(filtered)
        setCurrentPage(1)
    }

    // Get unique vendors from orders
    const vendors = ['all', ...new Set(myOrders.map(order => order.vendor))]

    // Filter orders
    const handleFilterOrders = () => {
        let filtered = [...myOrders]

        if (selectedVendor !== 'all') {
            filtered = filtered.filter(order => order.vendor === selectedVendor)
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(order => order.status.toLowerCase() === selectedStatus.toLowerCase())
        }

        if (startDate && endDate) {
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.createdAt)
                return orderDate >= new Date(startDate) && orderDate <= new Date(endDate)
            })
        }

        setFilteredOrders(filtered)
        setCurrentPage(1)
    }

    // Format date
    const formatDate = (dateString, includeTime = false) => {
        const date = new Date(dateString)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = months[date.getMonth()]
        const day = date.getDate()
        const year = date.getFullYear()

        if (includeTime) {
            const hours = date.getHours().toString().padStart(2, '0')
            const minutes = date.getMinutes().toString().padStart(2, '0')
            return `${month} ${day}, ${year} at ${hours}:${minutes}`
        }
        return `${month} ${day}, ${year}`
    }

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    // Get empty state message based on filter
    const getEmptyStateMessage = () => {
        const statusText = mobileStatusFilter.charAt(0).toUpperCase() + mobileStatusFilter.slice(1)
        return `Oops! There is no ${statusText.toLowerCase()} order. Start browsing and place your order, and your history will show up here!`
    }

  return (
    <>
    <div className='bg-white min-h-screen pt-20'>
        <PageNavbar />
        <div className='mt-10 pb-16 px-6 md:px-16 lg:px-24 xl:px-32'>
            <div className='flex flex-col items-start mb-8 mt-12'>
                <h2 className='text-2xl font-medium'>Order History</h2>
                <p className='text-gray-600'>Review your past and current orders. Thank you for helping reduce food waste!</p>
            </div>

            {/* Mobile Delivery Type Filter */}
            <div className='md:hidden mb-4'>
                <div className='flex gap-2 relative'>
                    {/* Sliding background */}
                    <div 
                        className={`absolute top-0 bottom-0 w-[calc(50%-4px)] bg-green-600 rounded-md transition-transform duration-300 ease-in-out ${
                            selectedDeliveryType === 'Delivery' ? 'transform translate-x-0' : 'transform translate-x-[calc(100%+8px)]'
                        }`}
                    />
                    <button
                        onClick={() => handleDeliveryTypeChange('Delivery')}
                        className={`flex-1 py-3 px-6 rounded-md text-sm font-medium z-10 transition-colors duration-300 border ${
                            selectedDeliveryType === 'Delivery' ? 'text-white border-green-600' : 'text-gray-700 border-gray-300 bg-white'
                        }`}
                    >
                        Delivery
                    </button>
                    <button
                        onClick={() => handleDeliveryTypeChange('Pickup')}
                        className={`flex-1 py-3 px-6 rounded-md text-sm font-medium z-10 transition-colors duration-300 border ${
                            selectedDeliveryType === 'Pickup' ? 'text-white border-green-600' : 'text-gray-700 border-gray-300 bg-white'
                        }`}
                    >
                        Pickup
                    </button>
                </div>
            </div>

            {/* Mobile Status Filter Tabs */}
            <div className='md:hidden mb-6'>
                <div className='bg-gray-100 rounded-full p-1 flex relative'>
                    {/* Sliding background */}
                    <div 
                        className={`absolute top-1 bottom-1 w-1/3 bg-green-600 rounded-full transition-transform duration-300 ease-in-out ${
                            mobileStatusFilter === 'processing' ? 'transform translate-x-0' :
                            mobileStatusFilter === 'completed' ? 'transform translate-x-full' :
                            'transform translate-x-[200%]'
                        }`}
                    />
                    <button
                        onClick={() => handleMobileStatusChange('processing')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium z-10 transition-colors duration-300 ${
                            mobileStatusFilter === 'processing' ? 'text-white' : 'text-gray-700'
                        }`}
                    >
                        Processing
                    </button>
                    <button
                        onClick={() => handleMobileStatusChange('completed')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium z-10 transition-colors duration-300 ${
                            mobileStatusFilter === 'completed' ? 'text-white' : 'text-gray-700'
                        }`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => handleMobileStatusChange('failed')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium z-10 transition-colors duration-300 ${
                            mobileStatusFilter === 'failed' ? 'text-white' : 'text-gray-700'
                        }`}
                    >
                        Failed
                    </button>
                </div>
            </div>

            {/* Desktop Filters */}
            <div className='hidden md:block bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm'>
                <div className='grid grid-cols-1 md:grid-cols-5 gap-3'>
                    {/* Vendor Filter */}
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium mb-1.5'>
                            Search by Vendor
                        </label>
                        <div className='relative'>
                            <Utensils className='w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400' />
                            <select 
                                value={selectedVendor}
                                onChange={(e) => setSelectedVendor(e.target.value)}
                                className='border border-gray-300 rounded-md pl-9 pr-2 py-1.5 text-xs w-full focus:outline-none focus:ring-2 focus:ring-green-500'
                            >
                                {vendors.map((vendor, index) => (
                                    <option key={index} value={vendor}>
                                        {vendor === 'all' ? 'All Vendors' : vendor}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium mb-1.5'>
                            Status
                        </label>
                        <div className='relative'>
                            <Truck className='w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400' />
                            <select 
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className='border border-gray-300 rounded-md pl-9 pr-2 py-1.5 text-xs w-full focus:outline-none focus:ring-2 focus:ring-green-500'
                            >
                                <option value="all">All Statuses</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium mb-1.5'>
                            Start Date
                        </label>
                        <div className='relative'>
                            <Calendar className='w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400' />
                            <input 
                                type='date'
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className='border border-gray-300 rounded-md pl-9 pr-2 py-1.5 text-xs w-full focus:outline-none focus:ring-2 focus:ring-green-500'
                            />
                        </div>
                    </div>

                    <div className='flex flex-col'>
                        <label className='text-xs font-medium mb-1.5'>
                            End Date
                        </label>
                        <div className='relative'>
                            <Calendar className='w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400' />
                            <input 
                                type='date'
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className='border border-gray-300 rounded-md pl-9 pr-2 py-1.5 text-xs w-full focus:outline-none focus:ring-2 focus:ring-green-500'
                            />
                        </div>
                    </div>

                    {/* Filter Button */}
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium mb-1.5 opacity-0'>
                            Action
                        </label>
                        <button 
                            onClick={handleFilterOrders}
                            className='bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-xs font-medium transition-colors h-full cursor-pointer'
                        >
                            Filter Orders
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {currentOrders.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-16 text-center'>
                    <img src={assets.oops} alt='No orders' className='w-48 h-48 mb-6 object-contain' />
                    <p className='text-gray-600 max-w-md mb-6 px-4'>{getEmptyStateMessage()}</p>
                    <button 
                        onClick={() => navigate('/shop')}
                        className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors'
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <>
                    {/* Desktop Table Header */}
                    <div className='hidden md:block border border-gray-200 rounded-t-lg p-3 mb-1 bg-white'>
                        <div className='grid grid-cols-6 gap-3 text-xs font-semibold text-gray-700'>
                            <div>Order ID</div>
                            <div>Date</div>
                            <div>Vendor</div>
                            <div>Total</div>
                            <div>Status</div>
                            <div className='text-right'>Action</div>
                        </div>
                    </div>

                    {/* Desktop Table Rows */}
                    <div className='hidden md:block'>
                        {currentOrders.map((order, index) => (
                            <div key={index} className='border border-gray-200 border-t-0 p-3 bg-white'>
                                <div className='grid grid-cols-6 gap-3 items-center text-xs'>
                                    <div className='font-semibold text-gray-900'>{order._id}</div>
                                    <div className='text-gray-600'>{formatDate(order.createdAt)}</div>
                                    <div className='text-gray-600'>{order.vendor}</div>
                                    <div className='font-semibold text-gray-900'>RWF {order.amount.toLocaleString()}</div>
                                    <div>
                                        <span className={`text-xs px-3 py-1 rounded-full ${
                                            order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                            order.status === 'Cancelled' ? 'bg-gray-100 text-gray-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className='text-right'>
                                        <button 
                                            onClick={() => setSelectedOrder(order)}
                                            className='text-green-600 hover:text-green-700 text-sm font-medium underline cursor-pointer'
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mobile Order Cards */}
                    <div className='md:hidden space-y-3'>
                        {currentOrders.map((order, index) => {
                            const firstProduct = order.items[0].product
                            return (
                                <div 
                                    key={index} 
                                    onClick={() => setSelectedOrder(order)}
                                    className='border border-gray-200 rounded-lg p-4 bg-white active:bg-gray-50 cursor-pointer'
                                >
                                    <div className='flex items-center gap-3 mb-3'>
                                        <img 
                                            src={firstProduct.image[0]} 
                                            alt={firstProduct.name}
                                            className='w-12 h-12 rounded-full object-cover shrink-0'
                                        />
                                        <p className='text-sm font-medium text-gray-900 line-clamp-2'>{firstProduct.name}</p>
                                    </div>
                                    <div className='flex justify-between items-start'>
                                        <div className='flex-1'>
                                            <p className='text-sm font-semibold text-gray-900 mb-2'>{order._id}</p>
                                            <p className='text-xs text-gray-600'>{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div className='flex flex-col items-end'>
                                            <p className='text-sm font-semibold text-gray-900 mb-2'>RWF {order.amount.toLocaleString()}</p>
                                            <p className='text-xs text-gray-600'>{order.order_type}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Pagination */}
                    <div className='flex justify-between items-center mt-8 flex-wrap gap-4'>
                        <p className='text-sm text-gray-600'>
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} results
                        </p>
                        <div className='flex gap-2'>
                            <button 
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`flex items-center gap-1 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                                    currentPage === 1 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <ChevronLeft className='w-4 h-4' />
                                Previous
                            </button>
                            <button 
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={`flex items-center gap-1 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                                    currentPage === totalPages 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Next
                                <ChevronRight className='w-4 h-4' />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
            <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
                <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
                    <div className='sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center'>
                        <div className='flex items-center gap-4'>
                            <h3 className='text-xl font-semibold'>Order Details</h3>
                            <button 
                                className='text-red-500 hover:text-red-700 transition-colors'
                                title='Delete Order'
                            >
                                <Trash2 className='w-5 h-5' />
                            </button>
                        </div>
                        <button 
                            onClick={() => setSelectedOrder(null)}
                            className='text-gray-500 hover:text-gray-700'
                        >
                            <X className='w-6 h-6' />
                        </button>
                    </div>
                    <div className='p-6'>
                        {/* Order Info */}
                        <div className='mb-6'>
                            <h4 className='font-semibold text-lg mb-3'>Order Information</h4>
                            <div className='grid grid-cols-2 gap-4 text-sm'>
                                <div>
                                    <p className='text-gray-600'>Order ID</p>
                                    <p className='font-medium'>{selectedOrder._id}</p>
                                </div>
                                <div>
                                    <p className='text-gray-600'>Date & Time</p>
                                    <p className='font-medium'>{formatDate(selectedOrder.createdAt, true)}</p>
                                </div>
                                <div>
                                    <p className='text-gray-600'>Status</p>
                                    <p className={`font-medium ${
                                        selectedOrder.status === 'Completed' ? 'text-green-700' :
                                        selectedOrder.status === 'Processing' ? 'text-blue-700' :
                                        selectedOrder.status === 'Cancelled' ? 'text-gray-700' :
                                        'text-red-700'
                                    }`}>{selectedOrder.status}</p>
                                </div>
                                <div>
                                    <p className='text-gray-600'>Order Type</p>
                                    <p className='font-medium'>{selectedOrder.order_type}</p>
                                </div>
                                <div>
                                    <p className='text-gray-600'>Delivery Type</p>
                                    <p className='font-medium'>{selectedOrder.type}</p>
                                </div>
                                <div>
                                    <p className='text-gray-600'>Vendor</p>
                                    <p className='font-medium'>{selectedOrder.vendor}</p>
                                </div>
                                <div>
                                    <p className='text-gray-600'>Payment Method</p>
                                    <p className='font-medium'>{selectedOrder.paymentMethod}</p>
                                </div>
                                <div>
                                    <p className='text-gray-600'>Payment Status</p>
                                    <p className='font-medium'>{selectedOrder.isPaid ? 'Paid' : 'Unpaid'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        <div className='mb-6'>
                            <h4 className='font-semibold text-lg mb-3'>Products</h4>
                            <div className='space-y-3'>
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className='flex items-center gap-4 p-3 border rounded-lg'>
                                        <img 
                                            src={item.product.image[0]} 
                                            alt={item.product.name}
                                            className='w-16 h-16 object-cover rounded'
                                        />
                                        <div className='flex-1'>
                                            <p className='font-medium'>{item.product.name}</p>
                                            <p className='text-sm text-gray-600'>Quantity: {item.quantity}</p>
                                        </div>
                                        <p className='font-medium'>RWF {(item.product.offerPrice * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className='border-t pt-4'>
                            <h4 className='font-semibold text-lg mb-3'>Order Summary</h4>
                            <div className='space-y-2 text-sm'>
                                <div className='flex justify-between'>
                                    <p className='text-gray-600'>Subtotal</p>
                                    <p className='font-medium'>RWF {selectedOrder.items.reduce((sum, item) => sum + (item.product.offerPrice * item.quantity), 0).toLocaleString()}</p>
                                </div>
                                {selectedOrder.type === 'Delivery' && (
                                    <div className='flex justify-between'>
                                        <p className='text-gray-600'>Delivery Charges</p>
                                        <p className='font-medium'>RWF 1,000</p>
                                    </div>
                                )}
                                <div className='flex justify-between'>
                                    <p className='text-gray-600'>Container Charge</p>
                                    <p className='font-medium'>RWF 500</p>
                                </div>
                                <div className='flex justify-between pt-2 border-t'>
                                    <p className='font-semibold text-base'>Total</p>
                                    <p className='font-semibold text-base'>RWF {selectedOrder.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {selectedOrder.type === 'Delivery' && (
                            <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
                                <h4 className='font-semibold mb-2'>Delivery Information</h4>
                                <p className='text-sm text-gray-600'>Address details would be displayed here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
        </div>
        <Footer />
    </>
  )
}

export default MyOrders
