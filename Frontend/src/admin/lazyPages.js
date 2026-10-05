import { lazy } from 'react';

// Each dashboard page is its own chunk: opening Orders no longer downloads Analytics,
// Settings and the charting library along with it.
const named = (load, name) => lazy(() => load().then((m) => ({ default: m[name] })));

export const Impact = named(() => import('./pages/Analytics'), 'Impact');
export const Insights = named(() => import('./pages/Analytics'), 'Insights');
export const Overview = named(() => import('./pages/Analytics'), 'Overview');
export const Reports = named(() => import('./pages/Analytics'), 'Reports');
export const DashboardNotifications = lazy(() => import('./pages/DashboardNotifications'));
export const CustomerComplaints = named(() => import('./pages/Disputes'), 'CustomerComplaints');
export const RefundRequests = named(() => import('./pages/Disputes'), 'RefundRequests');
export const AllListings = named(() => import('./pages/Listings'), 'AllListings');
export const NewListing = named(() => import('./pages/Listings'), 'NewListing');
export const AllOrders = named(() => import('./pages/Orders'), 'AllOrders');
export const CompletedOrders = named(() => import('./pages/Orders'), 'CompletedOrders');
export const Deliveries = named(() => import('./pages/Orders'), 'Deliveries');
export const PendingOrders = named(() => import('./pages/Orders'), 'PendingOrders');
export const Payouts = lazy(() => import('./pages/Payouts'));
export const Riders = lazy(() => import('./pages/Riders'));
export const Settings = lazy(() => import('./pages/Settings'));
export const AllUsers = named(() => import('./pages/Users'), 'AllUsers');
export const RolesPermissions = named(() => import('./pages/Users'), 'RolesPermissions');
export const UserActivity = named(() => import('./pages/Users'), 'UserActivity');
export const AllVendors = named(() => import('./pages/Vendors'), 'AllVendors');
export const VendorApproval = named(() => import('./pages/Vendors'), 'VendorApproval');

export const Reviews = lazy(() => import('./pages/Reviews'));
