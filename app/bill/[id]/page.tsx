'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Image as ImageIcon,
  CheckCircle2,
  PhoneCall,
  Loader2,
  Receipt, 
  IndianRupee, 
  RefreshCw,
  AlertCircle,
  History,
  Printer,
  ChevronRight
} from 'lucide-react';
import { generatePDF, exportToImage } from '@/utils/export';
import { authService } from '@/lib/auth-service';
import { api } from '@/lib/api';

function BillDetailsContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setFetchError] = useState(false);
  
  // Public check based on your spec
  const isAdmin = authService.isTokenValid();

  const fetchBill = async () => {
    if (!id) return;
    setLoading(true);
    setFetchError(false);

    try {
      const res = await api.get(`/bills?id=${id}`);
      setBill(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
    // Register as public bill for lock logic in RootGuard if not admin
    if (id && !isAdmin) {
      authService.setPublicBillId(id as string);
    }
  }, [id, isAdmin]);

  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-teal-600" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Retrieving Invoice...</p>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
           <AlertCircle className="text-red-500" size={32} />
        </div>
        <div className="space-y-2">
           <h2 className="text-xl font-black text-slate-800 tracking-tight">Invoice Unavailable</h2>
           <p className="text-slate-400 text-sm font-medium max-w-xs">This bill does not exist or has been removed.</p>
        </div>
        <button 
          onClick={fetchBill}
          className="flex items-center space-x-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black shadow-lg hover:bg-slate-800 transition-all active:scale-95"
        >
          <RefreshCw size={18} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const cleanUrl = `${window.location.origin}/bill/${id}`;
        await navigator.share({
          title: `Bill for ${bill.customerName}`,
          text: `Invoice Total: ₹${bill.grandTotal}`,
          url: cleanUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('Sharing not supported on this browser');
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-8 pb-20 px-4 sm:px-0 mt-8`}>
      {/* Header (Admin View Only) */}
      {isAdmin && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/orders')}
              className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600 hover:text-teal-600 active:scale-95 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Invoice Details</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{bill._id.substring(bill._id.length - 8).toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/orders')}
            className="hidden sm:flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all text-xs"
          >
            <History size={16} />
            <span>All Sales</span>
          </button>
        </div>
      )}

      {/* Main Bill */}
      <div className={`grid grid-cols-1 gap-8 items-start ${!isAdmin ? '' : 'lg:grid-cols-3'}`}>
        <div className={`${!isAdmin ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <div id="bill-invoice" className="bg-white rounded-[24px] sm:rounded-[48px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
            <div className="h-4 bg-teal-600 w-full" />
            
            <div className="p-6 sm:p-14 space-y-6 sm:space-y-10">
              <div className="flex flex-col sm:flex-row items-start justify-between space-y-6 sm:space-y-0 text-center sm:text-left">
                <div className="w-full sm:w-auto flex flex-col items-center sm:items-start text-center sm:text-left">
                  <h3 className="text-2xl sm:text-4xl font-black text-teal-600 tracking-tighter leading-none mb-2">
                    {process.env.NEXT_PUBLIC_BUSINESS_NAME || "JOELIAA"}
                  </h3>
                  <div className="h-1 w-12 bg-teal-500 rounded-full mb-3 mx-auto sm:mx-0" />
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Premium Homemade</p>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Treats & Snacks</p>
                </div>
              </div>

              <div className="h-px bg-gray-100 w-full" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-slate-200">
                <div className="p-4 border-b sm:border-b-0 sm:border-r border-slate-200">
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Details</p>
                  <p className="text-base sm:text-lg font-black text-slate-800 leading-tight">{bill.customerName}</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 mt-2">Place of Supply: Tamil Nadu ( 33 )</p>
                </div>
                <div className="p-0 flex flex-col">
                  <div className="grid grid-cols-2 flex-1 border-b border-slate-200">
                    <div className="p-3 sm:p-4 border-r border-slate-200 flex flex-col justify-center">
                      <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase">Inv No.</p>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-800">INV-{bill._id.substring(bill._id.length - 6).toUpperCase()}</p>
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col justify-center">
                      <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase">Dated</p>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-800">{new Date(bill.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase">Terms</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-800 uppercase italic">COD / Prepaid</p>
                  </div>
                </div>
              </div>

              <div className="border-x border-t border-slate-200 overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-tight sm:tracking-widest text-center py-2">
                  <div className="col-span-1 border-r border-slate-200">Sl</div>
                  <div className="col-span-6 sm:col-span-7 border-r border-slate-200 px-1 sm:px-2 text-left">Items</div>
                  <div className="col-span-1 border-r border-slate-200">Qty</div>
                  <div className="col-span-2 sm:col-span-1 border-r border-slate-200">Rate</div>
                  <div className="col-span-2">Total</div>
                </div>
                <div className="min-h-[150px] sm:min-h-[200px]">
                  {bill.items.map((item: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 border-b border-slate-100 text-[10px] sm:text-xs font-bold text-slate-800 text-center py-2 sm:py-3">
                      <div className="col-span-1 border-r border-slate-100 text-slate-400 flex items-center justify-center">{idx + 1}</div>
                      <div className="col-span-6 sm:col-span-7 border-r border-slate-100 px-2 sm:px-4 text-left uppercase truncate">{item.name}</div>
                      <div className="col-span-1 border-r border-slate-100 flex items-center justify-center">{item.quantity}</div>
                      <div className="col-span-2 sm:col-span-1 border-r border-slate-100 text-slate-500 flex items-center justify-center">{item.price}</div>
                      <div className="col-span-2 font-black flex items-center justify-center">{item.total}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-12 border-t-2 border-slate-200 bg-slate-50 py-3 text-right pr-4">
                  <div className="col-span-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal Amount :</div>
                  <div className="col-span-2 text-sm font-black text-slate-900">₹{bill.subtotal}.00</div>
                </div>
                <div className="grid grid-cols-12 bg-slate-50 py-2 border-t border-slate-100 text-right pr-4">
                  <div className="col-span-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Charges :</div>
                  <div className="col-span-2 text-sm font-black text-slate-900 border-b border-slate-300">₹{bill.deliveryCharge}.00</div>
                </div>
                <div className="grid grid-cols-12 bg-teal-50/50 py-3 sm:py-4 text-right pr-2 sm:pr-4">
                  <div className="col-span-9 sm:col-span-10 flex flex-col items-end pr-2 justify-center">
                    <span className="text-[9px] sm:text-[11px] font-black text-teal-600 uppercase tracking-[0.1em] leading-none">Grand Total</span>
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-xl sm:text-3xl font-black text-teal-600 tracking-tighter">₹{bill.grandTotal}</div>
                </div>
              </div>

              <div className="pt-6 sm:pt-10 space-y-6 sm:space-y-8">
                <div className="text-center py-8 sm:py-10 bg-teal-50/50 rounded-[24px] sm:rounded-[40px] border border-dashed border-teal-100 relative overflow-hidden">
                  <p className="text-lg sm:text-2xl font-black text-teal-600 relative z-10 px-4">
                    Enjoy your fresh homemade treats! 🧁
                  </p>
                  <p className="text-[8px] sm:text-[10px] font-bold text-teal-400 uppercase tracking-[0.2em] mt-2">Homemade with quality ingredients</p>
                </div>

                <div className="flex flex-col items-center justify-center space-y-4 pt-4">
                  <div className="flex items-center space-x-3 text-lg font-black text-slate-800">
                    <PhoneCall size={20} className="text-teal-600" />
                    <span>{process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+91 90426 85346"}</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Computer Generated Invoice</p>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-400 w-full" />
          </div>
        </div>

        {/* Action Sidebar (Admin View Only) */}
        {isAdmin && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200 border border-slate-100 space-y-8">
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-2">Admin Panel</h3>
                <p className="text-xs text-slate-500 font-medium">Manage this invoice record</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => generatePDF(bill)}
                  className="w-full flex items-center justify-between p-4 bg-teal-50 text-teal-700 rounded-2xl font-bold hover:bg-teal-100 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <Download size={20} />
                    <span>Download PDF</span>
                  </div>
                  <ChevronRight size={18} className="text-teal-300 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={() => exportToImage('bill-invoice', `Bill_${bill.customerName}`)}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-100 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <ImageIcon size={20} />
                    <span>Save Image</span>
                  </div>
                  <ChevronRight size={18} className="text-blue-300 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="h-px bg-slate-50 w-full" />

              <button 
                onClick={handleShare}
                className="w-full py-5 bg-teal-600 text-white rounded-[24px] font-black shadow-xl shadow-teal-100 flex items-center justify-center space-x-3 hover:translate-y-[-2px] active:scale-95 transition-all"
              >
                <Share2 size={24} />
                <span>Quick Share</span>
              </button>
            </div>

            <div className="bg-emerald-500 p-8 rounded-[40px] shadow-lg shadow-emerald-100 relative overflow-hidden">
              <div className="relative z-10 text-white">
                <CheckCircle2 size={40} className="mb-4 opacity-40" />
                <h3 className="text-xl font-black mb-1 leading-tight text-white">Another order?</h3>
                <button 
                  onClick={() => router.push('/billing')}
                  className="mt-6 w-full py-4 bg-white text-emerald-600 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  Start New Bill
                </button>
              </div>
              <Receipt className="absolute -right-6 -bottom-6 text-white opacity-10" size={140} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BillPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    }>
      <BillDetailsContent />
    </Suspense>
  );
}
