import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PublicOnlyRoute({ children }) {
  const [checking, setChecking] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((res) => {
        if (res.ok) {
          // prihlásený → nemá tu čo robiť, preč
          navigate('/avatar');
        } else {
          // neprihlásený → smie vidieť stránku
          setChecking(false);
        }
      })
      .catch(() => setChecking(false)); // ak fetch padne, radšej ukáž stránku
  }, [navigate]);

  if (checking) return <p>Loading…</p>;
  return children;
}

export default PublicOnlyRoute;