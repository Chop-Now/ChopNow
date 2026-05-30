import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bike,
  Car,
  Loader2,
  Info,
  CheckCircle2,
  ShieldAlert,
  ChevronRight,
  Phone,
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const VEHICLES = [
  { key: 'bicycle', label: 'Bicycle', icon: Bike, description: 'Best for short urban trips' },
  {
    key: 'motorcycle',
    label: 'Motorcycle',
    icon: Bike,
    description: 'Fastest for standard delivery',
  },
  { key: 'car', label: 'Car', icon: Car, description: 'Ideal for bulk orders/weather' },
  { key: 'walking', label: 'Walking', icon: Bike, description: 'Eco-friendly hyper-local' },
];

const RiderRegistration = () => {
  const navigate = useNavigate();
  const { user, addRiderRole } = useAppContext();

  const [phone, setPhone] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('bicycle');
  const [nationalId, setNationalId] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      toast.error('Please login to register as a rider.');
      navigate('/login');
      return;
    }
    if (user.phone) {
      setPhone(user.phone);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    const newErrors = {};
    if (!phone || phone.length < 10) newErrors.phone = 'Valid phone number is required';
    if (!nationalId.trim()) newErrors.nationalId = 'National ID is required for verification';
    if (['motorcycle', 'car'].includes(selectedVehicle) && !licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required for motor vehicles';
    }
    if (!agreedToTerms) newErrors.terms = 'You must agree to the terms';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.phone) toast.error(newErrors.phone);
      if (newErrors.nationalId) toast.error(newErrors.nationalId);
      if (newErrors.licensePlate) toast.error(newErrors.licensePlate);
      if (newErrors.terms) toast.error(newErrors.terms);
      return;
    }

    setIsSubmitting(true);
    try {
      // Calls addRiderRole in AppContext, which calls backend API and updates state
      await addRiderRole(true);
      toast.success('Congratulations! You are now a ChopNow Rider! 🚴');
      navigate('/rider-dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to activate rider profile. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showPlateField = ['motorcycle', 'car'].includes(selectedVehicle);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 mb-6">
          <span className="text-green-600 font-medium">ChopNow Account</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium">Delivery Partner Signup</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </div>

        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Become a ChopNow Rider
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Earn on your own terms by delivering delicious, rescued food from local vendors to
            buyers.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Upper Hero Banner Card */}
          <div className="bg-gradient-to-br from-green-700 via-green-800 to-emerald-950 p-8 text-white">
            <h2 className="text-xl font-bold mb-2">Flexible Work, Solid Payouts 💸</h2>
            <p className="text-xs text-green-100 leading-relaxed max-w-xl">
              As a ChopNow Rider, you help reduce food waste in your community while earning
              competitive fees. Use your bike, motorcycle, car, or simply walk to complete local
              deliveries.
            </p>
          </div>

          <div className="p-8 sm:p-10">
            {/* Info Alert Box */}
            <div className="mb-8 p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-xs text-blue-800">Verification Info</h3>
                <p className="text-xs text-blue-600/90 mt-1 leading-relaxed">
                  We verify all rider credentials to ensure safety. Submit your details below to
                  activate your rider profile instantly.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Vehicle Type Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">
                  How will you deliver?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {VEHICLES.map((vehicle) => {
                    const isSelected = selectedVehicle === vehicle.key;
                    const IconComponent = vehicle.icon;
                    return (
                      <button
                        key={vehicle.key}
                        type="button"
                        onClick={() => setSelectedVehicle(vehicle.key)}
                        className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-green-50/50 border-green-600 ring-2 ring-green-600/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`p-2.5 rounded-lg ${isSelected ? 'bg-green-100 text-green-700' : 'bg-slate-50 text-slate-500'}`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <p
                            className={`text-sm font-bold ${isSelected ? 'text-green-900' : 'text-slate-800'}`}
                          >
                            {vehicle.label}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{vehicle.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Mobile Phone Number
                  </label>
                  <PhoneInput
                    country={'rw'}
                    value={phone}
                    onChange={(val) => {
                      setPhone(val);
                      if (val.length >= 10) {
                        setErrors((prev) => ({ ...prev, phone: null }));
                      }
                    }}
                    containerClass="w-full"
                    inputClass="!w-full !h-11 !rounded-xl !border-slate-200 !text-sm focus:!ring-2 focus:!ring-green-500/20 focus:!border-green-600"
                    buttonClass="!bg-slate-50 !border-slate-200 !rounded-l-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      National ID or License No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 11990800..."
                      value={nationalId}
                      onChange={(e) => {
                        setNationalId(e.target.value);
                        setErrors((prev) => ({ ...prev, nationalId: null }));
                      }}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none"
                    />
                  </div>

                  {showPlateField && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Vehicle License Plate
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. RA 123 A"
                        value={licensePlate}
                        onChange={(e) => {
                          setLicensePlate(e.target.value);
                          setErrors((prev) => ({ ...prev, licensePlate: null }));
                        }}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Agreement */}
              <div className="relative flex items-start gap-3 mt-4">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                  />
                </div>
                <div className="text-xs">
                  <label htmlFor="terms" className="font-medium text-slate-700">
                    I agree to the ChopNow Rider Terms of Service and Code of Conduct.
                  </label>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    I certify that I am legally authorized to work, have any necessary licenses, and
                    will comply with food safety standards.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Activating profile...
                    </>
                  ) : (
                    'Register as Rider'
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  Role is activated immediately. You can switch modes from the top profile bar.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderRegistration;
