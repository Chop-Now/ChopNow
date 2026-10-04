import { assets } from '../assets/assets';
import { Eye, EyeOff, Lock, Mail, PersonStanding, Handshake } from 'lucide-react';
import React, { useState, useCallback } from 'react';

import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { businessService, authService } from '../services';
import useContainerWidth from '../utils/useContainerWidth';

const Login = () => {
  const { login, googleAuth } = useAppContext();
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null); // null, 'buyer', or 'business'
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  // H16: the login button had no in-flight guard at all - a double-click or
  // slow network could fire two concurrent login attempts.
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // H5 fix: use the ID-token credential flow (GoogleLogin), not the
  // access-token flow (useGoogleLogin) - Google's Identity Services only
  // issues an audience-bound ID token through this flow, and the backend now
  // requires one to verify the login is actually for this app (see
  // Backend/controllers/userController.js googleLogin).
  // Stable references (useCallback), not inline arrows: @react-oauth/google's
  // GoogleLogin re-invokes Google's renderButton whenever onSuccess/onError
  // change identity, and Google's script appends a fresh button into the
  // container each time rather than replacing it - an inline arrow recreated
  // every render was rendering two stacked "Sign in with Google" buttons in
  // production (found during the 2026-09-26 E2E pass, same bug as SignUp.jsx).
  const handleGoogleSuccess = useCallback(
    async (credentialResponse) => {
      try {
        await googleAuth(credentialResponse.credential);
        // Redirect consumers to shop
        navigate('/shop');
      } catch (err) {
        console.error(err);
      }
    },
    [googleAuth, navigate]
  );
  const handleGoogleError = useCallback(() => toast.error('Google Login Failed'), []);

  const [googleRef, googleWidth] = useContainerWidth(200, 400);

  return (
    <div className="min-h-dvh w-full flex">
      <div className="flex w-full">
        {/* Left Side - Image (Hidden on mobile) */}
        <div className="w-1/2 hidden md:block md:fixed md:left-0 md:top-0 md:h-screen">
          <img
            className="h-full w-full object-cover"
            src={assets.login_bg}
            alt="Login background"
          />
        </div>

        {/* Right Side - Form Container */}
        <div className="w-full md:w-1/2 md:ml-[50%] flex flex-col items-center justify-center px-4 py-8">
          {/* Logo */}
          <div className="mb-8">
            <img src={assets.wordmarklogo} alt="ChopNow" className="h-12" />
          </div>

          <div className="border border-gray-500/20 rounded-2xl p-5 sm:p-8 md:p-12 w-full max-w-lg">
            {/* User Type Selection */}
            {!userType ? (
              <div className="flex flex-col">
                <h2
                  className="text-4xl font-medium text-center"
                  style={{ color: 'var(--color-textColor)' }}
                >
                  Sign in
                </h2>
                <p
                  className="text-sm mt-3 text-center"
                  style={{ color: 'var(--color-moringa-muted)' }}
                >
                  Choose how you want to sign in
                </p>

                {/* Sign in as Buyer Button */}
                <button
                  type="button"
                  onClick={() => setUserType('buyer')}
                  className="w-full mt-8 bg-gray-100 border border-solid border-gray-300 flex items-center justify-center h-14 rounded-lg hover:bg-gray-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solid transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-3">
                    <PersonStanding className="w-5 h-5" style={{ color: 'var(--color-solid)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-textColor)' }}>
                    Sign in as Buyer
                  </span>
                </button>

                {/* Sign in as Business Button */}
                <button
                  type="button"
                  onClick={() => setUserType('business')}
                  className="w-full mt-4 bg-gray-100 border border-solid border-gray-300 flex items-center justify-center h-14 rounded-lg hover:bg-gray-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solid transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-3">
                    <Handshake className="w-5 h-5" style={{ color: 'var(--color-solid)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-textColor)' }}>
                    Sign in as Business
                  </span>
                </button>

                {/* Sign up link */}
                <p
                  className="text-sm mt-8 text-center"
                  style={{ color: 'var(--color-moringa-muted)' }}
                >
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="hover:underline font-medium"
                    style={{ color: 'var(--color-solid)' }}
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            ) : (
              <form className="flex flex-col">
                <div className="relative mb-4">
                  <h2
                    className="text-2xl font-medium text-center"
                    style={{ color: 'var(--color-textColor)' }}
                  >
                    {userType === 'buyer' ? 'Sign in as Buyer' : 'Sign in as Business'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setUserType(null)}
                    className="absolute right-0 top-0 text-sm hover:underline focus-visible:outline-none focus-visible:underline rounded"
                    style={{ color: 'var(--color-solid)' }}
                  >
                    Back
                  </button>
                </div>
                <p
                  className="text-sm mb-6 text-center"
                  style={{ color: 'var(--color-moringa-muted)' }}
                >
                  Welcome back! Please sign in to continue
                </p>

                {userType === 'buyer' && (
                  <>
                    {/* Google Button */}
                    <div ref={googleRef} className="w-full flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                        width={String(googleWidth)}
                      />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 w-full my-6">
                      <div className="w-full h-px bg-gray-300"></div>
                      <p
                        className="text-nowrap text-sm"
                        style={{ color: 'var(--color-moringa-muted)' }}
                      >
                        or sign in with email
                      </p>
                      <div className="w-full h-px bg-gray-300"></div>
                    </div>
                  </>
                )}

                {/* Email Input */}
                <div className="flex items-center w-full bg-transparent border border-gray-300 h-12 rounded-lg overflow-hidden px-4 gap-3 focus-within:ring-2 focus-within:ring-solid focus-within:border-transparent transition-all">
                  <Mail className="w-5 h-5" style={{ color: 'var(--color-moringa-muted)' }} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent outline-none text-sm w-full h-full"
                    style={{ color: 'var(--color-textColor)' }}
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="flex items-center mt-4 w-full bg-transparent border border-gray-300 h-12 rounded-lg overflow-hidden px-4 gap-3 focus-within:ring-2 focus-within:ring-solid focus-within:border-transparent transition-all">
                  <Lock className="w-5 h-5" style={{ color: 'var(--color-moringa-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent outline-none text-sm w-full h-full"
                    style={{ color: 'var(--color-textColor)' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 rounded hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solid transition-all"
                  >
                    {showPassword ? (
                      <EyeOff
                        className="w-5 h-5 cursor-pointer"
                        style={{ color: 'var(--color-moringa-muted)' }}
                      />
                    ) : (
                      <Eye
                        className="w-5 h-5 cursor-pointer"
                        style={{ color: 'var(--color-moringa-muted)' }}
                      />
                    )}
                  </button>
                </div>

                {/* Remember me & Forgot password */}
                <div className="w-full flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    <input
                      className="w-4 h-4 cursor-pointer rounded focus:ring-solid focus:ring-offset-0"
                      type="checkbox"
                      id="checkbox"
                    />
                    <label
                      className="text-sm cursor-pointer"
                      htmlFor="checkbox"
                      style={{ color: 'var(--color-moringa-muted)' }}
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    className="text-sm hover:underline"
                    to="/forgot-password"
                    style={{ color: 'var(--color-solid)' }}
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  onClick={async (e) => {
                    e.preventDefault();
                    if (isLoggingIn) return;
                    if (!email || !password) {
                      toast.error('Please enter email and password');
                      return;
                    }

                    setIsLoggingIn(true);
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
                          toast.error(
                            'This account is not registered as a business. You can add a business from your profile.'
                          );
                          // Redirect to shop instead since they're a consumer
                          navigate('/shop');
                          return;
                        }

                        toast.success('Login successful!');

                        // Fetch the business to check verification status
                        try {
                          const businessResponse = await businessService.getMyBusinesses();
                          const businesses = businessResponse.businesses || businessResponse || [];

                          if (businesses.length === 0) {
                            // No business created yet, redirect to verification
                            navigate('/business-verification');
                            return;
                          }

                          const business = businesses[0]; // Get the first business
                          const verificationStatus = business.verification?.status;

                          // Check business verification/approval status
                          // Business is approved if status is 'active' and verification.status is 'verified' or 'approved'
                          const isApproved =
                            business.status === 'active' &&
                            (verificationStatus === 'verified' ||
                              verificationStatus === 'approved');

                          if (isApproved) {
                            // Approved/auto-verified business - go to dashboard
                            navigate('/dashboard');
                          } else if (verificationStatus === 'pending') {
                            // Documents submitted, waiting for review
                            navigate('/pending-review');
                          } else if (verificationStatus === 'unverified') {
                            // Restaurant/cafe that needs to submit documents
                            navigate('/business-verification');
                          } else {
                            // Any other state - go to verification page
                            navigate('/business-verification');
                          }
                        } catch (bizError) {
                          console.error('Error fetching business:', bizError);
                          // If we can't fetch business, redirect to verification
                          navigate('/business-verification');
                        }
                      } else {
                        // Consumer login - redirect to shop
                        toast.success('Login successful!');
                        navigate('/shop');
                      }
                    } catch (error) {
                      console.error('Login error:', error);
                      if (error.code === 'EMAIL_NOT_VERIFIED') {
                        setUnverifiedEmail(error.email || email);
                        return;
                      }
                      toast.error(error.message || 'Login failed');
                    } finally {
                      setIsLoggingIn(false);
                    }
                  }}
                  className="mt-8 w-full h-11 rounded-lg text-white font-medium hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solid focus-visible:ring-offset-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--color-solid)' }}
                >
                  {isLoggingIn ? 'Signing in...' : 'Login'}
                </button>

                {unverifiedEmail && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="mb-2">
                      Please verify your email first. We sent a link to{' '}
                      <strong>{unverifiedEmail}</strong> when you signed up.
                    </p>
                    <button
                      type="button"
                      disabled={resending}
                      onClick={async () => {
                        setResending(true);
                        try {
                          const res = await authService.resendVerificationEmail(unverifiedEmail);
                          toast.success(res.message || 'Verification email sent');
                        } catch (err) {
                          toast.error(err.message || 'Could not resend the email');
                        } finally {
                          setResending(false);
                        }
                      }}
                      className="font-medium underline hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solid rounded transition-all disabled:opacity-50"
                    >
                      {resending ? 'Sending…' : 'Resend verification email'}
                    </button>
                  </div>
                )}

                {/* Sign up link */}
                <p
                  className="text-sm mt-4 text-center"
                  style={{ color: 'var(--color-moringa-muted)' }}
                >
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="hover:underline font-medium"
                    style={{ color: 'var(--color-solid)' }}
                  >
                    Sign up
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
