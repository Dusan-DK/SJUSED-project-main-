import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { apiGet } from '../lib/api';
import ScreenMessage from './ScreenMessage';

/*
  Logged in AND has not finished the quiz yet.

  THE BUG: this used to be a bare fetch of /api/quiz/status with no res.ok
  check. For a logged-out visitor that endpoint answers 401 with
  { error: 'Not logged in' } — no `completed` field — so `data.completed` was
  undefined, the else branch ran, and the quiz rendered for someone with no
  session at all. They answered every question and only discovered the problem
  when the final POST failed.

  Auth is now settled first, by the shared provider, and only then do we ask
  whether the quiz is done.
*/
function QuizRoute({ children }) {
  const { user, loading } = useAuth();
  // 'pending' until the answer arrives; 'done' carries `completed`.
  const [quiz, setQuiz] = useState({ state: 'pending', completed: false });

  useEffect(() => {
    // Don't ask about the quiz until we know there is someone to ask about.
    if (loading || !user) return;

    let cancelled = false;

    apiGet('/api/quiz/status')
      .then((data) => {
        if (!cancelled) setQuiz({ state: 'done', completed: Boolean(data.completed) });
      })
      .catch(() => {
        /*
          If the check itself fails, let them take the quiz. Submitting is
          idempotent server-side (ON CONFLICT (user_id) DO UPDATE), so the
          worst case is they redo it — far better than blocking a new user
          out of the only route that creates their profile.
        */
        if (!cancelled) setQuiz({ state: 'done', completed: false });
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  if (loading) return <ScreenMessage>Loading…</ScreenMessage>;
  if (!user) return <Navigate to="/login" replace />;
  if (quiz.state === 'pending') return <ScreenMessage>Loading…</ScreenMessage>;
  if (quiz.completed) return <Navigate to="/avatar" replace />;

  return children;
}

export default QuizRoute;
