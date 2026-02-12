import { assets } from '../assets/assets'
import { Eye, EyeOff, Lock, Mail, PersonStanding, Handshake, MapPin, LocateFixed } from 'lucide-react'
import React, { useState } from 'react'

import { useGeolocation } from '../Components/maps/useGeolocation'
import { reverseGeocode, searchAddress } from '../services/geocoding'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'
import { useNavigate, Link } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google';
import { businessService } from '../services';
import LocationPicker from '../Components/maps/LocationPicker'

const Login = () => {
  const { login, googleAuth } = useAppContext();
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null); // null, 'buyer', or 'business'
  const [showPassword, setShowPassword] = useState(false);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await googleAuth(tokenResponse.access_token);
        // Redirect consumers to shop
        navigate('/shop');
      } catch (err) {
        console.error(err);
      }
    },
    onError: () => console.log('Google Login Failed'),
  });

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { getCurrentLocation } = useGeolocation();

  return (
    <div className="min-h-screen w-full flex">
      <div className="flex w-full">
        {/* Left Side - Image (Hidden on mobile) */}
        <div className="w-1/2 hidden md:block md:fixed md:left-0 md:top-0 md:h-screen">
          <img className="h-full w-full object-cover" src={assets.login_bg} alt="Login background" />
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
                <h2 className="text-4xl font-medium text-center" style={{ color: 'var(--color-textColor)' }}>Sign in</h2>
                <p className="text-sm mt-3 text-center" style={{ color: 'var(--color-gray-50)' }}>Choose how you want to sign in</p>

                {/* Sign in as Buyer Button */}
                <button
                  type="button"
                  onClick={() => setUserType('buyer')}
                  className="w-full mt-8 bg-gray-100 border border-solid border-gray-300 flex items-center justify-center h-14 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-3">
                    <PersonStanding className="w-5 h-5" style={{ color: 'var(--color-solid)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-textColor)' }}>Sign in as Buyer</span>
                </button>

                {/* Sign in as Business Button */}
                <button
                  type="button"
                  onClick={() => setUserType('business')}
                  className="w-full mt-4 bg-gray-100 border border-solid border-gray-300 flex items-center justify-center h-14 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-3">
                    <Handshake className="w-5 h-5" style={{ color: 'var(--color-solid)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-textColor)' }}>Sign in as Business</span>
                </button>

                {/* Sign up link */}
                <p className="text-sm mt-8 text-center" style={{ color: 'var(--color-gray-50)' }}>
                  Don't have an account? <Link to="/signup" className="hover:underline font-medium" style={{ color: 'var(--color-solid)' }}>Sign up</Link>
                </p>
              </div>
            ) : (
              <form className="flex flex-col">
                <div className="relative mb-4">
                  <h2 className="text-2xl font-medium text-center" style={{ color: 'var(--color-textColor)' }}>
                    {userType === 'buyer' ? 'Sign in as Buyer' : 'Sign in as Business'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setUserType(null)}
                    className="absolute right-0 top-0 text-sm hover:underline"
                    style={{ color: 'var(--color-solid)' }}
                  >
                    Back
                  </button>
                </div>
                <p className="text-sm mb-6 text-center" style={{ color: 'var(--color-gray-50)' }}>
                  Welcome back! Please sign in to continue
                </p>

                {userType === 'buyer' && (
                  <>
                    {/* Google Button */}
                    <button
                      type="button"
                      onClick={() => loginWithGoogle()}
                      className="w-full bg-gray-100 border border-solid border-gray-300 flex items-center justify-center h-12 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
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
                  </>
                )}

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

                {/* Location Section - Only for Buyers */}
                {userType === 'buyer' && (
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
                            } catch {
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
                                } catch {
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
                              } catch {
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
                          } catch {
                            setAddress(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  onClick={async (e) => {
                    e.preventDefault();
                    // Get email and password from inputs
                    const form = e.target.closest('form');
                    const emailInput = form.querySelector('input[type="email"]');
                    // Password input type changes when "show password" is toggled, so use placeholder to find it
                    const passwordInput = form.querySelector('input[placeholder="Password"]');

                    const email = emailInput?.value;
                    const password = passwordInput?.value;

                    if (!email || !password) {
                      toast.error("Please enter email and password");
                      return;
                    }

                    try {
                      // Map userType to role for the login function
                      const preferredRole = userType === 'business' ? 'business_owner' : 'consumer';
                      const result = await login(email, password, preferredRole);
                      const loggedInUser = result.user;

                      // Get roles from response
                      const userRoles = loggedInUser.roles || [loggedInUser.role];
                      const currentActiveRole = loggedInUser.activeRole || loggedInUser.role;

                      // Handle business owner login
                      if (userType === 'business' || currentActiveRole === 'business_owner') {
                        // Check if user has business_owner role
                        if (!userRoles.includes('business_owner')) {
                          toast.error("This account is not registered as a business. You can add a business from your profile.");
                          // Redirect to shop instead since they're a consumer
                          window.location.href = '/shop';
                          return;
                        }

                        toast.success("Login successful!");

                        // Fetch the business to check verification status
                        try {
                          const businessResponse = await businessService.getMyBusinesses();
                          const businesses = businessResponse.businesses || businessResponse || [];

                          if (businesses.length === 0) {
                            // No business created yet, redirect to verification
                            window.location.href = '/business-verification';
                            return;
                          }

                          const business = businesses[0]; // Get the first business
                          const verificationStatus = business.verification?.status;

                          // Check business verification/approval status
                          // Business is approved if status is 'active' and verification.status is 'verified' or 'approved'
                          const isApproved = business.status === 'active' &&
                                            (verificationStatus === 'verified' || verificationStatus === 'approved');

                          if (isApproved) {
                            // Approved/auto-verified business - go to dashboard
                            window.location.href = '/dashboard';
                          } else if (verificationStatus === 'pending') {
                            // Documents submitted, waiting for review
                            window.location.href = '/pending-review';
                          } else if (verificationStatus === 'unverified') {
                            // Restaurant/cafe that needs to submit documents
                            window.location.href = '/business-verification';
                          } else {
                            // Any other state - go to verification page
                            window.location.href = '/business-verification';
                          }
                        } catch (bizError) {
                          console.error("Error fetching business:", bizError);
                          // If we can't fetch business, redirect to verification
                          window.location.href = '/business-verification';
                        }
                      } else {
                        // Consumer login - redirect to shop
                        toast.success("Login successful!");
                        window.location.href = '/shop';
                      }

                    } catch (error) {
                      console.error("Login error:", error);
                      toast.error(error.message || "Login failed");
                    }
                  }}
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
