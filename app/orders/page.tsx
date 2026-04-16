'use client';

import { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  ChevronRight,
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

  useEffect(() => {
    api.get('/bills')
      .then(res => {
        setBills(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error('Failed to fetch bills', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredBills = bills.filter(bill => 
    bill.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Orders</h1>
          <p className="text-xs sm:text-slate-500 font-medium text-slate-400">History</p>
        </div>
        <div className="bg-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3">
          <FileText className="text-teal-600 w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-black text-slate-700">{bills.length} Total</span>
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {(Array.isArray(filteredBills) ? filteredBills : []).map((bill) => (
            <Link 
              key={bill._id} 
              href={`/bill/${bill._id}`}
              className="group block bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100 hover:border-teal-300 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 p-2.5 sm:p-3 bg-teal-50 text-teal-600 rounded-xl sm:rounded-2xl group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 shrink-0">
                    <User className="w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-[11px] sm:text-sm leading-none group-hover:text-teal-700 transition-colors uppercase tracking-tight truncate">{bill.customerName}</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 sm:mt-1.5 tracking-widest truncate">
                      INV-{bill._id.substring(bill._id.length - 4).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right mt-2 sm:mt-0">
                  <p className="text-lg sm:text-2xl font-black text-slate-900 tracking-tighter">₹{bill.grandTotal}</p>
                </div>
              </div>

              <div className="h-px bg-slate-50 w-full mb-4" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[9px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Calendar size={12} className="text-teal-500 sm:w-3.5 sm:h-3.5" />
                  <span>{new Date(bill.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-1 py-1 px-2 sm:px-3 bg-slate-50 rounded-lg group-hover:bg-teal-50 group-hover:text-teal-700 transition-all">
                  <span>{bill.items.length} items</span>
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
            </Link>
          ))}
          {filteredBills.length === 0 && (
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
