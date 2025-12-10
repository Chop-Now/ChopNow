import { assets } from '@/assets/assets'
import { Eye, EyeOff, Lock, Mail, User, Phone } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('+234');

  const countries = [
    { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
    { code: '+254', name: 'Kenya', flag: '🇰🇪' },
    { code: '+233', name: 'Ghana', flag: '🇬🇭' },
    { code: '+27', name: 'South Africa', flag: '🇿🇦' },
    { code: '+251', name: 'Ethiopia', flag: '🇪🇹' },
    { code: '+256', name: 'Uganda', flag: '🇺🇬' },
    { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
    { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
  ];

  return (
    <div className="min-h-screen w-full flex">
      <div className="flex w-full">
        {/* Left Side - Image (Hidden on mobile) */}
        <div className="w-1/2 hidden md:block md:fixed md:left-0 md:top-0 md:h-screen">
          <img className="h-full w-full object-cover" src={assets.login_bg} alt="Signup background" />
        </div>

        {/* Right Side - Form Container */}
        <div className="w-full md:w-1/2 md:ml-[50%] flex flex-col items-center justify-center px-4 py-8">
          {/* Logo */}
          <div className="mb-8">
            <img src={assets.ChopNowLogo} alt="ChopNow Logo" className="h-12" />
          </div>
          
          <div className="border border-gray-500/20 rounded-2xl p-8 md:p-12 w-full max-w-lg">
            <form className="flex flex-col">
              <h2 className="text-4xl font-medium text-center" style={{ color: 'var(--color-textColor)' }}>Sign up</h2>
              <p className="text-sm mt-3 text-center" style={{ color: 'var(--color-gray-50)' }}>Create your account to get started</p>

              {/* Google Button */}
              <button 
                type="button" 
                className="w-full mt-8 bg-gray-100 border border-solid border-gray-300 flex items-center justify-center h-12 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <img src={assets.google} alt="Google Logo" className="w-5 h-5" />
                <span className="ml-2 text-sm font-medium" style={{ color: 'var(--color-textColor)' }}>Sign up with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 w-full my-6">
                <div className="w-full h-px bg-gray-300"></div>
                <p className="text-nowrap text-sm" style={{ color: 'var(--color-gray-50)' }}>or sign up with email</p>
                <div className="w-full h-px bg-gray-300"></div>
              </div>

              {/* First Name & Last Name */}
              <div className="flex gap-3">
                <div className="flex items-center flex-1 bg-transparent border border-gray-300 h-12 rounded-lg overflow-hidden px-4 gap-3">
                  <User className="w-5 h-5" style={{ color: 'var(--color-gray-50)' }} />
                  <input 
                    type="text" 
                    placeholder="First name" 
                    className="bg-transparent outline-none text-sm w-full h-full" 
                    style={{ color: 'var(--color-textColor)' }}
                    required 
                  />                 
                </div>
                <div className="flex items-center flex-1 bg-transparent border border-gray-300 h-12 rounded-lg overflow-hidden px-4 gap-3">
                  <User className="w-5 h-5" style={{ color: 'var(--color-gray-50)' }} />
                  <input 
                    type="text" 
                    placeholder="Last name" 
                    className="bg-transparent outline-none text-sm w-full h-full" 
                    style={{ color: 'var(--color-textColor)' }}
                    required 
                  />                 
                </div>
              </div>

              {/* Email Input */}
              <div className="flex items-center w-full bg-transparent border border-gray-300 h-12 rounded-lg overflow-hidden px-4 gap-3 mt-4">
                <Mail className="w-5 h-5" style={{ color: 'var(--color-gray-50)' }} />
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-transparent outline-none text-sm w-full h-full" 
                  style={{ color: 'var(--color-textColor)' }}
                  required 
                />                 
              </div>

              {/* Country & Phone Number */}
              <div className="flex gap-3 mt-4">
                <div className="flex items-center bg-transparent border border-gray-300 h-12 rounded-lg overflow-hidden px-4">
                  <select 
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-transparent outline-none text-sm cursor-pointer" 
                    style={{ color: 'var(--color-textColor)' }}
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center flex-1 bg-transparent border border-gray-300 h-12 rounded-lg overflow-hidden px-4 gap-3">
                  <Phone className="w-5 h-5" style={{ color: 'var(--color-gray-50)' }} />
                  <input 
                    type="tel" 
                    placeholder="Phone number" 
                    className="bg-transparent outline-none text-sm w-full h-full" 
                    style={{ color: 'var(--color-textColor)' }}
                    required 
                  />                 
                </div>
              </div>

              {/* Password Input */}
              <div className="flex items-center mt-4 w-full bg-transparent border border-gray-300 h-12 rounded-lg overflow-hidden px-4 gap-3">
                <Lock className="w-5 h-5" style={{ color: 'var(--color-gray-50)' }} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  className="bg-transparent outline-none text-sm w-full h-full" 
                  style={{ color: 'var(--color-textColor)' }}
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 cursor-pointer" style={{ color: 'var(--color-gray-50)' }} />
                  ) : (
                    <Eye className="w-5 h-5 cursor-pointer" style={{ color: 'var(--color-gray-50)' }} />
                  )}
                </button>
              </div>

              {/* Confirm Password Input */}
              <div className="flex items-center mt-4 w-full bg-transparent border border-gray-300 h-12 rounded-lg overflow-hidden px-4 gap-3">
                <Lock className="w-5 h-5" style={{ color: 'var(--color-gray-50)' }} />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm password" 
                  className="bg-transparent outline-none text-sm w-full h-full" 
                  style={{ color: 'var(--color-textColor)' }}
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="shrink-0"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 cursor-pointer" style={{ color: 'var(--color-gray-50)' }} />
                  ) : (
                    <Eye className="w-5 h-5 cursor-pointer" style={{ color: 'var(--color-gray-50)' }} />
                  )}
                </button>
              </div>

              {/* Create Account Button */}
              <button 
                type="submit" 
                className="mt-8 w-full h-11 rounded-lg text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
                style={{ backgroundColor: 'var(--color-solid)' }}
              >
                Create Account
              </button>

              {/* Terms and Privacy */}
              <p className="text-xs mt-4 text-center" style={{ color: 'var(--color-gray-50)' }}>
                By creating an account, you agree to our{' '}
                <a className="hover:underline font-medium" href="#" style={{ color: 'var(--color-solid)' }}>Terms of Service</a>
                {' '}and{' '}
                <a className="hover:underline font-medium" href="#" style={{ color: 'var(--color-solid)' }}>Privacy Policy</a>
              </p>

              {/* Sign in link */}
              <p className="text-sm mt-4 text-center" style={{ color: 'var(--color-gray-50)' }}>
                Already have an account? <Link to="/login" className="hover:underline font-medium" style={{ color: 'var(--color-solid)' }}>Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
