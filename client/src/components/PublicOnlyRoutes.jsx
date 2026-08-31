import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import ScreenMessage from './ScreenMessage';

/*
  Logged-OUT users only — the marketing home page, login and register.
  An already-authenticated visitor gets bounced to their avatar.
*/
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <ScreenMessage>Loading…</ScreenMessage>;
  if (user) return <Navigate to="/avatar" replace />;

  return children;
}

export default PublicOnlyRoute;
