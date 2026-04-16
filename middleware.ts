import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// We use the basic logic from authConfig to keep the middleware lightweight
// This avoids pulling in Node-only modules like Mongoose or bcrypt into the Edge runtime
const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  // Protect all routes except next internals, static files, and images
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|JOELIAA.png|logo.png|.*\\.png$|.*\\.jpg$|.*\\.jpeg$).*)"],
};
