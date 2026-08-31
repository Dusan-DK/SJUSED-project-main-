/*
  The avatar name is chosen on /avatar/name but only saved at the END of the
  quiz, so it has to survive the whole flow.

  It used to ride in React Router navigation state:

      navigate('/quiz', { state: { avatarName } })

  which lives in the history entry and is DISCARDED on a hard refresh. Reload
  the page mid-quiz and the name was gone — the profile was then written with
  a null avatar_name, and since validation.js started requiring the field, the
  submit fails outright with a 400 after the user has answered everything.

  sessionStorage instead: survives reload, scoped to this tab, and cleared
  automatically when the tab closes. Router state is still passed as well, so
  the normal path doesn't depend on storage being available at all.
*/

const KEY = 'sjused:avatarName';

/*
  Every access is wrapped: sessionStorage throws rather than returning null in
  a few real situations — Safari private browsing, and any context where the
  site is blocked from storing data. A missing name is recoverable (we send the
  user back one screen); a thrown exception during render is not.
*/
export function rememberAvatarName(name) {
  try {
    sessionStorage.setItem(KEY, name);
  } catch {
    // Non-fatal: the router state below still carries it for this navigation.
  }
}

export function recallAvatarName() {
  try {
    return sessionStorage.getItem(KEY) || null;
  } catch {
    return null;
  }
}

export function forgetAvatarName() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to do; the value expires with the tab anyway.
  }
}
