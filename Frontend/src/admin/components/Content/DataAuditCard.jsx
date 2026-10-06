import React, { useState } from 'react';
import toast from 'react-hot-toast';
import analyticsService from '../../../services/analyticsService';

const rwf = (n) => `RWF ${Math.round(n || 0).toLocaleString()}`;

const Row = ({ label, value, strong }) => (
  <div className="flex items-center justify-between gap-4 py-1">
    <span className="text-slate-600 dark:text-slate-400">{label}</span>
    <span
      className={
        strong
          ? 'font-semibold text-slate-900 dark:text-white'
          : 'text-slate-800 dark:text-slate-200'
      }
    >
      {value}
    </span>
  </div>
);

/**
 * Admin only. A read-only check of how much of the data in the system looks
 * like test data, so the dashboard numbers can be trusted. It changes nothing.
 */
const DataAuditCard = () => {
  const [audit, setAudit] = useState(null);
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState(null);
  const [typed, setTyped] = useState('');
  const [purging, setPurging] = useState(false);

  const loadPlan = async () => {
    setBusy(true);
    try {
      setPlan(await analyticsService.previewTestDataPurge());
      setTyped('');
    } catch (error) {
      toast.error(error?.message || 'Could not prepare the clean-up');
    } finally {
      setBusy(false);
    }
  };

  const purge = async () => {
    setPurging(true);
    try {
      const result = await analyticsService.runTestDataPurge(typed);
      // Keep a record of exactly what was removed.
      const file = new Blob([JSON.stringify(result.snapshot, null, 2)], {
        type: 'application/json',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = `chopnow-removed-test-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Test data removed. A record of what was removed has been downloaded.');
      setPlan(null);
      setAudit(await analyticsService.getTestDataAudit());
    } catch (error) {
      toast.error(error?.message || 'The clean-up failed. Nothing more was changed.');
    } finally {
      setPurging(false);
    }
  };

  const run = async () => {
    setBusy(true);
    try {
      setAudit(await analyticsService.getTestDataAudit());
    } catch (error) {
      toast.error(error?.message || 'Could not run the data check');
    } finally {
      setBusy(false);
    }
  };

  const t = audit?.testLooking;
  const p = audit?.platform;
  const r = audit?.remainingIfTestRemoved;
  const months = t ? Object.entries(t.revenueByMonth).sort(([a], [b]) => a.localeCompare(b)) : [];

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            Is the data real? (test-data check)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Looks for test accounts, test listings and fake test-mode payments. Running the check
            only reads data; removing test data is a separate, confirmed step below.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={run}
          className="min-h-11 shrink-0 rounded-lg bg-solid px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-tertiary disabled:opacity-60"
        >
          {busy ? 'Checking…' : audit ? 'Check again' : 'Run check'}
        </button>
      </div>

      {audit && (
        <div className="mt-4 grid gap-4 text-xs md:grid-cols-3">
          <div>
            <p className="mb-1 font-semibold text-slate-800 dark:text-white">Everything now</p>
            <Row label="Users" value={p.users} />
            <Row label="Businesses" value={p.businesses} />
            <Row label="Listings" value={p.listings} />
            <Row label="Orders" value={p.orders} />
            <Row label="Completed orders" value={p.completedOrders} />
            <Row label="Completed revenue" value={rwf(p.completedRevenue)} strong />
          </div>

          <div>
            <p className="mb-1 font-semibold text-red-600 dark:text-red-400">
              Looks like test data
            </p>
            <Row
              label="Fake test-mode payments"
              value={`${audit.provenFake.payments} (${rwf(audit.provenFake.paymentAmount)})`}
            />
            <Row label="Orders they paid" value={audit.provenFake.orders} />
            <Row label="Test-looking users" value={t.users} />
            <Row label="Their businesses" value={t.businesses} />
            <Row label="Balance owed to them" value={rwf(t.businessBalanceOwed)} />
            <Row label="Test listings" value={t.listings} />
            <Row label="Test orders" value={`${t.orders} (${t.completedOrders} completed)`} />
            <Row label="Their completed revenue" value={rwf(t.completedRevenue)} strong />
          </div>

          <div>
            <p className="mb-1 font-semibold text-green-700 dark:text-green-400">
              What would be left
            </p>
            <Row label="Users" value={r.users} />
            <Row label="Businesses" value={r.businesses} />
            <Row label="Listings" value={r.listings} />
            <Row label="Orders" value={r.orders} />
            <Row label="Completed revenue" value={rwf(r.completedRevenue)} strong />
          </div>

          {months.length > 0 && (
            <div className="md:col-span-3">
              <p className="mb-1 font-semibold text-slate-800 dark:text-white">
                Test revenue by month
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {months.map(([m, v]) => `${m}: ${rwf(v)}`).join(' · ')}
              </p>
            </div>
          )}

          {audit.realLookingPayments.length > 0 && (
            <div className="md:col-span-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
              <p className="font-semibold">
                {audit.realLookingPayments.length} completed payment(s) on test-looking orders look
                real
              </p>
              <p>
                These are not simulated, so they may be genuine test payments you made. Check them
                before anything is removed:{' '}
                {audit.realLookingPayments
                  .map((x) => `${rwf(x.amount)} (${x.providerTransactionId || 'no id'})`)
                  .join(', ')}
              </p>
            </div>
          )}

          <div className="md:col-span-3 rounded-lg border border-red-300 p-3 dark:border-red-800">
            <p className="font-semibold text-red-700 dark:text-red-400">Remove the test data</p>
            <p className="mb-2 text-slate-700 dark:text-slate-300">
              Deletes the test accounts, shops, listings, orders and fake payments above, and fixes
              the totals. Admins, real customers and vendors, and anything paid with real money are
              never removed. This cannot be undone, so make sure a database backup exists first.
            </p>
            {!plan ? (
              <button
                type="button"
                disabled={busy}
                onClick={loadPlan}
                className="min-h-11 rounded-lg border border-red-500 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {busy ? 'Preparing…' : 'Review what would be removed'}
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-800 dark:text-slate-200">
                  Will delete: {plan.counts.users} accounts, {plan.counts.businesses} shops,{' '}
                  {plan.counts.listings} listings, {plan.counts.orders} orders,{' '}
                  {plan.counts.payments} payments. Kept: {plan.kept.ordersWithRealPayments} order(s)
                  paid with real money, plus the people and shops behind them.
                </p>
                <details>
                  <summary className="cursor-pointer text-slate-700 dark:text-slate-300">
                    Accounts that will be deleted ({plan.sampleUsers.length})
                  </summary>
                  <ul className="mt-1 list-disc pl-5 text-slate-700 dark:text-slate-300">
                    {plan.sampleUsers.map((email) => (
                      <li key={email}>{email}</li>
                    ))}
                  </ul>
                </details>
                <label className="block text-slate-700 dark:text-slate-300">
                  Type <strong>{plan.confirmation}</strong> to confirm
                  <input
                    type="text"
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    autoComplete="off"
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={purging || typed !== plan.confirmation}
                    onClick={purge}
                    className="min-h-11 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {purging ? 'Removing…' : 'Delete test data'}
                  </button>
                  <button
                    type="button"
                    disabled={purging}
                    onClick={() => setPlan(null)}
                    className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <details className="md:col-span-3">
            <summary className="cursor-pointer font-semibold text-slate-800 dark:text-white">
              Show the test-looking accounts and listings
            </summary>
            <div className="mt-2 grid gap-4 md:grid-cols-3 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-5">
                {audit.samples.users.map((u) => (
                  <li key={u.email}>{u.email}</li>
                ))}
              </ul>
              <ul className="list-disc pl-5">
                {audit.samples.businesses.map((b, i) => (
                  <li key={i}>
                    {b.name} ({rwf(b.balance)})
                  </li>
                ))}
              </ul>
              <ul className="list-disc pl-5">
                {audit.samples.listings.map((l, i) => (
                  <li key={i}>
                    {l.title} [{l.status}]
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default DataAuditCard;
