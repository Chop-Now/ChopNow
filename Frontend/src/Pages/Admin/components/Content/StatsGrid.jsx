import { ArrowDownRight, ArrowUpRight, DollarSign, ShoppingBasket, Store, User, Users, Wallet } from 'lucide-react'
import React from 'react'
import { useAdminMode } from '../../context/AdminModeContext'

const StatsGrid = () => {
    const { adminMode } = useAdminMode();

    const shopAdminStats = [
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
            icon: <svg className='w-6 h-6' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 7V12C4 16.55 7.16 20.74 12 22C16.84 20.74 20 16.55 20 12V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>,
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            textColor: "text-black dark:text-white",
        },
        {
            title: "Average Reviews",
            value: "4.8/5",
            change: "+2.3%",
            trend: "up",
            icon: <svg className='w-6 h-6' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>,
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            textColor: "text-black dark:text-white",
        }
    ];

    const websiteAdminStats = [
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
            title: "Total Vendors",
            value: "234",
            change: "+15.2%",
            trend: "up",
            icon: <Store className='w-6 h-6' />,
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            textColor: "text-black dark:text-white",
        },
        {
            title: "Total Users",
            value: "12,543",
            change: "+8.7%",
            trend: "up",
            icon: <Users className='w-6 h-6' />,
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            textColor: "text-black dark:text-white",
        }
    ];

    const stats = adminMode === 'shop' ? shopAdminStats : websiteAdminStats;
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
            {stats.map((stat, index) => {
                return (
                    <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group' key={index}>
                        <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                                <p className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'>
                                    {stat.title}
                                </p>
                                <p className='text-xl font-bold text-slate-800 dark:text-white mb-2'>
                                    {stat.value}
                                </p>
                                <div className='flex items-center space-x-1.5'>
                                    {stat.trend === "up" ? <ArrowUpRight className='w-3 h-3 text-emerald-500'/> : <ArrowDownRight className='w-3 h-3 text-red-500'/>}
                                    <span className={`text-xs font-semibold ${stat.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>{stat.change}</span>
                                    <span className='text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap'>vs Last Month</span>
                                </div>
                            </div>
                            <div className={`p-2.5 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-all duration-300`}>
                                <div className={stat.textColor}>
                                    {stat.icon}
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
