"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/auth-service";
import { Loader2 } from "lucide-react";
import Image from "next/image";

// Global flag to track if the initial session check has been completed
// This prevents the full-screen loader from showing on every client-side navigation
let isInitialCheckDone = false;

export default function RootGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(!isInitialCheckDone);

  useEffect(() => {
    const runChecks = () => {
      const isAdminKey = authService.isAdmin();
      const isTokenValid = authService.isTokenValid();
      const isTokenExpired = authService.isTokenExpired();
      
      const isLoginRoute = pathname === "/login";
      const isBillRoute = pathname.startsWith("/bill/");
      
      // Protected routes: everything except /login and /bill/[id]
      const isProtectedRoute = !isLoginRoute && !isBillRoute;

      // 1. If isAdmin key exists, check JWT
      if (isAdminKey) {
        if (isTokenValid && !isTokenExpired) {
          // Token is valid
          if (isLoginRoute) {
            router.replace("/");
            return;
          }
        } else {
          // Token is missing or invalid/expired
          authService.clearSession(); // Clears token AND isAdmin key
          if (!isLoginRoute) {
            router.replace("/login?expired=true");
            return;
          }
        }
      } 
      // 2. If isAdmin key is NOT there
      else {
        if (isProtectedRoute) {
          // If trying to access dashboard, orders, etc without key
          // Behave naturally: redirect to login or show 404 (we use redirect to login for protected pages)
          router.replace("/login");
          return;
        }
      }

      setIsChecking(false);
      isInitialCheckDone = true;
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
            priority
            sizes="64px"
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
