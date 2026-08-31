import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import ScreenMessage from './ScreenMessage';

/*
  Logged-in users only.

  Reads the shared auth state instead of doing its own /api/me fetch, and
  redirects declaratively with <Navigate> rather than calling navigate() from
  inside an effect — no effect, no dependency array, nothing to get wrong.

  The old version also had no .catch(): if that fetch failed for any reason,
  `loading` was never cleared and the page sat on "Loading..." forever. The
  provider now treats any failure as logged-out.
*/
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <ScreenMessage>Loading…</ScreenMessage>;
  // replace: don't leave the guarded URL in history, or Back bounces off it.
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
