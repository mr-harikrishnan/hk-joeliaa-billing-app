import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  customerName: string;
  items: CartItem[];
  deliveryCharge: number;
  discount: number;
  paymentMethod: 'cash' | 'upi';
  amountReceived: number;
  changeReturned: number;
  setCustomerName: (name: string) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updatePrice: (id: string, price: number) => void;
  setDeliveryCharge: (charge: number) => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: 'cash' | 'upi') => void;
  setAmountReceived: (amount: number) => void;
  setChangeReturned: (change: number) => void;
  resetCart: () => void;
  getSubtotal: () => number;
  getGrandTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  customerName: '',
  items: [],
  deliveryCharge: 0,
  discount: 0,
  paymentMethod: 'upi',
  amountReceived: 0,
  changeReturned: 0,
  setCustomerName: (name) => set({ customerName: name }),
  addItem: (newItem) => {
    const existing = get().items.find((i) => i.id === newItem.id);
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...get().items, { ...newItem, quantity: 1 }] });
    }
  },
  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
    } else {
      set({
        items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      });
    }
  },
  updatePrice: (id, price) => {
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, price } : i)),
    });
  },
  setDeliveryCharge: (charge) => set({ deliveryCharge: charge }),
  setDiscount: (discount) => set({ discount }),
  setPaymentMethod: (method) => set({ 
    paymentMethod: method,
    amountReceived: 0,
    changeReturned: 0
  }),
  setAmountReceived: (amount) => set((state) => ({ 
    amountReceived: amount,
    changeReturned: Math.max(0, amount - state.getGrandTotal())
  })),
  setChangeReturned: (change) => set({ changeReturned: change }),
  resetCart: () => set({ 
    customerName: '', 
    items: [], 
    deliveryCharge: 0, 
    discount: 0,
    paymentMethod: 'upi',
    amountReceived: 0,
    changeReturned: 0
  }),
  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
  getGrandTotal: () => {
    return get().getSubtotal() + get().deliveryCharge - get().discount;
  },
}));
