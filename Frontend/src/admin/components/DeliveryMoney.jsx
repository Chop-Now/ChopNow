import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { analyticsService } from '../../services';

const rwf = (n) => (n === null || n === undefined ? '-' : `RWF ${Math.round(n).toLocaleString()}`);

const Box = ({ label, value, hint }) => (
  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
    {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
  </div>
);

/**
 * Admin only. Every paid delivery: what the customer paid for delivery, which courier booking
 * carried it, and what the courier charged, so the courier's invoice can be checked line by line.
 */
const DeliveryMoney = () => {
  const [data, setData] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setData(await analyticsService.getAdminDeliveries({ from, to, limit: 50 }));
    } catch (error) {
      toast.error(error?.message || 'Could not load the deliveries');
    } finally {
      setBusy(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const download = async (forCourier) => {
    try {
      await analyticsService.downloadAdminDeliveriesCsv({ forCourier, from, to });
    } catch (error) {
      toast.error(error?.message || 'Could not download the file');
    }
  };

  const s = data?.summary;
  return (
    <div className="mb-6 rounded-2xl border border-slate-200/60 bg-white/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Delivery money (courier)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Vendors never see this: it is between ChopNow and the courier.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2 text-xs">
          <label className="flex flex-col gap-1 text-slate-600 dark:text-slate-300">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
          <label className="flex flex-col gap-1 text-slate-600 dark:text-slate-300">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
          <button
            type="button"
            onClick={() => download(true)}
            className="min-h-10 rounded-lg bg-solid px-3 py-2 font-medium text-white hover:bg-tertiary"
          >
            Download for the courier (CSV)
          </button>
          <button
            type="button"
            onClick={() => download(false)}
            className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Download full copy (CSV)
          </button>
        </div>
      </div>

      {s && (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Box
            label="Collected from customers"
            value={rwf(s.collected)}
            hint={`${s.orders} paid deliveries`}
          />
          <Box
            label="Charged by the courier"
            value={rwf(s.booked.courierCharged)}
            hint={`${s.booked.orders} booked`}
          />
          <Box
            label="Difference (booked)"
            value={rwf(s.booked.difference)}
            hint="Below zero: ChopNow covered it"
          />
          <Box
            label="Not booked yet"
            value={rwf(s.awaitingBooking.collected)}
            hint={`${s.awaitingBooking.orders} orders`}
          />
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-2 pr-3">Order</th>
              <th className="py-2 pr-3">Shop</th>
              <th className="py-2 pr-3">Courier ref.</th>
              <th className="py-2 pr-3 text-right">Customer paid</th>
              <th className="py-2 pr-3 text-right">Quoted</th>
              <th className="py-2 pr-3 text-right">Charged</th>
              <th className="py-2 text-right">Difference</th>
            </tr>
          </thead>
          <tbody className="text-slate-800 dark:text-slate-200">
            {(data?.deliveries || []).map((d) => (
              <tr key={d.orderId} className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-2 pr-3 font-medium">{d.orderNumber}</td>
                <td className="py-2 pr-3">{d.shop}</td>
                <td className="py-2 pr-3">{d.courierReference || 'not booked'}</td>
                <td className="py-2 pr-3 text-right">{rwf(d.customerPaid)}</td>
                <td className="py-2 pr-3 text-right">{rwf(d.courierQuoted)}</td>
                <td className="py-2 pr-3 text-right">{rwf(d.courierCharged)}</td>
                <td className="py-2 text-right">{rwf(d.difference)}</td>
              </tr>
            ))}
            {data && data.deliveries.length === 0 && (
              <tr>
                <td colSpan="7" className="py-6 text-center text-slate-500 dark:text-slate-400">
                  {busy ? 'Loading…' : 'No paid deliveries yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryMoney;
