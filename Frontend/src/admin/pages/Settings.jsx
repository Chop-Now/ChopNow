import React, { useState } from 'react'
import { CircleUserRound, ReceiptText, Shield, Power, Trash2, Upload, Camera, Eye, EyeOff, CheckCircle, XCircle, MapPin, Monitor, Smartphone, Plus, Clock, FileText, X } from 'lucide-react'
import { useAdminMode } from '../context/AdminModeContext'
import LocationPicker from '@/Components/maps/LocationPicker'

const Settings = () => {
  const { adminMode } = useAdminMode()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileImage, setProfileImage] = useState(null)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Business Hours State
  const [businessHours, setBusinessHours] = useState([
    { day: 'Monday', from: '09:00', to: '17:00', closed: false },
    { day: 'Tuesday', from: '09:00', to: '17:00', closed: false },
    { day: 'Wednesday', from: '09:00', to: '17:00', closed: false },
    { day: 'Thursday', from: '09:00', to: '17:00', closed: false },
    { day: 'Friday', from: '09:00', to: '17:00', closed: false },
    { day: 'Saturday', from: '10:00', to: '15:00', closed: false },
    { day: 'Sunday', from: '', to: '', closed: true }
  ])

  const [specialHours, setSpecialHours] = useState([])
  
  // Business Information State
  const [businessInfo, setBusinessInfo] = useState({
    contactPhone: '+250 788 123 456',
    physicalAddress: { lat: -1.9441, lng: 30.0619, address: 'Kigali, Rwanda' }
  })

  const [addressSearch, setAddressSearch] = useState('')

  // Certificates State
  const [certificates, setCertificates] = useState([
    { id: 1, name: 'Business License', file: 'business_license.pdf', uploadDate: '2025-12-15' },
    { id: 2, name: 'Health Certificate', file: 'health_cert.pdf', uploadDate: '2026-01-10' },
    { id: 3, name: 'Tax Registration', file: 'tax_registration.pdf', uploadDate: '2025-11-20' }
  ])

  // Form state for Shop Admin
  const [shopFormData, setShopFormData] = useState({
    businessName: 'Green Valley Farms',
    businessLogo: null,
    businessTagline: 'Fresh, Organic, Locally Sourced',
    businessEmail: 'contact@greenvalleyfarms.com',
    contactPerson: 'John Doe',
    contactEmail: 'john.doe@greenvalleyfarms.com',
    phoneNumber: '+250 788 123 456'
  })

  // Form state for Website Admin
  const [adminFormData, setAdminFormData] = useState({
    name: 'Admin User',
    profilePicture: null,
    email: 'admin@chopnow.com',
    phoneNumber: '+250 788 987 654'
  })

  const handleShopInputChange = (e) => {
    const { name, value } = e.target
    setShopFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target
    setAdminFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (adminMode === 'shop') {
          setShopFormData(prev => ({
            ...prev,
            businessLogo: reader.result
          }))
        } else {
          setAdminFormData(prev => ({
            ...prev,
            profilePicture: reader.result
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = () => {
    // TODO: Implement API call to update profile
    console.log('Updating profile...', adminMode === 'shop' ? shopFormData : adminFormData)
    alert('Profile updated successfully!')
  }

  const handleLogoutAllDevices = () => {
    // TODO: Implement API call to logout from all devices
    if (confirm('Are you sure you want to logout from all devices?')) {
      console.log('Logging out from all devices...')
      alert('Logged out from all devices successfully!')
    }
  }

  const handleDeleteAccount = () => {
    // TODO: Implement API call to delete account
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Deleting account...')
      alert('Account deletion initiated. You will receive a confirmation email.')
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value} = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdatePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match!')
      return
    }
    // TODO: Implement API call to update password
    console.log('Updating password...')
  }

  // Business Hours Handlers
  const handleBusinessHourChange = (index, field, value) => {
    const updatedHours = [...businessHours]
    updatedHours[index][field] = value
    setBusinessHours(updatedHours)
  }

  const handleAddSpecialHour = () => {
    setSpecialHours([...specialHours, { date: '', description: '', from: '09:00', to: '17:00', closed: false }])
  }

  const handleRemoveSpecialHour = (index) => {
    setSpecialHours(specialHours.filter((_, i) => i !== index))
  }

  const handleSpecialHourChange = (index, field, value) => {
    const updatedSpecialHours = [...specialHours]
    updatedSpecialHours[index][field] = value
    setSpecialHours(updatedSpecialHours)
  }

  const handleBusinessInfoChange = (field, value) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLocationSelect = (location) => {
    setBusinessInfo(prev => ({
      ...prev,
      physicalAddress: location
    }))
  }

  const handleSearchAddress = async () => {
    if (!addressSearch.trim()) return
    
    try {
      // Using Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        const location = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name
        }
        handleLocationSelect(location)
        setAddressSearch(result.display_name)
      } else {
        alert('Address not found. Please try a different search term.')
      }
    } catch (error) {
      console.error('Error searching address:', error)
      alert('Failed to search address. Please try again.')
    }
  }

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          try {
            // Reverse geocoding to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            
            const location = {
              lat: latitude,
              lng: longitude,
              address: data.display_name || `${latitude}, ${longitude}`
            }
            handleLocationSelect(location)
            setAddressSearch(location.address)
          } catch (error) {
            console.error('Error getting address:', error)
            const location = {
              lat: latitude,
              lng: longitude,
              address: `${latitude}, ${longitude}`
            }
            handleLocationSelect(location)
            setAddressSearch(location.address)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your current location. Please check your browser permissions.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleCertificateUpload = (certificateId, file) => {
    // TODO: Implement certificate upload
    console.log('Uploading certificate:', certificateId, file)
    alert('Certificate uploaded successfully!')
  }

  const handleSaveBusinessDetails = () => {
    // TODO: Implement API call to save business details
    console.log('Saving business details...', { businessHours, specialHours, businessInfo, certificates })
    alert('Business details saved successfully!')
  }

  const handleCancelBusinessDetails = () => {
    // Reset to original values or close form
    console.log('Canceling business details changes...')
  }

  const handleToggle2FA = () => {
    // TODO: Implement API call to toggle 2FA
    setTwoFactorEnabled(!twoFactorEnabled)
    alert(`Two-Factor Authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'} successfully!`)
  }

  const handleLogoutSession = (sessionId) => {
    // TODO: Implement API call to logout specific session
    console.log('Logging out session:', sessionId)
    alert('Session logged out successfully!')
  }

  const handleSaveSecurityChanges = () => {
    // TODO: Implement API call to save security changes
    console.log('Saving security changes...')
    alert('Security settings saved successfully!')
  }

  const handleCancelSecurityChanges = () => {
    setShowPasswordFields(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  // Dummy data for active sessions
  const activeSessions = [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'Kigali, Rwanda',
      icon: Monitor,
      lastActive: '2 minutes ago'
    },
    {
      id: 2,
      device: 'Chrome on iPhone 13',
      location: 'Musanze, Rwanda',
      icon: Smartphone,
      lastActive: '1 hour ago'
    }
  ]

  // Dummy data for recent login activity
  const loginActivity = [
    {
      id: 1,
      dateTime: 'Jan 25, 2026 14:30',
      device: 'Chrome on Windows',
      location: 'Kigali, Rwanda',
      status: 'Successful'
    },
    {
      id: 2,
      dateTime: 'Jan 25, 2026 08:15',
      device: 'Chrome on iPhone 13',
      location: 'Musanze, Rwanda',
      status: 'Successful'
    },
    {
      id: 3,
      dateTime: 'Jan 24, 2026 22:45',
      device: 'Safari on MacBook',
      location: 'Huye, Rwanda',
      status: 'Failed'
    },
    {
      id: 4,
      dateTime: 'Jan 24, 2026 18:20',
      device: 'Chrome on Windows',
      location: 'Kigali, Rwanda',
      status: 'Successful'
    }
  ]

  const sidebarItems = [
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: CircleUserRound
    },
    ...(adminMode === 'shop' ? [{
      id: 'business',
      label: 'Business Details',
      icon: ReceiptText
    }] : []),
    {
      id: 'security',
      label: 'Security Settings',
      icon: Shield
    }
  ]

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 dark:text-slate-100'>Settings</h1>
          <p className='text-slate-600 dark:text-slate-400 mt-0.5 text-sm'>
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
        {/* Sidebar */}
        <div className='lg:col-span-1'>
          <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-3'>
            <nav className='space-y-1.5'>
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition-all text-sm cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className='w-4 h-4' />
                    <span className='font-medium'>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className='lg:col-span-3'>
          {activeTab === 'profile' && (
            <div className='space-y-4'>
              {/* Profile Form */}
              <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-5'>
                <h2 className='text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4'>
                  Profile Information
                </h2>

                {adminMode === 'shop' ? (
                  <div className='space-y-4'>
                    {/* Business Name */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        Business Name
                      </label>
                      <input
                        type='text'
                        name='businessName'
                        value={shopFormData.businessName}
                        onChange={handleShopInputChange}
                        className='w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      />
                    </div>

                    {/* Business Logo */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        Business Logo
                      </label>
                      <div className='flex items-center space-x-3'>
                        <div className='w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden'>
                          {shopFormData.businessLogo ? (
                            <img
                              src={shopFormData.businessLogo}
                              alt='Business Logo'
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <Camera className='w-7 h-7 text-slate-400' />
                          )}
                        </div>
                        <div className='flex-1'>
                          <label className='inline-flex items-center space-x-2 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all'>
                            <Upload className='w-3.5 h-3.5' />
                            <span className='font-medium'>Upload New Picture</span>
                            <input
                              type='file'
                              accept='image/*'
                              onChange={(e) => handleImageUpload(e, 'logo')}
                              className='hidden'
                            />
                          </label>
                          <p className='text-[10px] text-slate-500 dark:text-slate-400 mt-1'>
                            JPG, PNG or GIF. Max size 2MB.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Business Tagline */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        Business Tagline
                      </label>
                      <input
                        type='text'
                        name='businessTagline'
                        value={shopFormData.businessTagline}
                        onChange={handleShopInputChange}
                        className='w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      />
                    </div>

                    {/* Business Email */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        Business Email
                      </label>
                      <input
                        type='email'
                        name='businessEmail'
                        value={shopFormData.businessEmail}
                        onChange={handleShopInputChange}
                        className='w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      />
                    </div>

                    {/* Contact Person */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        Contact Person
                      </label>
                      <input
                        type='text'
                        name='contactPerson'
                        value={shopFormData.contactPerson}
                        onChange={handleShopInputChange}
                        className='w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      />
                    </div>

                    {/* Contact Email */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        Contact Email
                      </label>
                      <input
                        type='email'
                        name='contactEmail'
                        value={shopFormData.contactEmail}
                        onChange={handleShopInputChange}
                        className='w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        Phone Number
                      </label>
                      <input
                        type='tel'
                        name='phoneNumber'
                        value={shopFormData.phoneNumber}
                        onChange={handleShopInputChange}
                        className='w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      />
                    </div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {/* Name */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        Name
                      </label>
                      <input
                        type='text'
                        name='name'
                        value={adminFormData.name}
                        onChange={handleAdminInputChange}
                        className='w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      />
                    </div>

                    {/* Profile Picture */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        Profile Picture
                      </label>
                      <div className='flex items-center space-x-3'>
                        <div className='w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden'>
                          {adminFormData.profilePicture ? (
                            <img
                              src={adminFormData.profilePicture}
                              alt='Profile'
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <CircleUserRound className='w-10 h-10 text-slate-400' />
                          )}
                        </div>
                        <div className='flex-1'>
                          <label className='inline-flex items-center space-x-2 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all'>
                            <Upload className='w-3.5 h-3.5' />
                            <span className='font-medium'>Upload New Picture</span>
                            <input
                              type='file'
                              accept='image/*'
                              onChange={(e) => handleImageUpload(e, 'profile')}
                              className='hidden'
                            />
                          </label>
                          <p className='text-[10px] text-slate-500 dark:text-slate-400 mt-1'>
                            JPG, PNG or GIF. Max size 2MB.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        Email
                      </label>
                      <input
                        type='email'
                        name='email'
                        value={adminFormData.email}
                        onChange={handleAdminInputChange}
                        className='w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        Phone Number
                      </label>
                      <input
                        type='tel'
                        name='phoneNumber'
                        value={adminFormData.phoneNumber}
                        onChange={handleAdminInputChange}
                        className='w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      />
                    </div>
                  </div>
                )}

                {/* Update Profile Button */}
                <div className='mt-4 pt-4 border-t border-slate-200 dark:border-slate-700'>
                  <button
                    onClick={handleUpdateProfile}
                    className='px-4 py-2 text-sm bg-linear-to-r from-solid to-tertiary text-white rounded-lg font-medium hover:shadow-lg transition-all cursor-pointer'
                  >
                    Update Profile
                  </button>
                </div>
              </div>

              {/* Account Actions */}
              <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-5'>
                <h2 className='text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4'>
                  Account Actions
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {/* Logout from All Devices */}
                  <div className='flex flex-col justify-between p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30'>
                    <div className='flex items-start space-x-2.5 mb-3'>
                      <div className='w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0'>
                        <Power className='w-4 h-4 text-red-600 dark:text-red-400' />
                      </div>
                      <div>
                        <h3 className='text-sm font-medium text-slate-800 dark:text-slate-100'>
                          Logout From All Devices
                        </h3>
                        <p className='text-xs text-slate-600 dark:text-slate-400 mt-0.5'>
                          Sign out from all active sessions
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogoutAllDevices}
                      className='w-full px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium cursor-pointer'
                    >
                      Logout
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className='flex flex-col justify-between p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30'>
                    <div className='flex items-start space-x-2.5 mb-3'>
                      <div className='w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0'>
                        <Trash2 className='w-4 h-4 text-red-600 dark:text-red-400' />
                      </div>
                      <div>
                        <h3 className='text-sm font-medium text-slate-800 dark:text-slate-100'>
                          Delete Account
                        </h3>
                        <p className='text-xs text-slate-600 dark:text-slate-400 mt-0.5'>
                          Permanently delete your account and all data
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className='w-full px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium cursor-pointer'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className='space-y-4'>
              {/* Header */}
              <div>
                <h1 className='text-2xl font-bold text-slate-800 dark:text-slate-100'>
                  Business Details
                </h1>
                <p className='text-sm text-slate-600 dark:text-slate-400 mt-1'>
                  Manage your store's hours, location, contact info, and legal documents.
                </p>
              </div>

              {/* Business Hours Section */}
              <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-5'>
                <h2 className='text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4'>
                  Business Hours
                </h2>
                <div className='space-y-3'>
                  {businessHours.map((hour, index) => (
                    <div key={hour.day} className='flex items-center space-x-3'>
                      <div className='w-24'>
                        <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                          {hour.day}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2 flex-1'>
                        <input
                          type='time'
                          value={hour.from}
                          onChange={(e) => handleBusinessHourChange(index, 'from', e.target.value)}
                          disabled={hour.closed}
                          className='px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                        />
                        <span className='text-xs text-slate-500 dark:text-slate-400'>to</span>
                        <input
                          type='time'
                          value={hour.to}
                          onChange={(e) => handleBusinessHourChange(index, 'to', e.target.value)}
                          disabled={hour.closed}
                          className='px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                        />
                        <label className='flex items-center space-x-2 ml-4'>
                          <input
                            type='checkbox'
                            checked={hour.closed}
                            onChange={(e) => handleBusinessHourChange(index, 'closed', e.target.checked)}
                            className='w-4 h-4 text-solid bg-slate-100 border-slate-300 rounded focus:ring-solid dark:focus:ring-solid dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600'
                          />
                          <span className='text-xs text-slate-600 dark:text-slate-400'>Closed</span>
                        </label>
                      </div>
                    </div>
                  ))}

                  {/* Horizontal Line */}
                  <div className='border-t border-slate-200 dark:border-slate-700 my-4'></div>

                  {/* Special Hours */}
                  {specialHours.map((special, index) => (
                    <div key={index} className='flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/30'>
                      <input
                        type='date'
                        value={special.date}
                        onChange={(e) => handleSpecialHourChange(index, 'date', e.target.value)}
                        className='px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      />
                      <input
                        type='text'
                        placeholder='Holiday name'
                        value={special.description}
                        onChange={(e) => handleSpecialHourChange(index, 'description', e.target.value)}
                        className='flex-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                      />
                      <input
                        type='time'
                        value={special.from}
                        onChange={(e) => handleSpecialHourChange(index, 'from', e.target.value)}
                        disabled={special.closed}
                        className='px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all disabled:opacity-50'
                      />
                      <span className='text-xs text-slate-500'>to</span>
                      <input
                        type='time'
                        value={special.to}
                        onChange={(e) => handleSpecialHourChange(index, 'to', e.target.value)}
                        disabled={special.closed}
                        className='px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all disabled:opacity-50'
                      />
                      <label className='flex items-center space-x-1'>
                        <input
                          type='checkbox'
                          checked={special.closed}
                          onChange={(e) => handleSpecialHourChange(index, 'closed', e.target.checked)}
                          className='w-4 h-4 text-solid bg-slate-100 border-slate-300 rounded focus:ring-solid'
                        />
                        <span className='text-xs text-slate-600 dark:text-slate-400'>Closed</span>
                      </label>
                      <button
                        onClick={() => handleRemoveSpecialHour(index)}
                        className='p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all cursor-pointer'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={handleAddSpecialHour}
                    className='flex items-center space-x-2 px-4 py-2 text-sm text-solid border border-solid rounded-lg hover:bg-solid hover:text-white transition-all cursor-pointer'
                  >
                    <Plus className='w-4 h-4' />
                    <span>Add Special Hours</span>
                  </button>
                </div>
              </div>

              {/* Business Information Section */}
              <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-5'>
                <h2 className='text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4'>
                  Business Information
                </h2>
                <div className='space-y-4'>
                  {/* Contact Phone Number */}
                  <div>
                    <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                      Contact Phone Number
                    </label>
                    <input
                      type='tel'
                      value={businessInfo.contactPhone}
                      onChange={(e) => handleBusinessInfoChange('contactPhone', e.target.value)}
                      className='w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                    />
                  </div>

                  {/* Physical Address with Map */}
                  <div>
                    <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                      Physical Address
                    </label>
                    
                    {/* Search and Current Location */}
                    <div className='flex gap-2 mb-3'>
                      <div className='flex-1 flex gap-2'>
                        <input
                          type='text'
                          placeholder='Search for an address...'
                          value={addressSearch}
                          onChange={(e) => setAddressSearch(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                          className='flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
                        />
                        <button
                          onClick={handleSearchAddress}
                          className='px-4 py-2 text-sm bg-solid text-white rounded-lg hover:bg-solid/90 transition-all font-medium cursor-pointer'
                        >
                          Search
                        </button>
                      </div>
                      <button
                        onClick={handleUseCurrentLocation}
                        className='flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium whitespace-nowrap cursor-pointer'
                      >
                        <MapPin className='w-4 h-4' />
                        Use Current Location
                      </button>
                    </div>

                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={businessInfo.physicalAddress}
                    />
                  </div>
                </div>
              </div>

              {/* Certificates Section */}
              <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-5'>
                <h2 className='text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4'>
                  Certificates & Documents
                </h2>
                <div className='space-y-3'>
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className='flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
                          <FileText className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                        </div>
                        <div>
                          <h3 className='text-sm font-medium text-slate-800 dark:text-slate-100'>
                            {cert.name}
                          </h3>
                          <p className='text-xs text-slate-600 dark:text-slate-400'>
                            {cert.file} • Uploaded: {cert.uploadDate}
                          </p>
                        </div>
                      </div>
                      <label className='inline-flex items-center space-x-2 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all'>
                        <Upload className='w-3.5 h-3.5' />
                        <span>Update</span>
                        <input
                          type='file'
                          accept='.pdf,.jpg,.jpeg,.png'
                          onChange={(e) => handleCertificateUpload(cert.id, e.target.files[0])}
                          className='hidden'
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center justify-end space-x-3 pt-2'>
                <button
                  onClick={handleCancelBusinessDetails}
                  className='px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-medium cursor-pointer'
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBusinessDetails}
                  className='px-4 py-2 text-sm bg-linear-to-r from-solid to-tertiary text-white rounded-lg font-medium hover:shadow-lg transition-all cursor-pointer'
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className='space-y-4'>
              {/* Change Password Section */}
              <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-5'>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h2 className='text-lg font-semibold text-slate-800 dark:text-slate-100'>
                      Change Password
                    </h2>
                    <p className='text-xs text-slate-600 dark:text-slate-400 mt-0.5'>
                      Update your password regularly to keep your account secure
                    </p>
                  </div>
                  {!showPasswordFields && (
                    <button
                      onClick={() => setShowPasswordFields(true)}
                      className='px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-medium cursor-pointer'
                    >
                      Change Password
                    </button>
                  )}
                </div>

                {showPasswordFields && (
                  <div className='space-y-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700'>
                    {/* Current Password */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        Current Password
                      </label>
                      <div className='relative'>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name='currentPassword'
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className='w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all pr-10'
                        />
                        <button
                          type='button'
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer'
                        >
                          {showCurrentPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        New Password
                      </label>
                      <div className='relative'>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name='newPassword'
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className='w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all pr-10'
                        />
                        <button
                          type='button'
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        >
                          {showNewPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className='block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                        Confirm Password
                      </label>
                      <div className='relative'>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name='confirmPassword'
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className='w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all pr-10'
                        />
                        <button
                          type='button'
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        >
                          {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                        </button>
                      </div>
                    </div>

                    {/* Update Password Button */}
                    <button
                      onClick={handleUpdatePassword}
                      className='px-4 py-2 text-sm bg-linear-to-r from-solid to-tertiary text-white rounded-lg font-medium hover:shadow-lg transition-all cursor-pointer'
                    >
                      Update Password
                    </button>
                  </div>
                )}
              </div>

              {/* Two Factor Authentication */}
              <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-5'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h2 className='text-lg font-semibold text-slate-800 dark:text-slate-100'>
                      Two Factor Authentication
                    </h2>
                    <p className='text-xs text-slate-600 dark:text-slate-400 mt-0.5'>
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className='flex items-center space-x-3'>
                    {twoFactorEnabled ? (
                      <div className='flex items-center justify-center px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30'>
                        <span className='text-xs font-medium text-green-600 dark:text-green-400'>Enabled</span>
                      </div>
                    ) : (
                      <div className='flex items-center justify-center px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30'>
                        <span className='text-xs font-medium text-red-600 dark:text-red-400'>Disabled</span>
                      </div>
                    )}
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={twoFactorEnabled}
                        onChange={handleToggle2FA}
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-5'>
                <h2 className='text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4'>
                  Active Sessions
                </h2>
                <div className='space-y-3'>
                  {activeSessions.map((session) => {
                    const Icon = session.icon
                    return (
                      <div
                        key={session.id}
                        className='flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700'
                      >
                        <div className='flex items-center space-x-3'>
                          <div className='w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
                            <Icon className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                          </div>
                          <div>
                            <h3 className='text-sm font-medium text-slate-800 dark:text-slate-100'>
                              {session.device}
                            </h3>
                            <div className='flex items-center space-x-2 mt-0.5'>
                              <MapPin className='w-4 h-4 text-slate-500 dark:text-slate-400' />
                              <p className='text-xs text-slate-600 dark:text-slate-400'>
                                {session.location}
                              </p>
                              <span className='text-xs text-slate-500 dark:text-slate-400'>•</span>
                              <p className='text-xs text-slate-500 dark:text-slate-400'>
                                {session.lastActive}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleLogoutSession(session.id)}
                          className='px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all font-medium cursor-pointer'
                        >
                          Logout
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recent Login Activity */}
              <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-5'>
                <h2 className='text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4'>
                  Recent Login Activity
                </h2>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-slate-200 dark:border-slate-700'>
                        <th className='text-left text-xs font-medium text-slate-600 dark:text-slate-400 pb-3'>
                          Date & Time
                        </th>
                        <th className='text-left text-xs font-medium text-slate-600 dark:text-slate-400 pb-3'>
                          Device
                        </th>
                        <th className='text-left text-xs font-medium text-slate-600 dark:text-slate-400 pb-3'>
                          Location
                        </th>
                        <th className='text-left text-xs font-medium text-slate-600 dark:text-slate-400 pb-3'>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loginActivity.map((activity) => (
                        <tr
                          key={activity.id}
                          className='border-b border-slate-100 dark:border-slate-800 last:border-b-0'
                        >
                          <td className='py-3 text-xs text-slate-700 dark:text-slate-300'>
                            {activity.dateTime}
                          </td>
                          <td className='py-3 text-xs text-slate-700 dark:text-slate-300'>
                            {activity.device}
                          </td>
                          <td className='py-3 text-xs text-slate-600 dark:text-slate-400'>
                            {activity.location}
                          </td>
                          <td className='py-3'>
                            {activity.status === 'Successful' ? (
                              <span className='inline-flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium'>
                                <CheckCircle className='w-3 h-3' />
                                <span>Successful</span>
                              </span>
                            ) : (
                              <span className='inline-flex items-center space-x-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium'>
                                <XCircle className='w-3 h-3' />
                                <span>Failed</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center justify-end space-x-3 pt-2'>
                <button
                  onClick={handleCancelSecurityChanges}
                  className='px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-medium cursor-pointer'
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSecurityChanges}
                  className='px-4 py-2 text-sm bg-linear-to-r from-solid to-tertiary text-white rounded-lg font-medium hover:shadow-lg transition-all cursor-pointer'
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
