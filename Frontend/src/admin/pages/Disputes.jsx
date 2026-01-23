import React, { useState } from 'react'
import { Search, History, RotateCw, AlertTriangle, AlertCircle, AlertOctagon, CheckCircle, Phone, MessageSquare, ShieldAlert, Check, BadgeDollarSign, TruckIcon, Clock, Package, Store, Truck, DollarSign, CircleCheck, X, FileText, MapPin, User, Calendar, Image as ImageIcon } from 'lucide-react'

// Placeholder for RefundRequests component
export const RefundRequests = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Refund Requests</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Coming Soon</p>
      </div>
    </div>
  );
};

// Dummy complaints/issues data
const dummyIssues = [
  {
    id: 1,
    orderId: "ORD-2024-1234",
    orderValue: 45000,
    priority: "critical",
    type: "vendor",
    title: "Vendor Unresponsive",
    incident: "Vendor has not responded to customer messages for over 2 hours. Customer is waiting for order confirmation.",
    fullComplaint: "I placed an order at 8:30 AM and the vendor confirmed they would prepare it. However, it's now been over 2 hours and they haven't responded to any of my messages asking for an update. I've sent 5 messages through the app and called twice, but no one is picking up. This is very frustrating as I need the food for an important meeting. I'm a VIP customer and this level of service is unacceptable.",
    since: "10:45 AM",
    reportedAt: "2026-01-19T10:45:00",
    customer: {
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+233 24 123 4567",
      status: "VIP Customer",
      location: "Accra, Ghana",
      image: null
    },
    vendor: {
      name: "Mama's Kitchen",
      phone: "+233 20 555 7890",
      location: "East Legon, Accra"
    },
    deliveryStatus: "pending",
    rider: null,
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
    ],
    timeline: [
      { time: "8:30 AM", event: "Order placed" },
      { time: "8:45 AM", event: "Vendor confirmed order" },
      { time: "9:30 AM", event: "First message to vendor" },
      { time: "10:00 AM", event: "Multiple follow-up messages sent" },
      { time: "10:45 AM", event: "Complaint filed" }
    ],
    actions: ["call", "message", "alert", "resolve"]
  },
  {
    id: 2,
    orderId: "ORD-2024-1235",
    orderValue: 28500,
    priority: "high",
    type: "missing",
    title: "Missing Item",
    incident: "Customer reports that 2 items are missing from their delivered order. They've provided photos as evidence.",
    fullComplaint: "I received my order 20 minutes ago, but when I opened the bags, I noticed that 2 items are missing - the grilled chicken and the coleslaw that I specifically ordered. I've taken pictures of what I received vs what the receipt shows. This is really disappointing as I paid for a complete meal.",
    since: "11:20 AM",
    reportedAt: "2026-01-19T11:20:00",
    customer: {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+233 20 987 6543",
      status: "Frequent Orderer",
      location: "Tema, Ghana",
      image: null
    },
    vendor: {
      name: "Tasty Bites Restaurant",
      phone: "+233 24 666 7777",
      location: "Tema Community 1"
    },
    deliveryStatus: "delivered",
    rider: {
      name: "Kwame Mensah",
      phone: "+233 55 111 2222",
      vehicleNumber: "GT-4567-21"
    },
    images: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400"
    ],
    timeline: [
      { time: "10:30 AM", event: "Order placed" },
      { time: "10:45 AM", event: "Order confirmed by vendor" },
      { time: "11:00 AM", event: "Rider assigned" },
      { time: "11:05 AM", event: "Order picked up" },
      { time: "11:15 AM", event: "Order delivered" },
      { time: "11:20 AM", event: "Complaint filed - Missing items" }
    ],
    actions: ["call", "refund", "alert", "resolve"]
  },
  {
    id: 3,
    orderId: "ORD-2024-1236",
    orderValue: 15000,
    priority: "medium",
    type: "delivery",
    title: "Late Delivery",
    incident: "Order was scheduled for 12:00 PM but hasn't arrived yet. Customer has an important event.",
    fullComplaint: "I ordered food for a business lunch scheduled at 12:00 PM. It's now 12:30 PM and my food hasn't arrived. The rider hasn't called or sent any updates. I've been tracking the order and it seems like the rider is stuck somewhere. This is very unprofessional and I have guests waiting. I need this resolved immediately or I'll need a full refund.",
    since: "12:30 PM",
    reportedAt: "2026-01-19T12:30:00",
    customer: {
      name: "Michael Brown",
      email: "michael.brown@email.com",
      phone: "+233 24 555 1234",
      status: "New Customer",
      location: "Osu, Accra",
      image: null
    },
    vendor: {
      name: "Quick Meals Express",
      phone: "+233 20 444 5555",
      location: "Labadi, Accra"
    },
    deliveryStatus: "in_transit",
    rider: {
      name: "Emmanuel Osei",
      phone: "+233 59 333 4444",
      vehicleNumber: "GT-8901-21"
    },
    images: null,
    timeline: [
      { time: "11:15 AM", event: "Order placed" },
      { time: "11:25 AM", event: "Vendor confirmed - Est. ready 11:45 AM" },
      { time: "11:50 AM", event: "Rider assigned" },
      { time: "12:00 PM", event: "Order picked up" },
      { time: "12:30 PM", event: "Complaint filed - Delayed delivery" }
    ],
    actions: ["call", "track", "alert", "resolve"]
  },
  {
    id: 4,
    orderId: "ORD-2024-1237",
    orderValue: 52000,
    priority: "critical",
    type: "missing",
    title: "Incorrect Order",
    incident: "Customer received completely wrong items. They ordered vegetables but received meat products.",
    since: "9:15 AM",
    customer: {
      name: "Emily Davis",
      phone: "+233 20 444 5678",
      status: "VIP Customer",
      image: null
    },
    actions: ["call", "refund", "alert", "resolve"]
  },
  {
    id: 5,
    orderId: "ORD-2024-1238",
    orderValue: 33000,
    priority: "high",
    type: "other",
    title: "Request Refund",
    incident: "Customer wants full refund due to poor quality of delivered items. Multiple items were spoiled.",
    since: "11:50 AM",
    customer: {
      name: "David Wilson",
      phone: "+233 24 777 8899",
      status: "Frequent Orderer",
      image: null
    },
    actions: ["call", "refund", "alert", "resolve"]
  },
  {
    id: 6,
    orderId: "ORD-2024-1239",
    orderValue: 19500,
    priority: "medium",
    type: "vendor",
    title: "Vendor Issues",
    incident: "Vendor marked items as available but they're actually out of stock. Customer frustrated.",
    since: "1:10 PM",
    customer: {
      name: "Lisa Anderson",
      phone: "+233 20 333 2222",
      status: "New Customer",
      image: null
    },
    actions: ["call", "message", "alert", "resolve"]
  },
  {
    id: 7,
    orderId: "ORD-2024-1240",
    orderValue: 41000,
    priority: "high",
    type: "delivery",
    title: "Late Delivery",
    incident: "Delivery delayed by 3 hours. Driver had vehicle issues and didn't communicate with customer.",
    since: "10:00 AM",
    customer: {
      name: "Robert Taylor",
      phone: "+233 24 111 2222",
      status: "VIP Customer",
      image: null
    },
    actions: ["call", "track", "alert", "resolve"]
  },
  {
    id: 8,
    orderId: "ORD-2024-1241",
    orderValue: 22000,
    priority: "critical",
    type: "missing",
    title: "Missing Item",
    incident: "High-value item missing from order. Customer claims entire bag of items was not delivered.",
    since: "11:35 AM",
    customer: {
      name: "Jennifer Martinez",
      phone: "+233 20 999 8888",
      status: "Frequent Orderer",
      image: null
    },
    actions: ["call", "refund", "alert", "resolve"]
  },
  {
    id: 9,
    orderId: "ORD-2024-1242",
    orderValue: 16500,
    priority: "medium",
    type: "other",
    title: "Request Refund",
    incident: "Customer not satisfied with portion sizes. Says items don't match product descriptions.",
    since: "12:45 PM",
    customer: {
      name: "Christopher Lee",
      phone: "+233 24 666 7777",
      status: "New Customer",
      image: null
    },
    actions: ["call", "refund", "alert", "resolve"]
  },
  {
    id: 10,
    orderId: "ORD-2024-1243",
    orderValue: 38000,
    priority: "high",
    type: "vendor",
    title: "Vendor Unresponsive",
    incident: "Vendor hasn't confirmed order after 1 hour. Customer needs items urgently for an event.",
    since: "1:25 PM",
    customer: {
      name: "Amanda White",
      phone: "+233 20 222 3333",
      status: "VIP Customer",
      image: null
    },
    actions: ["call", "message", "alert", "resolve"]
  }
];

