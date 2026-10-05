import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { listingService } from '../../services';

/**
 * Admin tool: fish used to be listed under "Meat". This finds listings whose
 * title clearly names a fish or shellfish and moves them to "Fish & Seafood".
 * Checking changes nothing; moving needs a second, explicit click. Listings
 * that need a human look are shown but never moved.
 */
const SeafoodRecategoriser = ({ onDone }) => {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [moved, setMoved] = useState(null);

  const run = async (apply) => {
    setBusy(true);
    try {
      const data = await listingService.recategoriseSeafood(apply);
      if (apply) {
        setMoved(data.moved.length);
        setResult(null);
        toast.success(`Moved ${data.moved.length} listing(s) to Fish & Seafood`);
        if (onDone) onDone();
      } else {
        setMoved(null);
        setResult(data);
      }
    } catch (error) {
      toast.error(error?.message || 'Could not complete the request');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            Fish listings filed under Meat
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Find listings whose title clearly names a fish or shellfish and move them to Fish &
            Seafood, so their impact uses the seafood factors.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => run(false)}
          className="min-h-11 shrink-0 rounded-lg bg-solid px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-tertiary disabled:opacity-60"
        >
          {busy && !result ? 'Checking…' : result ? 'Check again' : 'Check'}
        </button>
      </div>

      {moved !== null && (
        <p className="mt-3 text-xs font-medium text-green-700 dark:text-green-400">
          Done: {moved} listing{moved === 1 ? '' : 's'} moved to Fish & Seafood.
        </p>
      )}

      {result && (
        <div className="mt-4 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div>
            <p className="mb-1 font-semibold">
              Will move to Fish & Seafood ({result.moved.length})
            </p>
            {result.moved.length === 0 ? (
              <p className="text-slate-500">Nothing to move.</p>
            ) : (
              <ul className="list-disc pl-5">
                {result.moved.map((l) => (
                  <li key={l._id}>{l.title}</li>
                ))}
              </ul>
            )}
          </div>
          {result.review.length > 0 && (
            <div>
              <p className="mb-1 font-semibold">
                Needs a manual look, will not be changed ({result.review.length})
              </p>
              <ul className="list-disc pl-5">
                {result.review.map((l) => (
                  <li key={l._id}>{l.title}</li>
                ))}
              </ul>
            </div>
          )}
          {result.moved.length > 0 && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(true)}
              className="min-h-11 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {busy ? 'Moving…' : `Move ${result.moved.length} to Fish & Seafood`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SeafoodRecategoriser;
