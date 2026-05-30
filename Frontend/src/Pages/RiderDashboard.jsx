import React, { useState } from 'react';
import {
  Bike,
  Compass,
  DollarSign,
  Smartphone,
  Download,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const MOCK_PAYOUTS = [
  {
    id: 'pay_001',
    date: 'May 28, 2026',
    amount: '24,500 RWF',
    status: 'Completed',
    method: 'Mobile Money',
  },
  {
    id: 'pay_002',
    date: 'May 21, 2026',
    amount: '38,200 RWF',
    status: 'Completed',
    method: 'Mobile Money',
  },
  {
    id: 'pay_003',
    date: 'May 14, 2026',
    amount: '41,100 RWF',
    status: 'Completed',
    method: 'Mobile Money',
  },
  {
    id: 'pay_004',
    date: 'May 07, 2026',
    amount: '28,000 RWF',
    status: 'Completed',
    method: 'Bank Transfer',
  },
];

const RiderDashboard = () => {
  const { user } = useAppContext();
  const [isOnline, setIsOnline] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  const toggleOnline = () => {
    setIsToggling(true);
    setTimeout(() => {
      setIsOnline(!isOnline);
      setIsToggling(false);
      toast.success(`You are now ${!isOnline ? 'ONLINE 🟢' : 'OFFLINE 🔴'}`);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-400 animate-pulse" />
              <span className="text-[10px] tracking-widest text-green-400 font-bold uppercase">
                Rider Partner Portal
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Hello, {user?.firstName || 'Rider'} 👋
            </h1>
            <p className="text-slate-300 text-sm max-w-md">
              Welcome back to your dashboard. Deliver surplus meals, earn fees, and reduce food
              waste!
            </p>
          </div>

          {/* Go Online Switcher Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 z-10 shrink-0 w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                Status
              </p>
              <p className="text-sm font-bold flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}
                />
                {isOnline ? 'Online & Available' : 'Offline'}
              </p>
            </div>
            <button
              onClick={toggleOnline}
              disabled={isToggling}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-md active:scale-95 cursor-pointer ${
                isOnline
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isToggling ? 'Syncing...' : isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

          {/* Absolute decorative background sphere */}
          <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-green-500/10 blur-3xl -z-0" />
        </div>

        {/* Dynamic Mobile App Promo Notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">
                Rider Deliveries are Mobile-Only 📱
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                To accept orders, use live GPS navigation, and upload proof of delivery, please use
                the ChopNow Mobile App. Download it from the Google Play Store or iOS App Store
                today.
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto shrink-0 justify-end">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white text-xs font-bold rounded-xl transition-all cursor-pointer">
              <Download className="w-4 h-4" />
              Get Android App
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white text-xs font-bold rounded-xl transition-all cursor-pointer">
              <Download className="w-4 h-4" />
              Get iOS App
            </button>
          </div>
        </div>

        {/* Quick Stats Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  All-Time Earnings
                </p>
                <p className="text-2xl font-black text-slate-900">131,800 RWF</p>
              </div>
              <div className="p-2.5 bg-green-50 text-green-700 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px] text-green-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18,500 RWF this week</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Total Deliveries
                </p>
                <p className="text-2xl font-black text-slate-900">58 Trips</p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                <Bike className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-4 text-[11px] text-slate-400">Avg. delivery time: 14 mins</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Rider Rating
                </p>
                <p className="text-2xl font-black text-slate-900">4.9 / 5.0</p>
              </div>
              <div className="p-2.5 bg-orange-50 text-orange-700 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px] text-orange-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Excellent Standing (Top 5%)</span>
            </div>
          </div>
        </div>

        {/* Lower Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Center: Weekly Earnings Chart Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Weekly Earnings</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Overview of earnings for the last 7 days
              </p>
            </div>

            {/* Custom SVG/CSS Bar Chart */}
            <div className="h-64 flex items-end gap-3 sm:gap-6 pt-4 border-b border-slate-100 pb-2">
              {[
                { day: 'Mon', amount: 3000, label: '3K' },
                { day: 'Tue', amount: 5500, label: '5.5K' },
                { day: 'Wed', amount: 0, label: '0' },
                { day: 'Thu', amount: 4000, label: '4K' },
                { day: 'Fri', amount: 7500, label: '7.5K' },
                { day: 'Sat', amount: 12000, label: '12K' },
                { day: 'Sun', amount: 9000, label: '9K' },
              ].map((bar, index) => {
                const heightPercent = bar.amount > 0 ? (bar.amount / 12000) * 100 : 0;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
                  >
                    <div className="relative w-full flex justify-center">
                      {/* Tooltip */}
                      {bar.amount > 0 && (
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap shadow">
                          {bar.amount} RWF
                        </div>
                      )}
                      <div
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                          bar.amount > 0
                            ? 'bg-gradient-to-t from-green-500 to-emerald-600'
                            : 'bg-slate-100'
                        }`}
                        style={{ height: `${heightPercent || 5}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{bar.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
              <span className="font-semibold text-slate-800">Total Weekly Earnings:</span>
              <span className="font-bold text-green-700">41,000 RWF</span>
            </div>
          </div>

          {/* Right: Payout Details & History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Payout History</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Overview of recent cashouts completed
              </p>
            </div>

            <div className="space-y-4">
              {MOCK_PAYOUTS.map((pay) => (
                <div
                  key={pay.id}
                  className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800">{pay.amount}</p>
                    <p className="text-[10px] text-slate-400">
                      {pay.date} · {pay.method}
                    </p>
                  </div>
                  <span className="bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 text-[9px] font-bold">
                    {pay.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
