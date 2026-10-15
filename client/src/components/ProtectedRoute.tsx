
import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { supabase } from "../lib/supabase";

export function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean | null>(null);

  const location = useLocation();

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const { data, error } =
          await supabase.auth.getSession();

        if (!active) return;

        setIsAuthenticated(
          !error && Boolean(data.session)
        );
      } catch {
        if (active) {
          setIsAuthenticated(false);
        }
      }
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;

        if (event === "SIGNED_OUT") {
          setIsAuthenticated(false);
        } else if (session) {
          setIsAuthenticated(true);
        } else if (event === "INITIAL_SESSION") {
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return <div>Checking session...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
