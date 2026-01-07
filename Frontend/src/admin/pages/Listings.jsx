import React, { useState } from 'react'
import { dummyProducts, categories } from '../../assets/assets'
import { Search, SlidersHorizontal, Pencil, Trash2, Package, CheckCircle, XCircle, Clock, Upload, X, Crop, Maximize2, ShoppingCart } from 'lucide-react'
import { useAdminMode } from '../context/AdminModeContext'

export const AllListings = () => {
  const { adminMode } = useAdminMode();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const itemsPerPage = 5;

  // Add status and stock to products
  const [products, setProducts] = useState(
    dummyProducts.map((product, index) => ({
      ...product,
      status: index % 3 === 0 ? 'inactive' : index % 5 === 0 ? 'expired' : 'active',
      stock: product.quantity || Math.floor(Math.random() * 50) + 10,
    }))
  );

  // Toggle product status
  const handleToggleStatus = (productId) => {
    setProducts(prev => prev.map(product => 
      product._id === productId 
        ? { ...product, status: product.status === 'active' ? 'inactive' : 'active' }
        : product
    ));
  };

  // Delete product
  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(product => product._id !== productId));
    }
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  // Calculate stats
  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    inactive: products.filter(p => p.status === 'inactive').length,
    expired: products.filter(p => p.status === 'expired').length,
  };

  // Filter products
  const filteredProducts = products.filter(product => {
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

  // If editing a product, show the edit form
  if (editingProduct) {
    return <EditListing product={editingProduct} onBack={() => setEditingProduct(null)} />;
  }

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
                          checked={product.status === 'active'}
                          onChange={() => handleToggleStatus(product._id)}
                        />
                        <div className='w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-solid transition-colors duration-200'></div>
                        <span className='absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5'></span>
                      </label>
                      {adminMode === 'shop' && (
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className='p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors'
                        >
                          <Pencil className='w-4 h-4 text-slate-600 dark:text-slate-400' />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        className='p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                      >
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
                className='px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer'
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
                      : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className='px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer'
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

export const NewListing = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    vendor: '',
    price: '',
    offerPrice: '',
    pickupFrom: '',
    pickupTo: '',
    stock: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    allergens: '',
    isRecurring: false,
    frequency: 'daily',
    repeatDays: [],
    endDate: ''
  });

  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      repeatDays: prev.repeatDays.includes(day)
        ? prev.repeatDays.filter(d => d !== day)
        : [...prev.repeatDays, day]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImages(prev => [...prev, ...newImages]);
    if (!mainImage && newImages.length > 0) {
      setMainImage(newImages[0]);
    }
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (mainImage?.id === id) {
      const remaining = images.filter(img => img.id !== id);
      setMainImage(remaining[0] || null);
    }
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className='min-h-screen'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Side - Form */}
        <div className='lg:col-span-2'>
          <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6'>
            <h2 className='text-2xl font-bold text-slate-800 dark:text-white mb-6'>Create New Listing</h2>
            
            <form className='space-y-6'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                    Product Images
                  </label>
                  <div className='flex flex-wrap gap-3'>
                    {images.map((img) => (
                      <div key={img.id} className='relative group'>
                        <img
                          src={img.preview}
                          alt='Product'
                          className='w-24 h-24 object-cover rounded-lg border-2 border-slate-200 dark:border-slate-700'
                        />
                        <button
                          type='button'
                          onClick={() => removeImage(img.id)}
                          className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </div>
                    ))}
                    <label className='w-24 h-24 border-2 border-dashed border-solid dark:border-solid rounded-lg flex items-center justify-center cursor-pointer hover:bg-solid/5 transition-colors'>
                      <input
                        type='file'
                        multiple
                        accept='image/*'
                        onChange={handleImageUpload}
                        className='hidden'
                      />
                      <Upload className='w-6 h-6 text-solid' />
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor='name' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                    Product Name
                  </label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                    placeholder='Enter product name'
                  />
                </div>

                <div>
                  <label htmlFor='description' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                    Description
                  </label>
                  <textarea
                    id='description'
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all resize-none'
                    placeholder='Describe your product'
                  />
                </div>

                <div>
                  <label htmlFor='vendor' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                    Vendor Name
                  </label>
                  <input
                    type='text'
                    id='vendor'
                    name='vendor'
                    value={formData.vendor}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                    placeholder='Enter vendor name'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label htmlFor='category' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Category
                    </label>
                    <select
                      id='category'
                      name='category'
                      value={formData.category}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all cursor-pointer'
                    >
                      <option value=''>Select Category</option>
                      {categories.map((cat, index) => (
                        <option key={index} value={cat.path}>{cat.text}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor='stock' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Stock Count
                    </label>
                    <input
                      type='number'
                      id='stock'
                      name='stock'
                      value={formData.stock}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='0'
                      min='0'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label htmlFor='price' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Price
                    </label>
                    <input
                      type='number'
                      id='price'
                      name='price'
                      value={formData.price}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='0.00'
                      step='0.01'
                      min='0'
                    />
                  </div>

                  <div>
                    <label htmlFor='offerPrice' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Offer Price
                    </label>
                    <input
                      type='number'
                      id='offerPrice'
                      name='offerPrice'
                      value={formData.offerPrice}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='0.00'
                      step='0.01'
                      min='0'
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Window */}
              <div className='space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700'>
                <h3 className='text-lg font-semibold text-slate-800 dark:text-white'>Pickup Window</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label htmlFor='pickupFrom' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      From
                    </label>
                    <input
                      type='datetime-local'
                      id='pickupFrom'
                      name='pickupFrom'
                      value={formData.pickupFrom}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                    />
                  </div>

                  <div>
                    <label htmlFor='pickupTo' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      To
                    </label>
                    <input
                      type='datetime-local'
                      id='pickupTo'
                      name='pickupTo'
                      value={formData.pickupTo}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                    />
                  </div>
                </div>
              </div>

              {/* Nutritional Information */}
              <div className='space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700'>
                <h3 className='text-lg font-semibold text-slate-800 dark:text-white'>
                  Nutritional Information <span className='text-xs font-normal text-slate-500'>(Optional)</span>
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div>
                    <label htmlFor='calories' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Calories
                    </label>
                    <input
                      type='number'
                      id='calories'
                      name='calories'
                      value={formData.calories}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='kcal'
                      min='0'
                    />
                  </div>

                  <div>
                    <label htmlFor='protein' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Protein
                    </label>
                    <input
                      type='number'
                      id='protein'
                      name='protein'
                      value={formData.protein}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='g'
                      min='0'
                    />
                  </div>

                  <div>
                    <label htmlFor='carbs' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Carbs
                    </label>
                    <input
                      type='number'
                      id='carbs'
                      name='carbs'
                      value={formData.carbs}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='g'
                      min='0'
                    />
                  </div>

                  <div>
                    <label htmlFor='fats' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Fats
                    </label>
                    <input
                      type='number'
                      id='fats'
                      name='fats'
                      value={formData.fats}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='g'
                      min='0'
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor='allergens' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                    Allergens
                  </label>
                  <input
                    type='text'
                    id='allergens'
                    name='allergens'
                    value={formData.allergens}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                    placeholder='e.g., Nuts, Dairy, Gluten'
                  />
                </div>
              </div>

              {/* Recurring Listing */}
              <div className='space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold text-slate-800 dark:text-white'>Recurring Listing</h3>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      name='isRecurring'
                      checked={formData.isRecurring}
                      onChange={handleInputChange}
                      className='sr-only peer'
                    />
                    <div className='w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-solid transition-colors duration-200'></div>
                    <span className='absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5'></span>
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className='space-y-4 pl-4 border-l-2 border-solid'>
                    <div>
                      <label htmlFor='frequency' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                        Frequency
                      </label>
                      <select
                        id='frequency'
                        name='frequency'
                        value={formData.frequency}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all cursor-pointer'
                      >
                        <option value='daily'>Daily</option>
                        <option value='weekly'>Weekly</option>
                        <option value='monthly'>Monthly</option>
                      </select>
                    </div>

                    {formData.frequency === 'weekly' && (
                      <div>
                        <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                          Repeat On
                        </label>
                        <div className='flex flex-wrap gap-2'>
                          {weekDays.map((day) => (
                            <button
                              key={day}
                              type='button'
                              onClick={() => handleDayToggle(day)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.repeatDays.includes(day)
                                  ? 'bg-solid text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor='endDate' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                        End Date <span className='text-xs font-normal text-slate-500'>(Optional)</span>
                      </label>
                      <input
                        type='date'
                        id='endDate'
                        name='endDate'
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className='flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700'>
                <button
                  type='button'
                  className='flex-1 px-6 py-3 bg-solid hover:bg-tertiary text-white font-medium rounded-lg transition-colors'
                >
                  Publish Listing
                </button>
                <button
                  type='button'
                  className='flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium rounded-lg transition-colors'
                >
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Preview */}
        <div className='lg:col-span-1 space-y-6'>
          {/* Customer Preview Card */}
          <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6'>
            <h3 className='text-lg font-semibold text-slate-800 dark:text-white mb-4'>Customer Preview</h3>
            <div className='relative border rounded-xl bg-white w-full shadow-md overflow-hidden' style={{ borderColor: '#E5E5E5' }}>
              {/* Discount Badge */}
              {formData.price && formData.offerPrice && formData.offerPrice < formData.price && (
                <div 
                  className='absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white z-10'
                  style={{ backgroundColor: 'var(--color-solidOne)' }}
                >
                  {Math.round(((formData.price - formData.offerPrice) / formData.price) * 100)}% OFF
                </div>
              )}
              
              <div className='relative h-40 overflow-hidden'>
                {mainImage ? (
                  <img 
                    className='w-full h-full object-cover' 
                    src={mainImage.preview} 
                    alt='Product preview' 
                  />
                ) : (
                  <div className='w-full h-full bg-slate-200 flex items-center justify-center'>
                    <Package className='w-12 h-12 text-slate-400' />
                  </div>
                )}
              </div>
              
              <div className='text-sm px-4 pb-3 pt-2'>
                <p className='font-medium text-base truncate w-full mb-0.5' style={{ color: 'var(--color-textColor)' }}>
                  {formData.name || 'Product Name'}
                </p>
                <div className='flex items-center gap-1 text-xs mb-0.5' style={{ color: 'var(--color-gray-50)' }}>
                  <span>{formData.vendor || 'Vendor Name'}</span>
                  <span>•</span>
                  <span className='font-medium' style={{ color: 'var(--color-solid)' }}>
                    1km
                  </span>
                </div>
                <p className='text-xs mb-1.5' style={{ color: 'var(--color-gray-50)' }}>
                  Pickup at {formData.pickupFrom && formData.pickupTo 
                    ? `${new Date(formData.pickupFrom).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${new Date(formData.pickupTo).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
                    : '4PM - 6PM Today'
                  }
                </p>
                <div className='flex items-end justify-between mt-2'>
                  <div>
                    <p className='text-lg font-semibold' style={{ color: 'var(--color-solid)' }}>
                      RWF {formData.offerPrice ? Number(formData.offerPrice).toLocaleString() : '0'}
                    </p>
                    {formData.price && (
                      <p className='text-xs line-through' style={{ color: 'var(--color-gray-50)' }}>
                        RWF {Number(formData.price).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <button 
                      className='flex items-center justify-center gap-1 border w-20 h-[34px] rounded font-medium text-white text-xs' 
                      style={{ backgroundColor: 'var(--color-solid)', borderColor: 'var(--color-solid)' }}
                    >
                      <ShoppingCart className='w-3.5 h-3.5' />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listing Photo Management */}
          {mainImage && (
            <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6'>
              <h3 className='text-lg font-semibold text-slate-800 dark:text-white mb-4'>Listing Photo</h3>
              <div className='relative group'>
                <img
                  src={mainImage.preview}
                  alt='Main listing'
                  className='w-full h-64 object-cover rounded-lg border border-slate-200 dark:border-slate-700'
                />
                <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3'>
                  <button
                    type='button'
                    className='p-3 bg-white/90 hover:bg-white rounded-lg transition-colors'
                    title='Resize'
                  >
                    <Maximize2 className='w-5 h-5 text-slate-800' />
                  </button>
                  <button
                    type='button'
                    className='p-3 bg-white/90 hover:bg-white rounded-lg transition-colors'
                    title='Crop'
                  >
                    <Crop className='w-5 h-5 text-slate-800' />
                  </button>
                  <button
                    type='button'
                    onClick={() => removeImage(mainImage.id)}
                    className='p-3 bg-red-500/90 hover:bg-red-500 rounded-lg transition-colors'
                    title='Delete'
                  >
                    <Trash2 className='w-5 h-5 text-white' />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const EditListing = ({ product, onBack }) => {
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description?.join(', ') || '',
    category: product.category || '',
    vendor: product.vendor || '',
    price: product.price || '',
    offerPrice: product.offerPrice || '',
    pickupFrom: '',
    pickupTo: '',
    stock: product.stock || product.quantity || '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    allergens: product.ingredients_allergens?.[1]?.contains || '',
    isRecurring: false,
    frequency: 'daily',
    repeatDays: [],
    endDate: ''
  });

  const [images, setImages] = useState(
    product.image?.map((img, index) => ({
      file: null,
      preview: img,
      id: `existing-${index}`
    })) || []
  );
  const [mainImage, setMainImage] = useState(images[0] || null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      repeatDays: prev.repeatDays.includes(day)
        ? prev.repeatDays.filter(d => d !== day)
        : [...prev.repeatDays, day]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImages(prev => [...prev, ...newImages]);
    if (!mainImage && newImages.length > 0) {
      setMainImage(newImages[0]);
    }
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (mainImage?.id === id) {
      const remaining = images.filter(img => img.id !== id);
      setMainImage(remaining[0] || null);
    }
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleUpdate = () => {
    // Here you would typically update the product
    alert('Product updated successfully!');
    onBack();
  };

  return (
    <div className='min-h-screen'>
      <div className='mb-6'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-solid hover:text-tertiary transition-colors cursor-pointer'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
          </svg>
          Back to All Listings
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Side - Form */}
        <div className='lg:col-span-2'>
          <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6'>
            <h2 className='text-2xl font-bold text-slate-800 dark:text-white mb-6'>Edit Listing</h2>
            
            <form className='space-y-6'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                    Product Images
                  </label>
                  <div className='flex flex-wrap gap-3'>
                    {images.map((img) => (
                      <div key={img.id} className='relative group'>
                        <img
                          src={img.preview}
                          alt='Product'
                          className='w-24 h-24 object-cover rounded-lg border-2 border-slate-200 dark:border-slate-700'
                        />
                        <button
                          type='button'
                          onClick={() => removeImage(img.id)}
                          className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </div>
                    ))}
                    <label className='w-24 h-24 border-2 border-dashed border-solid dark:border-solid rounded-lg flex items-center justify-center cursor-pointer hover:bg-solid/5 transition-colors'>
                      <input
                        type='file'
                        multiple
                        accept='image/*'
                        onChange={handleImageUpload}
                        className='hidden'
                      />
                      <Upload className='w-6 h-6 text-solid' />
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor='name' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                    Product Name
                  </label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                    placeholder='Enter product name'
                  />
                </div>

                <div>
                  <label htmlFor='description' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                    Description
                  </label>
                  <textarea
                    id='description'
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all resize-none'
                    placeholder='Describe your product'
                  />
                </div>

                <div>
                  <label htmlFor='vendor' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                    Vendor Name
                  </label>
                  <input
                    type='text'
                    id='vendor'
                    name='vendor'
                    value={formData.vendor}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                    placeholder='Enter vendor name'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label htmlFor='category' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Category
                    </label>
                    <select
                      id='category'
                      name='category'
                      value={formData.category}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all cursor-pointer'
                    >
                      <option value=''>Select Category</option>
                      {categories.map((cat, index) => (
                        <option key={index} value={cat.path}>{cat.text}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor='stock' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Stock Count
                    </label>
                    <input
                      type='number'
                      id='stock'
                      name='stock'
                      value={formData.stock}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='0'
                      min='0'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label htmlFor='price' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Price
                    </label>
                    <input
                      type='number'
                      id='price'
                      name='price'
                      value={formData.price}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='0.00'
                      step='0.01'
                      min='0'
                    />
                  </div>

                  <div>
                    <label htmlFor='offerPrice' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Offer Price
                    </label>
                    <input
                      type='number'
                      id='offerPrice'
                      name='offerPrice'
                      value={formData.offerPrice}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='0.00'
                      step='0.01'
                      min='0'
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Window */}
              <div className='space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700'>
                <h3 className='text-lg font-semibold text-slate-800 dark:text-white'>Pickup Window</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label htmlFor='pickupFrom' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      From
                    </label>
                    <input
                      type='datetime-local'
                      id='pickupFrom'
                      name='pickupFrom'
                      value={formData.pickupFrom}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                    />
                  </div>

                  <div>
                    <label htmlFor='pickupTo' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      To
                    </label>
                    <input
                      type='datetime-local'
                      id='pickupTo'
                      name='pickupTo'
                      value={formData.pickupTo}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                    />
                  </div>
                </div>
              </div>

              {/* Nutritional Information */}
              <div className='space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700'>
                <h3 className='text-lg font-semibold text-slate-800 dark:text-white'>
                  Nutritional Information <span className='text-xs font-normal text-slate-500'>(Optional)</span>
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div>
                    <label htmlFor='calories' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Calories
                    </label>
                    <input
                      type='number'
                      id='calories'
                      name='calories'
                      value={formData.calories}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='kcal'
                      min='0'
                    />
                  </div>

                  <div>
                    <label htmlFor='protein' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Protein
                    </label>
                    <input
                      type='number'
                      id='protein'
                      name='protein'
                      value={formData.protein}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='g'
                      min='0'
                    />
                  </div>

                  <div>
                    <label htmlFor='carbs' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Carbs
                    </label>
                    <input
                      type='number'
                      id='carbs'
                      name='carbs'
                      value={formData.carbs}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='g'
                      min='0'
                    />
                  </div>

                  <div>
                    <label htmlFor='fats' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                      Fats
                    </label>
                    <input
                      type='number'
                      id='fats'
                      name='fats'
                      value={formData.fats}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      placeholder='g'
                      min='0'
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor='allergens' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                    Allergens
                  </label>
                  <input
                    type='text'
                    id='allergens'
                    name='allergens'
                    value={formData.allergens}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                    placeholder='e.g., Nuts, Dairy, Gluten'
                  />
                </div>
              </div>

              {/* Recurring Listing */}
              <div className='space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold text-slate-800 dark:text-white'>Recurring Listing</h3>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      name='isRecurring'
                      checked={formData.isRecurring}
                      onChange={handleInputChange}
                      className='sr-only peer'
                    />
                    <div className='w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-solid transition-colors duration-200'></div>
                    <span className='absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5'></span>
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className='space-y-4 pl-4 border-l-2 border-solid'>
                    <div>
                      <label htmlFor='frequency' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                        Frequency
                      </label>
                      <select
                        id='frequency'
                        name='frequency'
                        value={formData.frequency}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all cursor-pointer'
                      >
                        <option value='daily'>Daily</option>
                        <option value='weekly'>Weekly</option>
                        <option value='monthly'>Monthly</option>
                      </select>
                    </div>

                    {formData.frequency === 'weekly' && (
                      <div>
                        <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                          Repeat On
                        </label>
                        <div className='flex flex-wrap gap-2'>
                          {weekDays.map((day) => (
                            <button
                              key={day}
                              type='button'
                              onClick={() => handleDayToggle(day)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.repeatDays.includes(day)
                                  ? 'bg-solid text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor='endDate' className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                        End Date <span className='text-xs font-normal text-slate-500'>(Optional)</span>
                      </label>
                      <input
                        type='date'
                        id='endDate'
                        name='endDate'
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className='flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700'>
                <button
                  type='button'
                  onClick={handleUpdate}
                  className='flex-1 px-6 py-3 bg-solid hover:bg-tertiary text-white font-medium rounded-lg transition-colors'
                >
                  Update Listing
                </button>
                <button
                  type='button'
                  onClick={onBack}
                  className='flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium rounded-lg transition-colors'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Preview */}
        <div className='lg:col-span-1 space-y-6'>
          {/* Customer Preview Card */}
          <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6'>
            <h3 className='text-lg font-semibold text-slate-800 dark:text-white mb-4'>Customer Preview</h3>
            <div className='relative border rounded-xl bg-white w-full shadow-md overflow-hidden' style={{ borderColor: '#E5E5E5' }}>
              {/* Discount Badge */}
              {formData.price && formData.offerPrice && formData.offerPrice < formData.price && (
                <div 
                  className='absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white z-10'
                  style={{ backgroundColor: 'var(--color-solidOne)' }}
                >
                  {Math.round(((formData.price - formData.offerPrice) / formData.price) * 100)}% OFF
                </div>
              )}
              
              <div className='relative h-40 overflow-hidden'>
                {mainImage ? (
                  <img 
                    className='w-full h-full object-cover' 
                    src={mainImage.preview} 
                    alt='Product preview' 
                  />
                ) : (
                  <div className='w-full h-full bg-slate-200 flex items-center justify-center'>
                    <Package className='w-12 h-12 text-slate-400' />
                  </div>
                )}
              </div>
              
              <div className='text-sm px-4 pb-3 pt-2'>
                <p className='font-medium text-base truncate w-full mb-0.5' style={{ color: 'var(--color-textColor)' }}>
                  {formData.name || 'Product Name'}
                </p>
                <div className='flex items-center gap-1 text-xs mb-0.5' style={{ color: 'var(--color-gray-50)' }}>
                  <span>{formData.vendor || 'Vendor Name'}</span>
                  <span>•</span>
                  <span className='font-medium' style={{ color: 'var(--color-solid)' }}>
                    1km
                  </span>
                </div>
                <p className='text-xs mb-1.5' style={{ color: 'var(--color-gray-50)' }}>
                  Pickup at {formData.pickupFrom && formData.pickupTo 
                    ? `${new Date(formData.pickupFrom).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${new Date(formData.pickupTo).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
                    : product.pickupTime || '4PM - 6PM Today'
                  }
                </p>
                <div className='flex items-end justify-between mt-2'>
                  <div>
                    <p className='text-lg font-semibold' style={{ color: 'var(--color-solid)' }}>
                      RWF {formData.offerPrice ? Number(formData.offerPrice).toLocaleString() : '0'}
                    </p>
                    {formData.price && (
                      <p className='text-xs line-through' style={{ color: 'var(--color-gray-50)' }}>
                        RWF {Number(formData.price).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <button 
                      className='flex items-center justify-center gap-1 border w-20 h-[34px] rounded font-medium text-white text-xs' 
                      style={{ backgroundColor: 'var(--color-solid)', borderColor: 'var(--color-solid)' }}
                    >
                      <ShoppingCart className='w-3.5 h-3.5' />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listing Photo Management */}
          {mainImage && (
            <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6'>
              <h3 className='text-lg font-semibold text-slate-800 dark:text-white mb-4'>Listing Photo</h3>
              <div className='relative group'>
                <img
                  src={mainImage.preview}
                  alt='Main listing'
                  className='w-full h-64 object-cover rounded-lg border border-slate-200 dark:border-slate-700'
                />
                <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3'>
                  <button
                    type='button'
                    className='p-3 bg-white/90 hover:bg-white rounded-lg transition-colors'
                    title='Resize'
                  >
                    <Maximize2 className='w-5 h-5 text-slate-800' />
                  </button>
                  <button
                    type='button'
                    className='p-3 bg-white/90 hover:bg-white rounded-lg transition-colors'
                    title='Crop'
                  >
                    <Crop className='w-5 h-5 text-slate-800' />
                  </button>
                  <button
                    type='button'
                    onClick={() => removeImage(mainImage.id)}
                    className='p-3 bg-red-500/90 hover:bg-red-500 rounded-lg transition-colors'
                    title='Delete'
                  >
                    <Trash2 className='w-5 h-5 text-white' />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
