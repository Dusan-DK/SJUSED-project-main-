import { createContext, useContext } from 'react';

/*
  Kept in a .js file with NO component in it on purpose. React Fast Refresh
  wants a module to export either components or plain values, not both — mixing
  them makes it fall back to a full reload on every edit. The provider
  component lives next door in AuthProvider.jsx.
*/
export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);

  // Renders outside the provider would otherwise fail later with a confusing
  // "cannot destructure property of null".
  if (context === null) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }

  return context;
}
