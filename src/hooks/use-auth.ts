/**
 * Simple local auth hook — no backend, no database.
 * Provides a mock user for the UI. In a real deployment, replace with
 * your actual auth provider (JWT, session, etc.).
 */

import { useState, useCallback } from "react";

interface User {
  name: string;
  email: string;
  role: "admin" | "member";
}

const DEMO_USER: User = {
  name: "Team Member",
  email: "member@toolhub.local",
  role: "admin",
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(DEMO_USER);
  const [isLoading] = useState(false);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const signIn = useCallback(() => {
    setUser(DEMO_USER);
  }, []);

  return {
    isLoading,
    isAuthenticated: !!user,
    user,
    signIn,
    signOut,
  };
}
