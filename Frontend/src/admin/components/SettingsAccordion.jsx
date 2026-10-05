import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * A settings card. On a phone the long platform-settings page is easier to move
 * through when each group folds away behind its title; from tablet width up it
 * is the same always-open card as before (the header stops being a button).
 */
export default function SettingsAccordion({ header, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="rounded-lg border border-slate-200/50 bg-white/80 p-3 backdrop-blur-xl md:p-5 dark:border-slate-700/50 dark:bg-slate-900/80">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center gap-3 text-left md:pointer-events-none md:mb-4 md:cursor-default"
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">{header}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-500 transition-transform md:hidden ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      <div id={id} className={`${open ? 'mt-4 block' : 'hidden'} md:mt-0 md:block`}>
        {children}
      </div>
    </div>
  );
}
