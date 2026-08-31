import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) navigate('/login');
        else setLoading(false);
      });
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  return children;
}

export default ProtectedRoute;