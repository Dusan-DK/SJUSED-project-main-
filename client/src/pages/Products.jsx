import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiGet, apiGetList } from '../lib/api';

/*
  ZONE → display config as data.
  Each zone has a tab label (what the user sees) and the heading/subtitle text.
  The `zone` value (url ?zone=) stays the backend contract — unchanged.
*/
const ZONES = [
  { id: 'hair',  label: 'Hair',     heading: 'Hair',     subtitle: 'Haircare picks for your routine.' },
  { id: 'face',  label: 'Face',     heading: 'Face',     subtitle: 'Skincare & complexion picks for you.' },
  { id: 'torso', label: 'Top',      heading: 'Top',      subtitle: 'Tops & layers in your style.' },
  { id: 'legs',  label: 'Bottoms',  heading: 'Bottoms',  subtitle: 'Bottoms that fit your look.' },
  { id: 'feet',  label: 'Footwear', heading: 'Footwear', subtitle: 'Shoes matched to your style.' },
];

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const zone = searchParams.get('zone') || 'face';
  const [profile, setProfile] = useState(null);
  // Bumped by "Try again". `zone` alone can't drive a retry, because retrying
  // the SAME zone leaves it unchanged and the effect would never re-run.
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  /*
    One state object tagged with the request it belongs to, rather than
    separate products/loading/error. That lets `loading` be DERIVED (below)
    instead of set at the top of the effect — calling setState synchronously
    in an effect body triggers a cascading re-render, which the react-hooks
    lint rule flags.
  */
  const [result, setResult] = useState({ zone: null, key: null, products: [], error: null });

  // FIX: dependency is [zone] — refetch whenever the zone changes (tab click).
  // Empty [] before meant it only fetched once and tabs did nothing.
  useEffect(() => {
    // `cancelled` stops a slow response from a previous zone landing after a
    // newer one, and silences state updates after the component unmounts.
    let cancelled = false;

    apiGetList(`/api/recommendations?zone=${zone}`)
      .then((data) => {
        if (!cancelled) setResult({ zone, key: reloadKey, products: data, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        // Session expired mid-browse — send them to log in again.
        if (err.status === 401) return navigate('/login');
        // Logged in but no quiz profile yet — nothing to recommend from.
        if (err.status === 404) return navigate('/avatar/name');
        /*
          THE WHITE-SCREEN BUG: this used to setProducts(<error object>).
          `products.length === 0` was then false, so the code fell through to
          products.map(...) — which is not a function on an object — and the
          whole page went blank with only a console error.
        */
        setResult({ zone, key: reloadKey, products: [], error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [zone, reloadKey, navigate]);

  // Derived: we are loading whenever the state on hand belongs to a different
  // zone (tab just clicked) or a previous attempt (Try again just pressed).
  const loading = result.zone !== zone || result.key !== reloadKey;
  const products = result.products;
  const error = result.error;

  // Tab click just updates the URL param. That changes `zone`, which triggers
  // the effect above to refetch. URL stays shareable/back-button friendly.
  function handleTabClick(zoneId) {
    setSearchParams({ zone: zoneId });
  }

  useEffect(() => {
    let cancelled = false;
    apiGet('/api/avatar/profile')
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      // The chips are decoration — if this fails the page still works, so
      // don't surface an error for it, just leave them out.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const activeZone = ZONES.find((z) => z.id === zone) || ZONES[1];

  return (
    <div className="min-h-screen bg-[#f5f8fb]">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Back link — <Link>, not <a href>, so it doesn't reload the document */}
        <Link to="/avatar" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
          ← Back to avatar
        </Link>

        {/* Heading + inline subtitle */}
        <div className="mt-6 flex flex-wrap items-baseline gap-x-4">
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-slate-900">
            {activeZone.heading}
          </h1>
          <p className="text-lg text-slate-500">{activeZone.subtitle}</p>
        </div>

        {/* Profile chips — static for now, fill from profile later if wanted */}

      {profile && (
  <div className="mt-5 flex flex-wrap items-center gap-3">
    {profile.style_archetype?.map((style) => (
      <span key={style} className="rounded-full bg-amber-100/70 px-4 py-1.5 text-sm font-semibold text-amber-800">
        {style}
      </span>
    ))}
    <span className="rounded-full bg-amber-100/70 px-4 py-1.5 text-sm font-semibold text-amber-800">
      {profile.budget} budget
    </span>
    <span className="rounded-full bg-amber-100/70 px-4 py-1.5 text-sm font-semibold text-amber-800">
      {profile.skin_type} skin
    </span>
    <span className="text-sm text-slate-400">Filtered to your profile</span>
  </div>
)}

        {/* FILTER TABS */}
        <div className="mt-6 flex flex-wrap gap-3 border-b border-slate-200 pb-6">
          {ZONES.map((z) => {
            const isActive = z.id === zone;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => handleTabClick(z.id)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-amber-400 text-slate-900'
                    : 'text-slate-600 ring-1 ring-slate-300 hover:bg-slate-100'
                }`}
              >
                {z.label}
              </button>
            );
          })}
        </div>

        {/* PRODUCT GRID — four distinct states, where there used to be two. */}
        {loading ? (
          <p className="mt-16 text-center text-sm text-slate-400">Loading picks…</p>
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
          <p className="mt-16 text-center text-sm text-slate-400">
            No picks for this zone yet.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:shadow-md"
              >
                {/* IMAGE AREA */}
                <div className="relative aspect-square bg-white">
                   {product.image_url ? (
                    <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      product shot
                    </div>
                  )}
                  {/* heart button — placeholder, wire to wishlist later */}
                  <button
                    type="button"
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-slate-50"
                    aria-label="Save"
                  >
                    <span className="text-slate-700">♡</span>
                  </button>
                </div>

                {/* DETAILS */}
                <div className="p-5">
                  {/* brand — only renders if API sends it */}
                  {product.brand && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {product.brand}
                    </p>
                  )}
                  <h2 className="mt-1 font-display text-base font-bold text-slate-900">
                    {product.name}
                  </h2>
                  {product.description && (
                    <p className="mt-1 text-sm text-slate-500">{product.description}</p>
                  )}

                  {/* price + buy row */}
                  <div className="mt-4 flex items-center justify-between">
                    {product.price && (
                      <span className="font-display text-lg font-extrabold text-slate-900">
                        ${product.price}
                      </span>
                    )}
                    <a
                      href={product.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-500"
                    >
                      Buy now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Products;



/* import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function Products() {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const zone = searchParams.get('zone');


  useEffect(() => {
    fetch(`/api/recommendations?zone=${zone}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <div>
      <h1>Your recommendations</h1>
      {products.map(product => (
        <div key={product.id}>
          <img src={product.image_url} alt={product.name} width="200" />
          <h2>{product.name}</h2>
          <a href={product.affiliate_url} target="_blank">Buy now</a>
        </div>
      ))}
    </div>
  );
}

export default Products; */
