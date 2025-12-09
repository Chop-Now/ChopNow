import { Linkedin } from 'lucide-react'
import React from 'react'

const Advisors = () => {
  const advisors = [
    {
      name: "Chinedu Okafor",
      role: "Former COO at NaijaGrocer",
      description: "With 20+ years orchestrating cross-border supply chains. Chinedu guides our operational playbooks for scale.",
      image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
    },
    {
      name: "Fatima Gaye",
      role: "Ex-program director at EcoSavor Senegal and global climate advocate.",
      description: "Fatima shapes our measurement framework for environmental and social impact.",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
    },
    {
      name: "Michael Adeyemi",
      role: "Former product lead at MarketSquare.",
      description: "Michael keeps our product roadmap inclusive, data-informed, and grounded in African consumer behavior.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      name: "Oluwatobi Mensah",
      role: "Co-founder of HarvestAid Ghana",
      description: "With deep redistribution expertise. Oluwatobi helps us forge partnerships with NGOs, schools, and food heroes.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop"
    }
  ];

  return (
    <div className="flex flex-col items-center text-center px-4 py-12 md:py-16" id="advisors">
      <h1 className="text-3xl md:text-4xl font-semibold mb-4" style={{ color: 'var(--color-textColor)' }}>Meet Our Advisors</h1>
      <p className="max-w-2xl mb-12 text-sm md:text-base" style={{ color: 'var(--color-gray-50)' }}>Industry leaders guiding ChopNow's mission to transform food access and sustainability.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
        {advisors.map((advisor, index) => (
          <div 
            key={index}
            className="group flex flex-col items-center p-6 text-sm rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2 h-full"
            style={{ 
              backgroundColor: 'white',
              border: '1px solid rgba(0, 168, 107, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              minHeight: '420px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-solid)';
              e.currentTarget.style.borderColor = 'var(--color-solid)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 168, 107, 0.3), 0 0 40px rgba(0, 168, 107, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = 'rgba(0, 168, 107, 0.2)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
            }}
          >
            <img 
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:border-white/90 transition-all" 
              src={advisor.image} 
              alt={advisor.name}
            />
            <h2 className="text-lg font-semibold mt-4 transition-colors" style={{ color: 'var(--color-textColor)' }}>
              <span className="group-hover:text-white">{advisor.name}</span>
            </h2>
            <p className="text-xs mt-2 font-medium transition-colors" style={{ color: 'var(--color-solid)' }}>
              <span className="group-hover:text-white/90">{advisor.role}</span>
            </p>
            <p className="text-center text-xs mt-4 flex-1 leading-relaxed transition-colors" style={{ color: 'var(--color-gray-50)' }}>
              <span className="group-hover:text-white/80">{advisor.description}</span>
            </p>
            <div className="flex items-center mt-6 transition-colors" style={{ color: 'var(--color-solid)' }}>
              <a href="#" className="hover:scale-110 transition-transform group-hover:text-white">
                <Linkedin size={22} />
              </a>
            </div>
          </div>
        ))}
      </div>
</div>
  )
}

export default Advisors
