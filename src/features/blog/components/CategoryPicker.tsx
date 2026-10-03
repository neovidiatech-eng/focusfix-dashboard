import { useState, useEffect } from 'react';
import { FolderTree, Plus, X, Check } from 'lucide-react';
import { BlogCategory } from '../types/blog.types';
import { blogApi } from '../api/blogApi';

interface CategoryPickerProps {
  selectedCategoryId: string;
  onChange: (categoryId: string) => void;
}

export function CategoryPicker({ selectedCategoryId, onChange }: CategoryPickerProps) {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNameAr, setNewNameAr] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async () => {
    const list = await blogApi.getCategories();
    setCategories(list);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!newNameAr.trim()) return;
    setIsSubmitting(true);
    const slug =
      newSlug.trim() ||
      newNameAr
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-|-$/g, '');

    const created = await blogApi.createCategory({
      nameAr: newNameAr,
      nameEn: newNameEn || newNameAr,
      slug,
      parentId: newParentId || null,
    });

    await loadCategories();
    onChange(created.id);
    setIsSubmitting(false);
    setIsAddModalOpen(false);
    setNewNameAr('');
    setNewNameEn('');
    setNewSlug('');
    setNewParentId('');
  };

  // Flatten categories with hierarchy indent
  const flattenedCategories: { id: string; name: string; isChild: boolean }[] = [];
  categories.forEach((cat) => {
    if (!cat.parentId) {
      flattenedCategories.push({ id: cat.id, name: cat.nameAr, isChild: false });
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach((child) => {
          flattenedCategories.push({
            id: child.id,
            name: `↳ ${child.nameAr}`,
            isChild: true,
          });
        });
      }
    }
  });

  // Also include any standalone categories that might have been created without nesting
  categories.forEach((cat) => {
    if (cat.parentId && !flattenedCategories.some((f) => f.id === cat.id)) {
      flattenedCategories.push({ id: cat.id, name: `↳ ${cat.nameAr}`, isChild: true });
    }
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <FolderTree className="w-4 h-4 text-emerald-600" />
          <span>التصنيف الأساسي (Primary Category)</span>
        </label>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>تصنيف جديد</span>
        </button>
      </div>

      {/* Select Box */}
      <select
        value={selectedCategoryId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
      >
        <option value="">-- اختر التصنيف الأساسي للمقال --</option>
        {flattenedCategories.map((c) => (
          <option key={c.id} value={c.id} className={c.isChild ? 'font-normal pr-4' : 'font-bold'}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Quick Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-600" />
                <span>إضافة تصنيف مقالات جديد</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم التصنيف بالعربية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newNameAr}
                  onChange={(e) => setNewNameAr(e.target.value)}
                  placeholder="مثال: شاشات أبل الأصلية"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الاسم بالإنجليزية (Name in English)
                </label>
                <input
                  type="text"
                  value={newNameEn}
                  onChange={(e) => setNewNameEn(e.target.value)}
                  placeholder="e.g. Original Apple Screens"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs ltr text-left focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الرابط المختصر (URL Slug)
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="original-apple-screens"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono ltr text-left focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  التصنيف الأب (Parent Category - اختياري)
                </label>
                <select
                  value={newParentId}
                  onChange={(e) => setNewParentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
                >
                  <option value="">لا يوجد (تصنيف رئيسي)</option>
                  {categories
                    .filter((c) => !c.parentId)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameAr}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newNameAr.trim() || isSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ واختيار</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
