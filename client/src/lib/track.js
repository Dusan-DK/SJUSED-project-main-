/*
  Behaviour tracking: views and "Buy now" clicks.

  Deliberately NOT built on apiSend:
  - Fire-and-forget. Nobody awaits this, and a failed log must never show an
    error or block shopping, so every failure is swallowed.
  - keepalive: true lets the request finish even if the page is closed or
    navigated away right after a click.
*/
export function trackEvent(type, productIds) {
  if (!productIds.length) return;

  fetch('/api/events', {
    method: 'POST',
    credentials: 'include',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, product_ids: productIds }),
  }).catch(() => {});
}
