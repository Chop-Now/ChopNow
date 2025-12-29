import React, { useState } from 'react'
import { User, Upload, Trash2, MoveLeft, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

const MyProfile = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [phone, setPhone] = useState('')
  const navigate = useNavigate()

  return (
     <div className='bg-gray-80 min-h-screen'>
      <div className="flex w-full">
        {/* Settings Menu - Sidebar */}
        <aside className="hidden lg:block w-72 bg-white border-r border-gray-200 p-6 h-screen fixed left-0 top-0 shrink-0 overflow-y-auto">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-textColor transition mb-6 cursor-pointer"
            style={{ color: 'var(--color-textColor)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1B5E20'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-textColor)'}
          >
            <MoveLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Profile Info */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
            <div className="h-12 w-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#1B5E20' }}>
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-textColor truncate">John Doe</p>
              <p className="text-xs text-gray-50 truncate">john@example.com</p>
            </div>
          </div>

          {/* Settings Menu */}
          <h2 className="text-xl font-bold text-textColor mb-4">Settings</h2>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-50 uppercase tracking-wider">Personal</span>
              <div className="flex flex-col gap-1">
                <button className="text-left px-3 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: '#1B5E20' }}>
                  Account
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="w-full lg:w-[calc(100%-18rem)] lg:ml-72 flex flex-col items-center py-12 px-4 lg:px-12">
          <div className="flex w-full max-w-3xl flex-col items-start gap-12">
            {/* Header */}
            <div className="flex w-full flex-col items-start gap-1">
              <h1 className="text-3xl font-bold text-textColor">Account</h1>
              <p className="text-sm text-gray-50">Update your profile and personal details here</p>
            </div>

            {/* Profile Section */}
            <div className="flex w-full flex-col items-start gap-6">
              <h3 className="text-xl font-semibold text-textColor">Profile</h3>
              
              {/* Avatar */}
              <div className="flex w-full flex-col items-start gap-4">
                <span className="text-sm font-semibold text-textColor">Avatar</span>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1B5E20' }}>
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-textColor hover:bg-gray-200 transition cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                    <span className="text-xs text-gray-50">
                      For best results, upload an image 512x512 or larger.
                    </span>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="flex w-full items-center gap-4 flex-col sm:flex-row">
                <div className="w-full flex-1">
                  <label className="block text-sm font-medium text-textColor mb-2">First name</label>
                  <input
                    type="text"
                    placeholder="Josef"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                    onFocus={(e) => e.target.style.borderColor = '#1B5E20'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                  />
                </div>
                <div className="w-full flex-1">
                  <label className="block text-sm font-medium text-textColor mb-2">Last name</label>
                  <input
                    type="text"
                    placeholder="Albers"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                    onFocus={(e) => e.target.style.borderColor = '#1B5E20'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                  />
                </div>
              </div>

              {/* Email and Phone Fields */}
              <div className="flex w-full items-start gap-4 flex-col sm:flex-row">
                <div className="w-full flex-1">
                  <label className="block text-sm font-medium text-textColor mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="josef@subframe.com"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                    onFocus={(e) => e.target.style.borderColor = '#1B5E20'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                  />
                </div>
                <div className="w-full flex-1">
                  <label className="block text-sm font-medium text-textColor mb-2">Phone number</label>
                  <PhoneInput
                    country={'rw'}
                    value={phone}
                    onChange={setPhone}
                    enableSearch={true}
                    searchPlaceholder="Search country"
                    placeholder="Choose your country"
                    containerClass="w-full"
                    inputClass="!w-full !h-10 !border-gray-300 !rounded-lg !text-sm !bg-white"
                    buttonClass="!border-gray-300 !rounded-l-lg !bg-white !h-10 !hover:bg-gray-100"
                    dropdownClass="!text-sm !bg-white !border !border-gray-300 !rounded-lg !shadow-lg"
                    searchClass="!text-sm !p-2 !border-gray-300 !m-2 !rounded-md"
                    inputStyle={{ color: 'var(--color-textColor)' }}
                  />
                </div>
              </div>

              {/* Save Changes Button */}
              <button 
                className="px-6 py-2 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                style={{ backgroundColor: '#1B5E20' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0D4A14'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1B5E20'}
              >
                Save changes
              </button>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gray-200" />

            {/* Password Section */}
            <div className="flex w-full flex-col items-start gap-6">
              <h3 className="text-xl font-semibold text-textColor">Password</h3>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-textColor mb-2">Current password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-solid"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-50 cursor-pointer" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-50 cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-textColor mb-2">New password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-solid"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-50 cursor-pointer" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-50 cursor-pointer" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-50 mt-2">
                  Your password must have at least 8 characters, include one uppercase letter, and one number.
                </p>
              </div>

              <div className="w-full">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-type new password"
                    className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-solid"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-50 cursor-pointer" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-50 cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>

              <button 
                className="px-6 py-2 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                style={{ backgroundColor: '#1B5E20' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0D4A14'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1B5E20'}
              >
                Change password
              </button>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gray-200" />

            {/* Danger Zone */}
            <div className="flex w-full flex-col items-start gap-6">
              <h3 className="text-xl font-semibold text-textColor">Danger zone</h3>
              
              <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-900 mb-1">Delete account</h4>
                    <p className="text-xs text-red-700">
                      Permanently remove your account. This action is not reversible.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition whitespace-nowrap"
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="flex flex-col items-center bg-white shadow-md rounded-xl py-6 px-5 md:w-[460px] w-[370px] border border-gray-200">
            <div className="flex items-center justify-center p-4 bg-red-100 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.875 5.75h1.917m0 0h15.333m-15.333 0v13.417a1.917 1.917 0 0 0 1.916 1.916h9.584a1.917 1.917 0 0 0 1.916-1.916V5.75m-10.541 0V3.833a1.917 1.917 0 0 1 1.916-1.916h3.834a1.917 1.917 0 0 1 1.916 1.916V5.75m-5.75 4.792v5.75m3.834-5.75v5.75" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-gray-900 font-semibold mt-4 text-xl">Are you sure?</h2>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Do you really want to continue? This action<br />cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-4 mt-5 w-full">
              <button
                onClick={() => setShowDeleteModal(false)}
                type="button"
                className="w-full md:w-36 h-10 rounded-md border border-gray-300 bg-white text-gray-600 font-medium text-sm hover:bg-gray-100 active:scale-95 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                className="w-full md:w-36 h-10 rounded-md text-white bg-red-600 font-medium text-sm hover:bg-red-700 active:scale-95 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
  )
}

export default MyProfile
