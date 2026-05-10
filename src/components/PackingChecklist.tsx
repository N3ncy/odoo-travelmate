import { useState, useEffect } from 'react';
import { Package, Plus, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { packingService } from '@/services/api';
import type { PackingItem } from '@/types';
import toast from 'react-hot-toast';

const CATEGORIES = ['clothing', 'toiletries', 'electronics', 'documents', 'medicine', 'other'] as const;
const CATEGORY_EMOJI: Record<string, string> = {
  clothing: '👔', toiletries: '🧴', electronics: '📱', documents: '📄', medicine: '💊', other: '📦',
};

interface Props {
  tripId: string;
}

export function PackingChecklist({ tripId }: Props) {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState<PackingItem['category']>('other');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const fetchItems = async () => {
    try {
      const data = await packingService.getPackingList(tripId);
      setItems(data);
    } catch {
      toast.error('Failed to load packing list');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    setAdding(true);
    try {
      const item = await packingService.addItem({
        trip_id: tripId,
        item_name: newItem.trim(),
        category: newCategory,
        quantity: 1,
        is_shared: false,
      });
      setItems(prev => [...prev, item]);
      setNewItem('');
      toast.success('Item added!');
    } catch {
      toast.error('Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (item: PackingItem) => {
    try {
      await packingService.togglePacked(item.id, !item.is_packed);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_packed: !i.is_packed } : i));
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await packingService.deleteItem(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch {
      toast.error('Failed to delete');
    }
  };

  const packed = items.filter(i => i.is_packed).length;
  const total = items.length;

  const grouped = CATEGORIES.map(cat => ({
    category: cat,
    items: items.filter(i => i.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header - clickable to toggle */}
      <button
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Packing Checklist</p>
            {total > 0 && (
              <p className="text-xs text-gray-400">{packed}/{total} packed</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {total > 0 && (
            <div className="w-20 bg-gray-100 rounded-full h-1.5">
              <div
                className="h-1.5 bg-emerald-500 rounded-full transition-all"
                style={{ width: `${total > 0 ? (packed / total) * 100 : 0}%` }}
              />
            </div>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-50">
          {/* Add Item */}
          <div className="px-6 py-4 bg-gray-50 flex gap-2">
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as PackingItem['category'])}
              className="border border-gray-200 rounded-xl px-2 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Add item..."
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newItem.trim()}
              className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Items */}
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : items.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No items yet. Add your first packing item above!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {grouped.map(group => (
                <div key={group.category}>
                  <div className="px-6 py-2 bg-gray-50/60">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {CATEGORY_EMOJI[group.category]} {group.category}
                    </p>
                  </div>
                  {group.items.map(item => (
                    <div key={item.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50/50 group">
                      <button
                        onClick={() => handleToggle(item)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          item.is_packed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-300 hover:border-emerald-400'
                        }`}
                      >
                        {item.is_packed && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                      <span className={`flex-1 text-sm ${item.is_packed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {item.item_name}
                        {item.quantity > 1 && <span className="text-gray-400 ml-1">×{item.quantity}</span>}
                        {item.is_shared && <span className="ml-1.5 text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">shared</span>}
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
