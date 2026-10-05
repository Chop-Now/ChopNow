import { assets } from '../../../assets/assets';
import {
  ChartNoAxesCombined,
  ChevronDown,
  CircleStar,
  Coins,
  LayoutDashboard,
  MessageSquareText,
  List,
  ServerCrash,
  Settings,
  ShoppingBasket,
  Store,
  User,
  ExternalLink,
  Bike,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAdminMode } from '../../context/AdminModeContext';
import { useAppContext } from '../../../context/AppContext';

const shopAdminMenuItems = [
  {
    id: 'dashboard',
    icon: <LayoutDashboard className="w-5 h-5 text-slate-400" />,
    label: 'Dashboard',
  },
  {
    id: 'analytics',
    icon: <ChartNoAxesCombined className="w-5 h-5 text-slate-400" />,
    label: 'Analytics',
    submenu: [
      { id: 'overview', label: 'Overview' },
      { id: 'reports', label: 'Reports' },
      { id: 'insights', label: 'Insights' },
      { id: 'impact', label: 'Impact' },
    ],
  },
  {
    id: 'orders',
    icon: <ShoppingBasket className="w-5 h-5 text-slate-400" />,
    label: 'Orders',
    submenu: [
      { id: 'all-orders', label: 'All Orders' },
      { id: 'pending-orders', label: 'Pending Orders' },
      { id: 'completed-orders', label: 'Completed Orders' },
      { id: 'deliveries', label: 'Deliveries' },
    ],
  },
  {
    id: 'listings',
    icon: <List className="w-5 h-5 text-slate-400" />,
    label: 'Listings',
    submenu: [
      { id: 'all-listings', label: 'All Listings' },
      { id: 'new-listing', label: 'New Listing' },
    ],
  },
  {
    id: 'reviews',
    icon: <MessageSquareText className="w-5 h-5 text-slate-400" />,
    label: 'Reviews',
  },
  {
    id: 'payouts',
    icon: <Coins className="w-5 h-5 text-slate-400" />,
    label: 'Payouts',
  },
  {
    id: 'settings',
    icon: <Settings className="w-5 h-5 text-slate-400" />,
    label: 'Settings',
  },
];

const websiteAdminMenuItems = [
  {
    id: 'dashboard',
    icon: <LayoutDashboard className="w-5 h-5 text-slate-400" />,
    label: 'Dashboard',
  },
  {
    id: 'analytics',
    icon: <ChartNoAxesCombined className="w-5 h-5 text-slate-400" />,
    label: 'Analytics',
    submenu: [
      { id: 'overview', label: 'Overview' },
      { id: 'reports', label: 'Reports' },
      { id: 'insights', label: 'Insights' },
      { id: 'impact', label: 'Impact' },
    ],
  },
  {
    id: 'users',
    icon: <User className="w-5 h-5 text-slate-400" />,
    label: 'Users',
    submenu: [
      { id: 'all-users', label: 'All Users' },
      { id: 'roles', label: 'Roles & Permissions' },
      { id: 'activity', label: 'User Activity' },
    ],
  },
  {
    id: 'orders',
    icon: <ShoppingBasket className="w-5 h-5 text-slate-400" />,
    label: 'Orders',
    submenu: [
      { id: 'all-orders', label: 'All Orders' },
      { id: 'pending-orders', label: 'Pending Orders' },
      { id: 'completed-orders', label: 'Completed Orders' },
      { id: 'deliveries', label: 'Deliveries' },
    ],
  },
  {
    id: 'listings',
    icon: <List className="w-5 h-5 text-slate-400" />,
    label: 'Listings',
    submenu: [{ id: 'all-listings', label: 'All Listings' }],
  },
  {
    id: 'vendors',
    icon: <Store className="w-5 h-5 text-slate-400" />,
    label: 'Vendors',
    submenu: [
      { id: 'all-vendors', label: 'All Vendors' },
      { id: 'vendor-approval', label: 'Vendor Approval' },
    ],
  },
  {
    id: 'riders',
    icon: <Bike className="w-5 h-5 text-slate-400" />,
    label: 'Riders',
    submenu: [
      { id: 'all-riders', label: 'All Riders' },
      { id: 'rider-approval', label: 'Rider Approval' },
    ],
  },
  {
    id: 'disputes',
    icon: <ServerCrash className="w-5 h-5 text-slate-400" />,
    label: 'Disputes',
    submenu: [{ id: 'complaints', label: 'Complaints' }],
  },
  {
    id: 'payouts',
    icon: <Coins className="w-5 h-5 text-slate-400" />,
    label: 'Payouts',
  },
  {
    id: 'settings',
    icon: <Settings className="w-5 h-5 text-slate-400" />,
    label: 'Settings',
  },
];

