# ChopNow Frontend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Admin Dashboard Architecture](#admin-dashboard-architecture)
6. [Admin Dashboard Pages](#admin-dashboard-pages)
7. [Public Pages](#public-pages)
8. [Components](#components)
9. [Context & State Management](#context--state-management)
10. [Styling & Theming](#styling--theming)
11. [Backend Integration Points](#backend-integration-points)

---

## Project Overview

ChopNow is a sustainable food marketplace platform that connects consumers with local vendors selling surplus food at discounted prices. The platform helps reduce food waste while providing affordable options to consumers. The frontend is built with React and Vite, featuring both public-facing pages and a comprehensive admin dashboard.

**Key Features:**
- Public marketplace with product browsing and purchasing
- Dual admin dashboard system (Shop Admin & Website Admin)
- Dark mode support throughout the application
- Responsive design with Tailwind CSS
- Real-time data visualization with charts
- User profile and notification management
- Product listing management with search, filtering, and pagination

---

## Tech Stack

### Core Technologies
- **React 18+** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Recharts** - Data visualization library

### Key Dependencies
```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "lucide-react": "latest",
  "recharts": "latest",
  "tailwindcss": "^4.x"
}
```

---

## Project Structure

```
Frontend/
├── public/                          # Static assets
├── src/
│   ├── admin/                       # Admin dashboard (main focus)
│   │   ├── Dashboard.jsx           # Main admin container with routing
│   │   ├── context/
│   │   │   └── AdminModeContext.jsx # Admin mode state management
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx      # Top navigation with profile/notifications
│   │   │   │   └── Sidebar.jsx     # Left navigation menu
│   │   │   └── Content/
│   │   │       ├── Content.jsx     # Dashboard overview content
│   │   │       ├── StatsGrid.jsx   # Statistics cards
│   │   │       ├── ChartSection.jsx # Charts container
│   │   │       ├── RevenueChart.jsx # Revenue visualization
│   │   │       ├── SalesChart.jsx   # Sales visualization
│   │   │       ├── OrderTrendsChart.jsx # Order trends with period toggle
│   │   │       ├── ActivityFeed.jsx # Recent activity list
│   │   │       └── TableSection.jsx # Recent orders table
│   │   └── pages/
│   │       ├── Analytics.jsx       # Analytics page (placeholder)
│   │       ├── Users.jsx           # User management page (placeholder)
│   │       ├── Orders.jsx          # Orders page (placeholder)
│   │       ├── Listings.jsx        # Product listings management (full)
│   │       ├── Vendors.jsx         # Vendor management (placeholder)
│   │       ├── Disputes.jsx        # Dispute resolution (placeholder)
│   │       ├── Payouts.jsx         # Payout management (placeholder)
│   │       └── Settings.jsx        # Settings page (placeholder)
│   │
│   ├── Pages/                       # Public pages
│   │   ├── Home.jsx                # Landing page
│   │   ├── Shop.jsx                # Product marketplace
│   │   ├── ProductDetails.jsx      # Product detail view
│   │   ├── Cart.jsx                # Shopping cart
│   │   ├── Login.jsx               # User login
│   │   ├── SignUp.jsx              # User registration
│   │   ├── MyProfile.jsx           # User profile
│   │   ├── MyOrders.jsx            # Order history
│   │   ├── MyImpact.jsx            # Environmental impact tracking
│   │   ├── CategoryPage.jsx        # Category browsing
│   │   ├── ContactUs.jsx           # Contact page
│   │   ├── FAQ.jsx                 # FAQ page
│   │   ├── BusinessVerification.jsx # Vendor verification
│   │   ├── PendingReview.jsx       # Review pending page
│   │   └── Notification.jsx        # Notifications page
│   │
│   ├── Components/                  # Shared components
│   │   ├── Navbar.jsx              # Main navigation
│   │   ├── PageNavbar.jsx          # Page-specific navigation
│   │   ├── Footer.jsx              # Footer component
│   │   ├── Header.jsx              # Hero header
│   │   ├── Hero.jsx                # Hero section
│   │   ├── Products.jsx            # Product grid
│   │   ├── ProductCard.jsx         # Product card
│   │   ├── Categories.jsx          # Category grid
│   │   ├── ShopSidebar.jsx         # Shop filters
│   │   ├── Breadcrumb.jsx          # Breadcrumb navigation
│   │   ├── AboutUs.jsx             # About section
│   │   ├── HowItWorks.jsx          # How it works section
│   │   ├── Testimonials.jsx        # Customer testimonials
│   │   ├── Advisors.jsx            # Advisors section
│   │   ├── Milestones.jsx          # Company milestones
│   │   ├── Apps.jsx                # App download section
│   │   ├── maps/
│   │   │   ├── LocationPicker.jsx  # Location selection
│   │   │   └── useGeolocation.js   # Geolocation hook
│   │   ├── ui/
│   │   │   ├── button.jsx          # Button component
│   │   │   └── animated-testimonials.jsx # Animated testimonials
│   │   └── animate-ui/             # Animation components
│   │
│   ├── assets/
│   │   └── assets.js               # Product data and images
│   │
│   ├── context/
│   │   └── AppContext.jsx          # Global app context
│   │
│   ├── services/
│   │   └── geocoding.js            # Geocoding utilities
│   │
│   ├── lib/
│   │   └── utils.js                # Utility functions
│   │
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # App entry point
│   ├── App.css                     # App styles
│   └── index.css                   # Global styles
│
├── components.json                 # Component config
├── tailwind.config.js              # Tailwind configuration
├── vite.config.js                  # Vite configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Basic knowledge of React and Tailwind CSS

### Installation

1. **Clone the repository**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

---

## Admin Dashboard Architecture

The admin dashboard is the core feature of this application, providing a comprehensive management interface for the ChopNow platform. It features a **dual admin system** that allows switching between two distinct admin modes.

### Dashboard Entry Point
**Location:** `src/admin/Dashboard.jsx`

This is the main container for the entire admin dashboard. It handles:
- Page routing logic via `renderPage()` function
- Admin mode context provider wrapper
- Layout composition (Header + Sidebar + Content)

### Dual Admin System

The platform supports two types of admin accounts:

#### 1. **Shop Admin** (Individual Vendor)
- Manages their own shop/vendor account
- Access to: Dashboard, Analytics, Users, Orders, Listings, Payouts, Settings
- Cannot see other vendors or platform-wide features
- Focused on individual shop performance

#### 2. **Website Admin** (Platform Administrator)
- Manages the entire ChopNow platform
- Access to: Dashboard, Analytics, Users (with Activity submenu), Orders, Listings, Vendors, Disputes, Payouts, Settings
- Can see all vendors, users, and platform-wide metrics
- Focused on overall platform health

### Admin Mode Toggle
**Location:** `src/admin/components/layout/Header.jsx` (line ~90-110)

Users can switch between admin modes using a toggle button in the header:
- **Shop Admin Icon:** Store icon (Lucide `Store`)
- **Website Admin Icon:** Building icon (Lucide `Building2`)
- Toggle changes global state via `AdminModeContext`
- Sidebar menu and dashboard content update dynamically

### Admin Mode Context
**Location:** `src/admin/context/AdminModeContext.jsx`

```javascript
// Context provides:
{
  adminMode: 'shop' | 'website',
  toggleAdminMode: () => void
}

// Usage in components:
const { adminMode, toggleAdminMode } = useAdminMode();
```

This context is consumed by:
- `Sidebar.jsx` - to show different menu items
- `StatsGrid.jsx` - to show different statistics
- `Content.jsx` - to conditionally render different content
- Other components that need admin-specific behavior

---

## Admin Dashboard Pages

### Dashboard Overview
**Location:** `src/admin/components/Content/Content.jsx`

**Route:** Default page when entering admin dashboard

**Components:**
1. **StatsGrid** - Statistics cards showing key metrics
   - Shop Admin: Total Revenue, Orders, CO2e Saved, Reviews
   - Website Admin: Total Revenue, Orders, Vendors, Users

2. **ChartSection** - Data visualization
   - Revenue Chart (bar chart)
   - Sales Chart (line chart)
   - Order Trends Chart (line chart with period toggle: monthly/quarterly/annually)

3. **ActivityFeed** - Recent activity timeline (5 recent activities)

4. **TableSection** - Recent orders table (Shop Admin)
   OR **DisputesTable** - Recent disputes table (Website Admin)
   - Note: DisputesTable component needs to be created in backend integration

**Dummy Data:** Currently uses static data in each component file

---

### Analytics Page
**Location:** `src/admin/pages/Analytics.jsx`

**Route:** `/admin` with `currentPage = 'analytics'`

**Status:** Placeholder (ComingSoon component)

**Intended Purpose:** 
- Advanced analytics and reporting
- Custom date range selection
- Downloadable reports
- Performance metrics visualization

**Backend Needs:**
- GET `/api/admin/analytics` - Aggregate analytics data
- Query parameters: date range, metrics type, admin mode

---

### Users Page
**Location:** `src/admin/pages/Users.jsx`

**Route:** `/admin` with `currentPage = 'users'`

**Status:** Placeholder (ComingSoon component)

**Intended Purpose:**
- User management table
- Search and filter users by role, status, registration date
- View user details
- Suspend/activate user accounts
- Export user list

**Backend Needs:**
- GET `/api/admin/users?page=1&limit=20&search=&role=&status=`
- PUT `/api/admin/users/:id/status` - Update user status
- GET `/api/admin/users/:id` - Get user details

**Website Admin Specific:**
- Submenu: User Activity (monitoring user behavior, login history)
- Additional endpoint: GET `/api/admin/users/:id/activity`

---

### Orders Page
**Location:** `src/admin/pages/Orders.jsx`

**Route:** `/admin` with `currentPage = 'orders'`

**Status:** Placeholder (ComingSoon component)

**Intended Purpose:**
- Complete order management
- Search by order ID, customer name, date
- Filter by status: pending, confirmed, ready for pickup, completed, cancelled
- View order details
- Update order status
- Export orders

**Backend Needs:**
- GET `/api/admin/orders?page=1&limit=20&search=&status=&dateFrom=&dateTo=`
- GET `/api/admin/orders/:id` - Order details
- PUT `/api/admin/orders/:id/status` - Update order status
- GET `/api/admin/orders/:id/timeline` - Order status history

**Shop Admin:** Only sees orders for their shop
**Website Admin:** Sees all platform orders with vendor filter

---

### All Listings Page (FULLY IMPLEMENTED)
**Location:** `src/admin/pages/Listings.jsx`

**Route:** `/admin` with `currentPage = 'all-listings'`

**Status:** ✅ Fully implemented with dummy data

**Features:**

1. **Statistics Cards** (4 cards at top)
   - Total Listings
   - Active Listings
   - Inactive Listings
   - Expired Listings
   - Icons: Package, CheckCircle, XCircle, Clock
   - Location: Lines 70-95

2. **Search & Filter Section**
   - Search input with Search icon
   - Status dropdown: All Status, Active, Inactive, Expired
   - Location: Lines 117-142

3. **Bulk Actions** (shown when products selected)
   - Select all checkbox in table header
   - Activate Selected button (green)
   - Deactivate Selected button (orange)
   - Delete Selected button (red)
   - Location: Lines 145-163

4. **Products Table**
   - Columns: Checkbox, Product (image + name), Category, Stock, Pickup Window, Date Created, Status, Actions
   - Product row shows:
     - 10x10 product image
     - Product name and price
     - Category
     - Stock quantity
     - Pickup time window (hardcoded: 12:00 PM - 6:00 PM)
     - Creation date
     - Status badge (active=green, inactive=orange, expired=red)
     - Actions: Toggle switch, Edit (Pencil icon), Delete (Trash icon)
   - Location: Lines 166-280

5. **Pagination**
   - Shows 5 items per page
   - "Showing X to Y of Z listings" text
   - Previous/Next buttons
   - Numbered page buttons (active page uses green bg-solid)
   - Location: Lines 283-318

**State Management:**
```javascript
const [selectedProducts, setSelectedProducts] = useState([])
const [searchTerm, setSearchTerm] = useState('')
const [statusFilter, setStatusFilter] = useState('all')
const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 5
```

**Data Flow:**
- Uses `dummyProducts` from `assets/assets.js`
- Adds `status` and `stock` fields to products
- Filters by search term (product name) and status
- Slices filtered products for pagination

**Backend Needs:**
- GET `/api/admin/listings?page=1&limit=5&search=&status=`
  - Response: `{ products: [], total: number, page: number, totalPages: number }`
- PUT `/api/admin/listings/:id/status` - Toggle active/inactive
- DELETE `/api/admin/listings/:id` - Delete product
- POST `/api/admin/listings/bulk-activate` - Body: `{ ids: [] }`
- POST `/api/admin/listings/bulk-deactivate` - Body: `{ ids: [] }`
- POST `/api/admin/listings/bulk-delete` - Body: `{ ids: [] }`

---

### New Listing Page
**Location:** `src/admin/pages/Listings.jsx` (exported as named export)

**Route:** `/admin` with `currentPage = 'new-listing'`

**Status:** Placeholder (ComingSoon component)

**Intended Purpose:**
- Form to create new product listing
- Fields: name, description, category, price, original price, stock, images, pickup window
- Image upload with preview
- Rich text editor for description
- Category dropdown
- Save as draft or publish

**Backend Needs:**
- POST `/api/admin/listings` - Create new listing
- POST `/api/admin/listings/upload-image` - Upload product images
- GET `/api/categories` - Get available categories

---

### Vendors Page
**Location:** `src/admin/pages/Vendors.jsx`

**Route:** `/admin` with `currentPage = 'vendors'`

**Status:** Placeholder (ComingSoon component)

**Access:** Website Admin only

**Intended Purpose:**
- Vendor management table
- Search vendors by name, location
- Filter by status: pending, active, suspended
- View vendor details
- Approve/reject vendor applications
- Suspend/activate vendors
- View vendor performance metrics

**Backend Needs:**
- GET `/api/admin/vendors?page=1&limit=20&search=&status=`
- GET `/api/admin/vendors/:id` - Vendor details
- PUT `/api/admin/vendors/:id/status` - Approve/suspend vendor
- GET `/api/admin/vendors/:id/metrics` - Vendor performance

---

### Disputes Page
**Location:** `src/admin/pages/Disputes.jsx`

**Route:** `/admin` with `currentPage = 'disputes'`

**Status:** Placeholder (ComingSoon component)

**Access:** Website Admin only

**Intended Purpose:**
- Dispute resolution system
- Search by dispute ID, customer, vendor
- Filter by status: open, in progress, resolved, closed
- View dispute details with conversation thread
- Assign disputes to support staff
- Resolve disputes with actions

**Backend Needs:**
- GET `/api/admin/disputes?page=1&limit=20&search=&status=`
- GET `/api/admin/disputes/:id` - Dispute details with messages
- POST `/api/admin/disputes/:id/message` - Add message to dispute
- PUT `/api/admin/disputes/:id/status` - Update dispute status
- POST `/api/admin/disputes/:id/resolve` - Resolve dispute with action

**Note:** Dashboard overview shows DisputesTable for Website Admin (component needs creation)

---

### Payouts Page
**Location:** `src/admin/pages/Payouts.jsx`

**Route:** `/admin` with `currentPage = 'payouts'`

**Status:** Placeholder (ComingSoon component)

**Intended Purpose:**
- Payout management and history
- For Shop Admin: View pending and completed payouts
- For Website Admin: Process vendor payouts
- Search by date, amount, status
- Filter by status: pending, processing, completed, failed
- Export payout reports

**Backend Needs:**
- GET `/api/admin/payouts?page=1&limit=20&status=&dateFrom=&dateTo=`
- GET `/api/admin/payouts/:id` - Payout details
- POST `/api/admin/payouts/:id/process` - Process payout (Website Admin)
- GET `/api/admin/payouts/summary` - Payout statistics

---

### Settings Page
**Location:** `src/admin/pages/Settings.jsx`

**Route:** `/admin` with `currentPage = 'settings'`

**Status:** Placeholder (ComingSoon component)

**Intended Purpose:**
- Admin account settings
- Shop settings (for Shop Admin): business info, pickup windows, notifications
- Platform settings (for Website Admin): commission rates, policies, email templates
- Password change
- Notification preferences
- API keys (for integrations)

**Backend Needs:**
- GET `/api/admin/settings` - Get current settings
- PUT `/api/admin/settings` - Update settings
- PUT `/api/admin/settings/password` - Change password
- GET `/api/admin/settings/notifications` - Notification preferences
- PUT `/api/admin/settings/notifications` - Update preferences

---

## Public Pages

### Home Page
**Location:** `src/Pages/Home.jsx`

Landing page with sections:
- Hero banner
- Featured products
- Categories
- How it works
- Testimonials
- About us
- Advisors
- Milestones
- App download

### Shop Page
**Location:** `src/Pages/Shop.jsx`

Product marketplace with:
- Product grid
- Sidebar filters (category, price, rating)
- Search functionality
- Pagination

**Backend Needs:**
- GET `/api/products?page=1&category=&minPrice=&maxPrice=&search=`

### Product Details
**Location:** `src/Pages/ProductDetails.jsx`

Single product view with:
- Image gallery
- Product information
- Add to cart
- Related products

**Backend Needs:**
- GET `/api/products/:id`
- GET `/api/products/:id/related`

### Cart
**Location:** `src/Pages/Cart.jsx`

Shopping cart with:
- Cart items list
- Quantity controls
- Price calculation
- Checkout button

**Backend Needs:**
- GET `/api/cart`
- POST `/api/cart/items`
- PUT `/api/cart/items/:id`
- DELETE `/api/cart/items/:id`
- POST `/api/checkout`

### Authentication

**Login:** `src/Pages/Login.jsx`
- Email/password login
- Social login options
- Forgot password link

**Backend Needs:**
- POST `/api/auth/login` - Body: `{ email, password }`
- POST `/api/auth/social` - Social authentication

**Sign Up:** `src/Pages/SignUp.jsx`
- User registration form
- Email verification

**Backend Needs:**
- POST `/api/auth/register` - Body: `{ name, email, password, role }`
- POST `/api/auth/verify-email` - Body: `{ token }`

### User Profile Pages

**My Profile:** `src/Pages/MyProfile.jsx`
- User information
- Address management
- Payment methods

**Backend Needs:**
- GET `/api/users/profile`
- PUT `/api/users/profile`

**My Orders:** `src/Pages/MyOrders.jsx`
- Order history
- Order tracking
- Reorder functionality

**Backend Needs:**
- GET `/api/users/orders?page=1&status=`
- GET `/api/users/orders/:id`

**My Impact:** `src/Pages/MyImpact.jsx`
- Environmental impact tracking
- CO2e saved statistics
- Achievements/badges

**Backend Needs:**
- GET `/api/users/impact`

### Other Pages

**Category Page:** `src/Pages/CategoryPage.jsx`
**Contact Us:** `src/Pages/ContactUs.jsx`
**FAQ:** `src/Pages/FAQ.jsx`
**Business Verification:** `src/Pages/BusinessVerification.jsx`
**Pending Review:** `src/Pages/PendingReview.jsx`
**Notifications:** `src/Pages/Notification.jsx`

---

## Components

### Admin Layout Components

#### Header
**Location:** `src/admin/components/layout/Header.jsx`

**Features:**
- Search bar (global search - not yet implemented)
- Notification dropdown (10 notifications, shows 8 latest with scroll)
- Profile dropdown (user info, menu items, sign out)
- Admin mode toggle button

**Notification Dropdown:**
- Position: Top-right, below bell icon
- Z-index: 9999 (ensures it appears above other elements)
- Max height: 320px (shows ~4 notifications)
- Scrollable list
- Close button (X icon)
- Dummy data: 10 hardcoded notifications

**Profile Dropdown:**
- Position: Top-right, below user icon
- Shows: User avatar, name (Tresor Shingiro), email
- Menu items: Edit Profile, Account Settings, Support, Sign Out
- Uses Lucide icons: User, Settings, HelpCircle, LogOut

**State:** 
```javascript
const [showNotifications, setShowNotifications] = useState(false)
const [showProfileMenu, setShowProfileMenu] = useState(false)
```

**Click-outside detection:** Uses `useRef` and `useEffect` to close dropdowns when clicking outside

**Backend Needs:**
- GET `/api/notifications?limit=10` - Fetch notifications
- PUT `/api/notifications/:id/read` - Mark as read
- GET `/api/users/profile` - User info for profile dropdown

#### Sidebar
**Location:** `src/admin/components/layout/Sidebar.jsx`

**Features:**
- Logo/brand
- Navigation menu (changes based on admin mode)
- Active page highlighting
- Icon + text menu items

**Menu Structure:**

**Shop Admin:**
```javascript
[
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { 
    id: 'listings', 
    label: 'Listings', 
    icon: Package,
    submenu: [
      { id: 'all-listings', label: 'All Listings' },
      { id: 'new-listing', label: 'New Listing' }
    ]
  },
  { id: 'payouts', label: 'Payouts', icon: DollarSign },
  { id: 'settings', label: 'Settings', icon: Settings }
]
```

**Website Admin:**
```javascript
[
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { 
    id: 'users', 
    label: 'Users', 
    icon: Users,
    submenu: [
      { id: 'users', label: 'All Users' },
      { id: 'user-activity', label: 'User Activity' }
    ]
  },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { 
    id: 'listings', 
    label: 'Listings', 
    icon: Package,
    submenu: [
      { id: 'all-listings', label: 'All Listings' },
      { id: 'new-listing', label: 'New Listing' }
    ]
  },
  { id: 'vendors', label: 'Vendors', icon: Store },
  { id: 'disputes', label: 'Disputes', icon: AlertCircle },
  { id: 'payouts', label: 'Payouts', icon: DollarSign },
  { id: 'settings', label: 'Settings', icon: Settings }
]
```

**Navigation:** Calls `onPageChange(pageId)` prop when menu item clicked

### Dashboard Content Components

All located in `src/admin/components/Content/`

**StatsGrid.jsx** - Statistics cards with icons
**ChartSection.jsx** - Container for charts
**RevenueChart.jsx** - Bar chart showing daily revenue
**SalesChart.jsx** - Line chart showing sales over time
**OrderTrendsChart.jsx** - Line chart with period toggle buttons
**ActivityFeed.jsx** - Timeline of recent activities
**TableSection.jsx** - Recent orders table

---

## Context & State Management

### AdminModeContext
**Location:** `src/admin/context/AdminModeContext.jsx`

Manages admin mode switching between 'shop' and 'website'.

**Provider:** Wraps entire Dashboard component in `Dashboard.jsx`

**Consumers:**
- Header.jsx (toggle button)
- Sidebar.jsx (menu items)
- StatsGrid.jsx (different stats)
- Content.jsx (conditional rendering)

### AppContext
**Location:** `src/context/AppContext.jsx`

Global app state for public pages (cart, user, etc.)

**Note:** Not currently implemented/used extensively. Backend should implement proper state management or use React Query/SWR for data fetching.

---

## Styling & Theming

### Tailwind Configuration
**Location:** `tailwind.config.js`

**Custom Colors:**
```javascript
colors: {
  solid: '#00A86B',      // Primary green
  solidOne: '#FF7A00',   // Primary orange
  solidTwo: '#FFB366',   // Light orange
  tertiary: '#007A4B'    // Dark green
}
```

**Dark Mode:** Class-based (`dark:` prefix)

### CSS Variables
**Location:** `src/index.css`

```css
:root {
  --color-solid: #00A86B;
  --color-solidOne: #FF7A00;
  --color-solidTwo: #FFB366;
  --color-tertiary: #007A4B;
}
```

### Font Sizes
Admin dashboard uses smaller fonts for compact UI:
- Stats titles: `text-[10px]`
- Stats values: `text-xl`
- Table headers: `text-[10px]`
- Table content: `text-xs`
- Buttons: `text-xs`
- Search/filters: `text-xs`

---

## Backend Integration Points

### Authentication & Authorization

**Required Endpoints:**
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh-token
GET /api/auth/verify-token
```

**Admin Access:**
- Backend should check user role before allowing admin dashboard access
- Roles: `customer`, `shop_admin`, `website_admin`
- Shop Admin can only see their own shop data
- Website Admin can see all platform data

### Admin Dashboard API Structure

**Pattern:** All admin endpoints should follow `/api/admin/*` structure

**Authentication:** 
- All admin endpoints require JWT token
- Token should include user role
- Middleware to verify admin role before processing

**Pagination:**
- Standard format: `?page=1&limit=20`
- Response: `{ data: [], page: number, limit: number, total: number, totalPages: number }`

**Search & Filters:**
- Query parameters: `?search=term&status=active&dateFrom=2026-01-01&dateTo=2026-01-31`
- Backend should sanitize and validate all inputs

### Product Data Structure

Based on `assets/assets.js`:
```javascript
{
  _id: string,
  name: string,
  price: number,
  originalPrice: number,
  category: string,
  image: string[],  // array of image URLs
  images: string[], // alias for image
  description: string,
  pickupTime: string, // "12:00 PM - 6:00 PM"
  expiryDate: string,
  vendor: {
    name: string,
    location: string,
    rating: number
  },
  stock: number,      // Add this field
  status: string,     // Add this: 'active' | 'inactive' | 'expired'
  createdAt: string,
  updatedAt: string
}
```

### Order Data Structure
```javascript
{
  _id: string,
  orderId: string,    // Display ID (e.g., "#12345")
  customer: {
    _id: string,
    name: string,
    email: string
  },
  vendor: {
    _id: string,
    name: string
  },
  items: [
    {
      product: { _id, name, price },
      quantity: number,
      subtotal: number
    }
  ],
  total: number,
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled',
  pickupTime: string,
  createdAt: string,
  updatedAt: string,
  timeline: [
    {
      status: string,
      timestamp: string,
      note: string
    }
  ]
}
```

### User Data Structure
```javascript
{
  _id: string,
  name: string,
  email: string,
  role: 'customer' | 'shop_admin' | 'website_admin',
  status: 'active' | 'suspended' | 'pending',
  avatar: string,
  phone: string,
  address: {
    street: string,
    city: string,
    state: string,
    zip: string
  },
  createdAt: string,
  lastLogin: string,
  emailVerified: boolean
}
```

### Vendor Data Structure
```javascript
{
  _id: string,
  businessName: string,
  ownerName: string,
  email: string,
  phone: string,
  location: {
    address: string,
    city: string,
    state: string,
    coordinates: { lat: number, lng: number }
  },
  status: 'pending' | 'active' | 'suspended',
  rating: number,
  totalOrders: number,
  totalRevenue: number,
  documents: {
    businessLicense: string,
    foodPermit: string
  },
  pickupHours: {
    start: string,
    end: string
  },
  createdAt: string,
  approvedAt: string
}
```

### Notification Data Structure
```javascript
{
  _id: string,
  userId: string,
  type: 'order' | 'payout' | 'dispute' | 'system',
  title: string,
  message: string,
  read: boolean,
  link: string,  // URL to navigate to
  createdAt: string
}
```

### Critical Backend Tasks

1. **Implement DisputesTable Component**
   - Create `src/admin/components/Content/DisputesTable.jsx`
   - Similar to TableSection.jsx but for disputes
   - Columns: Dispute ID, Customer, Vendor, Issue Type, Date, Status, Actions

2. **Real Data Integration**
   - Replace all dummy data with API calls
   - Use React Query or SWR for data fetching
   - Implement loading and error states
   - Add retry logic for failed requests

3. **Image Upload**
   - Implement image upload in New Listing page
   - Use FormData for multipart/form-data
   - Support multiple images
   - Image optimization and resizing on backend
   - CDN integration for image delivery

4. **Real-time Updates**
   - Consider WebSocket connection for real-time notifications
   - Live order status updates
   - Push notifications for critical events

5. **Export Functionality**
   - Add export buttons to tables (Orders, Listings, Users)
   - Backend endpoints to generate CSV/Excel files
   - Date range selection for exports

6. **Search Implementation**
   - Global search in header (search across all entities)
   - Debounced search input
   - Search suggestions/autocomplete
   - Backend full-text search

7. **Permissions System**
   - Fine-grained permissions beyond admin mode
   - Permission checks on every endpoint
   - Frontend should hide/disable actions based on permissions

---

## Development Notes

### Current Limitations

1. **No Backend Connection**
   - All data is static/dummy data
   - No real authentication
   - No data persistence

2. **Placeholder Pages**
   - Most admin pages show "Coming Soon"
   - Only All Listings page is fully implemented
   - Need to build out each page following Listings.jsx pattern

3. **Missing Components**
   - DisputesTable.jsx not created
   - Form components for New Listing, Settings
   - Rich text editor for product descriptions
   - Image upload component

4. **No Error Handling**
   - No loading states
   - No error boundaries
   - No retry mechanisms

### Recommended Next Steps for Backend Developer

1. **Set up authentication system**
   - JWT tokens
   - Refresh token mechanism
   - Role-based access control

2. **Create database schema**
   - Users, Products, Orders, Vendors, Disputes tables
   - Proper indexing for search performance
   - Relations and foreign keys

3. **Build admin API endpoints**
   - Follow the structure outlined in this README
   - Implement pagination, search, and filtering
   - Add proper validation and sanitization

4. **Connect frontend to backend**
   - Replace dummy data with API calls
   - Add loading and error states
   - Implement proper state management

5. **Test thoroughly**
   - Unit tests for API endpoints
   - Integration tests for auth flow
   - E2E tests for critical user journeys

---

## Additional Resources

### Key Files to Review
1. `src/admin/Dashboard.jsx` - Admin routing logic
2. `src/admin/pages/Listings.jsx` - Example of fully implemented page
3. `src/admin/components/layout/Header.jsx` - Dropdowns and toggle
4. `src/admin/context/AdminModeContext.jsx` - State management pattern
5. `src/assets/assets.js` - Dummy product data structure

### Component Patterns
- All admin components use Tailwind CSS
- Icons from Lucide React
- Dark mode support with `dark:` prefix
- Responsive design with `md:`, `lg:` breakpoints

### Questions for Product Owner
1. What permissions should each admin role have?
2. Should Shop Admins be able to see analytics for other shops?
3. What dispute resolution workflow should be implemented?
4. What are the commission rates and payout schedules?
5. What email notifications should be sent and when?

---

## Contact & Support

For questions about this frontend implementation, please contact the development team or create an issue in the repository.

**Important:** This README should be updated as new features are added or existing features change. Keep it synchronized with the actual codebase.
