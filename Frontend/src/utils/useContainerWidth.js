import { useEffect, useState } from 'react';

/**
 * Tracks an element's width, clamped to [min, max]. Returns a callback ref
 * (state-backed, so measuring starts whenever the element actually mounts) and
 * the width. Used to size third-party widgets that draw at a fixed pixel width,
 * such as Google's sign-in button, so they never overflow a phone-width card.
 */
export default function useContainerWidth(min, max) {
  const [el, setEl] = useState(null);
  const [width, setWidth] = useState(max);

  useEffect(() => {
    if (!el) return undefined;
    const update = () => setWidth(Math.max(min, Math.min(max, Math.floor(el.clientWidth))));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [el, min, max]);

  return [setEl, width];
}
