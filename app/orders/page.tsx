'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';

export default function OrdersPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bills');
      const data = Array.isArray(res.data) ? res.data : [];
      setBills(data);
    } catch (err) {
      console.error('Failed to fetch bills', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this bill?')) {
      try {
        await api.delete(`/bills/${id}`);
        setBills(prev => prev.filter(b => b._id !== id));
      } catch (err) {
        console.error('Failed to delete bill', err);
        alert('Failed to delete bill');
      }
    }
  };

  const filteredBills = bills.filter((bill: any) => 
    bill.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedBills = filteredBills.reduce((acc, bill: any) => {
    const date = new Date(bill.createdAt).toLocaleDateString(undefined, { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(bill);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedDates = Object.keys(groupedBills).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const toggleDate = (date: string) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader 
        title="Orders History" 
        refreshAction={fetchBills}
      />

      {/* Modern Search Field */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Filter by customer name..."
          className="w-full bg-white border border-slate-100 rounded-2xl py-4.5 pl-12 pr-4 shadow-sm focus:ring-4 focus:ring-teal-50 focus:border-teal-200 transition-all text-sm font-medium outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-6 px-4 sm:px-0">
        {loading ? (
            [1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-14 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-44 w-full rounded-[32px]" />
                  ))}
                </div>
              </div>
            ))
        ) : (
          <>
            {sortedDates.map((date) => {
              const dateBills = groupedBills[date];
              const isExpanded = expandedDates[date];
              return (
                <div key={date} className="space-y-3">
                  <button onClick={() => toggleDate(date)} className="w-full flex items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100 group transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                        <Calendar size={18} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-black text-slate-800 text-sm">{date}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dateBills.length} Transactions</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center text-slate-300 group-hover:text-teal-600">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in slide-in-from-top-2 duration-300">
                      {dateBills.map((bill: any) => (
                        <Link key={bill._id} href={`/bill/${bill._id}`} className="group block bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 hover:border-teal-200 transition-all">
                          <div className="flex flex-col h-full justify-between space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="w-10 h-10 p-2.5 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                <User className="w-full h-full" />
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-black text-slate-900 tracking-tighter">₹{bill.grandTotal}</p>
                                <button onClick={(e) => handleDeleteBill(e, bill._id)} className="p-1 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                              </div>
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-800 text-xs truncate uppercase tracking-tight">{bill.customerName}</h3>
                                <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">#{bill._id.substring(bill._id.length-6).toUpperCase()}</p>
                            </div>
                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase">
                              <div className="flex items-center space-x-1"><Calendar size={12} className="text-teal-500"/><span>{new Date(bill.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                              <div className="flex items-center space-x-1 py-1 px-2.5 bg-slate-50 rounded-lg text-slate-600">{bill.items.length} ITM<ChevronRight size={10}/></div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
