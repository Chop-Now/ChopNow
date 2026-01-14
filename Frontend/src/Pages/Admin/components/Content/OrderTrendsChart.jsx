import React, { useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const OrderTrendsChart = () => {
  const [period, setPeriod] = useState('monthly');

  // Monthly data
  const monthlyData = [
    { name: 'Week 1', thisMonth: 145, lastMonth: 120 },
    { name: 'Week 2', thisMonth: 180, lastMonth: 145 },
    { name: 'Week 3', thisMonth: 165, lastMonth: 155 },
    { name: 'Week 4', thisMonth: 210, lastMonth: 168 },
  ];

  // Quarterly data
  const quarterlyData = [
    { name: 'Jan', thisQuarter: 580, lastQuarter: 520 },
    { name: 'Feb', thisQuarter: 650, lastQuarter: 580 },
    { name: 'Mar', thisQuarter: 720, lastQuarter: 615 },
  ];

  // Annual data
  const annualData = [
    { name: 'Jan', thisYear: 580, lastYear: 520 },
    { name: 'Feb', thisYear: 650, lastYear: 580 },
    { name: 'Mar', thisYear: 720, lastYear: 615 },
    { name: 'Apr', thisYear: 690, lastYear: 640 },
    { name: 'May', thisYear: 750, lastYear: 680 },
    { name: 'Jun', thisYear: 820, lastYear: 720 },
    { name: 'Jul', thisYear: 880, lastYear: 760 },
    { name: 'Aug', thisYear: 850, lastYear: 790 },
    { name: 'Sep', thisYear: 920, lastYear: 820 },
    { name: 'Oct', thisYear: 950, lastYear: 850 },
    { name: 'Nov', thisYear: 980, lastYear: 880 },
    { name: 'Dec', thisYear: 1050, lastYear: 920 },
  ];

  const getData = () => {
    switch (period) {
      case 'monthly':
        return monthlyData;
      case 'quarterly':
        return quarterlyData;
      case 'annually':
        return annualData;
      default:
        return monthlyData;
    }
  };

  const getDataKeys = () => {
    switch (period) {
      case 'monthly':
        return { current: 'thisMonth', previous: 'lastMonth', currentLabel: 'This Month', previousLabel: 'Last Month' };
      case 'quarterly':
        return { current: 'thisQuarter', previous: 'lastQuarter', currentLabel: 'This Quarter', previousLabel: 'Last Quarter' };
      case 'annually':
        return { current: 'thisYear', previous: 'lastYear', currentLabel: 'This Year', previousLabel: 'Last Year' };
      default:
        return { current: 'thisMonth', previous: 'lastMonth', currentLabel: 'This Month', previousLabel: 'Last Month' };
    }
  };

  const dataKeys = getDataKeys();
  const chartData = getData();

  return (
    <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3'>
        <div>
          <h3 className='text-lg font-bold text-slate-800 dark:text-white'>Order Trends Comparison</h3>
          <p className='text-xs text-slate-500 dark:text-slate-400'>Compare current period with previous period</p>
        </div>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-5 py-2.5 text-xs font-medium rounded-md transition-all duration-200 ${
              period === 'monthly'
                ? 'bg-linear-to-r from-solid to-tertiary text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod('quarterly')}
            className={`px-5 py-2.5 text-xs font-medium rounded-md transition-all duration-200 ${
              period === 'quarterly'
                ? 'bg-linear-to-r from-solid to-tertiary text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => setPeriod('annually')}
            className={`px-5 py-2.5 text-xs font-medium rounded-md transition-all duration-200 ${
              period === 'annually'
                ? 'bg-linear-to-r from-solid to-tertiary text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
            }`}
          >
            Annually
          </button>
        </div>
      </div>

      <div className='flex items-center justify-center space-x-6 mb-4'>
        <div className='flex items-center space-x-2'>
          <div className='w-3 h-3 bg-linear-to-r from-solid to-tertiary rounded-full'></div>
          <span className='text-xs text-slate-600 dark:text-slate-400'>{dataKeys.currentLabel}</span>
        </div>
        <div className='flex items-center space-x-2'>
          <div className='w-3 h-3 bg-linear-to-r from-solidOne to-solidTwo rounded-full'></div>
          <span className='text-xs text-slate-600 dark:text-slate-400'>{dataKeys.previousLabel}</span>
        </div>
      </div>

      <div className='h-64 sm:h-72 md:h-80'>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#94a3b8" />
            <XAxis
              dataKey="name"
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
              formatter={(value) => [value.toLocaleString() + ' orders', ""]}
              labelStyle={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}
              itemStyle={{ fontSize: '11px' }}
            />
            <Line
              type="monotone"
              dataKey={dataKeys.current}
              stroke="url(#currentGradient)"
              strokeWidth={3}
              dot={{ fill: '#00A86B', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey={dataKeys.previous}
              stroke="url(#previousGradient)"
              strokeWidth={3}
              dot={{ fill: '#FF7A00', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              strokeDasharray="5 5"
            />
            <defs>
              <linearGradient id="currentGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00A86B" stopOpacity={1} />
                <stop offset="100%" stopColor="#007A4B" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="previousGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF7A00" stopOpacity={1} />
                <stop offset="100%" stopColor="#FFB366" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrderTrendsChart;