export const CustomerComplaints = () => {
  const [issues, setIssues] = useState(dummyIssues);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState('priority');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const itemsPerPage = 9;

  // Calculate stats
  const stats = {
    critical: issues.filter(i => i.priority === 'critical').length,
    high: issues.filter(i => i.priority === 'high').length,
    medium: issues.filter(i => i.priority === 'medium').length,
    resolvedToday: 8 // This would come from API in real app
  };

  const activeIssues = issues.filter(i => i.priority === 'critical' || i.priority === 'high').length;

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || issue.type === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Get category counts
  const categoryCounts = {
    all: issues.length,
    missing: issues.filter(i => i.type === 'missing').length,
    vendor: issues.filter(i => i.type === 'vendor').length,
    delivery: issues.filter(i => i.type === 'delivery').length
  };

  // Pagination
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIssues = filteredIssues.slice(startIndex, endIndex);
  const showingFrom = filteredIssues.length > 0 ? startIndex + 1 : 0;
  const showingTo = Math.min(endIndex, filteredIssues.length);

  const handleResolve = (issueId) => {
    setIssues(prev => prev.filter(i => i.id !== issueId));
  };

  const statsCards = [
    {
      title: 'Critical Priority',
      value: stats.critical,
      subtitle: 'Avg wait: 12m',
      icon: <AlertOctagon className='w-6 h-6' />,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'High Priority',
      value: stats.high,
      subtitle: 'Avg wait: 30m',
      icon: <AlertTriangle className='w-6 h-6' />,
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Medium Priority',
      value: stats.medium,
      subtitle: 'Avg wait: 1h',
      icon: <AlertCircle className='w-6 h-6' />,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Resolved Today',
      value: stats.resolvedToday,
      subtitle: 'Avg Resolution: 8m',
      icon: <CircleCheck className='w-6 h-6' />,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
  ];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const getActionButton = (action, issue) => {
    switch(action) {
      case 'call':
        return (
          <button className='flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer'>
            <Phone className='w-4 h-4' />
            Call
          </button>
        );
      case 'message':
        return (
          <button className='flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer'>
            <MessageSquare className='w-4 h-4' />
            Message
          </button>
        );
      case 'refund':
        return (
          <button className='flex items-center gap-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer'>
            <BadgeDollarSign className='w-4 h-4' />
            Refund
          </button>
        );
      case 'track':
        return (
          <button className='flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer'>
            <TruckIcon className='w-4 h-4' />
            Track
          </button>
        );
      case 'alert':
        return (
          <button 
            onClick={() => setSelectedIssue(issue)}
            className='flex items-center gap-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer'
          >
            <ShieldAlert className='w-4 h-4' />
          </button>
        );
      case 'resolve':
        return (
          <button 
            onClick={() => handleResolve(issue.id)}
            className='flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer'
          >
            <Check className='w-4 h-4' />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 dark:text-white'>Problem Queue</h1>
          <p className='text-sm text-slate-600 dark:text-slate-400 mt-1'>
            {activeIssues} active issues require immediate resolution
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button className='flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer'>
            <History className='w-4 h-4' />
            History
          </button>
          <button className='flex items-center gap-2 px-4 py-2 bg-solid hover:bg-tertiary text-white rounded-lg text-xs font-medium transition-colors cursor-pointer'>
            <RotateCw className='w-4 h-4' />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
        {statsCards.map((stat, index) => (
          <div key={index} className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 group'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>
                  {stat.title}
                </p>
                <p className='text-2xl font-bold text-slate-800 dark:text-white mb-1'>
                  {stat.value}
                </p>
                <p className='text-[11px] text-slate-500 dark:text-slate-500'>
                  {stat.subtitle}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-all duration-300`}>
                <div className={stat.iconColor}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className='relative z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 space-y-4'>
        {/* Search Bar */}
        <div className='relative'>
          <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
          <input
            type="text"
            placeholder='Filter by order ID, customer name, or vendor name...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'
          />
        </div>

        {/* Category and Priority Filters */}
        <div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
          {/* Category Buttons */}
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-solid text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Issues ({categoryCounts.all})
            </button>
            <button
              onClick={() => setCategoryFilter('missing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                categoryFilter === 'missing'
                  ? 'bg-solid text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Missing Items ({categoryCounts.missing})
            </button>
            <button
              onClick={() => setCategoryFilter('vendor')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                categoryFilter === 'vendor'
                  ? 'bg-solid text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Vendor Issues ({categoryCounts.vendor})
            </button>
            <button
              onClick={() => setCategoryFilter('delivery')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                categoryFilter === 'delivery'
                  ? 'bg-solid text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Late Delivery ({categoryCounts.delivery})
            </button>
          </div>

          {/* Priority and Sort Filters */}
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <button
                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                className='flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer'
              >
                Priority Filter
              </button>
            {showPriorityMenu && (
              <div className='absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-60 p-2'>
                <button
                  onClick={() => {
                    setPriorityFilter('all');
                    setShowPriorityMenu(false);
                  }}
                  className='w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer'
                >
                  All Priorities
                </button>
                <button
                  onClick={() => {
                    setPriorityFilter('critical');
                    setShowPriorityMenu(false);
                  }}
                  className='w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer'
                >
                  Critical
                </button>
                <button
                  onClick={() => {
                    setPriorityFilter('high');
                    setShowPriorityMenu(false);
                  }}
                  className='w-full text-left px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors cursor-pointer'
                >
                  High
                </button>
                <button
                  onClick={() => {
                    setPriorityFilter('medium');
                    setShowPriorityMenu(false);
                  }}
                  className='w-full text-left px-3 py-2 text-sm text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md transition-colors cursor-pointer'
                >
                  Medium
                </button>
              </div>
            )}
            </div>
            
            {/* Sort Order Filter */}
            <div className='relative'>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className='flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer'
              >
                Sort Order
              </button>
              {showSortMenu && (
                <div className='absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-60 p-2'>
                  <button
                    onClick={() => {
                      setSortBy('priority');
                      setShowSortMenu(false);
                    }}
                    className='w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer'
                  >
                    By Priority (Default)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('received');
                      setShowSortMenu(false);
                    }}
                    className='w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer'
                  >
                    By Time Received
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Issues Kanban Cards */}
      <div className='relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
        {currentIssues.map((issue) => {
          const getBorderColor = (priority) => {
            if (priority === 'critical') return 'border-red-500 dark:border-red-500';
            if (priority === 'high') return 'border-orange-500 dark:border-orange-500';
            return 'border-slate-200/50 dark:border-slate-700/50';
          };
          
          return (
          <div key={issue.id} className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border-2 ${getBorderColor(issue.priority)} hover:shadow-xl transition-all duration-300 flex flex-col h-full`}>
            {/* Header with Priority Tag and Time */}
            <div className='flex items-start justify-between mb-3'>
              <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase border ${getPriorityColor(issue.priority)}`}>
                {issue.priority}
              </span>
              <div className='flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400'>
                <Clock className='w-3.5 h-3.5' />
                since {issue.since}
              </div>
            </div>

            {/* Title - Fixed Height */}
            <h3 className='text-[15px] font-bold text-slate-800 dark:text-white mb-3 h-11 line-clamp-2'>
              {issue.title}
            </h3>

            {/* Incident Description - Fixed Height with Scrollable Content */}
            <div className='p-3 bg-slate-50 dark:bg-slate-800 rounded-lg mb-3 h-[120px] overflow-y-auto'>
              <p className='text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1'>Incident:</p>
              <p className='text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed'>
                {issue.incident}
              </p>
            </div>

            {/* Order Info */}
            <div className='flex items-center justify-between py-2 border-y border-slate-200 dark:border-slate-700 mb-3'>
              <span className='text-[13px] text-slate-600 dark:text-slate-400'>
                {issue.orderId}
              </span>
              <span className='text-[13px] font-bold text-solid'>
                RWF {issue.orderValue.toLocaleString()}
              </span>
            </div>

            {/* Customer Information */}
            <div className='space-y-2 mb-3 grow'>
              <p className='text-[11px] font-semibold text-slate-600 dark:text-slate-400'>Customer Information:</p>
              <div className='flex items-center gap-3'>
                <div className='w-11 h-11 rounded-full bg-solid/10 flex items-center justify-center text-solid font-semibold text-[15px] shrink-0'>
                  {issue.customer.name.charAt(0)}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-[13px] font-medium text-slate-800 dark:text-white truncate'>
                    {issue.customer.name}
                  </p>
                  <div className='flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400'>
                    <Phone className='w-3.5 h-3.5' />
                    {issue.customer.phone}
                  </div>
                </div>
              </div>
              <span className='inline-flex px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[11px] font-medium'>
                {issue.customer.status}
              </span>
            </div>

            {/* Action Buttons - Always at Bottom */}
            <div className='flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700 mt-auto'>
              {issue.actions.map((action, idx) => (
                <React.Fragment key={idx}>
                  {getActionButton(action, issue)}
                </React.Fragment>
              ))}
            </div>
          </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredIssues.length === 0 && (
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-12 border border-slate-200/50 dark:border-slate-700/50 text-center'>
          <CheckCircle className='w-16 h-16 mx-auto text-green-500 mb-4' />
          <h3 className='text-lg font-bold text-slate-800 dark:text-white mb-2'>No Issues Found</h3>
          <p className='text-sm text-slate-600 dark:text-slate-400'>
            All complaints matching your filters have been resolved or there are no active issues.
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredIssues.length > 0 && (
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between'>
          <p className='text-sm text-slate-600 dark:text-slate-400'>
            Showing {showingFrom} to {showingTo} of {filteredIssues.length} issues
          </p>
          
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className='px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer'
            >
              Previous
            </button>
            
            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-solid text-white'
                      : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className='px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer'
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Complaint Details Sidebar */}
      {selectedIssue && (
        <>
          <div className="fixed inset-0 bg-black/30 z-9999" onClick={() => setSelectedIssue(null)}></div>
          <div className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white dark:bg-slate-900 shadow-2xl z-10000 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5">
              {/* Header with Close Button */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Complaint Details</h2>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Priority Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold uppercase border-2 ${getPriorityColor(selectedIssue.priority)}`}>
                  {selectedIssue.priority} Priority
                </span>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  Since {selectedIssue.since}
                </div>
              </div>

              {/* Order Information */}
              <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Order ID</p>
                    <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">{selectedIssue.orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Order Value</p>
                    <p className="text-sm font-bold text-solid">RWF {selectedIssue.orderValue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Issue Type</p>
                  <span className="inline-flex px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                    {selectedIssue.type.charAt(0).toUpperCase() + selectedIssue.type.slice(1)} Issue
                  </span>
                </div>
              </div>

              {/* Complaint Title */}
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{selectedIssue.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Brief Description</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedIssue.incident}</p>
              </div>

              {/* Full Complaint Text */}
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                  Full Complaint
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedIssue.fullComplaint || selectedIssue.incident}
                </p>
              </div>

              {/* Customer-Provided Photos */}
              {selectedIssue.images && selectedIssue.images.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    Customer Photos ({selectedIssue.images.length} {selectedIssue.images.length === 1 ? 'photo' : 'photos'})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Photos provided by customer as evidence</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedIssue.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-solid dark:hover:border-solid transition-colors cursor-pointer"
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Information */}
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Customer Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-solid/10 flex items-center justify-center text-solid font-semibold text-lg shrink-0">
                      {selectedIssue.customer.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedIssue.customer.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{selectedIssue.customer.email || 'No email provided'}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-blue-200 dark:border-blue-800 space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <p className="text-xs text-slate-700 dark:text-slate-300">{selectedIssue.customer.phone}</p>
                    </div>
                    {selectedIssue.customer.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs text-slate-700 dark:text-slate-300">{selectedIssue.customer.location}</p>
                      </div>
                    )}
                    <span className="inline-flex px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium mt-2">
                      {selectedIssue.customer.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vendor Information */}
              {selectedIssue.vendor && (
                <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Vendor Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Business Name</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedIssue.vendor.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <p className="text-xs text-slate-700 dark:text-slate-300">{selectedIssue.vendor.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <p className="text-xs text-slate-700 dark:text-slate-300">{selectedIssue.vendor.location}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rider Information - Show if order was delivered or in transit */}
              {selectedIssue.rider && (selectedIssue.deliveryStatus === 'delivered' || selectedIssue.deliveryStatus === 'in_transit') && (
                <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    Rider Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-600/10 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold shrink-0">
                        {selectedIssue.rider.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedIssue.rider.name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{selectedIssue.deliveryStatus === 'delivered' ? 'Delivered order' : 'Currently delivering'}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-orange-200 dark:border-orange-800 space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                        <p className="text-xs text-slate-700 dark:text-slate-300">{selectedIssue.rider.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                        <p className="text-xs text-slate-700 dark:text-slate-300">Vehicle: {selectedIssue.rider.vehicleNumber}</p>
                      </div>
                    </div>
                    {selectedIssue.type === 'delivery' && selectedIssue.deliveryStatus === 'in_transit' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Reassign order ${selectedIssue.orderId} to a different rider?`)) {
                            alert('Order reassignment initiated. A new rider will be assigned shortly.');
                          }
                        }}
                        className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-3 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        Reassign to Another Rider
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {selectedIssue.timeline && selectedIssue.timeline.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    Issue Timeline
                  </h4>
                  <div className="space-y-2">
                    {selectedIssue.timeline.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="w-2 h-2 bg-solid rounded-full mt-1.5 shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-900 dark:text-white">{item.event}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>

              {/* Quick Actions */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                    <Phone className="w-4 h-4" />
                    Call Customer
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                    <BadgeDollarSign className="w-4 h-4" />
                    Issue Refund
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                    <TruckIcon className="w-4 h-4" />
                    Track Order
                  </button>
                </div>
              </div>

              {/* Resolve Button */}
              <button
                onClick={() => {
                  handleResolve(selectedIssue.id);
                  setSelectedIssue(null);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Resolved
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

