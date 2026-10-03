import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  ArrowRight,
  FileText,
  FolderTree,
  Tag,
} from 'lucide-react';
import { BlogAuthor } from '../types/blog.types';
import { blogApi } from '../api/blogApi';

export function AuthorsManagerPage() {
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<BlogAuthor | null>(null);

  // Form states
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bioAr, setBioAr] = useState('');
  const [bioEn, setBioEn] = useState('');

  const loadAuthors = async () => {
    const list = await blogApi.getAuthors();
    setAuthors(list);
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const openAddModal = () => {
    setEditingAuthor(null);
    setNameAr('');
    setNameEn('');
    setRoleTitle('خبير صيانة معتمد');
    setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
    setBioAr('');
    setBioEn('');
    setIsModalOpen(true);
  };

  const openEditModal = (author: BlogAuthor) => {
    setEditingAuthor(author);
    setNameAr(author.nameAr);
    setNameEn(author.nameEn);
    setRoleTitle(author.roleTitle || '');
    setAvatarUrl(author.avatarUrl || '');
    setBioAr(author.bioAr || '');
    setBioEn(author.bioEn || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!nameAr.trim()) return;

    if (editingAuthor) {
      const updated = authors.map((a) =>
        a.id === editingAuthor.id
          ? {
              ...a,
              nameAr,
              nameEn: nameEn || nameAr,
              roleTitle,
              avatarUrl,
              bioAr,
              bioEn,
            }
          : a
      );
      setAuthors(updated);
      localStorage.setItem('focusfix_cms_authors', JSON.stringify(updated));
    } else {
      await blogApi.createAuthor({
        nameAr,
        nameEn: nameEn || nameAr,
        roleTitle,
        avatarUrl,
        bioAr,
        bioEn,
      });
      await loadAuthors();
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الكاتب؟')) {
      const remaining = authors.filter((a) => a.id !== id);
      setAuthors(remaining);
      localStorage.setItem('focusfix_cms_authors', JSON.stringify(remaining));
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
              <UserCheck className="w-6 h-6 text-purple-600" />
              <span>فريق الكتاب والمحررين (Blog Authors)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              إدارة كتاب المدونة والخبراء الذين تظهر أسماؤهم ونبذاتهم التعريفية في صفحات المقالات
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة كاتب جديد</span>
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
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <Tag className="w-3.5 h-3.5 text-blue-600" />
          <span>الوسوم</span>
        </Link>
        <Link
          to="/blog/authors"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-2xs flex items-center gap-1.5"
        >
          <UserCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>الكتاب والمحررون ({authors.length})</span>
        </Link>
      </div>

      {/* Authors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map((author) => (
          <div
            key={author.id}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 hover:border-purple-300 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={author.nameAr}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{author.nameAr}</h3>
                  <p className="text-[11px] text-purple-700 font-medium">{author.roleTitle}</p>
                  <p className="text-[10px] text-slate-400 font-mono ltr text-right mt-0.5" dir="ltr">
                    {author.nameEn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(author)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(author.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {author.bioAr && (
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {author.bioAr}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">المقالات المنشورة:</span>
              <span className="font-bold text-slate-900 font-mono bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200">
                {author.postCount || 4} مقال
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>{editingAuthor ? 'تعديل بيانات الكاتب' : 'إضافة كاتب جديد'}</span>
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
                  placeholder="مثال: م. أحمد الشريف"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                  placeholder="e.g. Eng. Ahmed El-Sherif"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs ltr text-left focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  المسمى الوظيفي
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="مثال: خبير صيانة معتمد من Apple"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رابط الصورة الشخصية (Avatar URL)
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono ltr text-left focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نبذة تعريفية (Bio)
                </label>
                <textarea
                  rows={3}
                  value={bioAr}
                  onChange={(e) => setBioAr(e.target.value)}
                  placeholder="نبذة عن خبرة الكاتب وتخصصه الدقيق..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ البيانات</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
