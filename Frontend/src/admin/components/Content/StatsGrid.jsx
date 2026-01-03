import { ArrowDownRight, ArrowUpRight, DollarSign, ShoppingBasket, Sprout, Star, Wallet } from 'lucide-react'
import React from 'react'

const StatsGrid = () => {
    
    const stats = [
          
        {
        title: "Total Revenue",
        value: "RWF 45,231.89",
        change: "+12.5%",
        trend: "up",
        icon: <Wallet className='w-6 h-6' />,
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        textColor: "text-black dark:text-white",
       },
       {
        title: "Total Orders",
        value: "1,245",
        change: "-8.3%",
        trend: "down",
        icon: <ShoppingBasket className='w-6 h-6' />,
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        textColor: "text-grey-200 dark:text-white",
       },
       {
        title: "C02e Saved",
        value: "3,450 kg",
        change: "+5.1%",
        trend: "up",
        icon: <Sprout className='w-6 h-6' />,
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        textColor: "text-black dark:text-white",
       },
       {
        title: "Average Reviews",
        value: "4.8/5",
        change: "+2.3%",
        trend: "up",
        icon: <Star className='w-6 h-6' />,
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        textColor: "text-black dark:text-white",
       }
    ]
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
       {stats.map((stats, index) => {
          return (
           <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group' key={index}>
         <div className='flex items-start justify-between'>
             <div className='flex-1'>
                <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>
                    {stats.title}
                </p>
                <p className='text-xl font-bold text-slate-800 dark:text-white mb-2'>
                   {stats.value}
                </p>
                <div className='flex items-center space-x-1.5'>
                  {stats.trend === "up" ? <ArrowUpRight className='w-3 h-3 text-emerald-500'/> : <ArrowDownRight className='w-3 h-3 text-red-500'/>}
                   <span className={`text-xs font-semibold ${stats.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>{stats.change}</span>
                   <span className='text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap'>vs Last Month</span>
                </div>
             </div>
             <div className={`p-2.5 rounded-xl ${stats.bgColor} group-hover:scale-110 transition-all duration-300`}>
                <div className={stats.textColor}>
                  {stats.icon}
                </div>
             </div>
         </div>
      </div>
       )
       })}
    </div>
  )
}

export default StatsGrid
