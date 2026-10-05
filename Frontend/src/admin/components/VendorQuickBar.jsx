import React from 'react';
import { Plus, ClipboardList } from 'lucide-react';

/**
 * Phone-only strip at the top of the vendor home: which shop this is, whether
 * it is live, and the two jobs a vendor does all day (add a listing, check
 * orders). Everything else stays in the menu.
 */
export default function VendorQuickBar({ business, onNavigate }) {
  if (!business) return null;
  const live = business.status === 'active';

  return (
    <section
      aria-label="Your shop"
      className="rounded-2xl border border-slate-200/50 bg-white/80 p-3 backdrop-blur-xl lg:hidden dark:border-slate-700/50 dark:bg-slate-900/80"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-white">
          {business.name}
        </p>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            live
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
          }`}
        >
          {live ? 'Live' : 'Paused'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onNavigate('new-listing')}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-3 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New listing
        </button>
        <button
          type="button"
          onClick={() => onNavigate('all-orders')}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
        >
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Orders
        </button>
      </div>
    </section>
  );
}
