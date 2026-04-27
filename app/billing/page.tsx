'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Calendar as CalendarIcon, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import CustomCalendar from '@/components/ui/CustomCalendar';
import PageHeader from '@/components/ui/PageHeader';
import { useMenuStore } from '@/store/useMenuStore';

export default function BillingPage() {
  const router = useRouter();
  const { items, categories, fetchMenu, loading: menuLoading } = useMenuStore();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Date Logic
  const [isOldBill, setIsOldBill] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]._id);
    }
  }, [categories, activeCategory]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i._id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i._id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async () => {
    if (!customerName.trim()) return alert('Please enter customer name');
    if (cart.length === 0) return alert('Cart is empty');
    
    setIsSubmitting(true);
    try {
      const res = await api.post('/bills', {
        customerName,
        items: cart.map(i => ({
          menuItem: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        createdAt: isOldBill ? selectedDate.toISOString() : new Date().toISOString()
      });
      
      router.push(`/bill/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 lg:pb-8">
      <PageHeader 
        title="Create Invoice" 
        refreshAction={() => fetchMenu(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="bg-white p-2 rounded-[28px] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={18} />
              <input 
                type="text" placeholder="Search menu..."
                className="w-full bg-slate-50 border-none rounded-[20px] py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-100 transition-all"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex bg-slate-50 rounded-[20px] p-1">
              <button onClick={() => setIsOldBill(false)} className={`flex-1 sm:flex-none px-6 py-3 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all ${!isOldBill ? 'bg-white shadow-sm text-teal-600' : 'text-slate-400'}`}>Current</button>
              <button 
                onClick={() => { setIsOldBill(true); setShowDatePicker(true); }} 
                className={`flex-1 sm:flex-none px-6 py-3 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${isOldBill ? 'bg-white shadow-sm text-teal-600' : 'text-slate-400'}`}
              >
                <CalendarIcon size={14} />
                <span>{isOldBill ? selectedDate.toLocaleDateString() : 'History'}</span>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map(cat => (
              <button key={cat._id} onClick={() => setActiveCategory(cat._id)} className={`whitespace-nowrap px-6 py-3 rounded-xl text-xs font-bold transition-all border ${activeCategory === cat._id ? 'bg-teal-600 text-white border-teal-600 shadow-md translate-y-[-1px]' : 'bg-white text-slate-500 border-slate-100 hover:border-teal-200'}`}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <button key={item._id} onClick={() => addToCart(item)} className="group bg-white p-4 rounded-[28px] border border-slate-100 hover:border-teal-300 hover:shadow-xl hover:translate-y-[-4px] transition-all text-left flex flex-col justify-between h-40">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 uppercase tracking-tight leading-tight">{item.name}</h3>
                  <p className="text-teal-600 font-black text-base mt-1">₹{item.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Checkout Cart */}
        <div className="lg:block">
          <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 flex flex-col h-[calc(100vh-200px)] sticky top-6 overflow-hidden">
             <div className="p-6 bg-slate-50/50 border-b border-slate-100">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-black text-slate-800 flex items-center">
                   <ShoppingCart className="mr-2 text-teal-600" size={20} /> Checkout
                 </h2>
                 <span className="bg-teal-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">{cart.length} ITM</span>
               </div>
               <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-teal-100"
                   placeholder="CUSTOMER NAME" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                 />
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
               {cart.map(item => (
                 <div key={item._id} className="flex items-center justify-between group">
                   <div className="min-w-0 flex-1">
                     <h4 className="text-xs font-bold text-slate-800 truncate uppercase">{item.name}</h4>
                     <p className="text-[10px] text-slate-400 font-black">₹{item.price} × {item.quantity}</p>
                   </div>
                   <div className="flex items-center space-x-2 bg-slate-50 rounded-xl p-1 ml-4">
                     <button onClick={() => updateQuantity(item._id, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-400"><Minus size={14} /></button>
                     <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                     <button onClick={() => updateQuantity(item._id, 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-teal-600"><Plus size={14} /></button>
                   </div>
                   <button onClick={() => removeFromCart(item._id)} className="ml-2 text-slate-300 hover:text-red-500"><X size={14} /></button>
                 </div>
               ))}
               {cart.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
                   <TrendingUp size={48} className="mb-4 text-slate-300" />
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cart Empty</p>
                 </div>
               )}
             </div>

             <div className="p-6 bg-slate-50 border-t border-slate-100">
               <div className="flex justify-between items-end mb-6">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Payable</p>
                 <p className="text-3xl font-black text-teal-600 tracking-tighter">₹{total}</p>
               </div>
               <button 
                onClick={handleSubmit} disabled={isSubmitting || cart.length === 0}
                className="w-full bg-teal-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-teal-50 hover:bg-teal-700 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center disabled:opacity-50"
               >
                 {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <CreditCard className="mr-2" size={18} />}
                 {isSubmitting ? 'Syncing...' : 'Place Order'}
               </button>
             </div>
          </div>
        </div>
      </div>

      {showDatePicker && (
        <BottomSheet isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} title="Select Bill Date">
          <div className="p-2 pt-0">
            <CustomCalendar 
              selectedDate={selectedDate.toISOString().split('T')[0]} 
              onSelect={(dateStr) => { 
                setSelectedDate(new Date(dateStr)); 
                setShowDatePicker(false); 
              }} 
            />
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

function BottomSheet({ isOpen, onClose, title, children }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X size={18} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function Loader2({ className, size }: any) {
  return <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} style={{ width: size, height: size }} />;
}
