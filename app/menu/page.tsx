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
import PageHeader from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';

export default function MenuPage() {
  const { items, categories, fetchMenu, loading } = useMenuStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', category: '', newCategoryName: '' });

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

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', price: '', category: activeCategory || '', newCategoryName: '' });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ 
      name: item.name, price: item.price.toString(), 
      category: typeof item.category === 'string' ? item.category : item.category?._id || '', 
      newCategoryName: '' 
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let categoryId = formData.category;
      if (formData.category === 'new') {
        const catRes = await api.post('/categories', { name: formData.newCategoryName, order: categories.length + 1 });
        categoryId = catRes.data._id;
      }
      const method = editingItem ? 'put' : 'post';
      await (api as any)[method]('/menu', { ...(editingItem && { _id: editingItem._id }), name: formData.name, price: Number(formData.price), category: categoryId });
      setIsSheetOpen(false);
      await fetchMenu(true);
    } catch (err) {
      console.error('Failed to save menu item', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/menu?id=${id}`);
        await fetchMenu(true);
      } catch (err) {
        console.error('Failed to delete menu item', err);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader 
        title="Menu Library" 
        refreshAction={() => fetchMenu(true)}
        rightElement={
          <button onClick={handleOpenAdd} className="w-9 h-9 flex items-center justify-center bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all">
            <Plus size={20} />
          </button>
        }
      />

      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={18} />
          <input 
            type="text" placeholder="Search products..."
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-4 focus:ring-teal-50 focus:border-teal-200 outline-none transition-all text-sm font-medium"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 hidden sm:flex space-x-1">
          <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-teal-50 text-teal-600' : 'text-slate-400'}`}>
            <Grid size={20} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-teal-50 text-teal-600' : 'text-slate-400'}`}>
            <ListIcon size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 no-scrollbar">
        <div className="flex space-x-3">
          {loading && categories.length === 0 ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-24 rounded-xl" />)
          ) : (
            categories.map((cat) => (
              <button key={cat._id} onClick={() => setActiveCategory(cat._id)} className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border ${activeCategory === cat._id ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-white text-slate-500 border-slate-100 hover:border-teal-200'}`}>
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-50 space-y-4">
              <Skeleton className="h-24 w-full rounded-[24px]" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" /><Skeleton className="h-6 w-20" />
              </div>
              <div className="flex space-x-2 pt-4 border-t border-slate-100">
                <Skeleton className="h-10 grow rounded-xl" /><Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6" : "grid grid-cols-1 gap-4"}>
          {filteredItems.map((item) => (
            <div key={item._id} className={`bg-white rounded-[32px] shadow-sm border border-slate-100 transition-all hover:shadow-md group relative ${viewMode === 'grid' ? 'p-3 sm:p-6 flex flex-col' : 'p-4 flex items-center justify-between'}`}>
              <div className={`flex items-center ${viewMode === 'grid' ? 'space-x-0 flex-col text-center mb-3 sm:mb-6' : 'space-x-4'}`}>
                <div className={`${viewMode === 'grid' ? 'w-16 h-16 sm:w-24 sm:h-24 mb-3 sm:mb-4' : 'w-12 h-12'} bg-teal-50 rounded-[24px] flex items-center justify-center text-teal-600`}><PackageCheck size={viewMode === 'grid' ? 24 : 18} /></div>
                <div className="flex-1 w-full min-w-0">
                  <h3 className="font-bold text-slate-800 text-[11px] sm:text-xs truncate uppercase mb-1 tracking-tight">{item.name}</h3>
                  <p className="text-teal-600 font-black text-base sm:text-lg">₹{item.price}</p>
                </div>
              </div>
              <div className={`flex space-x-2 ${viewMode === 'grid' ? 'mt-auto pt-4 border-t border-slate-50 justify-center' : ''}`}>
                <button onClick={() => handleOpenEdit(item)} className="grow flex items-center justify-center space-x-2 py-2 px-4 shadow-sm text-blue-600 bg-blue-50 rounded-xl text-[10px] font-bold"><Edit3 size={14}/><span>Edit</span></button>
                <button onClick={() => handleDelete(item._id)} className="p-2.5 text-red-500 bg-red-50 rounded-xl"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100"><p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No records in view</p></div>
          )}
        </div>
      )}

      <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title={editingItem ? 'Edit Product' : 'New Product'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">Product Name</label>
            <input required className="w-full bg-slate-50 border-none rounded-2xl py-4.5 px-5 text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">Price</label>
              <input required type="number" className="w-full bg-slate-50 border-none rounded-2xl py-4.5 px-5 text-sm" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">Category</label>
              <select required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="" disabled>Select</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                {!editingItem && <option value="new">New...</option>}
              </select>
            </div>
          </div>
          {formData.category === 'new' && (
            <div className="space-y-2"><label className="text-xs font-bold text-teal-600 uppercase ml-1 tracking-widest">Category Name</label><input required className="w-full bg-teal-50 border-2 border-teal-100 rounded-2xl py-4.5 px-5 text-sm" value={formData.newCategoryName} onChange={(e) => setFormData({...formData, newCategoryName: e.target.value})} /></div>
          )}
          <button type="submit" disabled={isSaving} className="w-full bg-teal-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-teal-700 transition-all flex items-center justify-center uppercase tracking-widest text-xs">
            {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            {editingItem ? 'Update' : 'Confirm'}
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
