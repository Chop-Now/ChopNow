import React, { useState } from 'react'
import { useAdminMode } from '../context/AdminModeContext'
import { Pencil, Eye, EyeOff, CheckCircle, Clock, XCircle, Wallet, Smartphone, Building2, AlertCircle, History, ChevronLeft, ChevronRight, Info } from 'lucide-react'

// Shop Admin Payouts Component
const ShopAdminPayouts = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [preferredMethod, setPreferredMethod] = useState('bank') // 'bank' or 'mobile'
  const [showAccountNumber, setShowAccountNumber] = useState(false)
  const [showMobileNumber, setShowMobileNumber] = useState(false)

  // Form data state
  const [formData, setFormData] = useState({
    bankName: 'Bank of Kigali',
    accountHolder: 'John Doe',
    accountNumber: '1234567890123456',
    swiftCode: 'BKIGRWRW',
    mobileProvider: 'MTN',
    mobilePhone: '+250788123456',
    mobileAccountName: 'John Doe'
  })

  // Recent payouts data
  const recentPayouts = [
    { id: 'PAY-001', date: '2026-01-25', amount: 'RWF 125,000', status: 'completed' },
    { id: 'PAY-002', date: '2026-01-20', amount: 'RWF 98,500', status: 'completed' },
    { id: 'PAY-003', date: '2026-01-15', amount: 'RWF 156,000', status: 'completed' },
    { id: 'PAY-004', date: '2026-01-10', amount: 'RWF 78,900', status: 'pending' },
    { id: 'PAY-005', date: '2026-01-05', amount: 'RWF 45,000', status: 'failed' },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    // Save logic here
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset form logic here
    setIsEditing(false)
  }

  const maskAccountNumber = (number) => {
    if (!number) return ''
    return '•'.repeat(number.length - 4) + number.slice(-4)
  }

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
    
    return (
      <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-22 ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your payout methods and view payment history
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2.5 bg-solid hover:bg-tertiary text-white rounded-lg transition-colors font-medium text-sm cursor-pointer"
        >
          <Pencil className="w-4 h-4" />
          Update Info
        </button>
      </div>

      {/* Payout Schedule Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
              Payout Schedule
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Payouts are automatically released on the <span className="font-semibold">1st day</span> and <span className="font-semibold">15th day</span> of each month. Please ensure your payout information is up to date.
            </p>
          </div>
        </div>
      </div>

      {/* Payout Method Form */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Payout Method</h2>

        {/* Preferred Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Preferred Payout Method
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setPreferredMethod('bank')}
              disabled={!isEditing}
              className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                preferredMethod === 'bank'
                  ? 'border-solid bg-solid/10 text-solid dark:bg-solid/20'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
              } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-solid'}`}
            >
              Bank Account
            </button>
            <button
              onClick={() => setPreferredMethod('mobile')}
              disabled={!isEditing}
              className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                preferredMethod === 'mobile'
                  ? 'border-solid bg-solid/10 text-solid dark:bg-solid/20'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
              } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-solid'}`}
            >
              Mobile Money
            </button>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className={`space-y-4 pb-6 ${preferredMethod !== 'bank' ? 'opacity-40' : ''}`}>
          <h3 className="text-base font-medium text-slate-800 dark:text-white">Bank Account Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                disabled={!isEditing || preferredMethod !== 'bank'}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-solid/20 focus:border-solid outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                name="accountHolder"
                value={formData.accountHolder}
                onChange={handleInputChange}
                disabled={!isEditing || preferredMethod !== 'bank'}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-solid/20 focus:border-solid outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Account Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="accountNumber"
                  value={showAccountNumber ? formData.accountNumber : maskAccountNumber(formData.accountNumber)}
                  onChange={handleInputChange}
                  disabled={!isEditing || preferredMethod !== 'bank'}
                  className="w-full px-4 py-2.5 pr-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-solid/20 focus:border-solid outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowAccountNumber(!showAccountNumber)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {showAccountNumber ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                SWIFT/BIC Code
              </label>
              <input
                type="text"
                name="swiftCode"
                value={formData.swiftCode}
                onChange={handleInputChange}
                disabled={!isEditing || preferredMethod !== 'bank'}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-solid/20 focus:border-solid outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>

        {/* Mobile Money Details */}
        <div className={`space-y-4 ${preferredMethod !== 'mobile' ? 'opacity-40' : ''}`}>
          <h3 className="text-base font-medium text-slate-800 dark:text-white">Mobile Money</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Provider
              </label>
              <select
                name="mobileProvider"
                value={formData.mobileProvider}
                onChange={handleInputChange}
                disabled={!isEditing || preferredMethod !== 'mobile'}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-solid/20 focus:border-solid outline-none transition-all"
              >
                <option value="MTN">MTN</option>
                <option value="Vodafone">Vodafone</option>
                <option value="Airtel">Airtel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Account Name
              </label>
              <input
                type="text"
                name="mobileAccountName"
                value={formData.mobileAccountName}
                onChange={handleInputChange}
                disabled={!isEditing || preferredMethod !== 'mobile'}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-solid/20 focus:border-solid outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="mobilePhone"
                  value={showMobileNumber ? formData.mobilePhone : maskAccountNumber(formData.mobilePhone)}
                  onChange={handleInputChange}
                  disabled={!isEditing || preferredMethod !== 'mobile'}
                  className="w-full px-4 py-2.5 pr-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-solid/20 focus:border-solid outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowMobileNumber(!showMobileNumber)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {showMobileNumber ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-solid hover:bg-tertiary text-white rounded-lg transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Recent Payouts Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Payouts</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Payout ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayouts.map((payout) => (
                <tr key={payout.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{payout.date}</td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">{payout.id}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">{payout.amount}</td>
                  <td className="py-3 px-4">{getStatusBadge(payout.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Website Admin Payouts Component
const WebsiteAdminPayouts = () => {
  const [messageModal, setMessageModal] = useState({ open: false, vendor: null })
  const [message, setMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Vendors pending payout data - expanded for pagination demo
  const allVendorPayouts = [
    { id: 1, name: 'Fresh Farm Market', email: 'contact@freshfarm.rw', payoutMethod: 'Bank Account', accountInfo: 'Bank of Kigali - ****3456', amount: 'RWF 450,000', status: 'ready' },
    { id: 2, name: 'Organic Grocers', email: 'info@organicgrocers.rw', payoutMethod: 'Mobile Money', accountInfo: 'MTN - ****1234', amount: 'RWF 320,000', status: 'ready' },
    { id: 3, name: 'City Market Hub', email: 'hello@citymarket.rw', payoutMethod: 'Bank Account', accountInfo: 'Equity Bank - ****7890', amount: 'RWF 890,000', status: 'ready' },
    { id: 4, name: 'Green Valley Foods', email: 'support@greenvalley.rw', payoutMethod: 'Mobile Money', accountInfo: 'Airtel - ****5678', amount: 'RWF 125,000', status: 'ready' },
    { id: 5, name: 'African Delights', email: 'admin@africandelights.rw', payoutMethod: 'Bank Account', accountInfo: 'KCB Bank - ****2345', amount: 'RWF 560,000', status: 'ready' },
    { id: 9, name: 'Spice Heaven', email: 'info@spiceheaven.rw', payoutMethod: 'Mobile Money', accountInfo: 'MTN - ****4321', amount: 'RWF 280,000', status: 'ready' },
    { id: 10, name: 'Daily Bread Bakery', email: 'contact@dailybread.rw', payoutMethod: 'Bank Account', accountInfo: 'Access Bank - ****5432', amount: 'RWF 190,000', status: 'ready' },
    { id: 11, name: 'Tropical Fruits Co', email: 'sales@tropicalfruits.rw', payoutMethod: 'Mobile Money', accountInfo: 'MTN - ****6789', amount: 'RWF 410,000', status: 'ready' },
    { id: 12, name: 'Ocean Fresh Seafood', email: 'info@oceanfresh.rw', payoutMethod: 'Bank Account', accountInfo: 'GT Bank - ****8901', amount: 'RWF 670,000', status: 'ready' },
    { id: 13, name: 'Mountain View Dairy', email: 'contact@mountaindairy.rw', payoutMethod: 'Mobile Money', accountInfo: 'Airtel - ****2345', amount: 'RWF 340,000', status: 'ready' },
    { id: 14, name: 'Garden Fresh Veggies', email: 'hello@gardenfresh.rw', payoutMethod: 'Bank Account', accountInfo: 'Stanbic - ****3456', amount: 'RWF 230,000', status: 'ready' },
    { id: 15, name: 'Sweet Treats Bakery', email: 'orders@sweettreats.rw', payoutMethod: 'Mobile Money', accountInfo: 'MTN - ****7890', amount: 'RWF 180,000', status: 'ready' },
  ]

  // Failed payout vendors
  const failedPayouts = [
    { id: 6, name: 'Sunrise Bakery', email: 'contact@sunrisebakery.rw', payoutMethod: 'Bank Account', accountInfo: 'Bank of Kigali - ****9999', amount: 'RWF 78,000', reason: 'Invalid account number', lastAttempt: '2026-01-26' },
    { id: 7, name: 'Quick Meals', email: 'support@quickmeals.rw', payoutMethod: 'Mobile Money', accountInfo: 'MTN - ****8888', amount: 'RWF 45,000', reason: 'Account not registered', lastAttempt: '2026-01-25' },
    { id: 8, name: 'Fresh Catch', email: 'info@freshcatch.rw', payoutMethod: 'Bank Account', accountInfo: 'Equity Bank - ****7777', amount: 'RWF 156,000', reason: 'Account suspended', lastAttempt: '2026-01-24' },
  ]

  // Calculate stats
  const totalPendingAmount = allVendorPayouts.reduce((sum, vendor) => {
    const amount = parseInt(vendor.amount.replace(/[^0-9]/g, ''))
    return sum + amount
  }, 0)

  const mtnVendors = allVendorPayouts.filter(v => v.accountInfo.includes('MTN'))
  const mtnAmount = mtnVendors.reduce((sum, vendor) => {
    const amount = parseInt(vendor.amount.replace(/[^0-9]/g, ''))
    return sum + amount
  }, 0)

  const bankVendors = allVendorPayouts.filter(v => v.payoutMethod === 'Bank Account')
  const bankAmount = bankVendors.reduce((sum, vendor) => {
    const amount = parseInt(vendor.amount.replace(/[^0-9]/g, ''))
    return sum + amount
  }, 0)

  const totalFailed = failedPayouts.length

  // Pagination
  const totalPages = Math.ceil(allVendorPayouts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVendors = allVendorPayouts.slice(startIndex, endIndex)
  const showingFrom = allVendorPayouts.length > 0 ? startIndex + 1 : 0
  const showingTo = Math.min(endIndex, allVendorPayouts.length)

  const handleReleaseMTNPayouts = () => {
    console.log('Releasing payouts to MTN vendors...')
  }

  const handleReleaseBankPayouts = () => {
    console.log('Releasing payouts to Bank Account vendors...')
  }

  const handleSendMessage = (vendor) => {
    setMessageModal({ open: true, vendor })
    setMessage('')
  }

  const handleSendMessageSubmit = () => {
    console.log(`Sending message to ${messageModal.vendor.email}: ${message}`)
    setMessageModal({ open: false, vendor: null })
    setMessage('')
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <div className="space-y-6">
      {/* Header with History Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Payouts</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage payouts to all vendors across the platform
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
        >
          <History className="w-4 h-4" />
          Payout History
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
        {/* Total Pending */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>
                Total Pending
              </p>
              <p className='text-xl font-bold text-slate-800 dark:text-white mb-2'>
                RWF {totalPendingAmount.toLocaleString()}
              </p>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                {allVendorPayouts.length} vendors
              </p>
            </div>
            <div className='p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 group-hover:scale-110 transition-all duration-300'>
              <Wallet className='w-6 h-6 text-solid' />
            </div>
          </div>
        </div>

        {/* MTN Preferred */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>
                MTN Preferred
              </p>
              <p className='text-xl font-bold text-slate-800 dark:text-white mb-2'>
                RWF {mtnAmount.toLocaleString()}
              </p>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                {mtnVendors.length} vendors
              </p>
            </div>
            <div className='p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 group-hover:scale-110 transition-all duration-300'>
              <Smartphone className='w-6 h-6 text-yellow-600 dark:text-yellow-400' />
            </div>
          </div>
        </div>

        {/* Bank Account Preferred */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>
                Bank Account Preferred
              </p>
              <p className='text-xl font-bold text-slate-800 dark:text-white mb-2'>
                RWF {bankAmount.toLocaleString()}
              </p>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                {bankVendors.length} vendors
              </p>
            </div>
            <div className='p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 group-hover:scale-110 transition-all duration-300'>
              <Building2 className='w-6 h-6 text-blue-600 dark:text-blue-400' />
            </div>
          </div>
        </div>

        {/* Total Failed */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>
                Total Failed
              </p>
              <p className='text-xl font-bold text-slate-800 dark:text-white mb-2'>
                {totalFailed}
              </p>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Requires attention
              </p>
            </div>
            <div className='p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 group-hover:scale-110 transition-all duration-300'>
              <AlertCircle className='w-6 h-6 text-red-600 dark:text-red-400' />
            </div>
          </div>
        </div>
      </div>

      {/* Payout Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleReleaseMTNPayouts}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors font-medium text-sm"
        >
          <Smartphone className="w-4 h-4" />
          Release Payout for MTN ({mtnVendors.length})
        </button>
        <button
          onClick={handleReleaseBankPayouts}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
        >
          <Building2 className="w-4 h-4" />
          Release Payout for Bank Accounts ({bankVendors.length})
        </button>
      </div>

      {/* Vendors Pending Payout Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Vendors Pending Payout</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Vendor</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Payout Method</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Account Info</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentVendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">{vendor.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{vendor.email}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{vendor.payoutMethod}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{vendor.accountInfo}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">{vendor.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {showingFrom} to {showingTo} of {allVendorPayouts.length} records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-solid text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Failed Payouts Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Failed Payouts</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Vendors requiring payout method updates</p>
          </div>
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
            {failedPayouts.length} Vendors
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {failedPayouts.map((vendor) => (
            <div key={vendor.id} className="border border-red-200 dark:border-red-900/50 rounded-xl p-4 bg-red-50/50 dark:bg-red-900/10 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{vendor.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{vendor.email}</p>
                </div>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 rounded text-xs font-medium">
                  Failed
                </span>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{vendor.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Method:</span>
                  <span className="text-slate-900 dark:text-white">{vendor.payoutMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Account:</span>
                  <span className="text-slate-900 dark:text-white">{vendor.accountInfo}</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg p-2 mb-3 border border-red-200 dark:border-red-900/30">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Reason:</p>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{vendor.reason}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Last attempt: {vendor.lastAttempt}</p>
              </div>
              
              <button
                onClick={() => handleSendMessage(vendor)}
                className="w-full px-4 py-2 bg-solid hover:bg-tertiary text-white rounded-lg transition-colors font-medium text-sm"
              >
                Send Message
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Message Modal */}
      {messageModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-xl">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Send Message to {messageModal.vendor?.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {messageModal.vendor?.email}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please update your payout information..."
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-solid/20 focus:border-solid outline-none transition-all resize-none"
                rows="5"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setMessageModal({ open: false, vendor: null })}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessageSubmit}
                className="flex-1 px-4 py-2.5 bg-solid hover:bg-tertiary text-white rounded-lg transition-colors font-medium"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main Payouts Component
const Payouts = () => {
  const { adminMode } = useAdminMode()

  return adminMode === 'shop' ? <ShopAdminPayouts /> : <WebsiteAdminPayouts />
}

export default Payouts
