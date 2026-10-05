import React, { useId, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

/**
 * Secondary filters (dates, sort, status) take a whole screen on a phone and
 * push the data below the fold. On phones they sit behind a "Filters" button -
 * search and the primary action stay visible - and from tablet width up they
 * render exactly as before (the wrapper disappears with `display: contents`).
 */
export default function CollapsibleFilters({ children, summary = '' }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={id}
        className="md:hidden flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
          {summary && <span className="text-xs font-normal opacity-70">{summary}</span>}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <div id={id} className={`${open ? 'block' : 'hidden'} md:contents`}>
        {children}
      </div>
    </>
  );
}
