import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './authContext';
import { apiGet, apiSend } from '../lib/api';

/*
  WHO IS LOGGED IN — asked once, shared by everyone.

  Before this, /api/me was fetched independently by Navbar, ProtectedRoute,
  PublicOnlyRoute and QuizRoute. Loading /avatar therefore hit it four times,
  and each of those is a session lookup plus a users row read on the server.
  Worse, they resolved at different moments, so the navbar visibly flicked from
  logged-out to logged-in links after the page had already rendered.

  Now the provider asks once and every consumer reads the same answer.
*/
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-ask the server who we are. Called after login/register, when the
  // session cookie has changed and the cached answer is stale.
  const refresh = useCallback(async () => {
    try {
      const data = await apiGet('/api/me');
      setUser(data.user);
      return data.user;
    } catch {
      // Any failure — 401, network, anything — means "not usable as logged in".
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiSend('/api/logout', 'POST', {});
    } finally {
      // Clear locally even if the request failed, so the UI can't keep showing
      // a logged-in navbar after the user has asked to leave.
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    apiGet('/api/me')
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Memoised so consumers don't re-render just because the provider did.
  const value = useMemo(
    () => ({ user, loading, refresh, logout }),
    [user, loading, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
