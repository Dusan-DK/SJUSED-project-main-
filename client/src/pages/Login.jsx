import AuthForm from '../components/AuthForm';
import {useNavigate} from 'react-router-dom';
import { apiSend } from '../lib/api';
import { useAuth } from '../context/authContext';

function Login() {
  const navigate = useNavigate();
  const { refresh } = useAuth();

  async function handleLogin(email, password) {
    // apiSend throws an ApiError carrying the server's message, which AuthForm
    // catches and displays — same behaviour as the manual check it replaces.
    await apiSend('/api/login', 'POST', { email, password });

    /*
      MUST refresh before navigating. The provider cached "logged out" when the
      app loaded; without re-asking, ProtectedRoute would still see user=null
      and bounce us straight back to /login.
    */
    await refresh();
    navigate('/avatar');
  }

  return (
    <AuthForm 
      heading="Welcome back"
      leadIn="Don't have an account?"
      linkText="Create one"
      linkTo="/register"
      buttonText="Login"
      onSubmit={handleLogin}
    />
  );
}

export default Login;














/* import { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      window.location.href = '/avatar';
    } else {
      alert('Login failed');
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login; */

