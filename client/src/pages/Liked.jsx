import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiGetList, apiSend } from '../lib/api';
import ProductCard from '../components/ProductCard';

/*
  Everything the user has hearted, newest first.

  Same card as Products. The one difference: un-hearting here REMOVES the card,
  because this page is "only liked products". It disappears straight away and
  comes back in the same spot if the server says no.

  No view tracking here on purpose. A "view" means "the recommender showed you
  this"; counting your own liked list would make those items look ignored
  every time you visit it.
*/
function Liked() {
  const navigate = useNavigate();
  const [reloadKey, setReloadKey] = useState(0);
  // Tagged with the attempt it belongs to, same pattern as Products, so
  // `loading` is derived rather than set synchronously inside the effect.
  const [result, setResult] = useState({ key: null, products: [], error: null });

  useEffect(() => {
    let cancelled = false;

    apiGetList('/api/saved')
      .then((data) => {
        if (!cancelled) setResult({ key: reloadKey, products: data, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) return navigate('/login');
        setResult({ key: reloadKey, products: [], error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey, navigate]);

  const loading = result.key !== reloadKey;
  const { products, error } = result;

  /*
    Back = the previous page in this app (Products, Profile…). React Router
    numbers its history entries in history.state.idx; 0 means this tab
    started here (a bookmark, a pasted link), and navigate(-1) would leave
    the app entirely — so go to the avatar instead.
  */
  function handleBack() {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/avatar');
  }

  async function handleUnlike(product) {
    const index = products.findIndex((p) => p.id === product.id);
    setResult((r) => ({ ...r, products: r.products.filter((p) => p.id !== product.id) }));

    try {
      await apiSend(`/api/saved/${product.id}`, 'DELETE');
    } catch (err) {
      if (err.status === 401) return navigate('/login');
      // Put it back where it was.
      setResult((r) => {
        const restored = [...r.products];
        restored.splice(Math.min(index, restored.length), 0, product);
        return { ...r, products: restored };
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8fb]">
      <div className="mx-auto max-w-6xl px-6 py-10">

        <button
          type="button"
          onClick={handleBack}
          className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          ← Back
        </button>

        <div className="mt-6 flex flex-wrap items-baseline gap-x-4 border-b border-slate-200 pb-6">
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-slate-900">
            Liked
          </h1>
          <p className="text-lg text-slate-500">
            {loading || error
              ? 'Everything you hearted, in one place.'
              : `${products.length} ${products.length === 1 ? 'item' : 'items'} you hearted.`}
          </p>
        </div>

        {loading ? (
          <p className="mt-16 text-center text-sm text-slate-400">Loading your likes…</p>
        ) : error ? (
          <div className="mt-16 text-center">
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-4 rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-500"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          // Empty state points somewhere useful instead of a dead end.
          <div className="mt-16 text-center">
            <p className="text-4xl text-slate-300">♡</p>
            <p className="mt-3 font-display text-lg font-bold text-slate-900">Nothing liked yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Tap the heart on any pick and it will show up here.
            </p>
            <Link
              to="/avatar"
              className="mt-6 inline-block rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-500"
            >
              Find picks
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                saved
                onToggleSave={handleUnlike}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Liked;
