"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

type AccessState = {
  authenticated: boolean;
  ready: boolean;
};

export default function CustomerAccessGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [access, setAccess] = useState<AccessState>({
    authenticated: false,
    ready: false,
  });

  const isAdminPath = pathname.startsWith('/admin');
  const requiresLogin = pathname === '/cart';

  useEffect(() => {
    if (isAdminPath) return;

    let active = true;
    fetch('/api/otp/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then((session) => {
        if (!active) return;
        setAccess({
          authenticated: Boolean(session.authenticated),
          ready: true,
        });
      })
      .catch(() => {
        if (!active) return;
        setAccess({ authenticated: false, ready: true });
      });

    const handlePhoneSession = (event: Event) => {
      const phoneEvent = event as CustomEvent<{ phone: string | null }>;
      setAccess((current) => ({ ...current, authenticated: Boolean(phoneEvent.detail?.phone), ready: true }));
    };

    window.addEventListener('azmar:phone-session', handlePhoneSession);

    return () => {
      active = false;
      window.removeEventListener('azmar:phone-session', handlePhoneSession);
    };
  }, [isAdminPath]);

  useEffect(() => {
    if (isAdminPath || !access.ready) return;

    if (requiresLogin && !access.authenticated) {
      router.replace('/account/login?next=/cart');
    }
  }, [access, isAdminPath, requiresLogin, router]);

  if (isAdminPath) return children;

  const permitted =
    !requiresLogin || (access.ready && access.authenticated);

  if (!permitted) {
    return (
      <main className="access-gate-loading" aria-busy="true" aria-live="polite">
        <span className="access-gate-loading__spinner" aria-hidden="true" />
        <p>Getting things ready…</p>
      </main>
    );
  }

  return children;
}
