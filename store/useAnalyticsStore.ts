import { create } from 'zustand';
import { api } from '@/lib/api';

interface AnalyticsState {
  data: any;
  loading: boolean;
  fetchAnalytics: (force?: boolean) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  data: null,
  loading: false,
  fetchAnalytics: async (force = false) => {
    if (!force && get().data) return;

    set({ loading: true });
    try {
      const res = await api.get('/analytics');
      set({ data: res.data, loading: false });
      
      // Seed DB if empty (first run) - background task
      api.get("/seed").catch(() => {});
    } catch (error) {
      console.error('Failed to fetch analytics', error);
      set({ loading: false });
    }
  },
}));
