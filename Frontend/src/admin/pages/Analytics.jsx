import React, { useState, useEffect } from 'react'
import { useAdminMode } from '../context/AdminModeContext'
import analyticsService from '../../services/analyticsService'
import { TrendingUp, TrendingDown, Leaf, Droplet, UtensilsCrossed, ArrowUpRight, ArrowDownRight, Download, FileText, BarChart3, PieChart as PieChartIcon, Calendar, Clock, Users, ShoppingCart, Package, Award, Car, Trees, Waves, Home, Sparkles } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts'

// Shop Admin Overview Component
const ShopAdminOverview = () => {
  const [loading, setLoading] = useState(true)
  const [businessData, setBusinessData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true)
        const response = await analyticsService.getBusinessOverview()
        setBusinessData(response)
      } catch (err) {
        console.error('Error fetching business data:', err)
        setError(err.message || 'Failed to load business data')
      } finally {
        setLoading(false)
      }
    }
    fetchBusinessData()
  }, [])

  // Format weekly trend data from API response or use placeholder
  const salesTrendData = businessData?.weeklyTrend?.length > 0
    ? businessData.weeklyTrend.map((week, index) => ({
        week: `Week ${index + 1}`,
        sales: week.sales || 0,
        orders: week.orders || 0
      }))
    : [
        { week: 'Week 1', sales: 0, orders: 0 },
        { week: 'Week 2', sales: 0, orders: 0 },
        { week: 'Week 3', sales: 0, orders: 0 },
        { week: 'Week 4', sales: 0, orders: 0 },
      ]

  // Top selling products from API or empty array
  const topProducts = businessData?.topProducts?.map((product, index) => ({
    rank: index + 1,
    name: product.name || 'Unknown Product',
    sold: product.sold || 0,
    revenue: `RWF ${(product.revenue || 0).toLocaleString()}`,
    stock: product.stock || 0
  })) || []

  // Calculate totals from API data
  const totalRevenue = businessData?.stats?.totalRevenue || 0
  const totalOrders = businessData?.stats?.totalOrders || 0
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  // Placeholder percentage changes (would need historical data to calculate)
  const revenueChange = 0
  const ordersChange = 0
  const avgOrderChange = 0

  const currentWeekSales = salesTrendData[salesTrendData.length - 1]?.sales || 0
  const previousWeekSales = salesTrendData[salesTrendData.length - 2]?.sales || 1
  const weeklyChange = previousWeekSales > 0
    ? ((currentWeekSales - previousWeekSales) / previousWeekSales * 100).toFixed(1)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-solid border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading business data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading data</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Shop Overview</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View your shop's performance metrics and insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Total Revenue */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>
                Total Revenue
              </p>
              <p className='text-2xl font-bold text-slate-800 dark:text-white mb-2'>
                RWF {totalRevenue.toLocaleString()}
              </p>
              <div className='flex items-center space-x-1.5'>
                {revenueChange > 0 ? <ArrowUpRight className='w-3 h-3 text-emerald-500'/> : <ArrowDownRight className='w-3 h-3 text-red-500'/>}
                <span className={`text-xs font-semibold ${revenueChange > 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {revenueChange > 0 ? '+' : ''}{revenueChange}%
                </span>
                <span className='text-xs text-slate-500 dark:text-slate-400'>vs Last Month</span>
              </div>
            </div>
            <div className='p-2.5 rounded-xl bg-solid/10 dark:bg-solid/20 group-hover:scale-110 transition-all duration-300'>
              <BarChart3 className='w-6 h-6 text-solid' />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>
                Total Orders
              </p>
              <p className='text-2xl font-bold text-slate-800 dark:text-white mb-2'>
                {totalOrders}
              </p>
              <div className='flex items-center space-x-1.5'>
                {ordersChange > 0 ? <ArrowUpRight className='w-3 h-3 text-emerald-500'/> : <ArrowDownRight className='w-3 h-3 text-red-500'/>}
                <span className={`text-xs font-semibold ${ordersChange > 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {ordersChange > 0 ? '+' : ''}{ordersChange}%
                </span>
                <span className='text-xs text-slate-500 dark:text-slate-400'>vs Last Month</span>
              </div>
            </div>
            <div className='p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 group-hover:scale-110 transition-all duration-300'>
              <UtensilsCrossed className='w-6 h-6 text-blue-600 dark:text-blue-400' />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>
                Avg Order Value
              </p>
              <p className='text-2xl font-bold text-slate-800 dark:text-white mb-2'>
                RWF {avgOrderValue.toLocaleString()}
              </p>
              <div className='flex items-center space-x-1.5'>
                {avgOrderChange > 0 ? <ArrowUpRight className='w-3 h-3 text-emerald-500'/> : <ArrowDownRight className='w-3 h-3 text-red-500'/>}
                <span className={`text-xs font-semibold ${avgOrderChange > 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {avgOrderChange > 0 ? '+' : ''}{avgOrderChange}%
                </span>
                <span className='text-xs text-slate-500 dark:text-slate-400'>vs Last Month</span>
              </div>
            </div>
            <div className='p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 group-hover:scale-110 transition-all duration-300'>
              <TrendingUp className='w-6 h-6 text-orange-600 dark:text-orange-400' />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3'>
          <div>
            <h3 className='text-lg font-bold text-slate-800 dark:text-white'>Sales & Orders Trend</h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>Last 30 days breakdown by week</p>
          </div>
          <div className='flex items-center gap-2'>
            <div className='px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg'>
              <span className='text-xs font-semibold text-green-600 dark:text-green-400'>
                {weeklyChange > 0 ? '+' : ''}{weeklyChange}% this week
              </span>
            </div>
          </div>
        </div>
        <div className='h-72'>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00A86B" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#00A86B" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#94a3b8" />
              <XAxis 
                dataKey="week" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                yAxisId="left"
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                width={60}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  padding: '8px 12px'
                }} 
                formatter={(value, name) => {
                  if (name === 'sales') return ['RWF ' + value.toLocaleString(), 'Sales']
                  if (name === 'orders') return [value + ' orders', 'Orders']
                }}
                labelStyle={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#00A86B" strokeWidth={2} fill="url(#salesGradient)" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top 5 Selling Products</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Best performing products this month</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Product Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Units Sold</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Stock</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.rank} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      product.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      product.rank === 2 ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                      product.rank === 3 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {product.rank}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">{product.name}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">{product.sold}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-solid">{product.revenue}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock > 50 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      product.stock > 20 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {product.stock} left
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Website Admin Overview Component
const WebsiteAdminOverview = () => {
  const [loading, setLoading] = useState(true)
  const [platformData, setPlatformData] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        setLoading(true)
        const [overviewResponse, leaderboardResponse] = await Promise.all([
          analyticsService.getPlatformOverview(),
          analyticsService.getImpactLeaderboard()
        ])
        setPlatformData(overviewResponse)
        // Format leaderboard data
        const formattedLeaderboard = leaderboardResponse.map((vendor, index) => ({
          rank: index + 1,
          name: vendor.name,
          mealsRescued: vendor.stats?.impact?.mealsRescued || 0,
          co2Saved: vendor.stats?.impact?.co2Saved || 0,
          waterSaved: vendor.stats?.impact?.waterSaved || 0
        }))
        setLeaderboard(formattedLeaderboard)
      } catch (err) {
        console.error('Error fetching platform data:', err)
        setError(err.message || 'Failed to load platform data')
      } finally {
        setLoading(false)
      }
    }
    fetchPlatformData()
  }, [])

  // Default values for when data isn't available
  const totalMealsRescued = platformData?.impact?.totalMealsRescued || 0
  const totalCo2Saved = platformData?.impact?.totalCo2Saved || 0
  const totalWaterSaved = platformData?.impact?.totalWaterSaved || 0

  // CO2e saved trend data (placeholder - can be connected to backend later)
  const co2TrendData = [
    { week: 'Week 1', co2Saved: Math.round(totalCo2Saved * 0.2), target: Math.round(totalCo2Saved * 0.18) },
    { week: 'Week 2', co2Saved: Math.round(totalCo2Saved * 0.22), target: Math.round(totalCo2Saved * 0.20) },
    { week: 'Week 3', co2Saved: Math.round(totalCo2Saved * 0.25), target: Math.round(totalCo2Saved * 0.23) },
    { week: 'Week 4', co2Saved: Math.round(totalCo2Saved * 0.33), target: Math.round(totalCo2Saved * 0.28) },
  ]

  // Use fetched leaderboard or show empty state
  const vendorLeaderboard = leaderboard.length > 0 ? leaderboard : []

  const mealsChange = 25 // Placeholder - can be calculated from historical data
  const co2Change = 18
  const waterChange = -10

  const currentWeekCo2 = co2TrendData[3]?.co2Saved || 0
  const previousWeekCo2 = co2TrendData[2]?.co2Saved || 1
  const weeklyChange = ((currentWeekCo2 - previousWeekCo2) / previousWeekCo2 * 100).toFixed(1)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-solid border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading platform data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading data</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Overview</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Monitor overall platform performance and environmental impact
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Total Meals Rescued */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>
                Total Meals Rescued
              </p>
              <p className='text-2xl font-bold text-slate-800 dark:text-white mb-2'>
                {totalMealsRescued.toLocaleString()}
              </p>
              <div className='flex items-center space-x-1.5'>
                {mealsChange > 0 ? <ArrowUpRight className='w-3 h-3 text-emerald-500'/> : <ArrowDownRight className='w-3 h-3 text-red-500'/>}
                <span className={`text-xs font-semibold ${mealsChange > 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {mealsChange > 0 ? '+' : ''}{mealsChange}%
                </span>
                <span className='text-xs text-slate-500 dark:text-slate-400'>vs Last Month</span>
              </div>
            </div>
            <div className='p-2.5 rounded-xl bg-solid/10 dark:bg-solid/20 group-hover:scale-110 transition-all duration-300'>
              <UtensilsCrossed className='w-6 h-6 text-solid' />
            </div>
          </div>
        </div>

        {/* Total CO2e Saved */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>
                Total CO2e Saved
              </p>
              <p className='text-2xl font-bold text-slate-800 dark:text-white mb-2'>
                {totalCo2Saved.toLocaleString()} kg
              </p>
              <div className='flex items-center space-x-1.5'>
                {co2Change > 0 ? <ArrowUpRight className='w-3 h-3 text-emerald-500'/> : <ArrowDownRight className='w-3 h-3 text-red-500'/>}
                <span className={`text-xs font-semibold ${co2Change > 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {co2Change > 0 ? '+' : ''}{co2Change}%
                </span>
                <span className='text-xs text-slate-500 dark:text-slate-400'>vs Last Month</span>
              </div>
            </div>
            <div className='p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 group-hover:scale-110 transition-all duration-300'>
              <Leaf className='w-6 h-6 text-green-600 dark:text-green-400' />
            </div>
          </div>
        </div>

        {/* Total Water Saved */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>
                Total Water Saved
              </p>
              <p className='text-2xl font-bold text-slate-800 dark:text-white mb-2'>
                {(totalWaterSaved / 1000).toFixed(1)}k L
              </p>
              <div className='flex items-center space-x-1.5'>
                {waterChange > 0 ? <ArrowUpRight className='w-3 h-3 text-emerald-500'/> : <ArrowDownRight className='w-3 h-3 text-red-500'/>}
                <span className={`text-xs font-semibold ${waterChange > 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {waterChange > 0 ? '+' : ''}{waterChange}%
                </span>
                <span className='text-xs text-slate-500 dark:text-slate-400'>vs Last Month</span>
              </div>
            </div>
            <div className='p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 group-hover:scale-110 transition-all duration-300'>
              <Droplet className='w-6 h-6 text-blue-600 dark:text-blue-400' />
            </div>
          </div>
        </div>
      </div>

      {/* CO2e Saved Trend Chart */}
      <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3'>
          <div>
            <h3 className='text-lg font-bold text-slate-800 dark:text-white'>CO2e Saved Trend</h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>Last 30 days breakdown by week</p>
          </div>
          <div className='flex items-center gap-2'>
            <div className='px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg'>
              <span className='text-xs font-semibold text-green-600 dark:text-green-400'>
                {weeklyChange > 0 ? '+' : ''}{weeklyChange}% this week
              </span>
            </div>
          </div>
        </div>
        <div className='h-72'>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={co2TrendData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#94a3b8" />
              <XAxis 
                dataKey="week" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  padding: '8px 12px'
                }} 
                formatter={(value, name) => [value + ' kg', name === 'co2Saved' ? 'CO2e Saved' : 'Target']}
                labelStyle={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="co2Saved" stroke="#10b981" strokeWidth={2} fill="url(#co2Gradient)" />
              <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Leaderboard */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top 10 Vendor Leaderboard</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Vendors ranked by environmental impact</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Vendor Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Meals Rescued</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">CO2e Saved (kg)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Water Saved (L)</th>
              </tr>
            </thead>
            <tbody>
              {vendorLeaderboard.map((vendor) => (
                <tr key={vendor.rank} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      vendor.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      vendor.rank === 2 ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                      vendor.rank === 3 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {vendor.rank}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">{vendor.name}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">{vendor.mealsRescued.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-green-600 dark:text-green-400">{vendor.co2Saved}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-blue-600 dark:text-blue-400">{vendor.waterSaved.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Main Overview Component
export const Overview = () => {
  const { adminMode } = useAdminMode()
  return adminMode === 'shop' ? <ShopAdminOverview /> : <WebsiteAdminOverview />
}

// Shop Admin Reports Component
const ShopAdminReports = () => {
  // Revenue breakdown data
  const revenueData = [
    { month: 'Jan', revenue: 95000, cost: 68000 },
    { month: 'Feb', revenue: 118000, cost: 82000 },
    { month: 'Mar', revenue: 102000, cost: 75000 },
    { month: 'Apr', revenue: 145000, cost: 98000 },
    { month: 'May', revenue: 132000, cost: 89000 },
    { month: 'Jun', revenue: 168000, cost: 112000 },
  ]

  // Product category distribution
  const categoryData = [
    { name: 'Vegetables', value: 28, color: '#10b981' },
    { name: 'Fruits', value: 22, color: '#f59e0b' },
    { name: 'Dairy', value: 18, color: '#3b82f6' },
    { name: 'Grains', value: 16, color: '#8b5cf6' },
    { name: 'Others', value: 16, color: '#64748b' },
  ]

  // Peak sales hours
  const peakHoursData = [
    { hour: '6AM', orders: 12 },
    { hour: '9AM', orders: 28 },
    { hour: '12PM', orders: 45 },
    { hour: '3PM', orders: 38 },
    { hour: '6PM', orders: 52 },
    { hour: '9PM', orders: 18 },
  ]

  // Order fulfillment metrics
  const fulfillmentMetrics = [
    { status: 'On-Time Delivery', value: 85, color: '#10b981' },
    { status: 'Late Delivery', value: 10, color: '#f59e0b' },
    { status: 'Cancelled', value: 5, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Shop Reports</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Generate and download detailed shop reports
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-solid hover:bg-tertiary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-solid/20">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Revenue vs Cost Chart */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Revenue & Cost Analysis</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#94a3b8" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={60} tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', padding: '8px 12px' }} 
                formatter={(value, name) => ['RWF ' + value.toLocaleString(), name === 'revenue' ? 'Revenue' : 'Cost']}
                labelStyle={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Bar dataKey="revenue" fill="#00A86B" radius={[8, 8, 0, 0]} />
              <Bar dataKey="cost" fill="#FF7A00" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Sales by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', padding: '8px 12px' }} 
                  formatter={(value) => [`${value}%`, 'Share']}
                  labelStyle={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{category.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Peak Sales Hours</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#94a3b8" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={40} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', padding: '8px 12px' }} 
                  formatter={(value) => [value + ' orders', 'Orders']}
                  labelStyle={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Order Fulfillment Status */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Order Fulfillment Status</h3>
        <div className="space-y-4">
          {fulfillmentMetrics.map((metric) => (
            <div key={metric.status}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{metric.status}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{metric.value}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${metric.value}%`, backgroundColor: metric.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Website Admin Reports Component
const WebsiteAdminReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [loading, setLoading] = useState(true)
  const [adminStats, setAdminStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true)
        const statsResponse = await analyticsService.getAdminStats()
        setAdminStats(statsResponse)
      } catch (err) {
        console.error('Error fetching reports data:', err)
        setError(err.message || 'Failed to load reports data')
      } finally {
        setLoading(false)
      }
    }
    fetchReportsData()
  }, [])

  // Use real data or defaults
  const totalOrders = adminStats?.orders?.total || 0
  const activeVendors = adminStats?.businesses?.active || 0
  const totalUsers = adminStats?.users?.total || 0
  const totalRevenue = adminStats?.revenue?.total || 0
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  // Placeholder revenue data (can be connected to detailed reports endpoint later)
  const revenueData = [
    { month: 'Jan', revenue: Math.round(totalRevenue * 0.14), expenses: Math.round(totalRevenue * 0.06) },
    { month: 'Feb', revenue: Math.round(totalRevenue * 0.16), expenses: Math.round(totalRevenue * 0.07) },
    { month: 'Mar', revenue: Math.round(totalRevenue * 0.15), expenses: Math.round(totalRevenue * 0.065) },
    { month: 'Apr', revenue: Math.round(totalRevenue * 0.18), expenses: Math.round(totalRevenue * 0.075) },
    { month: 'May', revenue: Math.round(totalRevenue * 0.16), expenses: Math.round(totalRevenue * 0.068) },
    { month: 'Jun', revenue: Math.round(totalRevenue * 0.21), expenses: Math.round(totalRevenue * 0.082) },
  ]

  // Category distribution
  const categoryData = [
    { name: 'Vegetables', value: 25, color: '#10b981' },
    { name: 'Fruits', value: 20, color: '#3b82f6' },
    { name: 'Bakery', value: 18, color: '#f59e0b' },
    { name: 'Dairy', value: 15, color: '#8b5cf6' },
    { name: 'Meat & Fish', value: 12, color: '#ef4444' },
    { name: 'Others', value: 10, color: '#6b7280' },
  ]

  // Order fulfillment data using real stats
  const completedOrders = adminStats?.orders?.completed || 0
  const pendingOrders = adminStats?.orders?.pending || 0
  const cancelledOrders = totalOrders - completedOrders - pendingOrders
  const completedPercentage = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
  const pendingPercentage = totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0
  const cancelledPercentage = 100 - completedPercentage - pendingPercentage

  const fulfillmentData = [
    { type: 'Completed', count: completedOrders, percentage: completedPercentage },
    { type: 'Pending', count: pendingOrders, percentage: pendingPercentage },
    { type: 'Cancelled', count: cancelledOrders > 0 ? cancelledOrders : 0, percentage: cancelledPercentage > 0 ? cancelledPercentage : 0 },
  ]

  // Peak hours data (placeholder)
  const peakHoursData = [
    { time: '6AM', orders: 45 },
    { time: '9AM', orders: 120 },
    { time: '12PM', orders: 280 },
    { time: '3PM', orders: 180 },
    { time: '6PM', orders: 320 },
    { time: '9PM', orders: 95 },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-solid border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading reports data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading data</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Reports</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Generate comprehensive platform-wide reports
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-solid hover:bg-tertiary text-white rounded-lg transition-colors font-medium text-sm">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50'>
          <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>Total Orders</p>
          <p className='text-2xl font-bold text-slate-800 dark:text-white'>{totalOrders.toLocaleString()}</p>
        </div>
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50'>
          <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>Active Vendors</p>
          <p className='text-2xl font-bold text-slate-800 dark:text-white'>{activeVendors.toLocaleString()}</p>
        </div>
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50'>
          <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>Total Users</p>
          <p className='text-2xl font-bold text-slate-800 dark:text-white'>{totalUsers.toLocaleString()}</p>
        </div>
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50'>
          <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>Avg Order Value</p>
          <p className='text-2xl font-bold text-slate-800 dark:text-white'>RWF {avgOrderValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3'>
          <div>
            <h3 className='text-lg font-bold text-slate-800 dark:text-white'>Revenue & Expenses</h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>Monthly breakdown (All values in RWF)</p>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 rounded-full bg-solid'></div>
              <span className='text-xs text-slate-600 dark:text-slate-400'>Revenue</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 rounded-full bg-solidOne'></div>
              <span className='text-xs text-slate-600 dark:text-slate-400'>Expenses</span>
            </div>
          </div>
        </div>
        <div className='h-72'>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#94a3b8" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={60} tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  padding: '8px 12px'
                }} 
                formatter={(value) => ['RWF ' + value.toLocaleString(), '']}
              />
              <Bar dataKey="revenue" fill="#00A86B" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expenses" fill="#FF7A00" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution & Peak Hours */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Category Distribution */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6'>
          <div className='mb-4'>
            <h3 className='text-lg font-bold text-slate-800 dark:text-white'>Sales by Category</h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>Product distribution</p>
          </div>
          <div className='h-64'>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color}/>
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value) => [value + '%', '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className='grid grid-cols-2 gap-x-4 gap-y-2 mt-4'>
            {categoryData.map((item, index) => (
              <div className='flex items-center justify-between' key={index}>
                <div className='flex items-center space-x-2'>
                  <div className='w-2.5 h-2.5 rounded-full' style={{backgroundColor: item.color}} />
                  <span className='text-xs text-slate-600 dark:text-slate-400'>{item.name}</span>
                </div>
                <span className='text-xs font-semibold text-slate-800 dark:text-white'>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6'>
          <div className='mb-4'>
            <h3 className='text-lg font-bold text-slate-800 dark:text-white'>Peak Order Hours</h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>Average orders per hour</p>
          </div>
          <div className='h-64'>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#94a3b8" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={40} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  }} 
                  formatter={(value) => [value + ' orders', '']}
                />
                <Bar dataKey="orders" fill="#00A86B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Order Fulfillment Status */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <h3 className='text-lg font-bold text-slate-800 dark:text-white mb-4'>Order Fulfillment Status</h3>
        <div className="space-y-4">
          {fulfillmentData.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.type}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.count.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">({item.percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    item.type === 'Completed' ? 'bg-solid' :
                    item.type === 'Pending' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Reports Component
export const Reports = () => {
  const { adminMode } = useAdminMode()
  return adminMode === 'shop' ? <ShopAdminReports /> : <WebsiteAdminReports />
}

// Shop Admin Insights Component
const ShopAdminInsights = () => {
  // Customer behavior data
  const customerBehaviorData = [
    { day: 'Mon', newCustomers: 12, returningCustomers: 28 },
    { day: 'Tue', newCustomers: 15, returningCustomers: 32 },
    { day: 'Wed', newCustomers: 18, returningCustomers: 35 },
    { day: 'Thu', newCustomers: 20, returningCustomers: 38 },
    { day: 'Fri', newCustomers: 25, returningCustomers: 45 },
    { day: 'Sat', newCustomers: 30, returningCustomers: 52 },
    { day: 'Sun', newCustomers: 22, returningCustomers: 40 },
  ]

  // Product performance insights
  const productPerformance = [
    { 
      product: 'Fresh Vegetable Mix',
      viewToCart: 68,
      cartToCheckout: 85,
      checkoutToSale: 92,
      trend: 'up'
    },
    { 
      product: 'Organic Fruit Basket',
      viewToCart: 72,
      cartToCheckout: 78,
      checkoutToSale: 88,
      trend: 'up'
    },
    { 
      product: 'Whole Grain Bread',
      viewToCart: 45,
      cartToCheckout: 65,
      checkoutToSale: 75,
      trend: 'down'
    },
  ]

  // Key insights cards
  const insights = [
    {
      title: 'Peak Sales Time',
      value: '6PM - 8PM',
      description: '45% of daily sales occur during this window',
      icon: Clock,
      color: 'blue',
      trend: 'Schedule promotions during peak hours'
    },
    {
      title: 'Customer Retention',
      value: '72%',
      description: 'Returning customers contribute to most revenue',
      icon: Users,
      color: 'green',
      trend: 'Focus on loyalty programs'
    },
    {
      title: 'Avg. Cart Value',
      value: 'RWF 1,490',
      description: 'Up 8% from last month',
      icon: ShoppingCart,
      color: 'orange',
      trend: 'Bundle deals are working'
    },
    {
      title: 'Best Category',
      value: 'Vegetables',
      description: '28% of total sales',
      icon: Package,
      color: 'purple',
      trend: 'Expand vegetable inventory'
    },
  ]

  // Growth opportunities
  const opportunities = [
    {
      title: 'Expand Fruit Selection',
      impact: 'High',
      effort: 'Medium',
      description: 'Customer demand for organic fruits increased by 45%',
      potential: '+RWF 85,000/month'
    },
    {
      title: 'Evening Delivery Slots',
      impact: 'High',
      effort: 'Low',
      description: 'Many customers abandon carts due to delivery time constraints',
      potential: '+RWF 120,000/month'
    },
    {
      title: 'Loyalty Program',
      impact: 'Medium',
      effort: 'High',
      description: 'Reward repeat customers to increase retention rate',
      potential: '+RWF 65,000/month'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Shop Insights</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Discover insights to grow your business
        </p>
      </div>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight) => (
          <div key={insight.title} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${
                insight.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                insight.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                insight.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                'bg-purple-50 dark:bg-purple-900/20'
              } group-hover:scale-110 transition-all duration-300`}>
                <insight.icon className={`w-5 h-5 ${
                  insight.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                  insight.color === 'green' ? 'text-green-600 dark:text-green-400' :
                  insight.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                  'text-purple-600 dark:text-purple-400'
                }`} />
              </div>
            </div>
            <h3 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{insight.title}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{insight.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{insight.description}</p>
            <p className="text-xs font-semibold text-solid">{insight.trend}</p>
          </div>
        ))}
      </div>

      {/* Customer Behavior Chart */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Customer Behavior (Last 7 Days)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={customerBehaviorData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#94a3b8" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', padding: '8px 12px' }} 
                formatter={(value, name) => [value + ' customers', name === 'newCustomers' ? 'New' : 'Returning']}
                labelStyle={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Line type="monotone" dataKey="newCustomers" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="New Customers" />
              <Line type="monotone" dataKey="returningCustomers" stroke="#00A86B" strokeWidth={2} dot={{ r: 4 }} name="Returning Customers" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Product Conversion Funnel</h3>
        <div className="space-y-4">
          {productPerformance.map((product) => (
            <div key={product.product} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{product.product}</h4>
                {product.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">View → Cart</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${product.viewToCart}%` }}></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{product.viewToCart}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Cart → Checkout</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${product.cartToCheckout}%` }}></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{product.cartToCheckout}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Checkout → Sale</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${product.checkoutToSale}%` }}></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{product.checkoutToSale}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Opportunities */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Growth Opportunities</h3>
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <div key={opportunity.title} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-base font-semibold text-slate-900 dark:text-white">{opportunity.title}</h4>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    opportunity.impact === 'High' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {opportunity.impact} Impact
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    opportunity.effort === 'Low' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    opportunity.effort === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {opportunity.effort} Effort
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{opportunity.description}</p>
              <p className="text-sm font-semibold text-solid">Potential Revenue: {opportunity.potential}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Website Admin Insights Component
const WebsiteAdminInsights = () => {
  const [loading, setLoading] = useState(true)
  const [adminStats, setAdminStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInsightsData = async () => {
      try {
        setLoading(true)
        const statsResponse = await analyticsService.getAdminStats()
        setAdminStats(statsResponse)
      } catch (err) {
        console.error('Error fetching insights data:', err)
        setError(err.message || 'Failed to load insights data')
      } finally {
        setLoading(false)
      }
    }
    fetchInsightsData()
  }, [])

  // Use real data for user growth
  const totalUsers = adminStats?.users?.total || 0
  const activeUsersEstimate = Math.round(totalUsers * 0.8) // Estimate 80% active

  // User growth data based on real totals
  const userGrowthData = [
    { month: 'Jan', users: Math.round(totalUsers * 0.68), activeUsers: Math.round(totalUsers * 0.54) },
    { month: 'Feb', users: Math.round(totalUsers * 0.73), activeUsers: Math.round(totalUsers * 0.59) },
    { month: 'Mar', users: Math.round(totalUsers * 0.81), activeUsers: Math.round(totalUsers * 0.65) },
    { month: 'Apr', users: Math.round(totalUsers * 0.86), activeUsers: Math.round(totalUsers * 0.69) },
    { month: 'May', users: Math.round(totalUsers * 0.92), activeUsers: Math.round(totalUsers * 0.73) },
    { month: 'Jun', users: totalUsers, activeUsers: activeUsersEstimate },
  ]

  // Vendor performance metrics
  const vendorMetrics = [
    { metric: 'Average Response Time', value: '12 mins', status: 'good', change: -8 },
    { metric: 'Order Acceptance Rate', value: '94%', status: 'good', change: 5 },
    { metric: 'Customer Satisfaction', value: '4.7/5', status: 'good', change: 3 },
    { metric: 'Avg Delivery Time', value: '28 mins', status: 'warning', change: 2 },
  ]

  // Top performing regions
  const regionData = [
    { region: 'Kigali', orders: 2845, revenue: 'RWF 24.5M', growth: 18 },
    { region: 'Nairobi', orders: 1920, revenue: 'RWF 16.8M', growth: 25 },
    { region: 'Accra', orders: 1650, revenue: 'RWF 14.2M', growth: 12 },
    { region: 'Lagos', orders: 1480, revenue: 'RWF 12.9M', growth: 32 },
    { region: 'Dar es Salaam', orders: 1120, revenue: 'RWF 9.6M', growth: 15 },
  ]

  // User demographics
  const demographicData = [
    { age: '18-24', percentage: 22 },
    { age: '25-34', percentage: 38 },
    { age: '35-44', percentage: 25 },
    { age: '45-54', percentage: 10 },
    { age: '55+', percentage: 5 },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-solid border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading insights data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading data</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Insights</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Data-driven insights for platform optimization
        </p>
      </div>

      {/* User Growth Chart */}
      <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6'>
        <div className='mb-4'>
          <h3 className='text-lg font-bold text-slate-800 dark:text-white'>User Growth Trend</h3>
          <p className='text-xs text-slate-500 dark:text-slate-400'>Total users vs active users</p>
        </div>
        <div className='h-72'>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#94a3b8" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={50} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                }} 
                formatter={(value) => [value.toLocaleString(), '']}
              />
              <Line type="monotone" dataKey="users" stroke="#00A86B" strokeWidth={3} dot={{ r: 4 }} name="Total Users" />
              <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Active Users" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Performance Metrics */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <h3 className='text-lg font-bold text-slate-800 dark:text-white mb-4'>Vendor Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vendorMetrics.map((metric, index) => (
            <div key={index} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{metric.metric}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">{metric.value}</p>
              <div className="flex items-center gap-1">
                {metric.change > 0 ? (
                  <TrendingUp className={`w-3.5 h-3.5 ${metric.status === 'good' ? 'text-green-500' : 'text-red-500'}`} />
                ) : (
                  <TrendingDown className={`w-3.5 h-3.5 ${metric.status === 'good' ? 'text-green-500' : 'text-red-500'}`} />
                )}
                <span className={`text-xs font-semibold ${metric.status === 'good' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {Math.abs(metric.change)}% {metric.status === 'warning' ? 'slower' : 'better'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Regions & Demographics */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Top Performing Regions */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className='text-lg font-bold text-slate-800 dark:text-white mb-4'>Top Performing Regions</h3>
          <div className="space-y-3">
            {regionData.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{region.region}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400">{region.orders} orders</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{region.revenue}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">{region.growth}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Demographics */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className='text-lg font-bold text-slate-800 dark:text-white mb-4'>User Demographics</h3>
          <div className="space-y-4">
            {demographicData.map((demo, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{demo.age} years</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{demo.percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full bg-linear-to-r from-solid to-tertiary"
                    style={{ width: `${demo.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Peak Performance</h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">Orders peak at 6PM with 320 average orders. Consider increasing vendor capacity during this time.</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-1">Sustainability Impact</h4>
              <p className="text-xs text-green-700 dark:text-green-300">Each rescued meal saves an average of 0.3kg CO2e and 15L of water. Impact growing by 18%.</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">Growth Opportunity</h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Lagos shows 32% growth - highest among all regions. Consider vendor expansion here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Insights Component
export const Insights = () => {
  const { adminMode } = useAdminMode()
  return adminMode === 'shop' ? <ShopAdminInsights /> : <WebsiteAdminInsights />
}

// Shop Admin Impact Component
const ShopAdminImpact = () => {
  // Monthly impact data for the shop
  const monthlyImpactData = [
    { month: 'Jan', meals: 285, co2: 85.5, water: 4275 },
    { month: 'Feb', meals: 312, co2: 93.6, water: 4680 },
    { month: 'Mar', meals: 298, co2: 89.4, water: 4470 },
    { month: 'Apr', meals: 345, co2: 103.5, water: 5175 },
    { month: 'May', meals: 368, co2: 110.4, water: 5520 },
    { month: 'Jun', meals: 439, co2: 131.7, water: 6585 },
  ]

  // Impact by category
  const categoryImpact = [
    { category: 'Vegetables', meals: 620, co2: 186, water: 9300, percentage: 28 },
    { category: 'Fruits', meals: 487, co2: 146, water: 7305, percentage: 22 },
    { category: 'Dairy', meals: 398, co2: 119, water: 5970, percentage: 18 },
    { category: 'Grains', meals: 354, co2: 106, water: 5310, percentage: 16 },
    { category: 'Others', meals: 354, co2: 106, water: 5310, percentage: 16 },
  ]

  // Calculate totals
  const totalMeals = 2213
  const totalCo2 = 663.9 // kg
  const totalWater = 33195 // liters
  const shopRank = 15 // Out of all vendors

  // Environmental equivalents
  const equivalents = {
    carsOffRoad: (totalCo2 / 4600).toFixed(1), // avg car produces 4.6 tons CO2/year
    treesPlanted: Math.round(totalCo2 / 21), // 1 tree absorbs 21kg CO2/year
    poolsFilled: (totalWater / 75000).toFixed(2), // Olympic pool = 75,000 liters
    householdsPowered: (totalMeals * 0.5 / 30).toFixed(1) // Rough estimate
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Shop Impact</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Track your environmental and social impact
        </p>
      </div>

      {/* Impact Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Meals Rescued */}
        <div className='bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 backdrop-blur-xl rounded-2xl p-5 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-xl hover:shadow-blue-200/30 dark:hover:shadow-blue-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between mb-3'>
            <div className='p-3 rounded-xl bg-white/80 dark:bg-slate-900/40 group-hover:scale-110 transition-all duration-300'>
              <UtensilsCrossed className='w-6 h-6 text-blue-600 dark:text-blue-400' />
            </div>
            <TrendingUp className='w-5 h-5 text-blue-600 dark:text-blue-400' />
          </div>
          <p className='text-sm font-medium text-blue-700 dark:text-blue-300 mb-1'>Meals Rescued</p>
          <p className='text-3xl font-bold text-blue-900 dark:text-white mb-2'>{totalMeals.toLocaleString()}</p>
          <p className='text-xs text-blue-600 dark:text-blue-400 font-medium'>+54% vs last period</p>
        </div>

        {/* CO2e Saved */}
        <div className='bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 backdrop-blur-xl rounded-2xl p-5 border border-green-200/50 dark:border-green-700/50 hover:shadow-xl hover:shadow-green-200/30 dark:hover:shadow-green-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between mb-3'>
            <div className='p-3 rounded-xl bg-white/80 dark:bg-slate-900/40 group-hover:scale-110 transition-all duration-300'>
              <Leaf className='w-6 h-6 text-green-600 dark:text-green-400' />
            </div>
            <TrendingUp className='w-5 h-5 text-green-600 dark:text-green-400' />
          </div>
          <p className='text-sm font-medium text-green-700 dark:text-green-300 mb-1'>CO2e Saved</p>
          <p className='text-3xl font-bold text-green-900 dark:text-white mb-2'>{totalCo2.toLocaleString()} kg</p>
          <p className='text-xs text-green-600 dark:text-green-400 font-medium'>Environmental impact</p>
        </div>

        {/* Water Saved */}
        <div className='bg-linear-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20 backdrop-blur-xl rounded-2xl p-5 border border-cyan-200/50 dark:border-cyan-700/50 hover:shadow-xl hover:shadow-cyan-200/30 dark:hover:shadow-cyan-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between mb-3'>
            <div className='p-3 rounded-xl bg-white/80 dark:bg-slate-900/40 group-hover:scale-110 transition-all duration-300'>
              <Droplet className='w-6 h-6 text-cyan-600 dark:text-cyan-400' />
            </div>
            <TrendingUp className='w-5 h-5 text-cyan-600 dark:text-cyan-400' />
          </div>
          <p className='text-sm font-medium text-cyan-700 dark:text-cyan-300 mb-1'>Water Saved</p>
          <p className='text-3xl font-bold text-cyan-900 dark:text-white mb-2'>{totalWater.toLocaleString()} L</p>
          <p className='text-xs text-cyan-600 dark:text-cyan-400 font-medium'>Resource conservation</p>
        </div>

        {/* Shop Ranking */}
        <div className='bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 backdrop-blur-xl rounded-2xl p-5 border border-orange-200/50 dark:border-orange-700/50 hover:shadow-xl hover:shadow-orange-200/30 dark:hover:shadow-orange-900/20 transition-all duration-300 group'>
          <div className='flex items-start justify-between mb-3'>
            <div className='p-3 rounded-xl bg-white/80 dark:bg-slate-900/40 group-hover:scale-110 transition-all duration-300'>
              <Award className='w-6 h-6 text-orange-600 dark:text-orange-400' />
            </div>
            <TrendingUp className='w-5 h-5 text-orange-600 dark:text-orange-400' />
          </div>
          <p className='text-sm font-medium text-orange-700 dark:text-orange-300 mb-1'>Platform Rank</p>
          <p className='text-3xl font-bold text-orange-900 dark:text-white mb-2'>#{shopRank}</p>
          <p className='text-xs text-orange-600 dark:text-orange-400 font-medium'>Among all vendors</p>
        </div>
      </div>

      {/* Monthly Impact Trend */}
      <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6'>
        <h3 className='text-lg font-bold text-slate-800 dark:text-white mb-4'>Monthly Impact Trend</h3>
        <div className='h-72'>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyImpactData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#94a3b8" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', padding: '8px 12px' }} 
                formatter={(value, name) => {
                  if (name === 'meals') return [value + ' meals', 'Meals Rescued']
                  if (name === 'co2') return [value + ' kg', 'CO2e Saved']
                  if (name === 'water') return [(value / 1000).toFixed(1) + 'k L', 'Water Saved']
                }}
                labelStyle={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="meals" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line yAxisId="left" type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="water" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Impact Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Impact by Category</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Meals</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">CO2e (kg)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Water (L)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Share</th>
              </tr>
            </thead>
            <tbody>
              {categoryImpact.map((item) => (
                <tr key={item.category} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">{item.category}</td>
                  <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{item.meals}</td>
                  <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{item.co2}</td>
                  <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{item.water.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[100px] bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-solid h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Environmental Equivalents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Car className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cars Off Road</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{equivalents.carsOffRoad}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">For a full year</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Trees className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Trees Planted</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{equivalents.treesPlanted}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Carbon absorbed</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Waves className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Olympic Pools</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{equivalents.poolsFilled}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Water saved</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Home className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Households Fed</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{equivalents.householdsPowered}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">For a month</p>
        </div>
      </div>

      {/* Impact Statement Banner */}
      <div className="bg-linear-to-r from-solid/10 via-solid/5 to-tertiary/10 dark:from-solid/20 dark:via-solid/10 dark:to-tertiary/20 backdrop-blur-xl rounded-2xl p-6 border border-solid/20 dark:border-solid/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-solid/20 dark:bg-solid/30 rounded-xl">
            <Sparkles className="w-6 h-6 text-solid" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Your Impact Matters!</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              By rescuing {totalMeals.toLocaleString()} meals, you've saved {totalCo2.toLocaleString()} kg of CO2e from entering the atmosphere 
              and conserved {totalWater.toLocaleString()} liters of water. You're ranked <strong>#{shopRank}</strong> among all vendors on ChopNow. 
              Keep up the amazing work in fighting food waste and protecting our planet! 🌍
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Website Admin Impact Component
const WebsiteAdminImpact = () => {
  // Monthly impact data
  const monthlyImpactData = [
    { month: 'Jan', meals: 6800, co2: 2040, water: 102000 },
    { month: 'Feb', meals: 7500, co2: 2250, water: 112500 },
    { month: 'Mar', meals: 8200, co2: 2460, water: 123000 },
    { month: 'Apr', meals: 7900, co2: 2370, water: 118500 },
    { month: 'May', meals: 8600, co2: 2580, water: 129000 },
    { month: 'Jun', meals: 9230, co2: 2769, water: 138450 },
  ]

  // Impact by category
  const categoryImpactData = [
    { category: 'Vegetables', meals: 11250, co2: 3375, water: 168750, color: '#10b981' },
    { category: 'Fruits', meals: 9020, co2: 2706, water: 135300, color: '#3b82f6' },
    { category: 'Bakery', meals: 8115, co2: 2434, water: 121725, color: '#f59e0b' },
    { category: 'Dairy', meals: 6770, co2: 2031, water: 101550, color: '#8b5cf6' },
    { category: 'Meat & Fish', meals: 5410, co2: 2164, water: 81150, color: '#ef4444' },
    { category: 'Others', meals: 4665, co2: 1399, water: 69975, color: '#6b7280' },
  ]

  // Environmental equivalents
  const environmentalEquivalents = [
    { 
      title: 'Cars Off Road',
      value: '2,956',
      description: 'Equivalent to taking this many cars off the road for a day',
      icon: '🚗'
    },
    {
      title: 'Trees Planted',
      value: '678',
      description: 'Equal to planting this many trees annually',
      icon: '🌳'
    },
    {
      title: 'Olympic Pools',
      value: '271',
      description: 'Water saved could fill this many Olympic swimming pools',
      icon: '🏊'
    },
    {
      title: 'Households Powered',
      value: '1,245',
      description: 'Energy saved equivalent to powering households for a day',
      icon: '⚡'
    },
  ]

  // Total cumulative impact
  const totalImpact = {
    meals: 45230,
    co2: 13569,
    water: 678450,
    wasteReduced: 22615 // kg
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Impact</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Measure the platform's overall environmental and social impact
        </p>
      </div>

      {/* Total Impact Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-linear-to-br from-solid to-tertiary rounded-2xl p-5 text-white shadow-lg'>
          <div className="flex items-center justify-between mb-2">
            <UtensilsCrossed className="w-8 h-8 opacity-80" />
            <span className="text-3xl">🍽️</span>
          </div>
          <p className='text-sm opacity-90 mb-1'>Total Meals Rescued</p>
          <p className='text-3xl font-bold'>{totalImpact.meals.toLocaleString()}</p>
          <p className='text-xs opacity-75 mt-2'>Since platform launch</p>
        </div>

        <div className='bg-linear-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg'>
          <div className="flex items-center justify-between mb-2">
            <Leaf className="w-8 h-8 opacity-80" />
            <span className="text-3xl">🌱</span>
          </div>
          <p className='text-sm opacity-90 mb-1'>CO2e Emissions Saved</p>
          <p className='text-3xl font-bold'>{totalImpact.co2.toLocaleString()} kg</p>
          <p className='text-xs opacity-75 mt-2'>Carbon footprint reduced</p>
        </div>

        <div className='bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg'>
          <div className="flex items-center justify-between mb-2">
            <Droplet className="w-8 h-8 opacity-80" />
            <span className="text-3xl">💧</span>
          </div>
          <p className='text-sm opacity-90 mb-1'>Water Conserved</p>
          <p className='text-3xl font-bold'>{(totalImpact.water / 1000).toFixed(0)}k L</p>
          <p className='text-xs opacity-75 mt-2'>Liters saved from waste</p>
        </div>

        <div className='bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg'>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">♻️</span>
            <span className="text-3xl">🗑️</span>
          </div>
          <p className='text-sm opacity-90 mb-1'>Waste Reduced</p>
          <p className='text-3xl font-bold'>{(totalImpact.wasteReduced / 1000).toFixed(1)}t</p>
          <p className='text-xs opacity-75 mt-2'>Tonnes diverted from landfills</p>
        </div>
      </div>

      {/* Monthly Impact Trend */}
      <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6'>
        <div className='mb-4'>
          <h3 className='text-lg font-bold text-slate-800 dark:text-white'>Monthly Impact Trend</h3>
          <p className='text-xs text-slate-500 dark:text-slate-400'>Environmental impact over time</p>
        </div>
        <div className='h-80'>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyImpactData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#94a3b8" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={50} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={50} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                }} 
                formatter={(value, name) => {
                  if (name === 'meals') return [value.toLocaleString() + ' meals', 'Meals Rescued']
                  if (name === 'co2') return [value.toLocaleString() + ' kg', 'CO2e Saved']
                  if (name === 'water') return [(value/1000).toFixed(0) + 'k L', 'Water Saved']
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="meals" stroke="#00A86B" strokeWidth={3} dot={{ r: 5 }} name="Meals Rescued" />
              <Line yAxisId="right" type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} name="CO2e Saved (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impact by Category */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <h3 className='text-lg font-bold text-slate-800 dark:text-white mb-4'>Impact by Food Category</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Meals Rescued</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">CO2e Saved (kg)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Water Saved (L)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Impact</th>
              </tr>
            </thead>
            <tbody>
              {categoryImpactData.map((item, index) => (
                <tr key={index} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">{item.meals.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-green-600 dark:text-green-400">{item.co2.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-blue-600 dark:text-blue-400">{item.water.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${(item.meals / 11250) * 100}%`,
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Environmental Equivalents */}
      <div>
        <h3 className='text-lg font-bold text-slate-800 dark:text-white mb-4'>Environmental Equivalents</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {environmentalEquivalents.map((item, index) => (
            <div key={index} className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300'>
              <div className="text-4xl mb-3">{item.icon}</div>
              <p className='text-3xl font-bold text-slate-900 dark:text-white mb-1'>{item.value}</p>
              <p className='text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>{item.title}</p>
              <p className='text-xs text-slate-600 dark:text-slate-400'>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Statement */}
      <div className="bg-linear-to-r from-solid to-tertiary rounded-2xl p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-3">Our Collective Impact</h3>
          <p className="text-lg opacity-90 mb-4">
            Together with our vendors and customers, we've rescued <span className="font-bold">{totalImpact.meals.toLocaleString()} meals</span>, 
            saved <span className="font-bold">{totalImpact.co2.toLocaleString()} kg of CO2e</span>, 
            and conserved <span className="font-bold">{(totalImpact.water / 1000).toFixed(0)}k liters of water</span>.
          </p>
          <p className="text-sm opacity-75">
            Every meal rescued is a step towards a more sustainable future. Let's continue making a difference together.
          </p>
        </div>
      </div>
    </div>
  )
}

// Main Impact Component
export const Impact = () => {
  const { adminMode } = useAdminMode()
  return adminMode === 'shop' ? <ShopAdminImpact /> : <WebsiteAdminImpact />
}

