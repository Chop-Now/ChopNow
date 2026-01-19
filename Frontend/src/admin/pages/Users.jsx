import React, { useState } from 'react'
import { Search, Users, Store, Pen, Ban, CheckCircle, Clock, AlertCircle, X, Calendar, MapPin, Leaf, FileText, ChevronDown, Bike, Trash2, Archive, MoreVertical, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export const AllUsers = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showActionMenu, setShowActionMenu] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const itemsPerPage = 10

  // Sample user data
  const usersData = [
    {
      id: 'USR001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'customer',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      joinedDate: '2025-12-15',
      location: 'Lagos, Nigeria',
      impact: { meals: 45, co2Saved: 67.5, waterSaved: 135 },
      recentActivity: [
        { action: 'Placed order #1234', date: '2026-01-18' },
        { action: 'Updated profile', date: '2026-01-15' },
        { action: 'Left review for Mama\'s Kitchen', date: '2026-01-10' }
      ]
    },
    {
      id: 'VND002',
      name: 'Mama\'s Kitchen',
      email: 'mamas.kitchen@vendor.com',
      role: 'vendor',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mama',
      joinedDate: '2025-11-20',
      location: 'Abuja, Nigeria',
      impact: { meals: 320, co2Saved: 480, waterSaved: 960 },
      recentActivity: [
        { action: 'Added 5 new menu items', date: '2026-01-17' },
        { action: 'Fulfilled order #1230', date: '2026-01-16' },
        { action: 'Updated business hours', date: '2026-01-12' }
      ]
    },
    {
      id: 'RDR003',
      name: 'John Delivery',
      email: 'john.delivery@rider.com',
      role: 'rider',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      joinedDate: '2025-12-01',
      location: 'Port Harcourt, Nigeria',
      impact: { deliveries: 180, co2Saved: 90, distance: 540 },
      recentActivity: [
        { action: 'Completed delivery #4567', date: '2026-01-19' },
        { action: 'Completed delivery #4566', date: '2026-01-19' },
        { action: 'Updated vehicle info', date: '2026-01-14' }
      ]
    },
    {
      id: 'USR004',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      role: 'customer',
      status: 'pending',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      joinedDate: '2026-01-18',
      location: 'Ibadan, Nigeria',
      impact: { meals: 0, co2Saved: 0, waterSaved: 0 },
      recentActivity: [
        { action: 'Account created', date: '2026-01-18' }
      ]
    },
    {
      id: 'VND005',
      name: 'Fresh Bites',
      email: 'fresh.bites@vendor.com',
      role: 'vendor',
      status: 'pending',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fresh',
      joinedDate: '2026-01-17',
      location: 'Kano, Nigeria',
      impact: { meals: 0, co2Saved: 0, waterSaved: 0 },
      recentActivity: [
        { action: 'Submitted verification documents', date: '2026-01-17' },
        { action: 'Business profile created', date: '2026-01-17' }
      ]
    },
    {
      id: 'USR006',
      name: 'Emma Williams',
      email: 'emma.williams@email.com',
      role: 'customer',
      status: 'suspended',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      joinedDate: '2025-10-05',
      location: 'Enugu, Nigeria',
      impact: { meals: 28, co2Saved: 42, waterSaved: 84 },
      recentActivity: [
        { action: 'Account suspended - Policy violation', date: '2026-01-10' },
        { action: 'Disputed order #0987', date: '2026-01-08' }
      ]
    },
    {
      id: 'RDR007',
      name: 'David Rider',
      email: 'david.rider@rider.com',
      role: 'rider',
      status: 'pending',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      joinedDate: '2026-01-16',
      location: 'Calabar, Nigeria',
      impact: { deliveries: 0, co2Saved: 0, distance: 0 },
      recentActivity: [
        { action: 'Submitted documents', date: '2026-01-16' },
        { action: 'Completed rider registration', date: '2026-01-16' }
      ]
    }
  ]

  // Calculate stats
  const totalUsers = usersData.length
  const activeVendors = usersData.filter(u => u.role === 'vendor' && u.status === 'active').length
  const pendingVendors = usersData.filter(u => u.role === 'vendor' && u.status === 'pending').length
  const activeRiders = usersData.filter(u => u.role === 'rider' && u.status === 'active').length
  const weeklyChange = 50 // Mock data - positive means increase

  // Filter users
  const filteredUsers = usersData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'suspended': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'customer': return 'bg-blue-100 text-blue-700'
      case 'vendor': return 'bg-purple-100 text-purple-700'
      case 'rider': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleApproveUser = (userId) => {
    console.log('Approving user:', userId)
    // Add approval logic here
    alert(`User ${userId} approved!`)
  }

  const handleSuspendUser = (userId) => {
    if (window.confirm('Are you sure you want to suspend this account?')) {
      console.log('Suspending user:', userId)
      // Add suspension logic here
      alert(`User ${userId} suspended!`)
    }
  }

  const handleSaveNote = () => {
    console.log('Saving admin note:', adminNote)
    alert('Admin note saved!')
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      console.log('Deleting user:', userId)
      alert(`User ${userId} deleted!`)
    }
    setShowActionMenu(null)
  }

  const handleArchiveUser = (userId) => {
    console.log('Archiving user:', userId)
    alert(`User ${userId} archived!`)
    setShowActionMenu(null)
  }

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(currentUsers.map(user => user.id))
    }
  }

  const handleBulkArchive = () => {
    console.log('Archiving users:', selectedUsers)
    alert(`Archived ${selectedUsers.length} users!`)
    setSelectedUsers([])
  }

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      console.log('Deleting users:', selectedUsers)
      alert(`Deleted ${selectedUsers.length} users!`)
      setSelectedUsers([])
    }
  }

  return (
    <div className="p-4 min-h-screen">
      {/* Page Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-xs text-gray-600 mt-1">Manage customer, vendor, or rider accounts, track status, and view profiles</p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg shadow-sm p-4 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Users</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalUsers}</p>
              <div className="flex items-center gap-1 mt-1">
                {weeklyChange >= 0 ? (
                  <>
                    <ArrowUpRight className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">+{weeklyChange} this week</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-3 h-3 text-red-600 dark:text-red-400" />
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">{weeklyChange} this week</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg shadow-sm p-4 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Active Vendors</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{activeVendors}</p>
              {pendingVendors > 0 && (
                <p className="text-[10px] text-orange-600 dark:text-orange-400 font-medium mt-1">{pendingVendors} pending approvals</p>
              )}
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-full">
              <Store className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg shadow-sm p-4 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Active Riders</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{activeRiders}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Available for delivery</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-full">
              <Bike className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg shadow-sm p-3 mb-4 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected</p>
            <div className="flex gap-2">
              <button
                onClick={handleBulkArchive}
                className="px-3 py-1.5 text-xs bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Archive className="w-3 h-3" />
                Archive
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg shadow-sm p-3 mb-4 border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filter Options */}
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filterRole === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRole('customer')}
              className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filterRole === 'customer'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => setFilterRole('vendor')}
              className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filterRole === 'vendor'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Vendors
            </button>
            <button
              onClick={() => setFilterRole('rider')}
              className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filterRole === 'rider'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Riders
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700"
                      />
                      <div className="ml-3">
                        <div className="text-xs font-medium text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 inline-flex items-center gap-1 text-[10px] leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-green-600 hover:text-green-800 transition-colors cursor-pointer"
                      >
                        <Pen className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showActionMenu === user.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => handleArchiveUser(user.id)}
                              className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Archive className="w-3 h-3" />
                              Archive
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {selectedUser && (
        <>
          <div className="fixed inset-0 bg-black/30 z-9999" onClick={() => setSelectedUser(null)}></div>
          <div className="fixed top-0 right-0 h-full w-full md:w-[380px] bg-white dark:bg-slate-900 shadow-2xl z-10000 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              {/* Header with Close Button */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-3">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-slate-700 mb-2"
                />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{selectedUser.name}</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
              </div>

              {/* User ID - removed gray background */}
              <div className="mb-3 p-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                  {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)} ID
                </p>
                <p className="text-xs font-mono font-semibold text-slate-900 dark:text-white">{selectedUser.id}</p>
              </div>

              {/* Approve Button for Pending Users */}
              {selectedUser.status === 'pending' && (
                <button
                  onClick={() => handleApproveUser(selectedUser.id)}
                  className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-semibold py-2 px-3 text-xs rounded-lg transition-colors mb-3 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-3 h-3" />
                  Approve User
                </button>
              )}

              {/* Joined Date and Location */}
              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-[9px] text-slate-600 dark:text-slate-400">Joined</p>
                      <p className="text-[10px] font-semibold text-slate-900 dark:text-white">
                        {new Date(selectedUser.joinedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-[9px] text-slate-600 dark:text-slate-400">Location</p>
                      <p className="text-[10px] font-semibold text-slate-900 dark:text-white">{selectedUser.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <Leaf className="w-3 h-3 text-green-600 dark:text-green-400" />
                  Environmental Impact
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {selectedUser.role === 'rider' ? (
                    <>
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                        <p className="text-[9px] text-slate-600 dark:text-slate-400 mb-0.5">Deliveries</p>
                        <p className="text-base font-bold text-green-700 dark:text-green-400">{selectedUser.impact.deliveries}</p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                        <p className="text-[9px] text-slate-600 dark:text-slate-400 mb-0.5">Distance (km)</p>
                        <p className="text-base font-bold text-green-700 dark:text-green-400">{selectedUser.impact.distance}</p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800 col-span-2">
                        <p className="text-[9px] text-slate-600 dark:text-slate-400 mb-0.5">CO₂ Saved (kg)</p>
                        <p className="text-base font-bold text-green-700 dark:text-green-400">{selectedUser.impact.co2Saved}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                        <p className="text-[9px] text-slate-600 dark:text-slate-400 mb-0.5">Meals Saved</p>
                        <p className="text-base font-bold text-green-700 dark:text-green-400">{selectedUser.impact.meals}</p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                        <p className="text-[9px] text-slate-600 dark:text-slate-400 mb-0.5">CO₂ Saved (kg)</p>
                        <p className="text-base font-bold text-green-700 dark:text-green-400">{selectedUser.impact.co2Saved}</p>
                      </div>
                      {selectedUser.impact.waterSaved !== undefined && (
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800 col-span-2">
                          <p className="text-[9px] text-slate-600 dark:text-slate-400 mb-0.5">Water Saved (L)</p>
                          <p className="text-base font-bold text-green-700 dark:text-green-400">{selectedUser.impact.waterSaved}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5">Recent Activity</h4>
                <div className="space-y-1.5">
                  {selectedUser.recentActivity.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex items-start gap-1.5 p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="w-1 h-1 bg-green-600 dark:bg-green-400 rounded-full mt-1"></div>
                      <div className="flex-1">
                        <p className="text-[10px] font-medium text-slate-900 dark:text-white">{activity.action}</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {new Date(activity.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                  Admin Notes
                </h4>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add notes about this user..."
                  className="w-full p-2 text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows="2"
                />
                <button
                  onClick={handleSaveNote}
                  className="mt-1.5 w-full bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold py-1.5 px-2 text-[10px] rounded-lg transition-colors cursor-pointer"
                >
                  Save Note
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200 dark:border-slate-700 my-3"></div>

              {/* Danger Zone */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                <h4 className="text-xs font-semibold text-red-900 dark:text-red-400 mb-1.5">Danger Zone</h4>
                <p className="text-[10px] text-red-700 dark:text-red-400 mb-2">
                  {selectedUser.status === 'suspended'
                    ? 'This account is currently suspended.'
                    : 'Suspending this account will restrict their access to the platform.'}
                </p>
                <button
                  onClick={() => handleSuspendUser(selectedUser.id)}
                  disabled={selectedUser.status === 'suspended'}
                  className={`w-full font-semibold py-1.5 px-2 text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    selectedUser.status === 'suspended'
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white cursor-pointer'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                  {selectedUser.status === 'suspended' ? 'Account Suspended' : 'Suspend Account'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export const RolesPermissions = () => {
  const roles = [
    {
      name: 'Super Admin',
      description: 'Full access to all platform features and settings',
      userCount: 2,
      permissions: [
        'Manage all users',
        'Manage vendors',
        'Manage orders',
        'View analytics',
        'Manage settings',
        'Approve/suspend accounts',
        'Handle disputes',
        'Manage payouts'
      ]
    },
    {
      name: 'Vendor Manager',
      description: 'Manage vendor accounts and listings',
      userCount: 5,
      permissions: [
        'View vendors',
        'Approve vendors',
        'Manage listings',
        'View vendor analytics',
        'Handle vendor disputes'
      ]
    },
    {
      name: 'Customer Support',
      description: 'Handle customer inquiries and issues',
      userCount: 8,
      permissions: [
        'View users',
        'View orders',
        'Handle customer complaints',
        'View disputes',
        'Add admin notes'
      ]
    },
    {
      name: 'Finance Manager',
      description: 'Manage financial operations and payouts',
      userCount: 3,
      permissions: [
        'View financial reports',
        'Manage payouts',
        'View transaction history',
        'Generate financial reports'
      ]
    }
  ]

  return (
    <div className="p-4 min-h-screen">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Manage admin roles and their access levels</p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-semibold py-2 px-4 text-sm rounded-lg transition-colors cursor-pointer">
          + Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.map((role, index) => (
          <div key={index} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-4 flex flex-col h-[400px]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{role.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{role.description}</p>
              </div>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-semibold px-2 py-1 rounded-full">
                {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
              </span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex-1 overflow-y-auto">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Permissions</h4>
              <ul className="space-y-1.5">
                {role.permissions.map((permission, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                    {permission}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex gap-2 mt-auto">
              <button className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium py-2 px-3 text-xs rounded-lg transition-colors cursor-pointer">
                Edit Role
              </button>
              <button className="px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <Pen className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const UserActivity = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const activityData = [
    {
      id: 1,
      user: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        role: 'customer'
      },
      action: 'Placed a new order',
      details: 'Order #1234 - Jollof Rice from Mama\'s Kitchen',
      timestamp: '2026-01-19T14:30:00',
      type: 'order'
    },
    {
      id: 2,
      user: {
        name: 'Mama\'s Kitchen',
        email: 'mamas.kitchen@vendor.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mama',
        role: 'vendor'
      },
      action: 'Updated menu items',
      details: 'Added 3 new dishes to the menu',
      timestamp: '2026-01-19T13:15:00',
      type: 'update'
    },
    {
      id: 3,
      user: {
        name: 'John Delivery',
        email: 'john.delivery@rider.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        role: 'rider'
      },
      action: 'Completed delivery',
      details: 'Delivery #4567 - Delivered in 18 minutes',
      timestamp: '2026-01-19T12:45:00',
      type: 'delivery'
    },
    {
      id: 4,
      user: {
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
        role: 'customer'
      },
      action: 'Account created',
      details: 'New customer registration',
      timestamp: '2026-01-19T11:20:00',
      type: 'registration'
    },
    {
      id: 5,
      user: {
        name: 'Fresh Bites',
        email: 'fresh.bites@vendor.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fresh',
        role: 'vendor'
      },
      action: 'Submitted verification',
      details: 'Business documents uploaded for review',
      timestamp: '2026-01-19T10:00:00',
      type: 'verification'
    },
    {
      id: 6,
      user: {
        name: 'Emma Williams',
        email: 'emma.williams@email.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
        role: 'customer'
      },
      action: 'Disputed order',
      details: 'Dispute filed for order #0987',
      timestamp: '2026-01-19T09:30:00',
      type: 'dispute'
    }
  ]

  const getActivityIcon = (type) => {
    switch(type) {
      case 'order': return <FileText className="w-4 h-4 text-blue-600" />
      case 'delivery': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'update': return <Pen className="w-4 h-4 text-purple-600" />
      case 'registration': return <Users className="w-4 h-4 text-orange-600" />
      case 'verification': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'dispute': return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityBgColor = (type) => {
    switch(type) {
      case 'order': return 'bg-blue-50 dark:bg-blue-900/20'
      case 'delivery': return 'bg-green-50 dark:bg-green-900/20'
      case 'update': return 'bg-purple-50 dark:bg-purple-900/20'
      case 'registration': return 'bg-orange-50 dark:bg-orange-900/20'
      case 'verification': return 'bg-yellow-50 dark:bg-yellow-900/20'
      case 'dispute': return 'bg-red-50 dark:bg-red-900/20'
      default: return 'bg-slate-50 dark:bg-slate-800'
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Sort by latest first and paginate
  const sortedActivities = [...activityData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentActivities = sortedActivities.slice(startIndex, endIndex)

  return (
    <div className="p-4 min-h-screen">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Activity</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Monitor all user actions across the platform</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTimeRange('24hours')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              selectedTimeRange === '24hours'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            24 Hours
          </button>
          <button
            onClick={() => setSelectedTimeRange('7days')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              selectedTimeRange === '7days'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setSelectedTimeRange('30days')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              selectedTimeRange === '30days'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50">
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {currentActivities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Activity Icon */}
                <div className={`p-2 rounded-full ${getActivityBgColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Activity Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={activity.user.avatar}
                          alt={activity.user.name}
                          className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">{activity.user.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{activity.user.email}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                          activity.user.role === 'customer' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          activity.user.role === 'vendor' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                          'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                        }`}>
                          {activity.user.role}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white mt-1">{activity.action}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{activity.details}</p>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedActivities.length)} of {sortedActivities.length} activities
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
