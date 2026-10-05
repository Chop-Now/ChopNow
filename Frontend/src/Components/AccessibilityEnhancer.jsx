import { useEffect } from 'react';

/**
 * Safety net for accessible names. Icon-only buttons and bare form fields are
 * everywhere in the dashboards; this gives each one a name a screen reader can
 * announce, derived (in order) from its title, the text of a nearby <label> or
 * heading, its placeholder, or what its icon means. It only fills in names
 * that are missing - anything labelled in the source is left alone - and it
 * keeps up with rows and pages as they render. New code should still label
 * controls properly; this stops the long tail from being silent.
 */
const ICON_LABELS = {
  eye: 'View',
  'eye-off': 'Hide',
  trash: 'Delete',
  'trash-2': 'Delete',
  pencil: 'Edit',
  pen: 'Edit',
  'user-cog': 'Manage user',
  'user-check': 'Approve',
  'user-x': 'Reject',
  'user-plus': 'Add user',
  'circle-check': 'Approve',
  'check-circle': 'Approve',
  'circle-x': 'Reject',
  'x-circle': 'Reject',
  ban: 'Suspend',
  shield: 'Permissions',
  lock: 'Lock',
  unlock: 'Unlock',
  'message-square': 'Message',
  clock: 'History',
  'file-text': 'View document',
  'refresh-ccw': 'Refresh',
  'square-pen': 'Edit',
  edit: 'Edit',
  'edit-2': 'Edit',
  'edit-3': 'Edit',
  x: 'Close',
  plus: 'Add',
  minus: 'Remove',
  search: 'Search',
  filter: 'Filter',
  funnel: 'Filter',
  'refresh-cw': 'Refresh',
  'rotate-cw': 'Refresh',
  download: 'Download',
  upload: 'Upload',
  'chevron-left': 'Previous',
  'chevron-right': 'Next',
  'chevron-down': 'Expand',
  'chevron-up': 'Collapse',
  'arrow-left': 'Back',
  'more-vertical': 'More actions',
  'ellipsis-vertical': 'More actions',
  ellipsis: 'More actions',
  'more-horizontal': 'More actions',
  copy: 'Copy',
  bell: 'Notifications',
  check: 'Confirm',
  star: 'Rate',
  heart: 'Favourite',
  'share-2': 'Share',
  phone: 'Call',
  mail: 'Email',
  menu: 'Menu',
  settings: 'Settings',
  calendar: 'Choose date',
  send: 'Send',
  info: 'More information',
  'external-link': 'Open in a new tab',
  sun: 'Switch theme',
  moon: 'Switch theme',
  power: 'Toggle',
};

const hasName = (el) =>
  el.hasAttribute('aria-label') ||
  el.hasAttribute('aria-labelledby') ||
  el.hasAttribute('title') ||
  (el.textContent || '').trim().length > 0 ||
  el.querySelector('img[alt]:not([alt=""])') !== null;

const iconLabel = (el) => {
  const svg = el.querySelector('svg');
  if (!svg) return null;
  // lucide adds several aliases to one icon (e.g. "lucide-trash2 lucide-trash-2").
  const names = String(svg.getAttribute('class') || '').match(/lucide-[a-z0-9-]+/g) || [];
  for (const name of names) {
    const key = name.replace('lucide-', '');
    if (ICON_LABELS[key]) return ICON_LABELS[key];
  }
  // Better a rough spoken name than silence: "file-text" -> "File text".
  const fallback = names[names.length - 1]?.replace('lucide-', '').replace(/-/g, ' ');
  return fallback ? fallback.charAt(0).toUpperCase() + fallback.slice(1) : null;
};

const textOf = (node) => (node?.textContent || '').replace(/\s+/g, ' ').trim();

const fieldLabel = (el) => {
  if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return null;
  if (el.closest('label')) return null;
  if (el.title) return el.title;
  // The nearest label/heading-like text in the same field group.
  let group = el.parentElement;
  for (let depth = 0; group && depth < 3; depth += 1, group = group.parentElement) {
    const label = Array.from(group.querySelectorAll('label, legend, p, span')).find(
      (candidate) =>
        !candidate.contains(el) &&
        candidate.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING &&
        textOf(candidate).length > 0 &&
        textOf(candidate).length <= 40
    );
    if (label) return textOf(label);
  }
  return el.getAttribute('placeholder') || (el.type === 'date' ? 'Date' : null);
};

const enhance = (root) => {
  root.querySelectorAll('button, [role="button"], a[href]').forEach((el) => {
    if (hasName(el)) return;
    const label = iconLabel(el);
    if (label) el.setAttribute('aria-label', label);
  });

  root
    .querySelectorAll(
      'input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea'
    )
    .forEach((el) => {
      if (el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')) return;
      let label = fieldLabel(el);
      if (!label && el.tagName === 'SELECT') label = textOf(el.options[0]);
      // Visually-hidden switches (a styled <label> draws the control).
      if (!label && el.type === 'checkbox') {
        const row = el.closest('tr, li, [data-label]');
        label = `Toggle ${textOf(row?.querySelector('td, p, span, h3')).slice(0, 40)}`.trim();
      }
      if (label) el.setAttribute('aria-label', label);
    });

  // A scrolling region has to be reachable by keyboard.
  root.querySelectorAll('div[class*="overflow-"]').forEach((el) => {
    if (el.hasAttribute('tabindex')) return;
    const scrolls = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
    if (!scrolls) return;
    const { overflowX, overflowY } = getComputedStyle(el);
    if (!/(auto|scroll)/.test(overflowX + overflowY)) return;
    if (el.querySelector('a[href],button,input,select,textarea,[tabindex]')) return;
    el.setAttribute('tabindex', '0');
  });
};

export default function AccessibilityEnhancer() {
  useEffect(() => {
    let frame = 0;
    const run = () => enhance(document.body);
    // One pass per frame at most; never cancelled by newer mutations, or a page
    // that animates constantly would starve it.
    const schedule = () => {
      if (frame) return;
      frame = setTimeout(() => {
        frame = 0;
        run();
      }, 50);
    };
    run();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      clearTimeout(frame);
      observer.disconnect();
    };
  }, []);

  return null;
}
