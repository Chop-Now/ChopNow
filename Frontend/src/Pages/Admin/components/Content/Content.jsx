import React from 'react'
import StatsGrid from './StatsGrid'
import ChartSection from './ChartSection'
import TableSection from './TableSection'
import DisputesTable from './DisputesTable'
import ActivityFeed from './ActivityFeed'
import { useAdminMode } from '../../context/AdminModeContext'

const Content = () => {
  const { adminMode } = useAdminMode();

  return (
    <div className='space-y-6'>
       {/* Stats Grid*/}
       <StatsGrid />

        {/* Chart Section */}
       <ChartSection />

       <div className='grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch'>
          <div className='xl:col-span-2 h-full'>
            {adminMode === 'shop' ? <TableSection /> : <DisputesTable />}
          </div>
          <div className='h-full'>
            <ActivityFeed />
          </div>
       </div>
    </div>
  )
}

export default Content
