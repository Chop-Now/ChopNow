import { Bell, ChevronDown, MenuIcon, Moon, Search, SlidersHorizontal, Sun, CircleUserRound, Settings, BadgeInfo, LogOut, X, Package, TrendingUp, AlertCircle, CheckCircle, Building2, Store } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { useAdminMode } from '../../context/AdminModeContext'

const Header = ({ onMenuClick }) => {
  const { adminMode, toggleAdminMode } = useAdminMode();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Dummy notification data
  const notifications = [
    {
      id: 1,
      type: 'success',
      icon: CheckCircle,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      title: 'Order Completed',
      message: 'Your order #12345 has been delivered successfully',
      time: '2 minutes ago',
      timestamp: Date.now() - 2 * 60 * 1000
    },
    {
      id: 2,
      type: 'info',
      icon: Package,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      title: 'New Order Received',
      message: 'You have a new order from John Doe',
      time: '15 minutes ago',
      timestamp: Date.now() - 15 * 60 * 1000
    },
    {
      id: 3,
      type: 'success',
      icon: TrendingUp,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'Sales Milestone',
      message: 'Congratulations! You\'ve reached 100 sales this month',
      time: '1 hour ago',
      timestamp: Date.now() - 60 * 60 * 1000
    },
    {
      id: 4,
      type: 'warning',
      icon: AlertCircle,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      title: 'Low Stock Alert',
      message: 'Product "Fresh Tomatoes" is running low on stock',
      time: '2 hours ago',
      timestamp: Date.now() - 2 * 60 * 60 * 1000
    },
    {
      id: 5,
      type: 'success',
      icon: CheckCircle,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      title: 'Payment Received',
      message: 'Payment of RWF 45,000 has been confirmed',
      time: '3 hours ago',
      timestamp: Date.now() - 3 * 60 * 60 * 1000
    },
    {
      id: 6,
      type: 'info',
      icon: Package,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      title: 'Order Shipped',
      message: 'Order #12344 has been shipped to customer',
      time: '5 hours ago',
      timestamp: Date.now() - 5 * 60 * 60 * 1000
    },
    {
      id: 7,
      type: 'success',
      icon: TrendingUp,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'Revenue Update',
      message: 'Daily revenue increased by 25% compared to yesterday',
      time: '1 day ago',
      timestamp: Date.now() - 24 * 60 * 60 * 1000
    },
    {
      id: 8,
      type: 'success',
      icon: CheckCircle,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      title: 'Review Posted',
      message: 'A customer left a 5-star review on your product',
      time: '2 days ago',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000
    },
    {
      id: 9,
      type: 'info',
      icon: Package,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      title: 'New Product Added',
      message: 'Successfully added "Organic Bananas" to your catalog',
      time: '3 days ago',
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000
    },
    {
      id: 10,
      type: 'warning',
      icon: AlertCircle,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      title: 'Pending Verification',
      message: 'Your business verification is pending review',
      time: '4 days ago',
      timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000
    }
  ];

  // Get the 8 latest notifications
  const latestNotifications = notifications
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 8);

  // Check for saved theme preference or default to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='relative z-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4'>
      <div className='flex items-center justify-between'>
         {/*Left section*/}
         <div className='flex items-center space-x-4'>
           <button 
             onClick={onMenuClick}
             className='p-2.5 rounded-md border-2 border-slate-100 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer'
           >
            <MenuIcon className='w-5 h-5'/>
           </button>

           <div className='relative'>
              <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-400'/>
              <input type="text" placeholder='Search or type command...' className='w-[400px] pl-10 pr-12 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'/>
              <button className='absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'>
                <SlidersHorizontal className='w-4 h-4'/>
              </button>
           </div>
         </div>

         {/*Right side*/}
         <div className='flex items-center space-x-3'>
            <div className='flex items-center space-x-3'>
              {/*Admin Mode Toggle*/}
              <button
                onClick={toggleAdminMode}
                className='flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-solid to-tertiary text-white rounded-md hover:shadow-lg transition-all duration-200'
              >
                {adminMode === 'shop' ? (
                  <>
                    <Store className='w-4 h-4' />
                    <span className='text-sm font-medium'>Shop Admin</span>
                  </>
                ) : (
                  <>
                    <Building2 className='w-4 h-4' />
                    <span className='text-sm font-medium'>Website Admin</span>
                  </>
                )}
              </button>

              {/*Toggle switch*/}
              <button 
                onClick={toggleDarkMode}
                className='p-3 rounded-full border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer'
              >
                {isDarkMode ? <Sun className='w-5 h-5'/> : <Moon className='w-5 h-5'/>}
              </button>
              {/*Notification*/}
               <div className='relative z-999' ref={notificationRef}>
                 <button 
                   onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                   className='relative p-3 rounded-full border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer'
                 >
                  <Bell className='w-5 h-5'/>
                  <span className='absolute top-0.5 right-0.5 w-3 h-3 bg-orange-500 rounded-full animate-ping'></span>
                  <span className='absolute top-0.5 right-0.5 w-3 h-3 bg-orange-500 rounded-full'></span>
                 </button>

                 {/* Notification Dropdown */}
                 {isNotificationOpen && (
                   <div className='absolute right-0 mt-3 w-90 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-9999'>
                     {/* Header */}
                     <div className='flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700'>
                       <h3 className='text-base font-semibold text-slate-800 dark:text-white'>Notifications</h3>
                       <button 
                         onClick={() => setIsNotificationOpen(false)}
                         className='p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer'
                       >
                         <X className='w-5 h-5 text-slate-500 dark:text-slate-400' />
                       </button>
                     </div>

                     {/* Notifications List */}
                     <div className='max-h-80 overflow-y-auto'>
                       {latestNotifications.map((notification, index) => {
                         const Icon = notification.icon;
                         return (
                           <div 
                             key={notification.id}
                             className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${
                               index < latestNotifications.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''
                             }`}
                           >
                             <div className='flex items-start space-x-3'>
                               <div className={`p-2 ${notification.iconBg} rounded-full`}>
                                 <Icon className={`w-4 h-4 ${notification.iconColor}`} />
                               </div>
                               <div className='flex-1'>
                                 <p className='text-sm font-medium text-slate-800 dark:text-white'>{notification.title}</p>
                                 <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>{notification.message}</p>
                                 <p className='text-xs text-slate-400 dark:text-slate-500 mt-1'>{notification.time}</p>
                               </div>
                             </div>
                           </div>
                         );
                       })}
                     </div>

                     {/* Footer Button */}
                     <div className='p-4 border-t border-slate-200 dark:border-slate-700 flex justify-center'>
                       <button className='w-9/10 px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer'>
                         View All Notifications
                       </button>
                     </div>
                   </div>
                 )}
               </div>
              
              {/*User profile*/}
               <div className='relative z-999' ref={profileRef}>
                 <div 
                   onClick={() => setIsProfileOpen(!isProfileOpen)}
                   className='flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700 cursor-pointer'
                 >
                    <img src="https://images.pexels.com/photos/1370719/pexels-photo-1370719.jpeg" alt="user" className='w-10 h-10 rounded-full object-cover'/>
                    <div className='hidden md:block'>
                       <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>Tresor</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}/>
                 </div>

                 {/* Profile Dropdown */}
                 {isProfileOpen && (
                   <div className='absolute right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-9999'>
                     {/* User Info Section */}
                     <div className='px-4 py-3 border-b border-slate-200 dark:border-slate-700'>
                       <p className='text-sm font-semibold text-slate-800 dark:text-white'>Tresor Shingiro</p>
                       <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>tresor.shingiro@example.com</p>
                     </div>

                     {/* Menu Items */}
                     <div className='py-2'>
                       <button className='w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer'>
                         <CircleUserRound className='w-5 h-5 text-slate-600 dark:text-slate-400' />
                         <span className='text-sm text-slate-700 dark:text-slate-300'>Edit Profile</span>
                       </button>

                       <button className='w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer'>
                         <Settings className='w-5 h-5 text-slate-600 dark:text-slate-400' />
                         <span className='text-sm text-slate-700 dark:text-slate-300'>Account Settings</span>
                       </button>

                       <button className='w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer'>
                         <BadgeInfo className='w-5 h-5 text-slate-600 dark:text-slate-400' />
                         <span className='text-sm text-slate-700 dark:text-slate-300'>Support</span>
                       </button>
                     </div>

                     {/* Divider */}
                     <div className='border-t border-slate-200 dark:border-slate-700 my-2'></div>

                     {/* Sign Out */}
                     <div className='py-2'>
                       <button className='w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left cursor-pointer'>
                         <LogOut className='w-5 h-5 text-red-600 dark:text-red-400' />
                         <span className='text-sm text-red-600 dark:text-red-400 font-medium'>Sign Out</span>
                       </button>
                     </div>
                   </div>
                 )}
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

export default Header
