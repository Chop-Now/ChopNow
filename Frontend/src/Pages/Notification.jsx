import PageNavbar from '@/Components/PageNavbar'
import React, { useState } from 'react'
import { Truck, Megaphone, PartyPopper, Store, CheckCheck, ArchiveRestore, EllipsisVertical } from 'lucide-react'

const Notification = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'rider',
      title: 'Your rider, Alex, is on the way!',
      description: 'Expected delivery in 15 minutes',
      isRead: false,
      timestamp: '5 mins ago'
    },
    {
      id: 2,
      type: 'order',
      title: 'Order #12345 confirmed',
      description: 'Your order has been confirmed and is being prepared',
      isRead: true,
      timestamp: '30 mins ago'
    },
    {
      id: 3,
      type: 'announcement',
      title: 'New Feature: Track Your Impact',
      description: 'Now you can see how your purchases help reduce food waste!',
      isRead: false,
      timestamp: '2 hours ago'
    },
    {
      id: 4,
      type: 'milestone',
      title: 'You saved 50 meals from waste!',
      description: 'Congratulations! Your efforts are making a difference',
      isRead: false,
      timestamp: '1 day ago'
    },
    {
      id: 5,
      type: 'rider',
      title: 'Sarah delivered your order',
      description: 'We hope you enjoyed your meal!',
      isRead: true,
      timestamp: '2 days ago'
    },
    {
      id: 6,
      type: 'order',
      title: 'Order #12340 is ready for pickup',
      description: 'Your order is waiting at the restaurant',
      isRead: false,
      timestamp: '3 days ago'
    },
    {
      id: 7,
      type: 'announcement',
      title: 'Weekend Special Deals',
      description: 'Check out amazing discounts on surplus food this weekend',
      isRead: true,
      timestamp: '4 days ago'
    },
    {
      id: 8,
      type: 'milestone',
      title: 'First Week Complete!',
      description: 'You\'ve been with ChopNow for a week. Thank you for fighting food waste!',
      isRead: true,
      timestamp: '1 week ago'
    }
  ])
  const [dropdownOpen, setDropdownOpen] = useState(null)

  const categories = [
    { id: 'order', label: 'Order updates' },
    { id: 'rider', label: 'Rider Status' },
    { id: 'announcement', label: 'App announcements' },
    { id: 'milestone', label: 'Impact Milestones' }
  ]

  const getIconConfig = (type) => {
    switch (type) {
      case 'rider':
        return { Icon: Truck, color: '#00A86B', bgColor: '#E6F9F2' }
      case 'announcement':
        return { Icon: Megaphone, color: '#FF7A00', bgColor: '#FFF0E6' }
      case 'milestone':
        return { Icon: PartyPopper, color: '#4CAF50', bgColor: '#E8F5E9' }
      case 'order':
        return { Icon: Store, color: '#007A4B', bgColor: '#E0F2ED' }
      default:
        return { Icon: Store, color: '#007A4B', bgColor: '#E0F2ED' }
    }
  }

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const clearFilters = () => {
    setSelectedFilter('all')
    setSelectedCategories([])
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
  }

  const archiveAll = () => {
    setNotifications([])
  }

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
    )
    setDropdownOpen(null)
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
    setDropdownOpen(null)
  }

  const filteredNotifications = notifications.filter(notif => {
    const filterMatch = selectedFilter === 'all' || (selectedFilter === 'unread' && !notif.isRead)
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(notif.type)
    return filterMatch && categoryMatch
  })

  return (
    <div className='bg-white min-h-screen pt-20'>
      <PageNavbar />
      
      <div className='container mx-auto px-4 py-8'>
        <div className='flex gap-6'>
          {/* Sidebar - Desktop Only */}
          <aside className='hidden lg:block w-64 shrink-0 -ml-8'>
            <div className='bg-primary rounded-lg p-6 sticky top-24'>
              <h3 className='text-lg font-semibold text-textColor mb-4'>Filter by</h3>
              
              {/* Status Title */}
              <h4 className='text-sm font-semibold text-textColor mb-3'>Status</h4>
              
              {/* All/Unread Buttons */}
              <div className='flex gap-2 mb-6'>
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors text-center cursor-pointer ${
                    selectedFilter === 'all'
                      ? 'bg-solid text-white'
                      : 'bg-white text-textColor hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedFilter('unread')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors text-center cursor-pointer ${
                    selectedFilter === 'unread'
                      ? 'bg-solid text-white'
                      : 'bg-white text-textColor hover:bg-gray-100'
                  }`}
                >
                  Unread
                </button>
              </div>

              {/* Categories */}
              <div className='mb-6'>
                <h4 className='text-sm font-semibold text-textColor mb-3'>Categories:</h4>
                <div className='space-y-2'>
                  {categories.map(category => (
                    <label
                      key={category.id}
                      className='flex items-center space-x-2 cursor-pointer'
                    >
                      <input
                        type='checkbox'
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className='w-4 h-4 text-solid border-gray-300 rounded focus:ring-solid'
                      />
                      <span className='text-sm text-textColor'>{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className='w-full px-4 py-2 text-sm text-solid border border-solid rounded-lg hover:bg-solid hover:text-white transition-colors cursor-pointer'
              >
                Clear filters
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className='flex-1'>
            {/* Header */}
            <div className='mb-6'>
              <h1 className='text-3xl font-bold text-textColor mb-2'>Notifications Center</h1>
              <p className='text-gray-50'>All your recent updates in one place</p>
            </div>

            {/* Mobile Filters - Below Title */}
            <div className='lg:hidden mb-6 bg-primary rounded-lg p-4'>
              {/* All/Unread Buttons */}
              <div className='flex gap-2 mb-3'>
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors text-center text-sm ${
                    selectedFilter === 'all'
                      ? 'bg-solid text-white'
                      : 'bg-white text-textColor hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedFilter('unread')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors text-center text-sm ${
                    selectedFilter === 'unread'
                      ? 'bg-solid text-white'
                      : 'bg-white text-textColor hover:bg-gray-100'
                  }`}
                >
                  Unread
                </button>
              </div>

              {/* Categories */}
              <div className='flex flex-wrap gap-2 mb-3'>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      selectedCategories.includes(category.id)
                        ? 'bg-solid text-white'
                        : 'bg-white text-textColor hover:bg-gray-100'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Clear Filters */}
              {(selectedFilter !== 'all' || selectedCategories.length > 0) && (
                <button
                  onClick={clearFilters}
                  className='w-full px-4 py-2 text-xs text-solid border border-solid rounded-lg hover:bg-solid hover:text-white transition-colors'
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Actions Bar */}
            <div className='flex justify-end items-center gap-6 mb-6 pb-4 border-b border-gray-200'>
              <button
                onClick={markAllAsRead}
                className='flex items-center gap-2 text-sm text-textColor hover:text-gray-50 transition-colors cursor-pointer'
              >
                <CheckCheck size={18} />
                <span>Mark all as read</span>
              </button>
              <button
                onClick={archiveAll}
                className='flex items-center gap-2 text-sm text-textColor hover:text-gray-50 transition-colors cursor-pointer'
              >
                <ArchiveRestore size={18} />
                <span>Archive All</span>
              </button>
            </div>

            {/* Notifications List */}
            <div className='space-y-4'>
              {filteredNotifications.length === 0 ? (
                <div className='text-center py-12 text-gray-50'>
                  <p>No notifications to display</p>
                </div>
              ) : (
                filteredNotifications.map(notification => {
                  const { Icon, color, bgColor } = getIconConfig(notification.type)
                  return (
                    <div
                      key={notification.id}
                      className={`relative bg-primary rounded-lg p-3 hover:shadow-md transition-shadow ${
                        !notification.isRead ? 'ring-2 ring-solid ring-opacity-20' : ''
                      }`}
                    >
                      <div className='flex gap-3'>
                        {/* Icon with unread indicator */}
                        <div className='relative shrink-0'>
                          {!notification.isRead && (
                            <div className='absolute top-0 left-0 w-2.5 h-2.5 bg-blue-500 rounded-full z-10'></div>
                          )}
                          <div
                            className='w-11 h-11 rounded-full flex items-center justify-center'
                            style={{ backgroundColor: bgColor }}
                          >
                            <Icon size={20} style={{ color: color }} />
                          </div>
                        </div>

                        {/* Content */}
                        <div className='flex-1'>
                          <div className='flex justify-between items-start'>
                            <div>
                              <h3 className='font-semibold text-textColor mb-0.5 text-sm'>
                                {notification.title}
                              </h3>
                              <p className='text-xs text-gray-50 mb-1'>
                                {notification.description}
                              </p>
                              <span className='text-[10px] text-gray-50'>
                                {notification.timestamp}
                              </span>
                            </div>

                            {/* Actions Menu */}
                            <div className='relative'>
                              <button
                                onClick={() => setDropdownOpen(dropdownOpen === notification.id ? null : notification.id)}
                                className='text-gray-50 hover:text-textColor transition-colors'
                              >
                                <EllipsisVertical size={20} />
                              </button>

                              {dropdownOpen === notification.id && (
                                <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10'>
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className='w-full text-left px-4 py-2 text-sm text-textColor hover:bg-gray-100 transition-colors'
                                  >
                                    Mark as read
                                  </button>
                                  <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors'
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Notification
