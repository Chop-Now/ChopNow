import { useEffect } from 'react';

/**
 * Gives every modal in the app the behaviour of a proper dialog without
 * touching each one. The app's modals all share a shape: a full-screen fixed,
 * flex-centred backdrop containing one panel. When one appears this:
 *   - marks the panel role="dialog" aria-modal and names it from its heading
 *   - moves focus into it and keeps Tab inside it
 *   - closes it on Escape (backdrop click, else a Close/Cancel button)
 *   - restores focus to whatever opened it, and locks page scroll meanwhile
 * The phone bottom-sheet layout for the same shape lives in index.css.
 */
const BACKDROP = '.fixed.inset-0.flex.items-center.justify-center';
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const visibleFocusables = (panel) =>
  Array.from(panel.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);

const closeDialog = (backdrop, panel) => {
  const closer = Array.from(panel.querySelectorAll('button')).find((b) =>
    /^(close|cancel|dismiss|no|back)\b/i.test(
      (b.getAttribute('aria-label') || b.textContent || '').trim()
    )
  );
  if (closer) closer.click();
  else backdrop.click();
};

export default function DialogEnhancer() {
  useEffect(() => {
    const open = new Map(); // backdrop -> { opener }
    let idCounter = 0;

    const enhance = (backdrop) => {
      const panel = backdrop.firstElementChild;
      if (!panel || open.has(backdrop)) return;
      open.set(backdrop, { opener: document.activeElement });

      if (!panel.hasAttribute('role')) panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      const heading = panel.querySelector('h1,h2,h3,h4');
      if (heading && !panel.hasAttribute('aria-label') && !panel.hasAttribute('aria-labelledby')) {
        if (!heading.id) heading.id = `dialog-title-${++idCounter}`;
        panel.setAttribute('aria-labelledby', heading.id);
      }
      if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1');

      // Focus the first control, else the panel itself, once it has rendered.
      setTimeout(() => {
        if (!panel.contains(document.activeElement)) {
          (visibleFocusables(panel)[0] || panel).focus({ preventScroll: true });
        }
      });
      document.body.style.overflow = 'hidden';
    };

    const release = (backdrop) => {
      const state = open.get(backdrop);
      open.delete(backdrop);
      if (open.size === 0) document.body.style.overflow = '';
      if (state?.opener && document.contains(state.opener)) {
        state.opener.focus({ preventScroll: true });
      }
    };

    const sync = () => {
      const present = new Set(document.querySelectorAll(BACKDROP));
      present.forEach(enhance);
      Array.from(open.keys()).forEach((backdrop) => {
        if (!present.has(backdrop)) release(backdrop);
      });
    };

    const onKeyDown = (e) => {
      const backdrop = Array.from(open.keys()).pop();
      if (!backdrop) return;
      const panel = backdrop.firstElementChild;
      if (!panel) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeDialog(backdrop, panel);
      } else if (e.key === 'Tab') {
        const items = visibleFocusables(panel);
        if (items.length === 0) {
          e.preventDefault();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = setTimeout(() => {
        frame = 0;
        sync();
      }, 50);
    };

    sync();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      clearTimeout(frame);
      observer.disconnect();
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = '';
    };
  }, []);

  return null;
}
