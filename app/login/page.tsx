"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { authService } from "@/lib/auth-service";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const isExpired = searchParams.get("expired") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isExpired) {
      setError("Your session has expired. Please login again.");
    }
  }, [isExpired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token } = response.data;

      authService.setToken(token);
      setSuccess(true);

      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 800);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Invalid credentials. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8F9FA] overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {/* ── Left Panel (Desktop Only) ── */}
      <div className="hidden lg:flex w-[40%] bg-[#0B0E14] flex-col justify-between p-16 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-teal-500/10 rounded-full blur-[100px]" />

        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 flex items-center gap-4"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <Image
              src="/image.png"
              alt="Joeliaa"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-white font-black text-xl tracking-tighter block leading-none">
              JOELIAA
            </span>
            <span className="text-emerald-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-1 block">
              Billing Suite
            </span>
          </div>
        </motion.div>

        {/* Hero Section */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                Enterprise Ready
              </span>
            </div>

            <h1 className="text-white text-5xl font-black leading-[1.1] tracking-tighter">
              The smart way to
              <br />
              <span className="text-emerald-400 italic">scale</span> your
              <br />
              treats business.
            </h1>

            <p className="text-white/40 text-base leading-relaxed max-w-sm font-medium">
              Seamlessly manage billing, track every order, and watch your
              homemade business grow.
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-6 text-[10px] text-white font-bold uppercase tracking-widest">
            <span>v2.4.0</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Secure Node</span>
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel (Form Area) ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F8F9FA] relative">
        <div className="absolute top-0 right-0 p-8 hidden sm:block">
          <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
            System Status: <span className="text-emerald-500">Online</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile Layout Logo */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-12">
            <div className="w-16 h-16 flex items-center justify-center">
              <Image
                src="/image.png"
                alt="Joeliaa"
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-teal-600 tracking-tighter italic">
                {process.env.NEXT_PUBLIC_BUSINESS_NAME || "JOELIAA"}
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em] ml-1">
                Secure Admin Portal
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-10 lg:text-left text-center">
            <h2 className="text-slate-900 text-4xl font-black tracking-tighter mb-2 italic">
              Welcome back
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Access your administrative dashboard with your unique credentials.
            </p>
          </div>

          {/* Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-xs font-bold leading-none">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-600 text-xs font-bold leading-none">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>Secure access granted. Launching...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">
                Admin Identity
              </label>
              <div className="relative group">
                <Mail
                  size={18}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"
                />
                <input
                  type="email"
                  required
                  placeholder="admin@joeliaa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-14 pr-6 bg-white border border-slate-200 rounded-[24px] text-slate-900 text-sm font-bold placeholder-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">
                Secret Access Key
              </label>
              <div className="relative group">
                <Lock
                  size={18}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-14 pr-14 bg-white border border-slate-200 rounded-[24px] text-slate-900 text-sm font-bold placeholder-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors focus:outline-none"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={showPassword ? "hide" : "show"}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.1 }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 text-white rounded-[24px] font-black text-base shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    <span>Unlock Dashboard</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.4em]">
            Authorized Personnel Only
          </p>
        </motion.div>
      </div>

      <style jsx global>{`
        body {
          overflow: hidden !important;
        }
        @media (max-width: 1024px) {
          body {
            overflow: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
          <Loader2 className="animate-spin text-emerald-500" size={40} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
