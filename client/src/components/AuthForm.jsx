import { useState } from 'react';
import { Link } from 'react-router-dom';

function AuthForm({ heading, leadIn, linkText, linkTo, buttonText, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

async function handleSubmit(e) {
  e.preventDefault();
  setError(''); // reset pred každým pokusom
  try {
    await onSubmit(email, password);
  } catch (err) {
    setError(err.message); // zobraz chybu z parenta
  }
}

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f8fb] px-4">
         <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-10">
         <p className="font-display text-lg font-extrabold tracking-tight text-amber-400">
          SJUSED
        </p>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-slate-900">
          {heading}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {leadIn}{' '}
          <Link to={linkTo} className="font-semibold text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-2">
            {linkText}
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8">

          <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />

          {/* PASSWORD FIELD */}
          <label htmlFor="password" className="mt-5 block text-sm font-semibold text-slate-700">
            Password
          </label>
          <div className="relative mt-2">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 hover:text-slate-600"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
          </div>
          
          <button
            type="submit"
            className="mt-7 w-full rounded-full bg-amber-400 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-500"
          >
            {buttonText}
          </button>

          {error && (
            <p className="mt-3 text-sm font-medium text-red-500">{error}</p>
        )}
        </form>

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-sm text-slate-400">or</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
      <a
        href={`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`}
        className="flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 transition hover:bg-slate-50"
        >Continue with Google
      </a>

         </div>



    </div>
  );
}

export default AuthForm;