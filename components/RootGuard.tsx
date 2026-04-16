"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/auth-service";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function RootGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const runChecks = () => {
      const isTokenValid = authService.isTokenValid();
      const isTokenExpired = authService.isTokenExpired();
      const hasToken = !!authService.getToken();
      const isBillRoute = pathname.startsWith("/bill/");
      const isLoginRoute = pathname === "/login";

      // 1. PUBLIC BILL LOCK MODE
      if (isBillRoute) {
        // We are on a bill specific route. Enter lock mode.
        const billId = pathname.split("/bill/")[1];
        if (billId) {
          authService.setPublicBillId(billId);
        }
        setIsChecking(false);
        return;
      }

      // If user tries to escape public bill mode
      const publicBillId = authService.getPublicBillId();
      if (publicBillId && !isBillRoute && !isLoginRoute && !hasToken) {
        // Enforce lock mode!
        router.replace(`/bill/${publicBillId}`);
        return;
      }

      // 2. AUTHENTICATION CHECKS
      if (!isTokenValid || isTokenExpired) {
        // Missing, expired, or invalid token
        authService.clearSession(); // Ensure strict cleanup
        if (!isLoginRoute) {
          // If we had a token but it's invalid/expired, show expired message
          const suffix = hasToken ? "?expired=true" : "";
          router.replace(`/login${suffix}`);
          return;
        }
      } else {
        // Valid token
        if (isLoginRoute) {
          // Logged in trying to access login page
          router.replace("/");
          return;
        }
        // Admin access, clear any bill locks if they navigate elsewhere validly holding a token
        if (publicBillId) {
          localStorage.removeItem("joeliaa_public_bill_id");
        }
      }

      setIsChecking(false);
    };

    runChecks();
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-16 h-16 flex items-center justify-center animate-pulse">
          <Image
            src="/image.png"
            alt="JOELIAA"
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
        <div className="space-y-4">
          <Loader2 className="animate-spin text-teal-600 mx-auto" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
            Checking session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
