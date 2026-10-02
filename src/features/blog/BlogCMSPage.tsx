import { useState } from 'react';
import { Plus, Edit, Trash2, X, Save, Globe, Eye, FileText } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: 'منشور' | 'مسودة';
  views: number;
  date: string;
  content?: string;
  seoTitle?: string;
  seoDesc?: string;
}

export function BlogCMSPage() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      title: 'دليل شامل: كيف تحافظ على صحة بطارية الآيفون لأطول فترة ممكنة؟',
      slug: 'iphone-battery-health-guide',
      category: 'نصائح صيانة',
      status: 'منشور',
      views: 1420,
      date: '2026-09-28',
      seoTitle: 'كيف تحافظ على صحة بطارية الآيفون؟ — نصائح FocusFix',
      seoDesc: 'أهم الطرق والخطوات العملية للحفاظ على سعة بطارية آيفون وتجنب تلفها السريع مع خدمات الصيانة المنزلية من FocusFix.',
    },
    {
      id: '2',
      title: 'مقارنة بين تغيير الشاشة الأصلية والشاشات المقلدة ومخاطرها',
      slug: 'original-vs-fake-screen-replacement',
      category: 'الشاشات',
      status: 'منشور',
      views: 980,
      date: '2026-09-20',
      seoTitle: 'مقارنة الشاشات الأصلية والتجارية للآيفون',
      seoDesc: 'تعرف على الفرق بين الشاشة الأصلية والمقلدة ومخاطر التاتش والـ True Tone بعد التغيير.',
    },
    {
      id: '3',
      title: 'حل مشكلة ارتفاع حرارة آيفون 15 برو ماكس أثناء الشحن',
      slug: 'iphone-15-pro-max-overheating-fix',
      category: 'حلول أعطال',
      status: 'مسودة',
      views: 0,
      date: '2026-10-01',
    },
  ]);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('نصائح صيانة');
  const [formContent, setFormContent] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [formStatus, setFormStatus] = useState<'منشور' | 'مسودة'>('مسودة');

  const handleOpenNew = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormSlug('');
    setFormCategory('نصائح صيانة');
    setFormContent('');
    setFormSeoTitle('');
    setFormSeoDesc('');
    setFormStatus('مسودة');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (p: Post) => {
    setEditingPost(p);
    setFormTitle(p.title);
    setFormSlug(p.slug);
    setFormCategory(p.category);
    setFormContent(p.content || '');
    setFormSeoTitle(p.seoTitle || p.title);
    setFormSeoDesc(p.seoDesc || '');
    setFormStatus(p.status);
    setIsEditorOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    if (editingPost) {
      setPosts((prev) =>
        prev.map((item) =>
          item.id === editingPost.id
            ? {
                ...item,
                title: formTitle,
                slug: formSlug || 'post-' + Date.now(),
                category: formCategory,
                status: formStatus,
                content: formContent,
                seoTitle: formSeoTitle,
                seoDesc: formSeoDesc,
              }
            : item
        )
      );
    } else {
      const newPost: Post = {
        id: String(Date.now()),
        title: formTitle,
        slug: formSlug || 'post-' + Date.now(),
        category: formCategory,
        status: formStatus,
        views: 0,
        date: new Date().toISOString().split('T')[0],
        content: formContent,
        seoTitle: formSeoTitle,
        seoDesc: formSeoDesc,
      };
      setPosts([newPost, ...posts]);
    }

    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة المدونة (Blog CMS)</h1>
          <p className="text-sm text-slate-500 mt-1">
            كتابة ونشر مقالات الصيانة المتوافقة مع SEO لجلب الزيارات المجانية من جوجل
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            <span>كتابة مقال جديد</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">عنوان المقال</th>
              <th className="py-3 px-4">التصنيف</th>
              <th className="py-3 px-4">الرابط اللاتيني (Slug)</th>
              <th className="py-3 px-4">الحالة</th>
              <th className="py-3 px-4">المشاهدات</th>
              <th className="py-3 px-4">التاريخ</th>
              <th className="py-3 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-bold text-slate-900 max-w-md">{p.title}</td>
                <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{p.slug}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      p.status === 'منشور'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{p.views}</td>
                <td className="py-3.5 px-4 text-slate-500 text-xs">{p.date}</td>
                <td className="py-3.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                      title="تعديل المقال"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPosts(posts.filter((item) => item.id !== p.id))}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                      title="حذف"
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

      {/* Post Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>{editingPost ? 'تعديل المقال' : 'كتابة مقال جديد'}</span>
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  عنوان المقال (H1)
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (!formSlug) {
                      setFormSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, '')
                          .replace(/\s+/g, '-')
                      );
                    }
                  }}
                  placeholder="مثال: دليل صيانة شاشات الآيفون..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الرابط اللاتيني (Slug - إلزامي لاتيني لتجنب الترميز %D8)
                  </label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="iphone-screen-repair-guide"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">التصنيف</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>نصائح صيانة</option>
                    <option>الشاشات</option>
                    <option>البطاريات</option>
                    <option>حلول أعطال</option>
                    <option>أخبار Apple</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  محتوى المقال (Rich Editor Content)
                </label>
                <textarea
                  rows={8}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="اكتب تفاصيل المقال هنا، النصائح، الأسباب، والحلول..."
                  className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                />
              </div>

              {/* SEO Checklist & Meta */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>إعدادات السيو والظهور في نتائج البحث (SEO)</span>
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Meta Title (العنوان في جوجل)
                  </label>
                  <input
                    type="text"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    placeholder="العنوان المخصص لمحركات البحث..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Meta Description (الوصف في جوجل)
                  </label>
                  <textarea
                    rows={2}
                    value={formSeoDesc}
                    onChange={(e) => setFormSeoDesc(e.target.value)}
                    placeholder="مقتطف جذاب يشجع الزائر على النقر..."
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">حالة النشر:</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="مسودة">مسودة (Draft)</option>
                    <option value="منشور">منشور (Publish Now)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ المقال</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
