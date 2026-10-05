import { useEffect, useRef } from 'react';

/**
 * Content wrapper for the vendor and admin dashboards. Wide data tables can't
 * be read on a phone, so below `md` the CSS in index.css (`[data-stacked]`)
 * lays each row out as a card. That layout needs every cell to know its
 * column name, so this copies each header's text onto the matching cells as
 * `data-label`, and keeps doing it as rows load, filter and page. The table
 * markup in the pages stays untouched; add `data-no-stack` to a table to opt out.
 */
const labelTables = (root) => {
  root.querySelectorAll('table:not([data-no-stack])').forEach((table) => {
    const headers = Array.from(table.querySelectorAll('thead th')).map((th) =>
      th.textContent.trim()
    );
    table.setAttribute('data-stacked', '');
    table.querySelectorAll('tbody tr').forEach((row) => {
      Array.from(row.children).forEach((cell, index) => {
        const label = headers[index] || '';
        if (cell.getAttribute('data-label') !== label) cell.setAttribute('data-label', label);
      });
    });
  });
};

export default function StackedTables({ className, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = setTimeout(() => {
        frame = 0;
        labelTables(root);
      }, 50);
    };
    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      clearTimeout(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
