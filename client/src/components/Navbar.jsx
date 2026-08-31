import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export default function Navbar() {
  // Was its own /api/me fetch — one of four the app fired on every page load.
  const { user, loading } = useAuth();

  const link = 'px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors';

  const linkActive = ({ isActive }) =>
    link + (isActive ? ' text-yellow-500 font-semibold' : '');

  const cta = 'px-4 py-2 rounded-full bg-yellow-400 text-sm font-semibold text-gray-900 hover:bg-yellow-300 transition-colors';

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
      <NavLink
        to={user ? '/avatar' : '/'}
        className="text-3xl font-bold uppercase tracking-wide text-yellow-400"
      >
        SJUSED
      </NavLink>

      <nav className="flex items-center gap-2">
        {/*
          While auth is still resolving, show nothing rather than guessing.
          The old code defaulted to the logged-OUT links and then swapped them
          for the logged-in ones once its fetch landed — a visible flicker on
          every page load, and worse, "Login / Get started" briefly appearing
          to users who were already signed in.
        */}
        {loading ? null : user ? (
          <>
            <NavLink to="/avatar" className={linkActive}>Avatar</NavLink>
            <NavLink to="/profile" className={linkActive}>Profile</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/" end className={linkActive}>Home</NavLink>
            <NavLink to="/login" className={linkActive}>Login</NavLink>
            <NavLink to="/register" className={cta}>Get started</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}























/* import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
  fetch('/api/me', { credentials: 'include' })
    .then(res => res.ok ? res.json() : null)
    .then(data => setUser(data));
    }, []);


    return (
       <nav> 
        <h2>SJUSED</h2>
        {user ? (
    <div>
      <Link to="/profile">Profile</Link>
      <Link to="/avatar">Avatar</Link>
    </div>
    ): (
    <div>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
    </div>
    )}
    </nav>
  );
 
}

export default Navbar; */