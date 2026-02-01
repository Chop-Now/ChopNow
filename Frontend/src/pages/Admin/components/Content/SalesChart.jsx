import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Vegetables', value: 10, color: '#8884d8' },
  { name: 'Fruits', value: 30, color: '#82ca9d' },
  { name: 'Dairy', value: 20, color: '#ffc658' },
  { name: 'Bakery', value: 20, color: '#ff8042' },
  { name: 'Drinks', value: 10, color: '#ffbb28' },
  { name: 'Grains', value: 5, color: '#00c49f' },
  { name: 'Instant Food', value: 5, color: '#0088fe' },
];

const SalesChart = () => {
  return (
    <div className='bg-white dark:bg-slate-900 backdrop-blur-xl rounded-b-2xl p-6 border border-slate-200/50 dark:border-slate-700/50'>
      <div className='mb-6'>
         <h3 className='text-lg- font-bold text-slate-800 dark:text-white'>Sales by Category</h3>
         <p className='text-sm text-slate-500 dark:text-slate-400'>Production Distribution</p>
      </div>
      <div className='h-48'>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value">
                {data.map((entry, index) => (
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
              />
          </PieChart>
          </ResponsiveContainer>
      </div>
      <div className='grid grid-cols-2 gap-x-6 gap-y-2 mt-4'>
        {data.map((item, index) => {
          return <div className='flex items-center justify-between' key={index}>
             <div className='flex items-center space-x-2'>
                <div className='w-2.5 h-2.5 rounded-full' style={{backgroundColor: item.color}} />
                <span className='text-xs text-slate-600 dark:text-slate-400'>{item.name}</span>
             </div>
             <div className='text-xs font-semibold text-slate-800 dark:text-white'>
              {item.value}%
             </div>
          </div>;
        })}
      </div>
    </div>
  )
}

export default SalesChart
