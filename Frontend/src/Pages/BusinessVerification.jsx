import { assets } from '@/assets/assets'
import { MapPin, LocateFixed, CloudUpload, X, ChevronRight, BadgeAlert, CircleCheck } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import LocationPicker from '@/Components/maps/LocationPicker'
import { useGeolocation } from '@/Components/maps/useGeolocation'
import { reverseGeocode, searchAddress } from '@/services/geocoding'
import toast from 'react-hot-toast'

const BusinessVerification = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { getCurrentLocation } = useGeolocation();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, JPG, and PNG files are allowed');
        return;
      }

      setUploadedFiles([...uploadedFiles, file]);
      toast.success('File uploaded successfully!');
      // Reset file input
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    toast.success('Verification submitted! Our team will review your submission.');
    // Navigate to dashboard or appropriate page
  };

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center justify-center space-x-4 text-xs mb-8" style={{ color: 'var(--color-gray-50)' }}>
          <p className="text-green-600 font-medium">Account creation</p>
          <ChevronRight className="w-3 h-3" />
          <p style={{ color: 'var(--color-textColor)' }} className="font-medium">Business details</p>
          <ChevronRight className="w-3 h-3" />
          <p>Dashboard</p>
        </div>

        {/* Header - Outside container */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-textColor)' }}>
            Business Verification
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-gray-50)' }}>
            Just a few more details to get your business live on ChopNow and start selling surplus food.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12">
          {/* Information Notice */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BadgeAlert className="w-4 h-4" style={{ color: 'var(--color-textColor)' }} />
              <h3 className="font-semibold text-xs" style={{ color: 'var(--color-textColor)' }}>
                Why we need this information
              </h3>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-gray-50)' }}>
              To ensure the safety of our customers and maintain a trustworthy marketplace we need to verify your business's identity and confirm you're authorized to handle food. This helps prevent fraud and ensures compliance with local health regulations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-base font-medium mb-3" style={{ color: 'var(--color-textColor)' }}>
                Contact Information
              </h3>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-textColor)' }}>
                  Business Phone Number
                </label>
                <PhoneInput
                  country={'rw'}
                  value={phone}
                  onChange={setPhone}
                  enableSearch={true}
                  searchPlaceholder="Search country"
                  placeholder="Enter phone number"
                  containerClass="w-full"
                  inputClass="!w-full !h-12 !border-gray-300 !rounded-lg !text-sm !bg-transparent"
                  buttonClass="!border-gray-300 !rounded-l-lg !bg-transparent !h-12 !hover:bg-gray-100"
                  dropdownClass="!text-sm !bg-white !border !border-gray-300 !rounded-lg !shadow-lg"
                  searchClass="!text-sm !p-2 !border-gray-300 !m-2 !rounded-md"
                  inputStyle={{ color: 'var(--color-textColor)' }}
                />
              </div>
            </div>

            {/* Business Location */}
            <div>
              <h3 className="text-base font-medium mb-3" style={{ color: 'var(--color-textColor)' }}>
                Business Location
              </h3>
              
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
                className="w-full flex items-center justify-center gap-2 h-12 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 mb-3"
              >
                <LocateFixed className="w-5 h-5" style={{ color: 'var(--color-solid)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-textColor)' }}>
                  {isLoadingLocation ? 'Detecting location...' : 'Use my current location'}
                </span>
              </button>

              {/* Manual Address Input */}
              <div className="relative mb-3">
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
                <p className="mb-3 text-xs" style={{ color: 'var(--color-gray-50)' }}>
                  Selected: {address}
                </p>
              )}

              {/* Map */}
              <div>
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

            {/* Certification */}
            <div>
              <h3 className="text-base font-medium mb-3" style={{ color: 'var(--color-textColor)' }}>
                Certification
              </h3>
              <h4 className="text-xs font-medium mb-2" style={{ color: 'var(--color-textColor)' }}>
                Upload Operation Certificate
              </h4>
              <p className="text-xs mb-4" style={{ color: 'var(--color-gray-50)' }}>
                Please upload a valid, up to date food handler permit or similar local health department certificate. This document is required for verification.
              </p>

              {/* File Upload Area */}
              <label 
                htmlFor="fileInput" 
                className="border-2 border-dashed bg-white rounded-lg text-xs border-indigo-600/60 p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-indigo-500 transition-colors"
              >
                <CloudUpload className="w-10 h-10" style={{ color: 'var(--color-solid)' }} />
                <p style={{ color: 'var(--color-gray-50)' }}>Drag & drop your files here</p>
                <p className="text-gray-400 text-xs">
                  Or <span className="underline" style={{ color: 'var(--color-solid)' }}>click</span> to upload
                </p>
                <input 
                  id="fileInput" 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
              </label>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                          <CloudUpload className="w-4 h-4" style={{ color: 'var(--color-solid)' }} />
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: 'var(--color-textColor)' }}>
                            {file.name}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--color-gray-50)' }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* File Upload Notice */}
              <div className="mt-3 text-[10px] space-y-1" style={{ color: 'var(--color-gray-50)' }}>
                <div className="flex items-center gap-1">
                  <CircleCheck className="w-3 h-3" />
                  <p>Accepted formats: PDF, JPG, PNG</p>
                </div>
                <div className="flex items-center gap-1">
                  <CircleCheck className="w-3 h-3" />
                  <p>Maximum file size: 10 MB</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full h-11 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--color-solid)' }}
              >
                Submit for Verification
              </button>
              <p className="text-[10px] text-center mt-3" style={{ color: 'var(--color-gray-50)' }}>
                Our team will review your submission within 1-3 business days.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BusinessVerification
