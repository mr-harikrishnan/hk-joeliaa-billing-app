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
      const isAuthPage = nextUrl.pathname.startsWith("/login");
      const isUnauthorizedPage = nextUrl.pathname.startsWith("/unauthorized");
      const isBillView = nextUrl.pathname.startsWith("/bills/");
      const isCustomerMode = nextUrl.searchParams.get("mode")?.includes("customer");
      
      // Allow static assets and public logo always
      const isPublicAsset = nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|ico)$/);
      if (isPublicAsset) return true;

      // Explicitly allow Unauthorized page to be viewed even if not logged in
      if (isUnauthorizedPage) return true;

      // Logic for bills [id]
      if (isBillView) {
        if (isCustomerMode) return true;
        return isLoggedIn;
      }

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl.origin));
        return true;
      }

      return isLoggedIn;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;
