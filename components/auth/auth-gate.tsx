"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { LoginModal, OPEN_LOGIN_EVENT } from "@/components/auth/login-modal";

const publicRoutes = ["/", "/signup", "/callback"];

function isPublicPath(pathname: string) {
  return publicRoutes.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isManualLoginOpen, setIsManualLoginOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const publicPath = isPublicPath(pathname);
  const isLoginOpen = isManualLoginOpen || (!publicPath && isAuthenticated !== true);

  useEffect(() => {
    const handleOpenLogin = () => setIsManualLoginOpen(true);
    window.addEventListener(OPEN_LOGIN_EVENT, handleOpenLogin);
    return () => window.removeEventListener(OPEN_LOGIN_EVENT, handleOpenLogin);
  }, []);

  useEffect(() => {
    if (publicPath) return;

    const supabase = createClient();
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(Boolean(user));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(Boolean(session?.user));
      },
    );

    return () => subscription.subscription.unsubscribe();
  }, [pathname, publicPath]);

  return (
    <>
      {children}
      <LoginModal
        open={isLoginOpen}
        required={!publicPath}
        onClose={() => {
          if (publicPath) setIsManualLoginOpen(false);
        }}
      />
    </>
  );
}
