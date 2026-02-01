import Footer from '@/Components/Footer'
import PageNavbar from '@/Components/PageNavbar'
import React from 'react'
import { Award, Leaf, Droplets, Wind } from 'lucide-react'

const MyImpact = () => {
  // Dummy data for the chart
  const chartData = [
    { month: 'Jan', meals: 8, co2: 20 },
    { month: 'Feb', meals: 12, co2: 30 },
    { month: 'Mar', meals: 15, co2: 37 },
    { month: 'Apr', meals: 10, co2: 25 },
    { month: 'May', meals: 18, co2: 45 },
    { month: 'Jun', meals: 22, co2: 55 },
    { month: 'Jul', meals: 20, co2: 50 },
    { month: 'Aug', meals: 25, co2: 62 },
    { month: 'Sep', meals: 30, co2: 75 },
    { month: 'Oct', meals: 28, co2: 70 },
    { month: 'Nov', meals: 32, co2: 80 },
    { month: 'Dec', meals: 35, co2: 88 },
  ]

  const maxMeals = Math.max(...chartData.map(d => d.meals))
  const maxCo2 = Math.max(...chartData.map(d => d.co2))

  return (
    <div>
      <div className='bg-white min-h-screen pt-20'>
        <PageNavbar />
        
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          {/* Header */}
          <div className='mb-6 text-center'>
            <h2 className='text-xl font-bold text-gray-900 mb-1'>Your Impact Summary</h2>
            <p className='text-sm text-gray-600'>Thank you for making a difference! Here's a summary of your positive environmental impact.</p>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-3 gap-2 md:gap-4 mb-8'>
            {/* Meals Rescued Card */}
            <div className='bg-white rounded-lg shadow-md p-3 md:p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center'>
              <div className='flex items-center justify-center mb-1'>
                <Leaf className='w-5 h-5 md:w-6 md:h-6' style={{ color: 'var(--color-solid)' }} />
              </div>
              <h3 className='text-gray-600 text-[10px] md:text-xs font-medium mb-1'>Meals Rescued</h3>
              <p className='text-lg md:text-2xl font-bold text-gray-900'>123</p>
            </div>

            {/* CO2e Saved Card */}
            <div className='bg-white rounded-lg shadow-md p-3 md:p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center'>
              <div className='flex items-center justify-center mb-1'>
                <Wind className='w-5 h-5 md:w-6 md:h-6' style={{ color: 'var(--color-solid)' }} />
              </div>
              <h3 className='text-gray-600 text-[10px] md:text-xs font-medium mb-1'>CO2e Saved</h3>
              <p className='text-lg md:text-2xl font-bold text-gray-900'>310<span className='text-sm md:text-base'>kg</span></p>
            </div>

            {/* Water Saved Card */}
            <div className='bg-white rounded-lg shadow-md p-3 md:p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center'>
              <div className='flex items-center justify-center mb-1'>
                <Droplets className='w-5 h-5 md:w-6 md:h-6' style={{ color: 'var(--color-solid)' }} />
              </div>
              <h3 className='text-gray-600 text-[10px] md:text-xs font-medium mb-1'>Water Saved</h3>
              <p className='text-lg md:text-2xl font-bold text-gray-900'>155,000<span className='text-sm md:text-base'>L</span></p>
            </div>
          </div>

          {/* Milestones Section */}
          <div className='mb-8'>
            <h2 className='text-lg font-bold text-gray-900 mb-1 text-center'>Your Contribution Milestones</h2>
            <p className='text-sm text-gray-600 mb-4 text-center'>See how you're progressing towards the next level of impact.</p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto'>
              {/* Meals Milestone Card */}
              <div className='bg-white rounded-lg shadow-md p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300'>
                <div className='flex items-start justify-between mb-3'>
                  <div>
                    <h3 className='text-base font-bold text-gray-900 mb-1'>Food Waste Warrior</h3>
                    <p className='text-gray-600 text-xs'>Rescue 26 more meals to unlock the Eco-Hero badge!</p>
                  </div>
                  <div className='flex items-center gap-1 text-xs font-medium whitespace-nowrap' style={{ color: 'var(--color-solid)' }}>
                    <Award className='w-4 h-4' />
                    <span>Next: Eco-Hero</span>
                  </div>
                </div>
                
                <div className='mb-2'>
                  <div className='flex justify-between text-xs mb-1'>
                    <span className='font-medium text-gray-700'>124 / 150 meals</span>
                    <span className='font-bold' style={{ color: 'var(--color-solid)' }}>82%</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div 
                      className='h-2 rounded-full transition-all duration-500'
                      style={{ width: '82%', background: 'linear-gradient(to right, #00A86B, #007A4B)' }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* CO2 Milestone Card */}
              <div className='bg-white rounded-lg shadow-md p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300'>
                <div className='flex items-start justify-between mb-3'>
                  <div>
                    <h3 className='text-base font-bold text-gray-900 mb-1'>Carbon Crusader</h3>
                    <p className='text-gray-600 text-xs'>Save 90 more kg of CO2e to unlock the Climate Champion badge!</p>
                  </div>
                  <div className='flex items-center gap-1 text-xs font-medium whitespace-nowrap' style={{ color: 'var(--color-solidOne)' }}>
                    <Award className='w-4 h-4' />
                    <span>Next: Climate Champion</span>
                  </div>
                </div>
                
                <div className='mb-2'>
                  <div className='flex justify-between text-xs mb-1'>
                    <span className='font-medium text-gray-700'>310 / 400 kg</span>
                    <span className='font-bold' style={{ color: 'var(--color-solidOne)' }}>77%</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div 
                      className='h-2 rounded-full transition-all duration-500'
                      style={{ width: '77%', background: 'linear-gradient(to right, #FFB366, #FF7A00)' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Over Time Chart */}
          <div className='mb-8'>
            <div className='text-center mb-4'>
              <h2 className='text-lg font-bold text-gray-900 mb-1'>Your Impact Over Time</h2>
              <p className='text-sm text-gray-600'>This chart visualizes your growing contribution to a healthier planet each month.</p>
            </div>

            <div className='bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-300'>
              <div className='flex gap-4 mb-3'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded' style={{ backgroundColor: 'var(--color-solid)' }}></div>
                  <span className='text-xs text-gray-600'>Meals Rescued</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded' style={{ backgroundColor: 'var(--color-solidOne)' }}></div>
                  <span className='text-xs text-gray-600'>CO2e Saved (kg)</span>
                </div>
              </div>

              {/* Chart */}
              <div className='relative h-64'>
                {/* Y-axis labels */}
                <div className='absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 w-8'>
                  <span>{Math.max(maxMeals, maxCo2)}</span>
                  <span>{Math.floor(Math.max(maxMeals, maxCo2) * 0.75)}</span>
                  <span>{Math.floor(Math.max(maxMeals, maxCo2) * 0.5)}</span>
                  <span>{Math.floor(Math.max(maxMeals, maxCo2) * 0.25)}</span>
                  <span>0</span>
                </div>

                {/* Chart area */}
                <div className='absolute left-10 right-0 top-0 bottom-8'>
                  {/* Grid lines */}
                  <div className='absolute inset-0 flex flex-col justify-between'>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className='w-full border-t border-gray-200'></div>
                    ))}
                  </div>

                  {/* SVG for lines */}
                  <svg className='absolute inset-0 w-full h-full'>
                    {/* Meals line (green) */}
                    <polyline
                      fill='none'
                      stroke='#00A86B'
                      strokeWidth='2'
                      points={chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1)) * 100
                        const y = 100 - (d.meals / maxMeals) * 100
                        return `${x}%,${y}%`
                      }).join(' ')}
                    />
                    {/* CO2 line (orange) */}
                    <polyline
                      fill='none'
                      stroke='#FF7A00'
                      strokeWidth='2'
                      points={chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1)) * 100
                        const y = 100 - (d.co2 / maxCo2) * 100
                        return `${x}%,${y}%`
                      }).join(' ')}
                    />
                    {/* Data points for meals */}
                    {chartData.map((d, i) => {
                      const x = (i / (chartData.length - 1)) * 100
                      const y = 100 - (d.meals / maxMeals) * 100
                      return (
                        <circle
                          key={`meal-${i}`}
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r='3'
                          fill='#00A86B'
                        />
                      )
                    })}
                    {/* Data points for CO2 */}
                    {chartData.map((d, i) => {
                      const x = (i / (chartData.length - 1)) * 100
                      const y = 100 - (d.co2 / maxCo2) * 100
                      return (
                        <circle
                          key={`co2-${i}`}
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r='3'
                          fill='#FF7A00'
                        />
                      )
                    })}
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className='absolute left-10 right-0 bottom-0 flex justify-between text-xs text-gray-500'>
                  {chartData.map((d) => (
                    <span key={d.month}>{d.month}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default MyImpact
