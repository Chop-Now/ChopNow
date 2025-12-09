import React from "react";
import { Video } from "lucide-react";
import { assets } from "../assets/assets.js";

const Hero = () => {
  return (
    <div className="mx-auto max-w-[1440px] px-4 lg:px-12" id="home">
      <div className="h-screen w-full rounded-2xl relative overflow-hidden">
        
        {/* Badge centered at top */}
        <div className="absolute top-20 md:top-24 left-1/2 transform -translate-x-1/2 z-10">
          <div className='flex items-center gap-2 md:gap-2 border border-gray-300 p-1.5 md:p-2 pr-3 md:pr-4 rounded-full bg-white/80 backdrop-blur-sm whitespace-nowrap'>
            <div className='flex -space-x-2'>
              <img 
                src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D" 
                alt="User 1" 
                className='w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white object-cover shrink-0'
              />
              <img 
                src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D" 
                alt="User 2" 
                className='w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white object-cover shrink-0'
              />
              <img 
                src="https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D" 
                alt="User 3" 
                className='w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white object-cover shrink-0'
              />
              <img 
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D" 
                alt="User 4" 
                className='w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white object-cover shrink-0'
              />
            </div>
            <p className='text-[11px] md:text-xs font-medium'>Trusted by 1000+ consumers across Africa</p>
          </div>
        </div>
        
        {/*Container with Flex Layout*/}
        <div className="mx-auto max-w-[1440px] px-4 h-full flex flex-col lg:flex-row items-center md:items-center lg:items-start justify-between pt-44 md:pt-40 lg:pt-32 gap-2 md:gap-4 lg:gap-8">
          
          {/* Left Side - Content */}
          <div className="flex-1 max-w-[650px] relative z-10 w-full lg:mt-24 text-center lg:text-left">
            <h2 
              className="mb-3 font-bold leading-tight"
              style={{ fontSize: 'clamp(24px, 5vw, 42px)' }}
            >
              Rescue <span className="text-solidOne">Surplus Meals</span> <br />{" "}
              Elevate Taste <br />{" "}
              <span className="text-solidTwo">Sustain Tomorrow</span>
            </h2>
            <p 
              className="leading-relaxed max-w-lg mb-5 mx-auto lg:mx-0"
              style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', lineHeight: '1.5' }}
            >
              ChopNow connects you with African grocers, restaurants, and
              farmers to discover fresh surplus meals at up to 70% off —
              reducing food waste while fueling communities.
            </p>
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center md:justify-center lg:justify-start gap-2 sm:gap-2.5 mb-5">
                <button className="px-6 py-3 transition-all border border-gray-500/20 text-white text-sm font-medium cursor-pointer active:scale-95 hover:bg-tertiary bg-solid rounded-md h-11 sm:text-base shadow-[5px_5px_0px_0px_rgba(0,0,0,0.35)] w-80 sm:w-auto">
                    Get started
                </button>
                <button className="flex items-center justify-center gap-2 border border-slate-600 active:scale-95 hover:bg-white/10 transition text-slate-600 rounded-md px-4 h-11 text-sm sm:text-base font-semibold bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,0.25)] cursor-pointer w-80 sm:w-auto">
                  <Video size={18} />
                    <span>Watch demo</span>
                </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 md:gap-5 mt-5 max-w-xl mx-auto lg:mx-0">
              <div>
                <h4 className="font-bold mb-0.5 text-base md:text-xl" style={{ color: 'var(--color-solid)' }}>25+</h4>
                <p className="text-[8px] md:text-xs leading-tight" style={{ color: 'var(--color-textColor)' }}>Launch Partners</p>
              </div>
              <div>
                <h4 className="font-bold mb-0.5 text-base md:text-xl" style={{ color: 'var(--color-solid)' }}>50K</h4>
                <p className="text-[8px] md:text-xs leading-tight" style={{ color: 'var(--color-textColor)' }}>Households</p>
              </div>
              <div>
                <h4 className="font-bold mb-0.5 text-base md:text-xl" style={{ color: 'var(--color-solid)' }}>120K</h4>
                <p className="text-[8px] md:text-xs leading-tight" style={{ color: 'var(--color-textColor)' }}>Meals Rescued</p>
              </div>
              <div>
                <h4 className="font-bold mb-0.5 text-base md:text-xl" style={{ color: 'var(--color-solid)' }}>3</h4>
                <p className="text-[8px] md:text-xs leading-tight" style={{ color: 'var(--color-textColor)' }}>Countries</p>
              </div>
            </div>
          </div>

          {/* Right Side - Background Image */}
          <div className="flex-1 w-full h-[420px] md:h-[520px] lg:h-[780px] flex items-start justify-center -mt-110 md:-mt-60 lg:-mt-72">
            <img 
              src={assets.bg} 
              alt="ChopNow" 
              className="w-[120%] h-[120%] object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
