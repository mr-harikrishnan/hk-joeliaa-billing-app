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
  Package
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
    removeItem,
    getSubtotal,
    getGrandTotal,
    deliveryCharge,
    setDeliveryCharge,
    resetCart
  } = useCartStore();

  const [activeCategory, setActiveCategory] = useState<string | null>(null); // This will now store category ID
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isQtySheetOpen, setIsQtySheetOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    if (!customerName) {
      alert('Please enter customer name');
      return;
    }
    if (cartItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setIsGenerating(true);
    const billData = {
      customerName,
      items: cartItems.map(i => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        total: i.price * i.quantity
      })),
      subtotal: getSubtotal(),
      deliveryCharge,
      grandTotal: getGrandTotal(),
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
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Receipt className="text-teal-600 mr-3" size={32} />
            Create New Bill
          </h1>
          <p className="text-slate-500 font-medium">Select items and generate customer invoice</p>
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
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const inCart = cartItems.find(i => i.id === item._id);
                return (
                  <button
                    key={item._id}
                    onClick={() => handleItemTap(item)}
                    className={`
                      relative group bg-white p-6 rounded-[32px] shadow-sm border transition-all active:scale-95 text-left
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
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform">
                      <Package size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1 truncate">{item.name}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-teal-600 font-black text-lg">₹{item.price}</span>
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

        {/* Right Column: Checkout Sidebar (1/3 width on desktop) */}
        <div className="space-y-6">
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 sticky top-6 flex flex-col min-h-[500px]">
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
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Charge</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-teal-100"
                    value={deliveryCharge || ''}
                    onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[300px] mb-8 scrollbar-thin">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col p-4 bg-slate-50/50 rounded-2xl group border border-transparent hover:border-slate-100 transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">₹{item.price} per unit</p>
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

      {/* Quantity Bottom Sheet (Mobile & Quick Set) */}
      <BottomSheet 
        isOpen={isQtySheetOpen} 
        onClose={() => setIsQtySheetOpen(false)}
        title={selectedItem?.name || ''}
      >
        {/* Same Qty Selector Logic as before but with Teal Theme */}
        <div className="space-y-8 py-4">
          <div className="flex items-center justify-center space-x-8">
            <button 
              onClick={() => updateQuantity(selectedItem?._id, (cartItems.find(i => i.id === selectedItem?._id)?.quantity || 0) - 1)}
              disabled={!(cartItems.find(i => i.id === selectedItem?._id))}
              className={`w-16 h-16 rounded-[28px] flex items-center justify-center transition-all font-black text-2xl ${
                cartItems.find(i => i.id === selectedItem?._id) 
                  ? 'bg-slate-100 text-slate-500 active:bg-slate-200 active:scale-90' 
                  : 'bg-slate-50 text-slate-200 cursor-not-allowed'
              }`}
            >
              <Minus size={24} />
            </button>
            <div className="text-center">
              <span className="text-6xl font-black text-slate-900 leading-none tracking-tighter">
                {cartItems.find(i => i.id === selectedItem?._id)?.quantity || 0}
              </span>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">Quantity</p>
            </div>
            <button 
              onClick={() => addItem({ id: selectedItem._id, name: selectedItem.name, price: selectedItem.price })}
              className="w-16 h-16 bg-teal-100 rounded-[28px] flex items-center justify-center text-teal-600 active:bg-teal-200 active:scale-90 transition-all font-black"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">Item Total</span>
            <span className="text-3xl font-black text-slate-900 tracking-tighter">
              ₹{(selectedItem?.price || 0) * (cartItems.find(i => i.id === selectedItem?._id)?.quantity || 0)}
            </span>
          </div>

          <button 
            onClick={() => setIsQtySheetOpen(false)}
            className="w-full bg-teal-600 text-white font-black py-5 rounded-[28px] shadow-xl shadow-teal-100 flex items-center justify-center space-x-3 active:scale-95 transition-transform"
          >
            <span>Confirm Item</span>
            <CheckCircle2 size={24} />
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
