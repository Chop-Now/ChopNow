import { Clock, Motorbike, ShoppingCart, User } from 'lucide-react'
import React from 'react'

const activities = [
    {
        id: 1,
        type: "user",
        icon: User,
        title: "New User Registered",
        description: "John Doe has registered an account.",
        time: "2 hours ago",
        color: "text-blue-600",
        bgColor: "bg-blue-500/10 dark:bg-blue-500/20"
    },
    {
        id: 2,
        type: "order",
        icon: ShoppingCart,
        title: "New Order Placed",
        description: "Order #1234 has been placed.",
        time: "1 hour ago",
        color: "text-green-600",
        bgColor: "bg-green-500/10 dark:bg-green-500/20"
    },
    {
        id: 3,
        type: "delivery",
        icon: Motorbike,
        title: "Order Delivered",
        description: "Order #1233 has been delivered.",
        time: "30 minutes ago",
        color: "text-purple-600",
        bgColor: "bg-purple-500/10 dark:bg-purple-500/20"
    },
    {
        id: 4,
        type: "user",
        icon: User,
        title: "Profile Updated",
        description: "Jane Smith updated her profile.",
        time: "15 minutes ago",
        color: "text-yellow-600",
        bgColor: "bg-yellow-500/10 dark:bg-yellow-500/20"
    }
]

const ActivityFeed = () => {
  return (
    <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50'>
      <div className='p-6 border-b border-slate-200/50 dark:border-slate-700/50'>
        <div>
            <h3 className='text-lg font-bold text-slate-800 dark:text-white'>Activity Feed</h3>
            <p className='text-sm text-slate-500 dark:text-slate-400'>Recent System Activities</p>
        </div>
        <button className='text-blue- hover:text-blue-700 text-sm font-medium'>View All</button>
      </div>
      <div className='p-6'>
         <div className='space-y-4'>
            {activities.map((activity) =>  {
                const IconComponent = activity.icon;
                return <div key={activity.id} className='flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'>
               <div className={`p-2 rounded-lg ${activity.bgColor} flex items-center justify-center mt-1`}>
                  <IconComponent className={`w-4 h-4 ${activity.color}`} />
               </div>
               <div className='flex-1 min-w-0'>
                 <h4 className='text-sm font-semibold text-slate-800 dark:text-white'>{activity.title}</h4>
                 <p className='text-sm text-slate-600 dark:text-slate-400 truncate'>{activity.description}</p>
                 <div className='flex items-center space-x-1 mt-1'>
                   <Clock className='w-3 h-3 text-slate-400'/>
                   <span className='text-xs text-slate-500 dark:text-slate-400'>{activity.time}</span>
                 </div>
               </div>
            </div>
            })}
         </div>
      </div>
    </div>
  )
}

export default ActivityFeed
