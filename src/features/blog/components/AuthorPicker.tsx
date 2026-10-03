import { useState, useEffect } from 'react';
import { UserCheck, Plus, X, Check } from 'lucide-react';
import { BlogAuthor } from '../types/blog.types';
import { blogApi } from '../api/blogApi';

interface AuthorPickerProps {
  selectedAuthorId: string;
  onChange: (authorId: string) => void;
}

export function AuthorPicker({ selectedAuthorId, onChange }: AuthorPickerProps) {
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [roleTitle, setRoleTitle] = useState('خبير صيانة معتمد');
  const [bioAr, setBioAr] = useState('');

  const loadAuthors = async () => {
    const list = await blogApi.getAuthors();
    setAuthors(list);
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const handleCreate = async () => {
    if (!nameAr.trim()) return;
    const slug = nameAr.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-');
    const created = await blogApi.createAuthor({
      nameAr,
      nameEn: nameEn || nameAr,
      slug,
      roleTitle,
      bioAr,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });

    await loadAuthors();
    onChange(created.id);
    setIsAddModalOpen(false);
    setNameAr('');
    setNameEn('');
    setBioAr('');
  };

  const selectedAuthor = authors.find((a) => a.id === selectedAuthorId);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>كاتب المقال (Article Author)</span>
        </label>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>كاتب جديد</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {selectedAuthor?.avatarUrl ? (
          <img
            src={selectedAuthor.avatarUrl}
            alt={selectedAuthor.nameAr}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">
            A
          </div>
        )}

        <div className="flex-1">
          <select
            value={selectedAuthorId}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">-- اختر كاتب المقال --</option>
            {authors.map((auth) => (
              <option key={auth.id} value={auth.id}>
                {auth.nameAr} ({auth.roleTitle || 'كاتب'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Add Author Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>إضافة كاتب جديد للمدونة</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم الكاتب بالعربية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: م. محمود حسن"
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
                  placeholder="e.g. Mahmoud Hassan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs ltr text-left focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  المسمى الوظيفي والتخصص
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="مثال: مهندس فحص شاشات آيفون"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نبذة مختصرة (Bio)
                </label>
                <textarea
                  rows={2}
                  value={bioAr}
                  onChange={(e) => setBioAr(e.target.value)}
                  placeholder="نبذة عن خبرة الكاتب بمجال صيانة الأجهزة الذكية..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
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
                disabled={!nameAr.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>إضافة الكاتب</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
