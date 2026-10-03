import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag as TagIcon,
  Plus,
  Trash2,
  X,
  Check,
  ArrowRight,
  FileText,
  FolderTree,
  UserCheck,
  Search,
} from 'lucide-react';
import { BlogTag } from '../types/blog.types';
import { blogApi } from '../api/blogApi';

export function TagsManagerPage() {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');

  const loadTags = async () => {
    const list = await blogApi.getTags(search);
    setTags(list);
  };

  useEffect(() => {
    loadTags();
  }, [search]);

  const handleCreate = async () => {
    if (!nameAr.trim()) return;
    await blogApi.createTag(nameAr.trim(), nameEn.trim() || undefined);
    await loadTags();
    setIsModalOpen(false);
    setNameAr('');
    setNameEn('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الوسم؟')) {
      const remaining = tags.filter((t) => t.id !== id);
      setTags(remaining);
      localStorage.setItem('focusfix_cms_tags', JSON.stringify(remaining));
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
              <TagIcon className="w-6 h-6 text-blue-600" />
              <span>الوسوم والكلمات الدلالية (Blog Tags)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              الكلمات الدلالية الفرعية لربط المقالات ذات الموضوعات المشتركة
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة وسم جديد</span>
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
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <FolderTree className="w-3.5 h-3.5 text-emerald-600" />
          <span>التصنيفات</span>
        </Link>
        <Link
          to="/blog/tags"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-2xs flex items-center gap-1.5"
        >
          <TagIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>الوسوم ({tags.length})</span>
        </Link>
        <Link
          to="/blog/authors"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5 text-purple-600" />
          <span>الكتاب والمحررون</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs max-w-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في الوسوم..."
            className="w-full pr-9 pl-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between group hover:border-blue-300 transition-colors"
          >
            <div>
              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="text-blue-600">#</span>
                <span>{tag.nameAr}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5" dir="ltr">
                {tag.slug}
              </div>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                {tag.postCount || 1} مقال مرتبط
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(tag.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
              title="حذف الوسم"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-blue-600" />
                <span>إضافة وسم جديد</span>
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
                  اسم الوسم بالعربية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: شاشة OLED"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  placeholder="e.g. OLED Display"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs ltr text-left focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                onClick={handleCreate}
                disabled={!nameAr.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>إضافة الوسم</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
