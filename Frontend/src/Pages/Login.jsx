import { assets } from '@/assets/assets'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-0">
      <div className="flex w-full h-screen">
        {/* Left Side - Image (Hidden on mobile) */}
        <div className="w-1/2 hidden md:block">
          <img className="h-full w-full object-cover" src={assets.login_bg} alt="Login background" />
        </div>

        {/* Right Side - Form Container */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-4">
          {/* Logo */}
          <div className="mb-8">
            <img src={assets.ChopNowLogo} alt="ChopNow Logo" className="h-12" />
          </div>
          
          <div className="border border-gray-500/20 rounded-2xl p-8 md:p-12 w-full max-w-lg">
            <form className="flex flex-col">
              <h2 className="text-4xl font-medium text-center" style={{ color: 'var(--color-textColor)' }}>Sign in</h2>
              <p className="text-sm mt-3 text-center" style={{ color: 'var(--color-gray-50)' }}>Welcome back! Please sign in to continue</p>

              {/* Google Button */}
              <button 
                type="button" 
                className="w-full mt-8 bg-gray-100 border border-solid border-gray-300 flex items-center justify-center h-12 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <img src={assets.google} alt="Google Logo" className="w-5 h-5" />
                <span className="ml-2 text-sm font-medium" style={{ color: 'var(--color-textColor)' }}>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 w-full my-6">
                <div className="w-full h-px bg-gray-300"></div>
                <p className="text-nowrap text-sm" style={{ color: 'var(--color-gray-50)' }}>or sign in with email</p>
                <div className="w-full h-px bg-gray-300"></div>
              </div>

              {/* Email Input */}
              <div className="flex items-center w-full bg-transparent border border-gray-300 h-12 rounded-lg overflow-hidden px-4 gap-3">
                <Mail className="w-5 h-5" style={{ color: 'var(--color-gray-50)' }} />
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-transparent outline-none text-sm w-full h-full" 
                  style={{ color: 'var(--color-textColor)' }}
                  required 
                />                 
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

              {/* Remember me & Forgot password */}
              <div className="w-full flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                  <input className="w-4 h-4 cursor-pointer" type="checkbox" id="checkbox" />
                  <label className="text-sm cursor-pointer" htmlFor="checkbox" style={{ color: 'var(--color-gray-50)' }}>Remember me</label>
                </div>
                <a className="text-sm hover:underline" href="#" style={{ color: 'var(--color-solid)' }}>Forgot password?</a>
              </div>

              {/* Login Button */}
              <button 
                type="submit" 
                className="mt-8 w-full h-11 rounded-lg text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
                style={{ backgroundColor: 'var(--color-solid)' }}
              >
                Login
              </button>

              {/* Sign up link */}
              <p className="text-sm mt-4 text-center" style={{ color: 'var(--color-gray-50)' }}>
                Don't have an account? <Link to="/signup" className="hover:underline font-medium" style={{ color: 'var(--color-solid)' }}>Sign up</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
