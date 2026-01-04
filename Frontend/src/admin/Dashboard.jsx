import React, { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Content from './components/Content/Content';
import { AdminModeProvider } from './context/AdminModeContext';
// Analytics pages
import { Overview, Reports, Insights, Impact } from './pages/Analytics';
// Users pages
import { AllUsers, RolesPermissions, UserActivity } from './pages/Users';
// Orders pages
import { AllOrders, PendingOrders, CompletedOrders, Deliveries } from './pages/Orders';
// Listings pages
import { AllListings, NewListing } from './pages/Listings';
// Vendors pages
import { AllVendors, VendorApproval } from './pages/Vendors';
// Disputes pages
import { RefundRequests, CustomerComplaints } from './pages/Disputes';
// Other pages
import Payouts from './pages/Payouts';
import Settings from './pages/Settings';

const Dashboard = () => {

   const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
   const [currentPage, setCurrentPage] = useState("dashboard");

   const renderPage = () => {
     switch(currentPage) {
       case 'dashboard':
         return <Content />;
       // Analytics
       case 'overview':
         return <Overview />;
       case 'reports':
         return <Reports />;
       case 'insights':
         return <Insights />;
       case 'impact':
         return <Impact />;
       // Users
       case 'all-users':
         return <AllUsers />;
       case 'roles':
         return <RolesPermissions />;
       case 'activity':
         return <UserActivity />;
       // Orders
       case 'all-orders':
         return <AllOrders />;
       case 'pending-orders':
         return <PendingOrders />;
       case 'completed-orders':
         return <CompletedOrders />;
       case 'deliveries':
         return <Deliveries />;
       // Listings
       case 'all-listings':
         return <AllListings />;
       case 'new-listing':
         return <NewListing />;
       // Vendors
       case 'all-vendors':
         return <AllVendors />;
       case 'vendor-approval':
         return <VendorApproval />;
       // Disputes
       case 'refunds':
         return <RefundRequests />;
       case 'complaints':
         return <CustomerComplaints />;
       // Other
       case 'payouts':
         return <Payouts />;
       case 'settings':
         return <Settings />;
       default:
         return <Content />;
     }
   };

  return (
    <AdminModeProvider>
      <div className='min-h-scren bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500'>
          <div className='flex h-screen overflow-hidden'>
             <Sidebar 
             collapsed = {sideBarCollapsed} 
             onToggle = {() => setSideBarCollapsed(!sideBarCollapsed)}
             currentPage={currentPage} setCurrentPage={setCurrentPage}
             onPageChange={setCurrentPage}
              />
             <div className='flex-1 flex flex-col overflow-hidden'>
                <Header onMenuClick={() => setSideBarCollapsed(!sideBarCollapsed)} />

                  <div className='flex-1 overflow-y-auto bg-transparent'>
                    <div className='p-6 space-y-6'>
                       {renderPage()}
                    </div>
                  </div>
             </div>
          </div>
      </div>
    </AdminModeProvider>
  )
}

export default Dashboard
