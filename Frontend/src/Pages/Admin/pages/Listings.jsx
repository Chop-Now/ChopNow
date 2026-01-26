import React, { useState } from 'react'
import { dummyProducts } from '../../assets/assets'
import { Search, SlidersHorizontal, Pencil, Trash2, Package, CheckCircle, XCircle, Clock } from 'lucide-react'

export const AllListings = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add status and stock to products
  const productsWithStatus = dummyProducts.map((product, index) => ({
    ...product,
    status: index % 3 === 0 ? 'inactive' : index % 5 === 0 ? 'expired' : 'active',
    stock: product.quantity || Math.floor(Math.random() * 50) + 10,
  }));

  // Calculate stats
  const stats = {
    total: productsWithStatus.length,
    active: productsWithStatus.filter(p => p.status === 'active').length,
    inactive: productsWithStatus.filter(p => p.status === 'inactive').length,
    expired: productsWithStatus.filter(p => p.status === 'expired').length,
  };

  // Filter products
  const filteredProducts = productsWithStatus.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  const showingFrom = filteredProducts.length > 0 ? startIndex + 1 : 0;
  const showingTo = Math.min(endIndex, filteredProducts.length);

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(currentProducts.map(p => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  // Handle individual select
  const handleSelect = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pId => pId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const statsCards = [
    {
      title: 'Total Listings',
      value: stats.total,
      icon: <Package className='w-6 h-6' />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Active Listings',
      value: stats.active,
      icon: <CheckCircle className='w-6 h-6' />,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Inactive Listings',
      value: stats.inactive,
      icon: <XCircle className='w-6 h-6' />,
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Expired Listings',
      value: stats.expired,
      icon: <Clock className='w-6 h-6' />,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
        {statsCards.map((stat, index) => (
          <div key={index} className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 group'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <p className='text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1'>
                  {stat.title}
                </p>
                <p className='text-xl font-bold text-slate-800 dark:text-white'>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-all duration-300`}>
                <div className={stat.iconColor}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Section */}
      <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50'>
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1 relative'>
            <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
            <input
              type="text"
              placeholder='Search listings...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
            />
          </div>
          <div className='flex items-center gap-2'>
            <SlidersHorizontal className='w-4 h-4 text-slate-600 dark:text-slate-400' />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all cursor-pointer'
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50'>
          <div className='flex items-center justify-between'>
            <p className='text-xs text-slate-600 dark:text-slate-400'>
              {selectedProducts.length} item{selectedProducts.length > 1 ? 's' : ''} selected
            </p>
            <div className='flex gap-3'>
              <button className='px-3 py-1.5 bg-solid hover:bg-tertiary text-white rounded-lg text-xs font-medium transition-colors'>
                Activate Selected
              </button>
              <button className='px-3 py-1.5 bg-solidOne hover:bg-solidTwo text-white rounded-lg text-xs font-medium transition-colors'>
                Deactivate Selected
              </button>
              <button className='px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors'>
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden'>
        <div className='p-6 border-b border-slate-200/50 dark:border-slate-700/50'>
          <h3 className='text-base font-bold text-slate-800 dark:text-white'>All Products</h3>
          <p className='text-xs text-slate-500 dark:text-slate-400'>Manage your product listings</p>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-slate-50 dark:bg-slate-800/50'>
              <tr>
                <th className='px-6 py-3 text-left'>
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                    onChange={handleSelectAll}
                    className='w-4 h-4 rounded border-slate-300 text-solid focus:ring-solid cursor-pointer'
                  />
                </th>
                <th className='px-6 py-3 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                  Product
                </th>
                <th className='px-6 py-3 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                  Category
                </th>
                <th className='px-6 py-3 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                  Stock
                </th>
                <th className='px-6 py-3 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                  Pickup Window
                </th>
                <th className='px-6 py-3 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                  Date Created
                </th>
                <th className='px-6 py-3 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-200 dark:divide-slate-700'>
              {currentProducts.map((product) => (
                <tr key={product._id} className='hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'>
                  <td className='px-6 py-4'>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleSelect(product._id)}
                      className='w-4 h-4 rounded border-slate-300 text-solid focus:ring-solid cursor-pointer'
                    />
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-3'>
                      <img
                        src={product.image[0]}
                        alt={product.name}
                        className='w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700'
                      />
                      <span className='text-xs font-medium text-slate-900 dark:text-white truncate max-w-xs'>
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='text-xs text-slate-600 dark:text-slate-400'>{product.category}</span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='text-xs font-semibold text-slate-900 dark:text-white'>{product.stock}</span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='text-xs text-slate-600 dark:text-slate-400'>{product.pickupTime}</span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='text-xs text-slate-600 dark:text-slate-400'>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      product.status === 'active'
                        ? 'bg-solid/10 text-solid'
                        : product.status === 'inactive'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      <label className='relative inline-flex items-center cursor-pointer'>
                        <input
                          type="checkbox"
                          className='sr-only peer'
                          defaultChecked={product.status === 'active'}
                        />
                        <div className='w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-solid transition-colors duration-200'></div>
                        <span className='absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5'></span>
                      </label>
                      <button className='p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors'>
                        <Pencil className='w-4 h-4 text-slate-600 dark:text-slate-400' />
                      </button>
                      <button className='p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'>
                        <Trash2 className='w-4 h-4 text-red-600 dark:text-red-400' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className='px-6 py-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between'>
            <p className='text-xs text-slate-600 dark:text-slate-400'>
              Showing {showingFrom} to {showingTo} of {filteredProducts.length} listings
            </p>
            
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className='px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    currentPage === index + 1
                      ? 'bg-solid text-white'
                      : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className='px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Next
              </button>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className='p-12 text-center'>
            <p className='text-slate-500 dark:text-slate-400'>No products found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export const NewListing = () => <ComingSoon title="New Listing" />

const ComingSoon = ({ title }) => {
  return (
    <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-slate-800 dark:text-white mb-4'>{title}</h1>
        <p className='text-xl text-slate-500 dark:text-slate-400'>Coming Soon</p>
      </div>
    </div>
  )
}
