import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/unauthorized", 
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname, searchParams, origin } = nextUrl;

      // Public Assets & Logo (Always Allowed)
      const isPublicAsset = pathname.match(/\.(png|jpg|jpeg|svg|ico|webp)$/);
      if (isPublicAsset) return true;

      // Handle Bill Direct View (Customer Perspective)
      const isBillView = pathname.startsWith("/bills/");
      const isCustomerMode = searchParams.get("mode")?.includes("customer");
      if (isBillView && isCustomerMode) return true;

      // Auth Pages Logic
      const isAuthPage = pathname.startsWith("/login");
      const isUnauthorizedPage = pathname.startsWith("/unauthorized");
      
      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", origin));
        return true;
      }

      if (isUnauthorizedPage) return true;

      // Protect everything else
      if (!isLoggedIn) {
        let callbackUrl = pathname;
        if (searchParams.toString()) {
          callbackUrl += `?${searchParams.toString()}`;
        }
        
        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, origin));
      }

      return true;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;