const Sidebar = ({
  collapsed,
  onToggle,
  currentPage,
  onPageChange,
  isAdminDashboard = false,
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
  businessName,
}) => {
  const { adminMode, isAdmin } = useAdminMode();
  const { user } = useAppContext();
  const [openMenus, setOpenMenus] = useState({});
  const [isHovered, setIsHovered] = useState(false);

  // For admin dashboard (/admin), always use website admin menu items
  // For vendor dashboard (/dashboard), always use shop admin menu items
  const menuItems = isAdminDashboard ? websiteAdminMenuItems : shopAdminMenuItems;

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => {
      const isCurrentlyOpen = prev[menuId];
      // Close all menus and only open the clicked one if it was closed
      return isCurrentlyOpen ? {} : { [menuId]: true };
    });
  };

  // On phones the sidebar is an off-canvas drawer and always shows labels;
  // the icon-only collapsed mode is a desktop feature.
  const isExpanded = isMobile || !collapsed || isHovered;

  const handlePage = (id) => {
    onPageChange(id);
    if (isMobile) onMobileClose?.();
  };

  useEffect(() => {
    if (!isMobile || !mobileOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && onMobileClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMobile, mobileOpen, onMobileClose]);

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      <aside
        id="dashboard-nav"
        aria-label="Main navigation"
        inert={isMobile && !mobileOpen ? true : undefined}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] transform flex-col border-r border-slate-200/50 bg-white transition-all duration-300 ease-in-out dark:border-slate-700/50 dark:bg-slate-900 lg:static lg:z-10 lg:max-w-none lg:translate-x-0 lg:bg-white/80 lg:backdrop-blur-xl lg:dark:bg-slate-900/80 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isExpanded ? 'lg:w-72' : 'lg:w-20'}`}
        onMouseEnter={() => collapsed && !isMobile && setIsHovered(true)}
        onMouseLeave={() => collapsed && !isMobile && setIsHovered(false)}
      >
        {/*Logo*/}
        <div className="p-4 lg:p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center space-x-3">
            <img src={assets.logomarkgreen} alt="ChopNow" className="w-10 h-10" />

            {/*Conditional Rendering*/}
            {isExpanded && (
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">ChopNow</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAdminDashboard ? 'Admin Panel' : 'Vendor Dashboard'}
                </p>
                {!isAdminDashboard && businessName && (
                  <p className="mt-0.5 max-w-44 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {businessName}
                  </p>
                )}
              </div>
            )}
            {isMobile && (
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close menu"
                className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/*Sidebar Items*/}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.submenu) {
                    toggleMenu(item.id);
                  } else {
                    handlePage(item.id);
                  }
                }}
                className={`w-full min-h-11 flex items-center ${isExpanded ? 'justify-between pl-5' : 'justify-center'} p-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  currentPage === item.id
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`flex items-center ${isExpanded ? 'space-x-3' : ''}`}>
                  {item.icon}
                  {/*conditional rendering*/}
                  {isExpanded && (
                    <>
                      <span className="text-sm text-slate-800 dark:text-white font-medium">
                        {item.label}
                      </span>
                      {item.count && (
                        <span className="px-2 py-0.5 text-xs bg-solidTwo text-white rounded-full ml-2">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {isExpanded && item.submenu && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openMenus[item.id] ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
              {/*Submenu*/}
              {isExpanded && item.submenu && openMenus[item.id] && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.submenu.map((subitem) => (
                    <button
                      key={subitem.id}
                      onClick={() => handlePage(subitem.id)}
                      className={`w-full min-h-11 text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                        currentPage === subitem.id
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {subitem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View Storefront Button - Only for Vendor Dashboard */}
        {!isAdminDashboard && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                // Navigate to storefront - you can customize the URL or navigation logic
                window.open('/shop', '_blank');
              }}
              className={`w-full flex items-center ${isExpanded ? 'justify-center gap-3 px-4' : 'justify-center'} py-3 rounded-xl transition-all duration-300 bg-solid hover:bg-tertiary text-white font-medium shadow-lg hover:shadow-xl hover:shadow-solid/20 cursor-pointer`}
            >
              <ExternalLink className="w-5 h-5" />
              {isExpanded && <span className="text-sm">View Storefront</span>}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
