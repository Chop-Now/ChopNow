import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import LoadingSpinner from './ui/LoadingSpinner';
import { hasStoredUser, homeForRole } from '../utils/appMode';

/**
 * "/" is the marketing landing page for visitors. Signed-in users go straight
 * to their app (like opening TikTok: you land in the feed, not on a sales page).
 */
const HomeRoute = ({ children }) => {
  const { isAuthenticated, isLoading, activeRole, user } = useAppContext();

  if (isAuthenticated) {
    return <Navigate to={homeForRole(activeRole || user?.activeRole || user?.role)} replace />;
  }

  // Probably signed in, still confirming: wait rather than flash the landing page.
  if (isLoading && hasStoredUser()) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return children;
};

export default HomeRoute;
