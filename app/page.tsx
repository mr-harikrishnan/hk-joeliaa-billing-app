'use client';

import { useEffect } from "react";
import { 
  TrendingUp, 
  IndianRupee, 
  ChevronRight, 
  CalendarCheck 
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import PageHeader from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Dashboard() {
  const { data, loading, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const cards = [
    {
      title: "Today's Revenue",
      value: `₹${data?.today?.revenue || 0}`,
      icon: IndianRupee,
      color: "bg-teal-50 text-teal-600",
      sub: `${data?.today?.count || 0} orders today`,
    },
    {
      title: "Monthly Revenue",
      value: `₹${data?.month?.revenue || 0}`,
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
      sub: `${data?.month?.count || 0} orders this month`,
    },
    {
      title: "Average Order",
      value: `₹${data?.month?.count ? Math.round(data.month.revenue / data.month.count) : 0}`,
      icon: CalendarCheck,
      color: "bg-blue-50 text-blue-600",
      sub: "per customer value",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader 
        title="Business Overview" 
        refreshAction={() => fetchAnalytics(true)}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {loading || !data
          ? [1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" /><Skeleton className="h-8 w-28" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          : cards.map((card) => (
              <div key={card.title} className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-md transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-4 sm:mb-6`}>
                  <card.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
                  <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{card.value}</h3>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">{card.sub}</span>
                  <ChevronRight className="text-slate-300 group-hover:text-teal-500 transition-colors" size={14} />
                </div>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-5 sm:p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">Revenue Trends</h3>
          </div>
          <div className="h-72 w-full">
            {loading || !data ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1} /><stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }} />
                  <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", padding: "12px" }} itemStyle={{ color: "#0d9488", fontWeight: "bold" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-teal-600 p-8 rounded-[32px] shadow-xl shadow-teal-50 relative overflow-hidden flex flex-col justify-between group">
          <div className="relative z-10 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md group-hover:scale-110 transition-transform">
              <IndianRupee size={24} />
            </div>
            <h3 className="font-black text-xl leading-tight">Create<br />Invoice</h3>
            <p className="text-teal-100 text-[10px] sm:text-xs mt-2 font-bold uppercase tracking-widest opacity-80 italic">Standard Flow</p>
          </div>
          <button onClick={() => (window.location.href = "/billing")} className="mt-8 bg-white text-teal-600 w-full py-4 rounded-2xl font-black shadow-lg hover:bg-slate-50 transition-all text-sm relative z-10 uppercase tracking-widest">
            New Bill
          </button>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500 rounded-full opacity-20" />
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-teal-400 rounded-full opacity-10" />
        </div>
      </div>
    </div>
  );
}
