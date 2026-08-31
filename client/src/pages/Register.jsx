import AuthForm from '../components/AuthForm';
import {useNavigate} from 'react-router-dom';
import { apiSend } from '../lib/api';
import { useAuth } from '../context/authContext';

function Register() {
  const navigate = useNavigate();
  const { refresh } = useAuth();

  async function handleRegister(email, password) {
    // Validation errors from the server (weak password, bad email, address
    // already in use) arrive as the ApiError message and are shown in the form.
    await apiSend('/api/register', 'POST', { email, password });

    // Same as login: the provider's cached "logged out" has to be updated
    // before we navigate into a guarded route.
    await refresh();
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