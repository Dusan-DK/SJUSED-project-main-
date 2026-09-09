import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import ScreenMessage from '../components/ScreenMessage';

/*
  Renders for any URL no other <Route> claimed.

  Worth knowing how a request even gets here: server.js answers every non-/api
  GET with index.html, so /nonsense loads the app rather than 404ing. React then
  mounts, matches nothing, and — before this page existed — rendered null, i.e.
  the navbar sitting on an empty background.

  The primary link depends on who is asking. Sending a logged-in visitor to "/"
  would be a pointless double bounce: PublicOnlyRoute would immediately
  <Navigate> them to /avatar. Sending a logged-out one to /avatar is the same
  trip in reverse, via ProtectedRoute to /login.
*/
function NotFound() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  // Auth is still resolving. Guessing here means rendering "Log in" and then
  // swapping it to "Back to my avatar" a moment later, so wait it out — the
  // guards show this same message for the same reason.
  if (loading) return <ScreenMessage>Loading…</ScreenMessage>;

  const homeTo = user ? '/avatar' : '/';
  const homeText = user ? 'Back to my avatar' : 'Back to home';

  /*
    min-h-[70vh] rather than calc(100vh - navbar): the navbar is sticky and
    sized by its padding and logo type, not a fixed height, so subtracting a
    guessed 4rem would leave a stray scrollbar whenever the guess is short.
  */
  return (
    <main className="flex min-h-[70vh] items-center bg-[#f5f8fb]">
      <div className="mx-auto max-w-2xl px-6 py-16 text-center lg:py-24">
        <p className="font-display text-7xl font-extrabold tracking-tight text-amber-400 sm:text-8xl">
          404
        </p>

        <h1 className="font-display mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
          This page isn't{' '}
          <span className="text-amber-400">styled.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-slate-500">
          We couldn't find anything at{' '}
          {/*
            The path is safe to show — React escapes it, so a crafted URL like
            /<img onerror=…> is printed as text, never parsed as markup. break-all
            stops a long one widening the layout and scrolling the page sideways.
          */}
          <code className="break-all rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-700">
            {pathname}
          </code>
          . It may have moved, or the link that brought you here may be out of date.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to={homeTo}
            className="rounded-full bg-amber-400 px-7 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-500"
          >
            {homeText}
          </Link>

          <Link
            to={user ? '/products' : '/login'}
            className="rounded-full px-7 py-3.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-100"
          >
            {user ? 'See my picks' : 'I have an account'}
          </Link>
        </div>
      </div>
    </main>
  );
}

export default NotFound;
