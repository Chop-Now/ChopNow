import React from 'react'
import { assets } from '../assets/assets'

const Apps = () => {
  return (
    <div className="flex justify-center items-center px-4 py-12 md:py-16">
      <div 
        className="flex flex-col md:flex-row items-center justify-around text-sm rounded-2xl max-w-5xl w-full relative overflow-hidden"
        style={{ 
          backgroundColor: 'var(--color-primary)',
          border: '2px solid var(--color-solid)',
          boxShadow: '0 0 40px rgba(0, 168, 107, 0.15), 0 10px 30px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex flex-col text-center md:text-left items-center md:items-start pt-14 md:p-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ backgroundColor: 'var(--color-solidOne)', color: 'white' }}>
            Coming Soon
          </div>
          <h2 className="md:text-4xl text-2xl font-semibold" style={{ color: 'var(--color-textColor)' }}>Download Mobile App</h2>
          <p className="mt-2 w-3/4" style={{ color: 'var(--color-gray-50)', fontSize: '15px' }}>Mobile app for iOS & Android to get a personalized feed of nearby surplus meals, exclusive drops, and smart pick-up reminders, all inside an intuitive experience built for busy urban explorers.</p>

          <div className="flex items-center gap-4 mt-6">
            <button 
              aria-label="googlePlayBtn" 
              className="transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl" 
              type="button"
            >
              <img 
                className="md:w-44 w-28 rounded-2xl cursor-pointer"
                src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/appDownload/googlePlayBtn.svg"
                alt="googlePlayBtn"
              />
            </button>
            <button 
              aria-label="appleStoreBtn" 
              className="transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl" 
              type="button"
            >
              <img 
                className="md:w-44 w-28 rounded-2xl cursor-pointer"
                src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/appDownload/appleStoreBtn.svg"
                alt="appleStoreBtn"
              />
            </button>
          </div>
        </div>

        <img 
          className="max-w-[375px] pt-10 md:p-0"
          src={assets.pointing}
          alt="Man pointing left" 
        />
      </div>
    </div>
  )
}

export default Apps
