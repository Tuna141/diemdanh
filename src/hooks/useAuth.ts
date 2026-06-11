import { useEffect, useState } from "react";
import { subscribeAuth } from "../services/authService";
import type { AuthState } from "../types";

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    return subscribeAuth((user, isAdmin) => {
      setState({ user, isAdmin, loading: false });
    });
  }, []);

  return state;
}
