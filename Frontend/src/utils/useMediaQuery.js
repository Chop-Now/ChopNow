import { useSyncExternalStore } from 'react';

/**
 * Subscribes to a CSS media query. Used where layout has to change in JS (for
 * example, a dashboard sidebar that is a drawer on phones and a fixed panel on
 * desktops) and CSS classes alone can't express it.
 */
export default function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

// Tailwind's `lg` breakpoint: below this the dashboards use a drawer.
export const DASHBOARD_DRAWER_QUERY = '(max-width: 1023px)';
