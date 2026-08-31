import AuthForm from '../components/AuthForm';
import {useNavigate} from 'react-router-dom';
function Login() {
  const navigate = useNavigate();

  async function handleLogin(email, password) {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Login failed');
    } 
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

