import { create } from 'zustand';

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
  fetchMenu: () => Promise<void>;
}

export const useMenuStore = create<MenuState>((set) => ({
  items: [],
  categories: [],
  loading: false,
  setItems: (items) => set({ items }),
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
  fetchMenu: async () => {
    set({ loading: true });
    try {
      const [itemsRes, catsRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/categories')
      ]);
      const items = await itemsRes.json();
      const categories = await catsRes.json();
      set({ items, categories, loading: false });
    } catch (error) {
      console.error('Failed to fetch menu', error);
      set({ loading: false });
    }
  },
}));
