// Sends crashes real users hit to the backend (POST /api/client-errors), where they are logged
// and forwarded to Sentry. Without this, a blank screen on someone's phone is invisible to us.
// Kept deliberately quiet: duplicates, a per-page cap, and known noise are dropped.

const MAX_REPORTS_PER_PAGE = 5;
const sent = new Set();

const NOISE = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i,
  /dynamically imported module|Loading chunk|Importing a module script failed/i, // lazyWithRetry reloads these
  /Network Error|timeout of \d+ms|Request aborted|canceled|AbortError/i,
  /Non-Error promise rejection captured/i,
];

const fromExtension = (stack = '') => /(chrome|moz|safari)-extension:\/\//.test(stack);

export function reportError(error, source = 'window', extra = '') {
  try {
    if (import.meta.env.DEV || sent.size >= MAX_REPORTS_PER_PAGE) return;
    // The server already knows about failed API calls; only crashes in the page itself matter here.
    if (error?.isAxiosError || error?.response) return;

    const message = String(error?.message || error || '').slice(0, 500);
    const stack = `${error?.stack || ''}${extra ? `\n${extra}` : ''}`.slice(0, 3000);
    if (!message || NOISE.some((re) => re.test(message)) || fromExtension(stack)) return;

    const key = `${source}|${message}`;
    if (sent.has(key)) return;
    sent.add(key);

    fetch('/api/client-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, stack, source, url: window.location.href.split('?')[0] }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Reporting must never cause an error of its own.
  }
}

export function installErrorReporting() {
  window.addEventListener('error', (e) => reportError(e.error || e.message, 'window'));
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason, 'promise'));
}
