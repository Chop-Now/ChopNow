// Promise-based confirmation that renders the app's own dialog (see ConfirmHost)
// instead of the browser's native confirm() box, which looks out of place and is
// awkward on phones.
//
//   if (!(await confirmAction({ title: 'Delete this listing?', message: '...', confirmLabel: 'Delete', danger: true }))) return;
let handler = null;

export const registerConfirmHandler = (fn) => {
  handler = fn;
  return () => {
    if (handler === fn) handler = null;
  };
};

export const confirmAction = (options) => {
  const opts = typeof options === 'string' ? { message: options } : options || {};
  // Nothing mounted (e.g. a test render): fall back to the browser's own box.
  if (!handler) return Promise.resolve(window.confirm(opts.message || 'Are you sure?'));
  return handler(opts);
};
