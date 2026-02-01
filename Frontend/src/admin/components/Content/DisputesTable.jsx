import { MoreHorizontal, SlidersHorizontal } from 'lucide-react'
import React from 'react'

const DisputesTable = () => {
  const recentDisputes = [
    {
      id: 'DSP-1001',
      customer: 'John Kamau',
      vendor: 'Fresh Greens Ltd',
      type: 'Refund Request',
      reason: 'Product was damaged during delivery',
      amount: '5,500 Frw',
      date: '2026-01-03',
      status: 'Pending'
    },
    {
      id: 'DSP-1002',
      customer: 'Alice Mukami',
      vendor: 'Organic Farm Co',
      type: 'Complaint',
      reason: 'Order arrived 2 hours late',
      amount: '12,000 Frw',
      date: '2026-01-03',
      status: 'Under Review'
    },
    {
      id: 'DSP-1003',
      customer: 'Peter Uwase',
      vendor: 'Valley Produce',
      type: 'Refund Request',
      reason: 'Wrong items delivered',
      amount: '8,200 Frw',
      date: '2026-01-02',
      status: 'Resolved'
    },
    {
      id: 'DSP-1004',
      customer: 'Sarah Mugisha',
      vendor: 'Green Market',
      type: 'Complaint',
      reason: 'Poor quality vegetables',
      amount: '6,800 Frw',
      date: '2026-01-02',
      status: 'Pending'
    },
    {
      id: 'DSP-1005',
      customer: 'David Nkusi',
      vendor: 'Farm Direct',
      type: 'Refund Request',
      reason: 'Missing items from order',
      amount: '15,300 Frw',
      date: '2026-01-01',
      status: 'Under Review'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
      <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden h-full flex flex-col'>
         <div className='p-6 border-b border-slate-200/50 dark:border-slate-700/50 shrink-0'>
           <div className='flex items-center justify-between'>
              <div className=''>
                <h3 className='text-lg font-bold text-slate-800 dark:text-white'>Recent Disputes</h3>
                <p className='text-sm text-slate-500 dark:text-slate-400'>Latest Customer Disputes & Complaints</p>
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
                        Dispute ID
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                        Customer
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                        Vendor
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                        Type
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                        Amount
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
                {recentDisputes.map((dispute) => (
                  <tr key={dispute.id} className='hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm font-medium text-slate-900 dark:text-white'>{dispute.id}</span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm text-slate-900 dark:text-white'>{dispute.customer}</span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm text-slate-600 dark:text-slate-400'>{dispute.vendor}</span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm text-slate-600 dark:text-slate-400'>{dispute.type}</span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm font-semibold text-slate-900 dark:text-white'>
                        {dispute.amount}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                        {dispute.status}
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

export default DisputesTable
