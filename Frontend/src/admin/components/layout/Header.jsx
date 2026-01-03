import { Bell, ChevronDown, MenuIcon, Moon, Search, SlidersHorizontal, Sun } from 'lucide-react'
import React, { useState, useEffect } from 'react'

const Header = ({ onMenuClick }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for saved theme preference or default to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4'>
      <div className='flex items-center justify-between'>
         {/*Left section*/}
         <div className='flex items-center space-x-4'>
           <button 
             onClick={onMenuClick}
             className='p-2.5 rounded-md border-2 border-slate-100 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer'
           >
            <MenuIcon className='w-5 h-5'/>
           </button>

           <div className='relative'>
              <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-400'/>
              <input type="text" placeholder='Search or type command...' className='w-[400px] pl-10 pr-12 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-solid focus:border-transparent transition-all'/>
              <button className='absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'>
                <SlidersHorizontal className='w-4 h-4'/>
              </button>
           </div>
         </div>

         {/*Right side*/}
         <div className='flex items-center space-x-3'>
            <div className='flex items-center space-x-3'>
              {/*Toggle switch*/}
              <button 
                onClick={toggleDarkMode}
                className='p-3 rounded-full border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer'
              >
                {isDarkMode ? <Sun className='w-5 h-5'/> : <Moon className='w-5 h-5'/>}
              </button>
              {/*Notification*/}
               <button className='relative p-3 rounded-full border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer'>
                <Bell className='w-5 h-5'/>
                <span className='absolute top-0.5 right-0.5 w-3 h-3 bg-orange-500 rounded-full animate-ping'></span>
                <span className='absolute top-0.5 right-0.5 w-3 h-3 bg-orange-500 rounded-full'></span>
               </button>
              
              {/*User profile*/}
               <div className='flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700 cursor-pointer'>
                  <img src="https://images.pexels.com/photos/1370719/pexels-photo-1370719.jpeg" alt="user" className='w-10 h-10 rounded-full object-cover'/>
                  <div className='hidden md:block'>
                     <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>Tresor</p>
                  </div>
                  <ChevronDown className='w-5 h-5 text-slate-400'/>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

export default Header
