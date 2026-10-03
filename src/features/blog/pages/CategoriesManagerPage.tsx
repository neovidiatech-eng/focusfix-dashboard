import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ArrowRight,
  FileText,
  Tag,
  UserCheck,
} from 'lucide-react';
import { BlogCategory } from '../types/blog.types';
import { blogApi } from '../api/blogApi';

export function CategoriesManagerPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);

  // Form states
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [descAr, setDescAr] = useState('');
  const [descEn, setDescEn] = useState('');

  const loadCategories = async () => {
    const list = await blogApi.getCategories();
    setCategories(list);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setNameAr('');
    setNameEn('');
    setSlug('');
    setParentId('');
    setDescAr('');
    setDescEn('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: BlogCategory) => {
    setEditingCategory(cat);
    setNameAr(cat.nameAr);
    setNameEn(cat.nameEn);
    setSlug(cat.slug);
    setParentId(cat.parentId || '');
    setDescAr(cat.descriptionAr || '');
    setDescEn(cat.descriptionEn || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!nameAr.trim()) return;
    const finalSlug =
      slug.trim() ||
      nameAr
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-|-$/g, '');

    if (editingCategory) {
      // In a real API we'd call update; for now we can update locally/via API
      const updated = categories.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              nameAr,
              nameEn: nameEn || nameAr,
              slug: finalSlug,
              parentId: parentId || null,
              descriptionAr: descAr,
              descriptionEn: descEn,
            }
          : c
      );
      setCategories(updated);
      localStorage.setItem('focusfix_cms_categories', JSON.stringify(updated));
    } else {
      await blogApi.createCategory({
        nameAr,
        nameEn: nameEn || nameAr,
        slug: finalSlug,
        parentId: parentId || null,
        descriptionAr: descAr,
        descriptionEn: descEn,
      });
      await loadCategories();
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      await blogApi.deleteCategory(id);
      await loadCategories();
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/blog"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <FolderTree className="w-6 h-6 text-emerald-600" />
              <span>تصنيفات المدونة (Categories)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              تنظيم مقالات الموقع في أقسام هرمية رئيسية وفرعية لتعزيز تجربة المستخدم وأرشفة جوجل
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة تصنيف جديد</span>
        </button>
      </div>

      {/* Sub-nav */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Link
          to="/blog"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>كل المقالات</span>
        </Link>
        <Link
          to="/blog/categories"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-2xs flex items-center gap-1.5"
        >
          <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
          <span>التصنيفات ({categories.length})</span>
        </Link>
        <Link
          to="/blog/tags"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <Tag className="w-3.5 h-3.5 text-blue-600" />
          <span>الوسوم</span>
        </Link>
        <Link
          to="/blog/authors"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5 text-purple-600" />
          <span>الكتاب والمحررون</span>
        </Link>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">اسم التصنيف</th>
              <th className="py-3.5 px-4">الاسم بالإنجليزية</th>
              <th className="py-3.5 px-4">الرابط (Slug)</th>
              <th className="py-3.5 px-4">التصنيف الأب</th>
              <th className="py-3.5 px-4">الوصف</th>
              <th className="py-3.5 px-4 text-center">عدد المقالات</th>
              <th className="py-3.5 px-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    {cat.parentId ? <span className="text-slate-400 font-normal">↳</span> : null}
                    <span>{cat.nameAr}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-600 ltr text-right" dir="ltr">
                  {cat.nameEn}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] ltr text-right" dir="ltr">
                  {cat.slug}
                </td>
                <td className="py-3.5 px-4">
                  {cat.parentId ? (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {categories.find((c) => c.id === cat.parentId)?.nameAr || 'رئيسي'}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium text-[11px]">تصنيف رئيسي</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                  {cat.descriptionAr || '—'}
                </td>
                <td className="py-3.5 px-4 text-center font-mono">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-800">
                    {cat.postCount || 0}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                      title="تعديل التصنيف"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50"
                      title="حذف التصنيف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-600" />
                <span>{editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الاسم بالعربية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: شاشات أبل الأصلية"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الاسم بالإنجليزية
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Original Apple Screens"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs ltr text-left focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الرابط المختصر (Slug)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="original-apple-screens"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono ltr text-left focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  التصنيف الأب (Parent Category)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none"
                >
                  <option value="">لا يوجد (تصنيف رئيسي)</option>
                  {categories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameAr}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الوصف بالعربية
                </label>
                <textarea
                  rows={2}
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  placeholder="وصف مختصر للتصنيف يفيد في صفحات الأرشيف..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!nameAr.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingCategory ? 'تحديث التصنيف' : 'حفظ التصنيف'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
