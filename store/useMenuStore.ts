import { create } from 'zustand';
import { api } from '@/lib/api';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

interface Category {
  _id: string;
  name: string;
  order: number;
}

interface MenuState {
  items: MenuItem[];
  categories: Category[];
  loading: boolean;
  setItems: (items: MenuItem[]) => void;
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  fetchMenu: (force?: boolean) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set) => ({
  items: [],
  categories: [],
  loading: false,
  setItems: (items) => set({ items }),
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
  fetchMenu: async (force = false) => {
    const { items, categories } = useMenuStore.getState();
    if (!force && items.length > 0 && categories.length > 0) return;

    set({ loading: true });
    try {
      const [itemsRes, catsRes] = await Promise.all([
        api.get('/menu'),
        api.get('/categories')
      ]);
      
      const items = Array.isArray(itemsRes.data) ? itemsRes.data : [];
      const categories = Array.isArray(catsRes.data) ? catsRes.data : [];
      
      set({ items, categories, loading: false });
    } catch (error) {
      console.error('Failed to fetch menu', error);
      set({ items: [], categories: [], loading: false });
    }
  },
}));
