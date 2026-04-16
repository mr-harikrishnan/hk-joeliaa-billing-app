'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Plus, 
  Minus, 
  Search, 
  ChevronRight,
  Receipt,
  ShoppingCart,
  CheckCircle2,
  Loader2,
  Trash2,
  Package,
  Smartphone,
  Banknote
} from 'lucide-react';
import { useMenuStore } from '@/store/useMenuStore';
import { useCartStore } from '@/store/useCartStore';
import BottomSheet from '@/components/ui/BottomSheet';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function BillingPage() {
  const router = useRouter();
  const { items, categories, fetchMenu, loading } = useMenuStore();
  const { 
    customerName, 
    setCustomerName, 
    items: cartItems, 
    addItem, 
    updateQuantity,
    updatePrice,
    removeItem,
    getSubtotal,
    getGrandTotal,
    deliveryCharge,
    setDeliveryCharge,
    discount,
    setDiscount,
    paymentMethod,
    setPaymentMethod,
    amountReceived,
    setAmountReceived,
    resetCart
  } = useCartStore();

  const changeToReturn = Math.max(0, (amountReceived || 0) - getGrandTotal());

  const [activeCategory, setActiveCategory] = useState<string | null>(null); // This will now store category ID
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isQtySheetOpen, setIsQtySheetOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartMobileOpen, setIsCartMobileOpen] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]._id);
    }
  }, [categories, activeCategory]);

  const filteredItems = (Array.isArray(items) ? items : [])
    .filter(item => {
      const matchesCategory = item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleItemTap = (item: any) => {
    setSelectedItem(item);
    setIsQtySheetOpen(true);
  };

  const handleGenerateBill = async () => {
    if (cartItems.length === 0) {
      alert('Please add items to the cart first');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter customer name to proceed');
      return;
    }

    setIsGenerating(true);
    const billData = {
      customerName: customerName.trim(),
      items: cartItems.map(i => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        total: i.price * i.quantity
      })),
      subtotal: getSubtotal(),
      deliveryCharge: deliveryCharge || 0,
      discount: discount || 0,
      paymentMethod,
      amountReceived: paymentMethod === 'cash' ? amountReceived : 0,
      changeReturned: paymentMethod === 'cash' ? changeToReturn : 0,
      grandTotal: getGrandTotal(),
      status: 'paid'
    };

    try {
      const res = await api.post('/bills', billData);
      if (res.status === 201 || res.status === 200) {
        const bill = res.data;
        resetCart();
        router.push(`/bill/${bill._id}`);
      }
    } catch (err) {
      console.error('Failed to generate bill', err);
      alert('Failed to generate bill');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Receipt className="text-teal-600 mr-2 sm:mr-3 w-6 h-6 sm:w-8 sm:h-8" />
            Create Bill
          </h1>
          <p className="text-[11px] sm:text-slate-500 font-medium text-slate-400">Select items for invoice</p>
        </div>
        <div className="flex items-center space-x-2 bg-teal-50 px-4 py-2 rounded-2xl border border-teal-100">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-sm font-bold text-teal-700">Billing Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Product Selection (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search & Category Filter */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Find a product..."
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 shadow-inner text-sm focus:ring-2 focus:ring-teal-100 transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto no-scrollbar pb-2">
              <div className="flex space-x-2">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setActiveCategory(cat._id)}
                    className={`
                      whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-bold transition-all
                      ${activeCategory === cat._id 
                        ? 'bg-teal-600 text-white shadow-md' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}
                    `}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-teal-600" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredItems.map((item) => {
                const inCart = cartItems.find(i => i.id === item._id);
                return (
                  <button
                    key={item._id}
                    onClick={() => handleItemTap(item)}
                    className={`
                      relative group bg-white p-3 sm:p-6 rounded-[24px] sm:rounded-3xl shadow-sm border transition-all active:scale-95 text-left
                      ${inCart 
                        ? 'border-teal-500 ring-4 ring-teal-50 shadow-md' 
                        : 'border-slate-100 hover:border-teal-200 hover:shadow-md'}
                    `}
                  >
                    {inCart && (
                      <div className="absolute top-4 right-4 bg-teal-500 text-white p-1 rounded-full animate-in zoom-in-50">
                        <CheckCircle2 size={14} fill="white" className="text-teal-500" />
                      </div>
                    )}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-teal-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-[11px] sm:text-sm leading-tight mb-1 truncate">{item.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1 sm:mt-2">
                        <span className="text-teal-600 font-black text-base sm:text-lg">₹{item.price}</span>
                        {inCart && (
                          <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            qty: {inCart.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Checkout Sidebar (Hidden on mobile, FAB shows it) */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sticky top-6 flex flex-col min-h-[500px]">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                <ShoppingCart size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Active Cart</h3>
            </div>

            {/* Inputs */}
            <div className="space-y-4 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    placeholder="Enter customer name"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-teal-100"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Charge</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-4 text-sm font-black focus:ring-2 focus:ring-teal-100"
                      value={deliveryCharge || ''}
                      onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-rose-400">Discount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-base">-₹</span>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full bg-rose-50 border-none rounded-2xl py-4 pl-10 pr-4 text-sm font-black focus:ring-2 focus:ring-rose-100 text-rose-600"
                      value={discount || ''}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Selection */}
              <div className="space-y-3 mb-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-center justify-center space-x-2 py-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === 'upi' 
                        ? 'bg-teal-50 border-teal-600 text-teal-700 font-black' 
                        : 'bg-white border-slate-100 text-slate-400 font-bold'
                    }`}
                  >
                    <Smartphone size={18} />
                    <span>UPI</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center justify-center space-x-2 py-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === 'cash' 
                        ? 'bg-teal-50 border-teal-600 text-teal-700 font-black' 
                        : 'bg-white border-slate-100 text-slate-400 font-bold'
                    }`}
                  >
                    <Banknote size={18} />
                    <span>Cash</span>
                  </button>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 mt-2 animate-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount Received</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                        <input 
                          type="number"
                          placeholder="Enter amount"
                          value={amountReceived || ''}
                          onChange={(e) => setAmountReceived(Number(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-white border-none rounded-xl py-3 pl-8 pr-4 text-sm font-black text-slate-800"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Change to Return</span>
                      <span className="text-lg font-black text-teal-600">₹{changeToReturn}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[300px] mb-8 scrollbar-thin">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col p-4 bg-slate-50/50 rounded-2xl group border border-transparent hover:border-slate-100 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                      <div className="flex items-center mt-1 space-x-1.5">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">₹</span>
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 group-hover:border-teal-200 transition-colors py-0.5">
                          <button onClick={() => updatePrice(item.id, Math.max(0, item.price - 5))} className="p-1 text-slate-400 hover:text-rose-500 transition-colors"><Minus size={12} /></button>
                          <input 
                            type="number"
                            value={item.price}
                            onChange={(e) => updatePrice(item.id, Number(e.target.value))}
                            className="w-14 bg-transparent text-center text-xs font-black text-teal-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button onClick={() => updatePrice(item.id, item.price + 5)} className="p-1 text-slate-400 hover:text-teal-600 transition-colors"><Plus size={12} /></button>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">/ unit</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
                    <div className="flex items-center bg-white rounded-xl border border-slate-100 p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-slate-700">{item.quantity}</span>
                      <button 
                        onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-black text-teal-600">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
              {cartItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                  <ShoppingCart size={40} className="mb-2 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest italic">Cart is empty</p>
                </div>
              )}
            </div>

            {/* Summary & Action */}
            <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                <span>Subtotal</span>
                <span>₹{getSubtotal()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-rose-400">
                <span>Discount</span>
                <span>-₹{discount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-slate-800 tracking-tight">Total Amount</span>
                <span className="text-3xl font-black text-teal-600 tracking-tighter animate-in zoom-in-95">₹{getGrandTotal()}</span>
              </div>
              <button 
                disabled={isGenerating || cartItems.length === 0}
                onClick={handleGenerateBill}
                className={`
                  w-full py-5 rounded-[24px] font-black shadow-xl flex items-center justify-center space-x-3 transition-all active:scale-[0.98]
                  ${cartItems.length > 0 
                    ? 'bg-teal-600 text-white shadow-teal-100 hover:shadow-2xl hover:translate-y-[-2px]' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}
                `}
              >
                {isGenerating ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    <span>Generate Invoice</span>
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-24 left-6 right-6 z-40">
          <button 
            onClick={() => setIsCartMobileOpen(true)}
            className="w-full bg-slate-900 text-white rounded-[28px] p-1.5 shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center space-x-3 ml-4">
              <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center text-white font-black">
                {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Items in Cart</p>
                <p className="font-black text-lg leading-none">View Order</p>
              </div>
            </div>
            <div className="bg-teal-600 px-6 py-3.5 rounded-[22px] flex items-center space-x-2">
              <span className="font-black text-lg">₹{getGrandTotal()}</span>
              <ChevronRight size={20} />
            </div>
          </button>
        </div>
      )}

      {/* Mobile Cart Review Overlay */}
      <BottomSheet 
        isOpen={isCartMobileOpen} 
        onClose={() => setIsCartMobileOpen(false)}
        title="Review Order"
      >
        <div className="flex flex-col min-h-[60vh] pb-8">
          {/* Customer Details in Sheet */}
          <div className="space-y-3 mb-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Enter name"
                  className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-xs focus:ring-2 focus:ring-teal-100 font-bold"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full bg-slate-50 border-none rounded-xl py-3 pl-8 pr-4 text-xs font-black focus:ring-2 focus:ring-teal-100"
                      value={deliveryCharge || ''}
                      onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 text-rose-400">Discount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-sm">-₹</span>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full bg-rose-50 border-none rounded-xl py-3 pl-8 pr-4 text-xs font-black focus:ring-2 focus:ring-rose-100 text-rose-600"
                      value={discount || ''}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Payment Selection */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-center justify-center space-x-1.5 py-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'upi' 
                        ? 'bg-teal-50 border-teal-600 text-teal-700 font-black' 
                        : 'bg-white border-slate-100 text-slate-400 font-bold'
                    }`}
                  >
                    <Smartphone size={14} />
                    <span className="text-[10px]">UPI</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center justify-center space-x-1.5 py-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash' 
                        ? 'bg-teal-50 border-teal-600 text-teal-700 font-black' 
                        : 'bg-white border-slate-100 text-slate-400 font-bold'
                    }`}
                  >
                    <Banknote size={14} />
                    <span className="text-[10px]">CASH</span>
                  </button>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mt-1 animate-in slide-in-from-top-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Received</span>
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                        <input 
                          type="number"
                          placeholder="0"
                          value={amountReceived || ''}
                          onChange={(e) => setAmountReceived(Number(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-white border border-slate-100 rounded-lg py-1.5 pl-5 pr-2 text-xs font-black text-slate-800 text-right"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Change to Return</span>
                      <span className="text-sm font-black text-teal-600">₹{changeToReturn}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart Items List in Sheet */}
          <div className="flex-1 space-y-3 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-[11px] truncate">{item.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">₹</span>
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-0.5 shadow-sm">
                        <button onClick={() => updatePrice(item.id, Math.max(0, item.price - 5))} className="p-1 text-slate-400 active:text-rose-500"><Minus size={12} /></button>
                        <input 
                          type="number"
                          value={item.price}
                          onChange={(e) => updatePrice(item.id, Number(e.target.value))}
                          className="w-12 bg-transparent text-center text-xs font-black text-teal-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button onClick={() => updatePrice(item.id, item.price + 5)} className="p-1 text-slate-400 active:text-teal-600"><Plus size={12} /></button>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">/ unit</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-1 text-slate-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100/50">
                  <div className="flex items-center bg-white rounded-lg border border-slate-100 p-0.5">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-slate-400"><Minus size={12} /></button>
                    <span className="w-6 text-center text-[10px] font-black">{item.quantity}</span>
                    <button onClick={() => addItem({ id: item.id, name: item.name, price: item.price })} className="p-1 text-slate-400"><Plus size={12} /></button>
                  </div>
                  <span className="text-xs font-black text-teal-600">₹{item.price * item.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-bold text-rose-400 tracking-tight">Discount</span>
              <span className="text-sm font-bold text-rose-400 tracking-tight">-₹{discount || 0}</span>
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-base font-black text-slate-800 tracking-tight">Total Amount</span>
              <span className="text-2xl font-black text-teal-600 tracking-tighter">₹{getGrandTotal()}</span>
            </div>
            <button 
              disabled={isGenerating || cartItems.length === 0}
              onClick={handleGenerateBill}
              className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black shadow-lg shadow-teal-100 flex items-center justify-center space-x-2 active:scale-[0.98] transition-all"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span className="text-sm uppercase tracking-wider">Generate Invoice</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Quantity Bottom Sheet (Mobile & Quick Set) */}
      <BottomSheet 
        isOpen={isQtySheetOpen} 
        onClose={() => setIsQtySheetOpen(false)}
        title={selectedItem?.name || ''}
      >
        {/* Same Qty Selector Logic as before but with Teal Theme */}
        <div className="space-y-8 py-4">
          <div className="flex items-center justify-center space-x-6 sm:space-x-8">
            <button 
              onClick={() => updateQuantity(selectedItem?._id, (cartItems.find(i => i.id === selectedItem?._id)?.quantity || 0) - 1)}
              disabled={!(cartItems.find(i => i.id === selectedItem?._id))}
              className={`w-12 h-12 rounded-[20px] sm:rounded-[28px] flex items-center justify-center transition-all font-black text-xl sm:text-2xl ${
                cartItems.find(i => i.id === selectedItem?._id) 
                  ? 'bg-slate-100 text-slate-500 active:bg-slate-200 active:scale-90' 
                  : 'bg-slate-50 text-slate-200 cursor-not-allowed'
              }`}
            >
              <Minus size={20} className="sm:w-6 sm:h-6" />
            </button>
            <div className="text-center">
              <input 
                type="number"
                inputMode="numeric"
                value={cartItems.find(i => i.id === selectedItem?._id)?.quantity || 0}
                onChange={(e) => updateQuantity(selectedItem?._id, Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                className="w-24 sm:w-32 bg-transparent text-4xl sm:text-6xl font-black text-slate-900 leading-none tracking-tighter text-center border-none focus:ring-0 p-0 selection:bg-teal-100"
              />
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase mt-1.5 sm:mt-2 tracking-widest">Quantity</p>
            </div>
            <button 
              onClick={() => addItem({ id: selectedItem._id, name: selectedItem.name, price: selectedItem.price })}
              className="w-12 h-12 bg-teal-100 rounded-[20px] sm:rounded-[28px] flex items-center justify-center text-teal-600 active:bg-teal-200 active:scale-90 transition-all font-black"
            >
              <Plus size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100">
            <span className="text-slate-500 font-bold text-xs sm:text-sm uppercase tracking-widest">Item Total</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">
              ₹{(selectedItem?.price || 0) * (cartItems.find(i => i.id === selectedItem?._id)?.quantity || 0)}
            </span>
          </div>

          <button 
            onClick={() => setIsQtySheetOpen(false)}
            className="w-full bg-teal-600 text-white font-black py-4 sm:py-5 rounded-2xl sm:rounded-[28px] shadow-xl shadow-teal-100 flex items-center justify-center space-x-2 sm:space-x-3 active:scale-95 transition-transform"
          >
            <span className="text-sm sm:text-base">Confirm Item</span>
            <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
