import { useEffect, useRef, useState } from 'react';

const REASONS = [
  'Sold out',
  'Cannot prepare it in time',
  'Closing early today',
  'Problem with the order',
  'Other',
];

// Asks a vendor (or admin) why they are cancelling a customer's order; the customer
// is sent the reason together with the refund notice.
const CancelOrderDialog = ({ order, submitting, onCancel, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && !submitting && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel, submitting]);

  const paid = !['Pending'].includes(order.status);
  const send = () => {
    const text = [reason, note.trim()].filter(Boolean).join(': ');
    onSubmit(text);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900"
      >
        <h2
          id="cancel-order-title"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          Cancel order {order.number}?
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          The customer is told straight away.
          {paid ? ' They are refunded in full.' : ''} This cannot be undone.
        </p>

        <label
          htmlFor="cancel-reason"
          className="mt-4 block text-sm font-medium text-slate-800 dark:text-slate-200"
        >
          Reason
        </label>
        <select
          id="cancel-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">Choose a reason</option>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <label
          htmlFor="cancel-note"
          className="mt-3 block text-sm font-medium text-slate-800 dark:text-slate-200"
        >
          Message to the customer (optional)
        </label>
        <textarea
          id="cancel-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            ref={closeRef}
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Keep order
          </button>
          <button
            type="button"
            onClick={send}
            disabled={!reason || submitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Cancelling…' : 'Cancel order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderDialog;
