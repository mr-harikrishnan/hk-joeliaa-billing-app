"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  TrendingUp,
  IndianRupee,
  ChevronRight,
  Loader2,
  CalendarCheck,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/analytics")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to fetch analytics", err))
      .finally(() => setLoading(false));

    // Seed DB if empty (first run)
    api.get("/seed").catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Business Overview
          </h1>
          <p className="text-xs sm:text-slate-500 font-medium text-slate-400">
            Monitoring your performance
          </p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-2 pr-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative w-12 h-12">
            <Image
              src="/image.png"
              alt="Branding"
              fill
              priority
              sizes="48px"
              className="object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <h3 className="text-sm font-black text-slate-800 leading-none">
              {process.env.NEXT_PUBLIC_BUSINESS_NAME || "JOELIAA"} Store
            </h3>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">
              Active Store
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-md transition-all duration-300"
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${card.color} flex items-center justify-center mb-4 sm:mb-6`}
            >
              <card.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {card.title}
              </p>
              <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {card.value}
              </h3>
            </div>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">
                {card.sub}
              </span>
              <ChevronRight
                className="text-slate-300 group-hover:text-teal-500 transition-colors shrink-0"
                size={14}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Main Analytics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Large Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">
              Revenue Trends
            </h3>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-teal-500" />
              <span className="text-xs font-bold text-slate-400">
                Past 30 Days
              </span>
            </div>
          </div>
          <div className="h-72 w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={288}
            >
              <AreaChart
                data={data?.chartData || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    padding: "12px 16px",
                  }}
                  itemStyle={{ color: "#0d9488", fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0d9488"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#0d9488" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CTA Card */}
        <div className="bg-teal-600 p-8 rounded-[40px] shadow-xl shadow-teal-100 relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <IndianRupee className="text-white" size={28} />
            </div>
            <h3 className="text-white font-black text-xl sm:text-2xl leading-tight">
              Generate
              <br />
              Instant Bill
            </h3>
            <p className="text-teal-100 text-xs sm:text-sm mt-2 sm:mt-3 font-medium opacity-80">
              Quick checkout
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/billing")}
            className="mt-8 bg-white text-teal-600 w-full py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:scale-95 transition-all duration-200 relative z-10"
          >
            Start Billing Now
          </button>

          {/* Abstract background shapes */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500 rounded-full opacity-20" />
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-teal-400 rounded-full opacity-10" />
        </div>
      </div>
    </div>
  );
}
