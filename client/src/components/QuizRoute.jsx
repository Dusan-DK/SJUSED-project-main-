import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function QuizRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/quiz/status', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.completed) {
          navigate('/avatar'); // už urobil → preč
        } else {
          setChecking(false); // môže robiť quiz
        }
      });
  }, []);

  if (checking) return null;
  return children;
}

export default QuizRoute;