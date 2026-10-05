import { assets } from '../assets/assets';
import {
  Bell,
  Search,
  ShoppingCart,
  User,
  X,
  Funnel,
  Store,
  PersonStanding,
  ArrowRightLeft,
  Bike,
  Store as ShopIcon,
  ClipboardList,
  Leaf,
  LogIn,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const TABS = [
  { to: '/shop', label: 'Shop', Icon: ShopIcon },
  { to: '/my-orders', label: 'Orders', Icon: ClipboardList },
  { to: '/cart', label: 'Cart', Icon: ShoppingCart },
  { to: '/my-impact', label: 'Impact', Icon: Leaf },
];

/** Thumb-reach navigation for phones: the four main destinations plus Account. */
const MobileTabBar = ({ cartCount, accountOpen, onAccount }) => {
  useEffect(() => {
    // Pages reserve room for the bar so their last row isn't hidden behind it.
    document.body.classList.add('has-tab-bar');
    return () => document.body.classList.remove('has-tab-bar');
  }, []);

  const tabClass = (active) =>
    `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
      active ? 'text-moringa' : 'text-moringa-muted'
    }`;

  return (
    <nav
      aria-label="Main"
      className="pb-safe fixed inset-x-0 bottom-0 z-30 flex border-t border-surface-border bg-white md:hidden"
    >
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => tabClass(isActive)}
          aria-label={label === 'Cart' && cartCount > 0 ? `Cart, ${cartCount} items` : label}
        >
          <span className="relative">
            <Icon className="h-6 w-6" aria-hidden="true" />
            {label === 'Cart' && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pepper px-1 text-xs font-semibold leading-none text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </span>
          {label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onAccount}
        aria-haspopup="dialog"
        aria-expanded={accountOpen}
        className={`${tabClass(accountOpen)} cursor-pointer`}
      >
        <User className="h-6 w-6" aria-hidden="true" />
        Account
      </button>
    </nav>
  );
};

/** Bottom sheet: the phone-friendly replacement for a dropdown or side drawer. */
const AccountSheet = ({ open, onClose, children }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Close account menu"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Account"
        className="pb-safe absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white px-5 pt-3 pb-6 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-300" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
};

const PageNavbar = ({ onMobileFilterClick, hideTabBar = false }) => {
  const [open, setOpen] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    setSearchQuery,
    searchQuery,
    getTotalCartItems,
    user,
    isAuthenticated,
    logout,
    activeRole,
    availableRoles,
    switchRole,
  } = useAppContext();

  // Check if we're on cart or my-orders or my-impact or notifications page
  const hideSearch =
    location.pathname === '/cart' ||
    location.pathname === '/my-orders' ||
    location.pathname === '/my-impact' ||
    location.pathname === '/notifications';

  useEffect(() => {
    // Only navigate to shop if we're not already on a shop-related page
    if (searchQuery.length > 0 && !window.location.pathname.startsWith('/shop')) {
      navigate('/shop');
    }
  }, [searchQuery]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 py-2.5 md:py-4 border-b transition-all bg-white shadow-sm"
        style={{ borderColor: '#E5E5E5' }}
      >
        <NavLink to="/" aria-label="ChopNow home" className="flex min-h-11 items-center">
          <img src={assets.wordmarklogo} alt="ChopNow" className="h-8 md:h-9 w-auto" />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <NavLink
            to="/shop"
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-textColor)' }}
          >
            Shop
          </NavLink>
          <NavLink
            to="/my-orders"
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-textColor)' }}
          >
            My orders
          </NavLink>
          <NavLink
            to="/my-impact"
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-textColor)' }}
          >
            Impact
          </NavLink>

          {!hideSearch && (
            <div
              className="hidden lg:flex items-center text-sm gap-2 px-3 py-1.5 rounded-full"
              style={{ border: '1px solid var(--color-moringa-muted)', backgroundColor: 'white' }}
            >
              <input
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
                style={{ color: 'var(--color-textColor)' }}
                type="text"
                placeholder="Search products"
              />
              <Search className="w-4 h-4" style={{ color: 'var(--color-moringa-muted)' }} />
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate('/cart')}
            aria-label="Cart"
            className="relative cursor-pointer hover:opacity-70 transition-opacity"
          >
            <ShoppingCart className="w-5 h-5" style={{ color: 'var(--color-textColor)' }} />
            {getTotalCartItems() > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 text-xs text-white w-4 h-4 rounded-full flex items-center justify-center font-semibold"
                style={{ backgroundColor: 'var(--color-solid)' }}
              >
                {getTotalCartItems()}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            className="relative cursor-pointer hover:opacity-70 transition-opacity"
          >
            <Bell className="w-5 h-5" style={{ color: 'var(--color-textColor)' }} />
            <span
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--color-solidOne)' }}
            />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label="Account menu"
              aria-expanded={showProfileMenu}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
              style={{ backgroundColor: 'var(--color-solid)' }}
            >
              <User className="w-5 h-5 text-white" />
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 top-12 w-48 rounded-lg shadow-lg py-2 z-50"
                style={{ backgroundColor: 'white', border: '1px solid #E5E5E5' }}
              >
                {isAuthenticated && user ? (
                  <>
                    <div className="px-4 py-2 border-b" style={{ borderColor: '#E5E5E5' }}>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: 'var(--color-textColor)' }}
                      >
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-moringa-muted)' }}>
                        {user.email}
                      </p>
                    </div>

                    {/* Role Switcher - Only show if user has multiple roles */}
                    {availableRoles && availableRoles.length > 1 && (
                      <div className="px-4 py-2 border-b" style={{ borderColor: '#E5E5E5' }}>
                        <p
                          className="text-xs font-medium mb-2"
                          style={{ color: 'var(--color-moringa-muted)' }}
                        >
                          Switch Mode
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {availableRoles.includes('consumer') && (
                            <button
                              onClick={async () => {
                                if (activeRole !== 'consumer') {
                                  await switchRole('consumer');
                                  setShowProfileMenu(false);
                                  navigate('/shop');
                                }
                              }}
                              className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                                activeRole === 'consumer'
                                  ? 'text-white'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              style={{
                                backgroundColor:
                                  activeRole === 'consumer' ? 'var(--color-solid)' : undefined,
                                color:
                                  activeRole === 'consumer' ? 'white' : 'var(--color-textColor)',
                              }}
                            >
                              <PersonStanding className="w-3.5 h-3.5" />
                              Buyer Mode
                            </button>
                          )}
                          {availableRoles.includes('business_owner') && (
                            <button
                              onClick={async () => {
                                if (activeRole !== 'business_owner') {
                                  await switchRole('business_owner');
                                  setShowProfileMenu(false);
                                  navigate('/dashboard');
                                }
                              }}
                              className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                                activeRole === 'business_owner'
                                  ? 'text-white'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              style={{
                                backgroundColor:
                                  activeRole === 'business_owner'
                                    ? 'var(--color-solid)'
                                    : undefined,
                                color:
                                  activeRole === 'business_owner'
                                    ? 'white'
                                    : 'var(--color-textColor)',
                              }}
                            >
                              <Store className="w-3.5 h-3.5" />
                              Business Mode
                            </button>
                          )}
                          {availableRoles.includes('rider') && (
                            <button
                              onClick={async () => {
                                if (activeRole !== 'rider') {
                                  await switchRole('rider');
                                  setShowProfileMenu(false);
                                  navigate('/rider-dashboard');
                                }
                              }}
                              className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                                activeRole === 'rider'
                                  ? 'text-white'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              style={{
                                backgroundColor:
                                  activeRole === 'rider' ? 'var(--color-solid)' : undefined,
                                color: activeRole === 'rider' ? 'white' : 'var(--color-textColor)',
                              }}
                            >
                              <Bike className="w-3.5 h-3.5" />
                              Rider Mode
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <NavLink
                      to="/my-profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition"
                      style={{ color: 'var(--color-textColor)' }}
                    >
                      My Profile
                    </NavLink>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                        navigate('/login');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition cursor-pointer"
                      style={{ color: 'var(--color-solidOne)' }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition"
                      style={{ color: 'var(--color-textColor)' }}
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/signup"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition"
                      style={{ color: 'var(--color-solid)' }}
                    >
                      Sign Up
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: the main destinations live in the bottom tab bar; only the bell stays up here. */}
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
          className="md:hidden relative flex items-center justify-center rounded-full"
        >
          <Bell className="w-6 h-6" style={{ color: 'var(--color-textColor)' }} />
          <span
            className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-solidOne)' }}
          />
        </button>
      </nav>

      {/* Mobile Search Bar - Below Navbar */}
      {!hideSearch && (
        <div
          className="md:hidden sticky top-16 z-20 px-4 py-2 bg-white border-b"
          style={{ borderColor: '#E5E5E5' }}
        >
          <div
            className="flex items-center text-sm gap-2 pl-4 pr-1 rounded-full w-full"
            style={{ border: '1px solid var(--color-moringa-muted)' }}
          >
            <Search className="w-4 h-4" style={{ color: 'var(--color-moringa-muted)' }} />
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              className="w-full bg-transparent outline-none text-sm"
              style={{ color: 'var(--color-textColor)' }}
              type="search"
              enterKeyHint="search"
              aria-label="Search products"
              placeholder="Search products"
            />
            {onMobileFilterClick && (
              <button
                onClick={onMobileFilterClick}
                className="flex items-center justify-center hover:opacity-70 transition-opacity"
                aria-label="Filter and sort"
              >
                <Funnel className="w-4 h-4" style={{ color: 'var(--color-moringa-muted)' }} />
              </button>
            )}
          </div>
        </div>
      )}

      {!hideTabBar && (
        <MobileTabBar
          cartCount={getTotalCartItems()}
          accountOpen={open}
          onAccount={() => setOpen(true)}
        />
      )}

      <AccountSheet open={open} onClose={() => setOpen(false)}>
        {isAuthenticated && user && (
          <div className="mb-4">
            <p className="text-base font-semibold" style={{ color: 'var(--color-textColor)' }}>
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm break-all" style={{ color: 'var(--color-moringa-muted)' }}>
              {user.email}
            </p>
          </div>
        )}

        {isAuthenticated && availableRoles && availableRoles.length > 1 && (
          <div className="mb-4">
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-moringa-muted)' }}>
              Switch mode
            </p>
            <div className="grid gap-2">
              {[
                ['consumer', 'Buyer mode', PersonStanding, '/shop'],
                ['business_owner', 'Business mode', Store, '/dashboard'],
                ['rider', 'Rider mode', Bike, '/rider-dashboard'],
              ]
                .filter(([role]) => availableRoles.includes(role))
                .map(([role, label, Icon, dest]) => (
                  <button
                    key={role}
                    type="button"
                    onClick={async () => {
                      if (activeRole !== role) {
                        await switchRole(role);
                        setOpen(false);
                        navigate(dest);
                      }
                    }}
                    className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                      activeRole === role ? 'text-white' : 'bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: activeRole === role ? 'var(--color-solid)' : undefined,
                      color: activeRole === role ? 'white' : 'var(--color-textColor)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="grid gap-1 border-t pt-3" style={{ borderColor: '#E5E5E5' }}>
          {isAuthenticated ? (
            <>
              <NavLink
                to="/my-profile"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-3 text-sm font-medium"
                style={{ color: 'var(--color-textColor)' }}
              >
                <User className="w-5 h-5" />
                My profile
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate('/login');
                }}
                className="flex items-center gap-3 text-sm font-medium"
                style={{ color: 'var(--color-solidOne)' }}
              >
                <LogIn className="w-5 h-5 rotate-180" />
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-3 text-sm font-medium"
                style={{ color: 'var(--color-textColor)' }}
              >
                <LogIn className="w-5 h-5" />
                Log in
              </NavLink>
              <NavLink
                to="/signup"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center justify-center rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: 'var(--color-solid)' }}
              >
                Create an account
              </NavLink>
            </>
          )}
        </div>
      </AccountSheet>
    </>
  );
};

export default PageNavbar;
