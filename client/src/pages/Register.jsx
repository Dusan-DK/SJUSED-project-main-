import AuthForm from '../components/AuthForm';
import {useNavigate} from 'react-router-dom';
function Register() {
  const navigate = useNavigate();

  async function handleRegister(email, password) {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Registration failed');  
    } 
    navigate('/avatar/name');
  }
   
    
  return (
    <AuthForm
      heading="Create an account"
      leadIn="Already have an account?"
      linkText="Log in"
      linkTo="/login"
      buttonText="Create Account"
      onSubmit={handleRegister}
    />
  );
}

export default Register;