import { MoreHorizontal, SlidersHorizontal } from 'lucide-react'
import React from 'react'
import { dummyProducts } from '../../../../assets/assets'

const TableSection = () => {
  // Take only first 5 products for the table
  const recentOrders = dummyProducts.slice(0, 5).map((product, index) => ({
    ...product,
    orderId: `#ORD-${1000 + index}`,
    status: index % 2 === 0 ? 'Delivered' : 'Pending'
  }));

  return (
      <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden h-full flex flex-col'>
         <div className='p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex-shrink-0'>
           <div className='flex items-center justify-between'>
              <div className=''>
                <h3 className='text-lg font-bold text-slate-800 dark:text-white'>Recent Orders</h3>
                <p className='text-sm text-slate-500 dark:text-slate-400'>Latest Customer Orders</p>
              </div>
              <div className='flex items-center gap-3'>
                <button className='flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer'>
                  <SlidersHorizontal className='w-4 h-4 text-slate-600 dark:text-slate-400' />
                  <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>Filter</span>
                </button>
                <button className='px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer'>
                  <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>See All</span>
                </button>
              </div>
           </div>
         </div>
        {/*Table*/}
        <div className='overflow-x-auto flex-1'>
           <table className='w-full'>
              <thead className='bg-slate-50 dark:bg-slate-800/50'>
                <tr>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                        Order ID
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                        Product
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                        Category
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                        Price
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                        Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                        Actions
                    </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200 dark:divide-slate-700'>
                {recentOrders.map((order) => (
                  <tr key={order._id} className='hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm font-medium text-slate-900 dark:text-white'>{order.orderId}</span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center gap-3'>
                        <img 
                          src={order.image[0]} 
                          alt={order.name} 
                          className='w-10 h-10 rounded-lg object-cover'
                        />
                        <span className='text-sm text-slate-900 dark:text-white'>{order.name}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm text-slate-600 dark:text-slate-400'>{order.category}</span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm font-semibold text-slate-900 dark:text-white'>
                        {order.offerPrice.toLocaleString()} Frw
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <button className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'>
                        <MoreHorizontal className='w-5 h-5' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </div>
  )
}

export default TableSection
