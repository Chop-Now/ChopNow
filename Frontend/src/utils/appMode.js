import { useAppContext } from '../context/AppContext';

// Where each kind of signed-in user lands: their app, not the marketing site.
export const homeForRole = (role) =>
  ({ business_owner: '/dashboard', rider: '/rider-dashboard', admin: '/admin' })[role] || '/shop';

// A previous visit leaves the signed-in user in localStorage, so on reload we
// can tell "probably signed in, still checking" from "a new visitor" and avoid
// flashing the marketing site at someone who is about to land in the app.
export const hasStoredUser = () => {
  try {
    return !!localStorage.getItem('user');
  } catch {
    return false;
  }
};

/**
 * True when the person is (or is probably about to be confirmed as) signed in.
 * The marketing website - landing page, footer - is for visitors; once signed in
 * the site behaves like an app.
 */
export const useIsAppMode = () => {
  const { isAuthenticated, isLoading } = useAppContext();
  return isAuthenticated || (isLoading && hasStoredUser());
};
