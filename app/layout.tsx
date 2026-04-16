import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import RootGuard from "@/components/RootGuard";
import DashboardShell from "@/components/DashboardShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JOELIAA Billing | Premium Homemade Treats",
  description: "Manage your homemade snacks business with ease.",
  icons: {
    icon: "/image.png",
    shortcut: "/image.png",
    apple: "/image.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} bg-[#f8fafc] antialiased overflow-x-hidden min-h-screen h-full`}
      >
        <Suspense fallback={null}>
          <RootGuard>
            <DashboardShell>{children}</DashboardShell>
          </RootGuard>
        </Suspense>
      </body>
    </html>
  );
}
