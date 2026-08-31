/*
  Every page in this app used to do:

      fetch(url).then(res => res.json()).then(data => setState(data))

  which never checks whether the request SUCCEEDED. On a 401/404 the API sends
  back { error: '...' }, and that object got stored as if it were real data:
    - Avatar/Profile rendered past their `if (!profile)` guard, because an
      error object is truthy, showing a page full of undefined values.
    - Products stored an object where an array was expected, so .map() threw
      and the page went white.

  These helpers make a failed request throw instead, carrying the HTTP status
  so callers can react (send a 401 to /login, a 404 to the quiz, and so on).
*/

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(path, { credentials: 'include', ...options });
  } catch {
    // fetch() only rejects on network failure, never on a 4xx/5xx.
    throw new ApiError('Network error — check your connection', 0);
  }

  // 204, or a non-JSON error page from a proxy, would blow up res.json().
  let data = null;
  try {
    data = await res.json();
  } catch {
    // Leave data as null — an empty 204, or a non-JSON error page from a
    // proxy, is not something the caller can do anything useful with.
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }

  return data;
}

export function apiGet(path) {
  return request(path);
}

export function apiSend(path, method, body) {
  return request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/*
  For endpoints that must return a list. /api/recommendations returns a bare
  array, so anything else means something is wrong upstream — better to fail
  loudly here than to hand a non-array to .map().
*/
export async function apiGetList(path) {
  const data = await apiGet(path);
  if (!Array.isArray(data)) {
    throw new ApiError('Unexpected response from server', 0);
  }
  return data;
}

export { ApiError };
