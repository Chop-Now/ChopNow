import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../../services';

const rwf = (n) => `RWF ${Math.round(n || 0).toLocaleString()}`;

const Line = ({ label, hint, value, strong }) => (
  <div className="flex items-start justify-between gap-4 py-1.5">
    <div>
      <p className="text-slate-800 dark:text-slate-200">{label}</p>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
    <p
      className={
        strong
          ? 'shrink-0 font-semibold text-slate-900 dark:text-white'
          : 'shrink-0 text-slate-800 dark:text-slate-200'
      }
    >
      {value}
    </p>
  </div>
);

/**
 * Admin only. Where the money goes, kept apart: what customers spent on food (the vendors' sales),
 * what ChopNow earns from it, and the delivery money that is only passed on to the courier.
 */
const MoneyBreakdown = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let alive = true;
    analyticsService
      .getAdminStats()
      .then((data) => alive && setStats(data))
      .catch(() => alive && setStats(null));
    return () => {
      alive = false;
    };
  }, []);

  if (!stats) return null;
  const d = stats.delivery || {};
  const booked = d.booked || {};
  const awaiting = d.awaitingBooking || {};

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Where the money goes</h3>
      <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">
        Food sales and delivery are counted separately. Delivery is collected from customers and
        passed on to the courier, so it is not ChopNow revenue.
      </p>
      <div className="grid gap-6 text-sm md:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Food</p>
          <Line
            label="Food sales"
            hint="What customers paid for the items. Vendors earn this minus ChopNow's fee."
            value={rwf(stats.revenue?.total)}
          />
          <Line
            label="ChopNow revenue"
            hint="The platform fee on those sales."
            value={rwf(stats.revenue?.platformFees)}
            strong
          />
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Delivery
          </p>
          <Line
            label="Collected from customers"
            hint={`${d.orders || 0} paid delivery orders`}
            value={rwf(d.collected)}
          />
          <Line
            label="Charged by the courier"
            hint={`${booked.orders || 0} booked`}
            value={rwf(booked.courierCharged)}
          />
          <Line
            label="Difference on booked deliveries"
            hint="Customers paid minus the courier's charge. Below zero means ChopNow covered it."
            value={rwf(booked.difference)}
            strong
          />
          <Line
            label="Collected, not booked yet"
            hint={`${awaiting.orders || 0} orders waiting for the vendor to send them out`}
            value={rwf(awaiting.collected)}
          />
        </div>
      </div>
    </div>
  );
};

export default MoneyBreakdown;
