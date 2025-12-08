import React from "react";
import Rating from "./Rating";
import { Video } from "lucide-react";
import { assets } from "../assets/assets.js";

const Hero = () => {
  return (
    <div className="max-padd-container">
      <div 
        className="h-screen w-full rounded-2xl relative overflow-hidden"
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ 
            backgroundImage: `url(${assets.bg})`, 
            top: '30px'
          }}
        ></div>
        
        {/* Badge centered at top */}
        <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-10">
          <div className='inline-flex items-center gap-2 border border-gray-300 p-1.5 pr-4 rounded-full bg-white/80 backdrop-blur-sm'>
            <div className='flex -space-x-2'>
              <img 
                src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D" 
                alt="User 1" 
                className='w-8 h-8 rounded-full border-2 border-white object-cover'
              />
              <img 
                src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D" 
                alt="User 2" 
                className='w-8 h-8 rounded-full border-2 border-white object-cover'
              />
              <img 
                src="https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D" 
                alt="User 3" 
                className='w-8 h-8 rounded-full border-2 border-white object-cover'
              />
              <img 
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D" 
                alt="User 4" 
                className='w-8 h-8 rounded-full border-2 border-white object-cover'
              />
            </div>
            <p className='text-xs font-medium'>Trusted by 1000+ consumers across Africa</p>
          </div>
        </div>
        
        {/*Container*/}
        <div className="mx-auto max-w-[1440px] px-4 flex flex-col justify-between h-full">
          {/*Top*/}
          <div className="max-w-[650px] pt-36 lg:pt-48">
            <h2 
              className="mb-3 font-bold leading-tight"
              style={{ fontSize: 'clamp(26px, 3.5vw, 42px)' }}
            >
              Rescue <span className="text-solidOne">Surplus Meals</span> <br />{" "}
              Elevate Taste <br />{" "}
              <span className="text-solidTwo">Sustain Tomorrow</span>
            </h2>
            <p 
              className="leading-relaxed max-w-lg mb-5"
              style={{ fontSize: '16px', lineHeight: '1.5' }}
            >
              ChopNow connects you with African grocers, restaurants, and
              farmers to discover fresh surplus meals at up to 70% off —
              reducing food waste while fueling communities.
            </p>
            <div className="flex items-center gap-2.5 mb-5">
                <button className="btn-solid hover:bg-tertiary text-white active:scale-95 transition rounded-md px-5 h-11 text-base font-semibold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.35)] cursor-pointer">
                    Get started
                </button>
                <button className="flex items-center gap-2 border border-slate-600 active:scale-95 hover:bg-white/10 transition text-slate-600 rounded-md px-4 h-11 text-base font-semibold bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,0.25)] cursor-pointer">
                  <Video size={18} />
                    <span>Watch demo</span>
                </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5 max-w-xl">
              <div>
                <h4 className="font-bold mb-0.5" style={{ color: 'var(--color-solid)', fontSize: '20px' }}>25+</h4>
                <p className="text-xs leading-tight" style={{ color: 'var(--color-textColor)' }}>Launch Partners across Rwanda & Lagos</p>
              </div>
              <div>
                <h4 className="font-bold mb-0.5" style={{ color: 'var(--color-solid)', fontSize: '20px' }}>50K</h4>
                <p className="text-xs leading-tight" style={{ color: 'var(--color-textColor)' }}>Projected Households</p>
              </div>
              <div>
                <h4 className="font-bold mb-0.5" style={{ color: 'var(--color-solid)', fontSize: '20px' }}>120K</h4>
                <p className="text-xs leading-tight" style={{ color: 'var(--color-textColor)' }}>Meal Rescue Target (Year 1)</p>
              </div>
              <div>
                <h4 className="font-bold mb-0.5" style={{ color: 'var(--color-solid)', fontSize: '20px' }}>3</h4>
                <p className="text-xs leading-tight" style={{ color: 'var(--color-textColor)' }}>Countries</p>
              </div>
            </div>
          </div>
          {/*Bottom*/}
          <div className="pb-9">
             <Rating />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
