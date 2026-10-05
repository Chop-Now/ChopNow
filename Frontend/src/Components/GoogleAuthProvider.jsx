import { GoogleOAuthProvider } from '@react-oauth/google';

/**
 * Wraps only the screens that show "Continue with Google". The provider injects
 * Google's ~100 KB sign-in script on mount, which the shop, cart and dashboards
 * never need.
 */
export default function GoogleAuthProvider({ children }) {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
