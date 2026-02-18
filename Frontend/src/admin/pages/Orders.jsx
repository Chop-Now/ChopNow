import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Archive,
  Trash2,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Filter,
  Loader2,
} from 'lucide-react';
import { orderService } from '../../services';
import toast from 'react-hot-toast';
import { useAdminMode } from '../context/AdminModeContext';

const OrdersTable = ({ title, statusFilter }) => {
  const { adminMode } = useAdminMode();
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch orders from API
  useEffect(() => {
    let isMounted = true;
    const loadOrders = async () => {
      setLoading(true);
      try {
        const filters = {
          page: currentPage,
          limit: itemsPerPage,
        };

        if (statusFilter === 'pending') {
          filters.status = 'pending';
        } else if (statusFilter === 'completed') {
          filters.status = 'completed';
        } else if (statusFilter === 'deliveries') {
          filters.fulfillmentType = 'delivery';
          filters.status = 'confirmed';
        }

        const response =
          adminMode === 'website'
            ? await orderService.getAdminOrders(filters)
            : await orderService.getOrders(filters);

        if (!isMounted) return;

        const transformedOrders = (response.orders || []).map((order) => ({
          _id: order.orderNumber || order._id,
          orderId: order._id,
          customerName: order.customer
            ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
            : 'Unknown',
          vendor: order.business?.name || 'Unknown Vendor',
          status: formatStatus(order.status),
          total: order.pricing?.total || 0,
          pickupWindow: order.pickupDetails?.pickupTime || 'N/A',
          createdAt: order.createdAt,
          type: order.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup',
        }));

        setOrders(transformedOrders);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders');
        setOrders([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter === 'pending') {
        filters.status = 'pending';
      } else if (statusFilter === 'completed') {
        filters.status = 'completed';
      } else if (statusFilter === 'deliveries') {
        filters.fulfillmentType = 'delivery';
        filters.status = 'confirmed';
      }

      const response =
        adminMode === 'website'
          ? await orderService.getAdminOrders(filters)
          : await orderService.getOrders(filters);

      const transformedOrders = (response.orders || []).map((order) => ({
        _id: order.orderNumber || order._id,
        orderId: order._id,
        customerName: order.customer
          ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
          : 'Unknown',
        vendor: order.business?.name || 'Unknown Vendor',
        status: formatStatus(order.status),
        total: order.pricing?.total || 0,
        pickupWindow: order.pickupDetails?.pickupTime || 'N/A',
        createdAt: order.createdAt,
        type: order.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup',
      }));

      setOrders(transformedOrders);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Accepted',
      ready_for_pickup: 'Ready',
      out_for_delivery: 'In Transit',
      completed: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
  };

  // Client-side filtering for search and date (API handles status filter)
  let filteredOrders = orders;

  // Apply search filter (client-side)
  if (searchTerm) {
    filteredOrders = filteredOrders.filter(
      (order) =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply date range filter (client-side)
  if (dateFrom) {
    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.createdAt) >= new Date(dateFrom)
    );
  }
  if (dateTo) {
    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.createdAt) <= new Date(dateTo + 'T23:59:59')
    );
  }

  // Apply sorting (client-side)
  filteredOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'highest') {
      return b.total - a.total;
    } else if (sortBy === 'lowest') {
      return a.total - b.total;
    }
    return 0;
  });

  // Display values
  const currentOrders = filteredOrders;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const showingFrom = filteredOrders.length > 0 ? startIndex + 1 : 0;
  const showingTo = Math.min(endIndex, filteredOrders.length);

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(currentOrders.map((o) => o._id));
    } else {
      setSelectedOrders([]);
    }
  };

  // Handle individual select
  const handleSelect = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((oId) => oId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  // Handle archive
  const handleArchive = () => {
    if (window.confirm(`Archive ${selectedOrders.length} order(s)?`)) {
      setOrders(orders.filter((order) => !selectedOrders.includes(order._id)));
      setSelectedOrders([]);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (window.confirm(`Delete ${selectedOrders.length} order(s)? This action cannot be undone.`)) {
      setOrders(orders.filter((order) => !selectedOrders.includes(order._id)));
      setSelectedOrders([]);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Picked Up':
        return 'bg-solid/10 text-solid';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer, or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date From
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date To
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sort By
              </label>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-solid hover:bg-tertiary text-white rounded-lg text-xs font-medium transition-colors">
              <Filter className="w-4 h-4" />
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleArchive}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Archive className="w-4 h-4" />
                Archive Selected
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage your orders</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedOrders.length === currentOrders.length && currentOrders.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-solid focus:ring-solid cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Pickup Window
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {currentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => handleSelect(order._id)}
                      className="w-4 h-4 rounded border-slate-300 text-solid focus:ring-solid cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-semibold text-solid">{order._id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium text-slate-900 dark:text-white">
                      {order.customerName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-900 dark:text-white">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {order.pickupWindow}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      RWF {order.total.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Showing {showingFrom} to {showingTo} of {filteredOrders.length} orders
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Previous
              </button>

              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-solid text-white'
                        : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const AllOrders = () => <OrdersTable title="All Orders" statusFilter="all" />;
export const PendingOrders = () => <OrdersTable title="Pending Orders" statusFilter="pending" />;
export const CompletedOrders = () => (
  <OrdersTable title="Completed Orders" statusFilter="completed" />
);
export const Deliveries = () => (
  <OrdersTable title="Deliveries (To Be Delivered)" statusFilter="deliveries" />
);
