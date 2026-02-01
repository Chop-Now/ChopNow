import { assets } from '@/assets/assets'
import { Eye, EyeOff, Lock, Mail, User, MapPin, LocateFixed, PersonStanding, Handshake } from 'lucide-react'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import LocationPicker from '@/Components/maps/LocationPicker'
import { useGeolocation } from '@/Components/maps/useGeolocation'
import { reverseGeocode, searchAddress } from '@/services/geocoding'
import toast from 'react-hot-toast'


const SignUp = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null); // null, 'buyer', or 'business'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { getCurrentLocation } = useGeolocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (userType === 'business') {
      // Redirect to business verification page
      navigate('/business-verification');
    } else {
      // Handle buyer signup
      toast.success('Account created successfully!');
      // Add your buyer signup logic here
    }
  };

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
            {/* User Type Selection */}
            {!userType ? (
              <div className="flex flex-col">
                <h2 className="text-4xl font-medium text-center" style={{ color: 'var(--color-textColor)' }}>Sign up</h2>
                <p className="text-sm mt-3 text-center" style={{ color: 'var(--color-gray-50)' }}>Choose how you want to sign up</p>

                {/* Sign up as Buyer Button */}
                <button 
                  type="button"
                  onClick={() => setUserType('buyer')}
                  className="w-full mt-4 bg-gray-100 border border-solid border-gray-300 flex items-center justify-center h-14 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-3">
                    <PersonStanding className="w-5 h-5" style={{ color: 'var(--color-solid)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-textColor)' }}>Sign up as Buyer</span>
                </button>

                {/* Sign up as Business Button */}
                <button 
                  type="button"
                  onClick={() => setUserType('business')}
                  className="w-full mt-4 bg-gray-100 border border-solid border-gray-300 flex items-center justify-center h-14 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-3">
                    <Handshake className="w-5 h-5" style={{ color: 'var(--color-solid)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-textColor)' }}>Sign up as Business</span>
                </button>

                {/* Sign in link */}
                <p className="text-sm mt-8 text-center" style={{ color: 'var(--color-gray-50)' }}>
                  Already have an account? <Link to="/login" className="hover:underline font-medium" style={{ color: 'var(--color-solid)' }}>Sign in</Link>
                </p>
              </div>
            ) : (
              <form className="flex flex-col" onSubmit={handleSubmit}>
                <div className="relative mb-4">
                  <h2 className="text-2xl font-medium text-center" style={{ color: 'var(--color-textColor)' }}>
                    {userType === 'buyer' ? 'Sign up as Buyer' : 'Sign up as Business'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setUserType(null)}
                    className="absolute right-0 top-0 text-sm hover:underline cursor-pointer"
                    style={{ color: 'var(--color-solid)' }}
                  >
                    Back
                  </button>
                </div>
                <p className="text-sm mb-6 text-center" style={{ color: 'var(--color-gray-50)' }}>
                  {userType === 'buyer' ? 'Create your buyer account' : 'Create your business account'}
                </p>

                {userType === 'buyer' ? (
                  // Buyer Form
                  <>
                    {/* Google Button */}
                    <button 
                      type="button" 
                      className="w-full bg-gray-100 border border-solid border-gray-300 flex items-center justify-center h-12 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
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

                    {/* Phone Number */}
                    <div className="mt-4">
                      <PhoneInput
                        country={'rw'}
                        value={phone}
                        onChange={setPhone}
                        enableSearch={true}
                        searchPlaceholder="Search country"
                        placeholder="Choose your country"
                        containerClass="w-full"
                        inputClass="!w-full !h-12 !border-gray-300 !rounded-lg !text-sm !bg-transparent"
                        buttonClass="!border-gray-300 !rounded-l-lg !bg-transparent !h-12 !hover:bg-gray-100"
                        dropdownClass="!text-sm !bg-white !border !border-gray-300 !rounded-lg !shadow-lg"
                        searchClass="!text-sm !p-2 !border-gray-300 !m-2 !rounded-md"
                        inputStyle={{ color: 'var(--color-textColor)' }}
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

                    {/* Location Section */}
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-textColor)' }}>Your Location</h3>
                      
                      {/* Use Current Location Button */}
                      <button 
                        type="button"
                        onClick={async () => {
                          setIsLoadingLocation(true);
                          getCurrentLocation(
                            async (coords) => {
                              setLocation(coords);
                              try {
                                const result = await reverseGeocode(coords.lat, coords.lng);
                                setAddress(result.display_name || 'Location detected');
                                toast.success('Location detected successfully!');
                              } catch (error) {
                                toast.error('Could not fetch address');
                              }
                              setIsLoadingLocation(false);
                            },
                            (error) => {
                              toast.error(error);
                              setIsLoadingLocation(false);
                            }
                          );
                        }}
                        disabled={isLoadingLocation}
                        className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <LocateFixed className="w-5 h-5" style={{ color: 'var(--color-solid)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--color-textColor)' }}>
                          {isLoadingLocation ? 'Detecting location...' : 'Use my current location'}
                        </span>
                      </button>

                      {/* Manual Address Input */}
                      <div className="mt-3 relative">
                        <div className="flex items-center w-full bg-transparent border border-gray-300 h-12 rounded-lg overflow-hidden px-4 gap-3">
                          <MapPin className="w-5 h-5" style={{ color: 'var(--color-gray-50)' }} />
                          <MapPin className="w-5 h-5" style={{ color: 'var(--color-gray-50)' }} />
                          <input 
                            type="text" 
                            placeholder="Or enter address manually" 
                            value={manualAddress}
                            onChange={(e) => setManualAddress(e.target.value)}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (manualAddress.trim()) {
                                  try {
                                    const results = await searchAddress(manualAddress);
                                    if (results && results.length > 0) {
                                      const result = results[0];
                                      setLocation({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
                                      setAddress(result.display_name);
                                      toast.success('Address found!');
                                    } else {
                                      toast.error('Address not found');
                                    }
                                  } catch (error) {
                                    toast.error('Could not search address');
                                  }
                                }
                              }
                            }}
                            className="bg-transparent outline-none text-sm w-full h-full" 
                            style={{ color: 'var(--color-textColor)' }}
                          />                 
                        </div>
                        {manualAddress && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (manualAddress.trim()) {
                                try {
                                  const results = await searchAddress(manualAddress);
                                  if (results && results.length > 0) {
                                    const result = results[0];
                                    setLocation({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
                                    setAddress(result.display_name);
                                    toast.success('Address found!');
                                  } else {
                                    toast.error('Address not found');
                                  }
                                } catch (error) {
                                  toast.error('Could not search address');
                                }
                              }
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs rounded-md text-white"
                            style={{ backgroundColor: 'var(--color-solid)' }}
                          >
                            Search
                          </button>
                        )}
                      </div>

                      {/* Selected Address Display */}
                      {address && (
                        <p className="mt-2 text-xs" style={{ color: 'var(--color-gray-50)' }}>
                          Selected: {address}
                        </p>
                      )}

                      {/* Map */}
                      <div className="mt-4">
                        <LocationPicker 
                          selectedLocation={location}
                          onLocationSelect={async (latlng) => {
                            setLocation({ lat: latlng.lat, lng: latlng.lng });
                            try {
                              const result = await reverseGeocode(latlng.lat, latlng.lng);
                              setAddress(result.display_name || 'Location selected');
                            } catch (error) {
                              setAddress(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  // Business Form
                  <>
                    {/* Business Name */}
                    <div className="flex items-center w-full bg-transparent border border-gray-300 h-12 rounded-lg overflow-hidden px-4 gap-3">
                      <Handshake className="w-5 h-5" style={{ color: 'var(--color-gray-50)' }} />
                      <input 
                        type="text" 
                        placeholder="Business name" 
                        className="bg-transparent outline-none text-sm w-full h-full" 
                        style={{ color: 'var(--color-textColor)' }}
                        required 
                      />                 
                    </div>

                    {/* Contact Person */}
                    <div className="flex items-center w-full bg-transparent border border-gray-300 h-12 rounded-lg overflow-hidden px-4 gap-3 mt-4">
                      <User className="w-5 h-5" style={{ color: 'var(--color-gray-50)' }} />
                      <input 
                        type="text" 
                        placeholder="Contact person" 
                        className="bg-transparent outline-none text-sm w-full h-full" 
                        style={{ color: 'var(--color-textColor)' }}
                        required 
                      />                 
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
                  </>
                )}

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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
