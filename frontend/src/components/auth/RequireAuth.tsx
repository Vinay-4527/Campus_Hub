"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);

  const redirectToLogin = () => {
    try {
      // Ensure tokens are cleared
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
      // Replace current history entry to make back button less likely to restore
      router.replace("/auth?mode=login");
      // Hard redirect as a fallback (also defeats BFCache)
      setTimeout(() => {
        if (typeof window !== "undefined") {
          if (window.location.pathname !== "/auth") {
            window.location.replace("/auth?mode=login");
          }
        }
      }, 0);
    } catch (_) {
      // no-op
    }
  };

  const validateToken = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      setAuthorized(false);
      redirectToLogin();
      return;
    }
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${baseUrl}/auth/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        setAuthorized(false);
        redirectToLogin();
        return;
      }
      setAuthorized(true);
    } catch (_) {
      setAuthorized(false);
      redirectToLogin();
    }
  };

  useEffect(() => {
    validateToken();

    // If token removed in another tab or via logout, redirect
    const onStorage = (e: StorageEvent) => {
      if (e.key === "accessToken" && e.newValue === null) {
        redirectToLogin();
      }
    };

    // Handle BFCache/back navigation: when page is restored, revalidate
    const onPageShow = (e: PageTransitionEvent) => {
      if ((e as any).persisted) {
        validateToken();
      } else {
        // Also revalidate on normal show to be safe
        validateToken();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
      window.addEventListener("pageshow", onPageShow as any);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("pageshow", onPageShow as any);
      }
    };
  }, []);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Checking session…</div>
      </div>
    );
  }

  return <>{children}</>;
}





