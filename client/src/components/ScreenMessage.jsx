/*
  The full-page "Loading…" the route guards show while auth is resolving.
  Previously each guard rendered its own bare unstyled <p>Loading...</p>, which
  flashed white against the app's #f5f8fb background.
*/
function ScreenMessage({ children, tone = 'muted' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f8fb]">
      <p
        className={
          tone === 'error'
            ? 'text-sm font-semibold text-red-500'
            : 'text-sm text-slate-400'
        }
      >
        {children}
      </p>
    </div>
  );
}

export default ScreenMessage;
