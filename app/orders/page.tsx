'use client';

import { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Loader2,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function OrdersPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.get('/bills')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setBills(data);
        
        // Auto-expand today's date if exists
        const todayStr = new Date().toLocaleDateString(undefined, { 
          day: 'numeric', month: 'long', year: 'numeric' 
        });
        setExpandedDates({ [todayStr]: true });
      })
      .catch(err => console.error('Failed to fetch bills', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredBills = bills.filter((bill: any) => 
    bill.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayCount = bills.filter((bill: any) => {
    const billDate = new Date(bill.createdAt).toDateString();
    const todayDate = new Date().toDateString();
    return billDate === todayDate;
  }).length;

  // Grouping logic
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
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Orders</h1>
          <p className="text-xs sm:text-slate-500 font-medium text-slate-400">History</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-teal-50 px-4 py-2.5 rounded-2xl shadow-sm border border-teal-100 flex items-center space-x-2">
            <ClipboardList className="text-teal-600 w-4 h-4" />
            <span className="text-xs font-black text-teal-700">{todayCount} Today</span>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-2">
            <FileText className="text-slate-400 w-4 h-4" />
            <span className="text-xs font-black text-slate-700">{bills.length} Total</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search customer..."
            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 sm:py-4 pl-10 sm:pl-12 pr-4 shadow-inner text-xs sm:text-sm focus:ring-2 focus:ring-teal-100 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Orders View */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-teal-600" size={40} />
        </div>
      ) : (
        <div className="space-y-8 px-4 sm:px-0">
          {sortedDates.map((date) => {
            const dateBills = groupedBills[date];
            const isExpanded = expandedDates[date];

            return (
              <div key={date} className="space-y-4">
                <button 
                  onClick={() => toggleDate(date)}
                  className="w-full flex items-center justify-between bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-100 group hover:border-teal-200 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                      <Calendar size={18} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-black text-slate-800 text-sm">{date}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dateBills.length} Orders Completed</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 flex items-center justify-center text-slate-300 group-hover:text-teal-600 transition-colors">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {dateBills.map((bill: any) => (
                      <Link 
                        key={bill._id} 
                        href={`/bill/${bill._id}`}
                        className="group block bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100 hover:border-teal-300 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <div className="relative">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 p-2.5 sm:p-3 bg-teal-50 text-teal-600 rounded-xl sm:rounded-2xl group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 shrink-0">
                                <User className="w-full h-full" />
                              </div>
                              {bill.orderNumber && (
                                <div className="absolute -top-1.5 -right-1.5 bg-teal-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-sm border border-white">
                                  #{bill.orderNumber}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-800 text-[11px] sm:text-sm leading-none group-hover:text-teal-700 transition-colors uppercase tracking-tight truncate">{bill.customerName}</h3>
                              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1.5 sm:mt-2 tracking-widest truncate">
                                INV-{bill._id.substring(bill._id.length - 4).toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right mt-2 sm:mt-0">
                            <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter">₹{bill.grandTotal}</p>
                          </div>
                        </div>

                        <div className="h-px bg-slate-50 w-full mb-4" />

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <div className="flex items-center space-x-1.5">
                            <Calendar size={12} className="text-teal-500 sm:w-3.5 sm:h-3.5" />
                            <span>{new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center justify-between space-x-1 py-1 px-2 sm:px-3 bg-slate-50 rounded-lg group-hover:bg-teal-50 group-hover:text-teal-700 transition-all">
                            <span>{bill.items.length} items</span>
                            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform sm:w-3.5 sm:h-3.5" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {sortedDates.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center">
              <ClipboardList className="text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold">No matching records found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
