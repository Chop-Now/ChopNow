import toast from 'react-hot-toast';

// One failed request can raise an error toast in the axios interceptor and
// another in the page that made the call. Keep a single error toast on screen:
// the newest one (the page's, which is usually the more specific message) replaces
// the previous one instead of stacking up beside it.
let lastErrorId = null;
const showError = toast.error.bind(toast);

toast.error = (message, options) => {
  if (lastErrorId && options?.id !== lastErrorId) toast.dismiss(lastErrorId);
  lastErrorId = showError(message, options);
  return lastErrorId;
};
