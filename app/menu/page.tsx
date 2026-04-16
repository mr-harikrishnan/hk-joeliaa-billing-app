'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Loader2,
  PackageCheck,
  Grid,
  List as ListIcon
} from 'lucide-react';
import BottomSheet from '@/components/ui/BottomSheet';
import { useMenuStore } from '@/store/useMenuStore';
import { api } from '@/lib/api';

export default function MenuPage() {
  const { items, categories, fetchMenu, loading } = useMenuStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
  });

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].name);
    }
  }, [categories, activeCategory]);

  const filteredItems = (Array.isArray(items) ? items : [])
    .filter(item => {
      const matchesCategory = item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', price: '', category: activeCategory || '' });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ name: item.name, price: item.price.toString(), category: item.category });
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingItem ? 'put' : 'post';
    const body = editingItem 
      ? { ...formData, _id: editingItem._id, price: Number(formData.price) }
      : { ...formData, price: Number(formData.price) };

    try {
      const res = await (api as any)[method]('/menu', body);
      if (res.status === 200 || res.status === 201) {
        setIsSheetOpen(false);
        fetchMenu();
      }
    } catch (err) {
      console.error('Failed to save menu item', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const res = await api.delete(`/menu?id=${id}`);
        if (res.status === 200) fetchMenu();
      } catch (err) {
        console.error('Failed to delete menu item', err);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Menu Library</h1>
          <p className="text-slate-500 font-medium">Manage your items and categories</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-teal-600 text-white flex items-center justify-center space-x-2 px-6 py-4 rounded-[24px] shadow-lg shadow-teal-100 hover:bg-teal-700 active:scale-95 transition-all text-sm font-black"
        >
          <Plus size={20} />
          <span>New Product</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search items..."
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-teal-100 text-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* View Toggle */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 hidden sm:flex space-x-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-teal-50 text-teal-600' : 'text-slate-400'}`}
          >
            <Grid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-teal-50 text-teal-600' : 'text-slate-400'}`}
          >
            <ListIcon size={20} />
          </button>
        </div>
      </div>

      {/* Categories Grid (Interactive) */}
      <div className="overflow-x-auto pb-4 no-scrollbar">
        <div className="flex space-x-3">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat.name)}
              className={`
                whitespace-nowrap px-8 py-3.5 rounded-2xl text-sm font-bold transition-all border
                ${activeCategory === cat.name 
                  ? 'bg-teal-600 text-white border-teal-600 shadow-md translate-y-[-2px]' 
                  : 'bg-white text-slate-500 border-slate-100 hover:border-teal-200'}
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Result Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-teal-600" size={40} />
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "grid grid-cols-1 gap-4"
        }>
          {filteredItems.map((item) => (
            <div 
              key={item._id} 
              className={`
                bg-white rounded-[32px] shadow-sm border border-slate-100 transition-all hover:shadow-md group relative
                ${viewMode === 'grid' ? 'p-6 flex flex-col' : 'p-4 flex items-center justify-between'}
              `}
            >
              <div className={`flex items-center ${viewMode === 'grid' ? 'space-x-0 flex-col text-center mb-6' : 'space-x-4'}`}>
                <div className={`
                  ${viewMode === 'grid' ? 'w-24 h-24 mb-4' : 'w-14 h-14'}
                  bg-teal-50 rounded-[24px] flex items-center justify-center text-teal-600
                `}>
                  <PackageCheck size={viewMode === 'grid' ? 40 : 28} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate leading-tight">{item.name}</h3>
                  <p className="text-teal-600 font-black text-lg">₹{item.price}</p>
                </div>
              </div>

              <div className={`
                flex space-x-2 
                ${viewMode === 'grid' ? 'mt-auto pt-4 border-t border-slate-50 justify-center' : ''}
              `}>
                <button 
                  onClick={() => handleOpenEdit(item)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-xs font-bold"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => handleDelete(item._id)}
                  className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {!loading && filteredItems.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-bold">No products in this category yet</p>
              <button 
                onClick={handleOpenAdd}
                className="mt-4 text-teal-600 font-black text-sm hover:underline"
              >
                + Add your first item
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form Sheet (Centered Modal on Desktop) */}
      <BottomSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)}
        title={editingItem ? 'Update Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">Product Name</label>
            <input 
              required
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-teal-200"
              placeholder="e.g. Traditional Laddu"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">Price (₹)</label>
              <input 
                required
                type="number"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-teal-200"
                placeholder="50"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">Category</label>
              <select 
                required
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-teal-200 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m3%205%203%203%203-3%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_1.25rem_center] bg-no-repeat"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(c => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-teal-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-teal-100 hover:bg-teal-700 active:scale-[0.98] transition-all mt-4"
          >
            {editingItem ? 'Save Changes' : 'Confirm & Add'}
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
