import { trackEvent } from '../lib/track';

/*
  One product card, shared by Products and Liked so the two pages can never
  drift apart visually. It only DRAWS — whether a heart click means "toggle"
  (Products) or "remove from this list" (Liked) is the page's decision, passed
  in as onToggleSave.

  The "Buy now" click is tracked here, because it means the same thing on
  every page that shows a card.
*/
export default function ProductCard({ product, saved, onToggleSave }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:shadow-md">
      {/* IMAGE AREA */}
      <div className="relative aspect-square bg-white">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            // Images come straight from the shops' servers. no-referrer stops
            // them learning which page of ours (zone, liked list) asked.
            referrerPolicy="no-referrer"
            loading="lazy"
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            product shot
          </div>
        )}
        {/* heart button — saves to saved_products, logs save/unsave */}
        <button
          type="button"
          onClick={() => onToggleSave(product)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from liked` : `Like ${product.name}`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-slate-50 active:scale-90"
        >
          {saved ? (
            <span className="text-rose-500">♥</span>
          ) : (
            <span className="text-slate-700">♡</span>
          )}
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
            // Logged before the shop opens; keepalive lets it finish
            // even if this tab is closed right after.
            onClick={() => trackEvent('click', [product.id])}
            className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-500"
          >
            Buy now
          </a>
        </div>
      </div>
    </div>
  );
}
