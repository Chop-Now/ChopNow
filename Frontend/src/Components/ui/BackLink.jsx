import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { homeForRole, useIsAppMode } from '../../utils/appMode';
import { useAppContext } from '../../context/AppContext';

/**
 * The back control on standalone pages (terms, privacy, how impact is
 * calculated). Visitors get "Back to Home"; signed-in users get a plain "Back"
 * that returns to wherever they came from, like an app.
 */
const BackLink = () => {
  const isApp = useIsAppMode();
  const navigate = useNavigate();
  const { activeRole, user } = useAppContext();
  const home = isApp ? homeForRole(activeRole || user?.activeRole || user?.role) : '/';

  const onClick = (event) => {
    // history.state.idx > 0 means there is a previous page inside this app.
    if (isApp && window.history.state && window.history.state.idx > 0) {
      event.preventDefault();
      navigate(-1);
    }
  };

  return (
    <Link
      to={home}
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-2 text-moringa-muted hover:text-moringa transition"
    >
      <ArrowLeft size={20} />
      <span>{isApp ? 'Back' : 'Back to Home'}</span>
    </Link>
  );
};

export default BackLink;
