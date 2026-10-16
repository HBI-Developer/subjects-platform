import { type Auth, onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";

/**
 * Drop-in replacement for `react-firebase-hooks/auth` `useAuthState`.
 * Returns `[user, loading, error]` with the same tuple shape so existing
 * call sites migrate without logic changes.
 */
export function useAuthState(auth: Auth): [User | null, boolean, Error | undefined] {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [auth]);

  return [user, loading, error];
}
