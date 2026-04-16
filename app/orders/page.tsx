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

export default function OrdersPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/bills')
      .then(res => res.json())
      .then(setBills)
      .finally(() => setLoading(false));
  }, []);

  const filteredBills = bills.filter(bill => 
    bill.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Order History</h1>
          <p className="text-slate-500 font-medium">Review and download past transaction records</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3">
          <FileText className="text-teal-600" size={20} />
          <span className="text-sm font-black text-slate-700">{bills.length} Total Bills</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[32px] shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by customer name..."
            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 shadow-inner text-sm focus:ring-2 focus:ring-teal-100 transition-all font-medium"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.map((bill) => (
            <Link 
              key={bill._id} 
              href={`/bills/${bill._id}`}
              className="group block bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:border-teal-300 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-none group-hover:text-teal-700 transition-colors uppercase tracking-tight">{bill.customerName}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 tracking-widest">
                      INV-{bill._id.substring(bill._id.length - 6).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{bill.grandTotal}</p>
                </div>
              </div>

              <div className="h-px bg-slate-50 w-full mb-4" />

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <Calendar size={14} className="text-teal-500" />
                  <span>{new Date(bill.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-1 py-1 px-3 bg-slate-50 rounded-lg group-hover:bg-teal-50 group-hover:text-teal-700 transition-all">
                  <span>{bill.items.length} items</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
