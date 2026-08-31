import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

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
        {user ? (
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