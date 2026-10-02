import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Globe,
  Eye,
  FileText,
  Tag,
  Heading1,
  Heading2,
  Heading3,
  List,
  Bold,
  Italic,
  FolderPlus,
} from 'lucide-react';

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
}

interface Post {
  id: string;
  titleAr: string;
  titleEn: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  status: 'منشور' | 'مسودة';
  views: number;
  date: string;
  excerptAr: string;
  excerptEn: string;
  contentAr: string;
  contentEn: string;
  seoTitle: string;
  seoDesc: string;
}

export function BlogCMSPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');

  const [categories, setCategories] = useState<Category[]>([
    { id: 'cat-1', nameAr: 'نصائح صيانة أبل', nameEn: 'Apple Maintenance Tips', slug: 'apple-tips' },
    { id: 'cat-2', nameAr: 'شاشات الآيفون', nameEn: 'iPhone Screens', slug: 'screens' },
    { id: 'cat-3', nameAr: 'بطاريات أبل', nameEn: 'Batteries', slug: 'batteries' },
    { id: 'cat-4', nameAr: 'حلول أعطال شائعة', nameEn: 'Troubleshooting', slug: 'troubleshooting' },
    { id: 'cat-5', nameAr: 'أمان وخصوصية البيانات', nameEn: 'Data Privacy', slug: 'privacy' },
  ]);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      titleAr: 'متى يجب عليك تغيير بطارية الآيفون؟ علامات وحلول نصائح الخبراء',
      titleEn: 'When should you replace your iPhone battery? Expert Signs & Solutions',
      slug: 'when-to-replace-iphone-battery',
      categoryId: 'cat-3',
      categoryName: 'بطاريات أبل',
      status: 'منشور',
      views: 1420,
      date: '2026-03-15',
      excerptAr: 'هل لاحظت هبوط نسبة صحة البطارية أسفل 80%؟ تعرف على العلامات الحقيقية لتلف البطارية.',
      excerptEn: 'Did your battery capacity drop below 80%? Discover the real indicators of battery degradation.',
      contentAr: 'تعتبر بطارية الآيفون من المكونات الكيميائية القابلة للاستهلاك مع مرور الوقت...',
      contentEn: 'The iPhone battery is a consumable chemical component that ages over cycles...',
      seoTitle: 'متى تغير بطارية الآيفون؟ دليل شامل من FocusFix',
      seoDesc: 'أهم المؤشرات الحقيقية لتلف بطارية الهاتف وكيفية صيانتها منزلياً بضمان رسمي.',
    },
    {
      id: '2',
      titleAr: 'الفرق بين شاشة الآيفون الأصلية والتقليد: دليلك الكامل قبل الصيانة',
      titleEn: 'Original vs Replica iPhone Screen: Complete Guide Before Repair',
      slug: 'original-vs-copy-iphone-screen',
      categoryId: 'cat-2',
      categoryName: 'شاشات الآيفون',
      status: 'منشور',
      views: 980,
      date: '2026-03-20',
      excerptAr: 'تتعرف على الفروقات الجوهرية في ألوان الـ OLED ومعدل التحديث 120Hz.',
      excerptEn: 'Learn key differences in OLED color gamut and ProMotion 120Hz refresh rates.',
      contentAr: 'عند تعرض شاشة الآيفون للكسر، يقع الكثيرون في حيرة بين الشاشات الأصلية والمقلدة...',
      contentEn: 'When an iPhone screen breaks, customers face confusion between OEM and copy panels...',
      seoTitle: 'الفرق بين شاشات الآيفون الأصلية والتجارية | FocusFix',
      seoDesc: 'مقارنة فنية دقيقة توضح الفروق وتجنبك الغش التجاري.',
    },
  ]);

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Post Form states
  const [formTitleAr, setFormTitleAr] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('cat-1');
  const [formExcerptAr, setFormExcerptAr] = useState('');
  const [formExcerptEn, setFormExcerptEn] = useState('');
  const [formContentAr, setFormContentAr] = useState('');
  const [formContentEn, setFormContentEn] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [formStatus, setFormStatus] = useState<'منشور' | 'مسودة'>('منشور');

  // Category Form
  const [catNameAr, setCatNameAr] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catSlug, setCatSlug] = useState('');

  // Rich Text helper for inserting markdown tags
  const insertTag = (prefix: string, suffix: string = '') => {
    setFormContentAr((prev) => `${prev}\n${prefix}عنوان أو فقرة جديدة${suffix}\n`);
  };

  const handleOpenNewPost = () => {
    setEditingPost(null);
    setFormTitleAr('');
    setFormTitleEn('');
    setFormSlug('');
    setFormCategoryId(categories[0]?.id || 'cat-1');
    setFormExcerptAr('');
    setFormExcerptEn('');
    setFormContentAr('');
    setFormContentEn('');
    setFormSeoTitle('');
    setFormSeoDesc('');
    setFormStatus('منشور');
    setIsEditorOpen(true);
  };

  const handleOpenEditPost = (p: Post) => {
    setEditingPost(p);
    setFormTitleAr(p.titleAr);
    setFormTitleEn(p.titleEn);
    setFormSlug(p.slug);
    setFormCategoryId(p.categoryId);
    setFormExcerptAr(p.excerptAr);
    setFormExcerptEn(p.excerptEn);
    setFormContentAr(p.contentAr);
    setFormContentEn(p.contentEn);
    setFormSeoTitle(p.seoTitle);
    setFormSeoDesc(p.seoDesc);
    setFormStatus(p.status);
    setIsEditorOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === formCategoryId);
    const catName = cat ? cat.nameAr : 'عام';

    if (editingPost) {
      setPosts((prev) =>
        prev.map((item) =>
          item.id === editingPost.id
            ? {
                ...item,
                titleAr: formTitleAr,
                titleEn: formTitleEn,
                slug: formSlug || 'post-' + Date.now(),
                categoryId: formCategoryId,
                categoryName: catName,
                status: formStatus,
                excerptAr: formExcerptAr,
                excerptEn: formExcerptEn,
                contentAr: formContentAr,
                contentEn: formContentEn,
                seoTitle: formSeoTitle || formTitleAr,
                seoDesc: formSeoDesc || formExcerptAr,
              }
            : item
        )
      );
    } else {
      const newPost: Post = {
        id: String(Date.now()),
        titleAr: formTitleAr,
        titleEn: formTitleEn,
        slug: formSlug || 'post-' + Date.now(),
        categoryId: formCategoryId,
        categoryName: catName,
        status: formStatus,
        views: 0,
        date: new Date().toISOString().split('T')[0],
        excerptAr: formExcerptAr,
        excerptEn: formExcerptEn,
        contentAr: formContentAr,
        contentEn: formContentEn,
        seoTitle: formSeoTitle || formTitleAr,
        seoDesc: formSeoDesc || formExcerptAr,
      };
      setPosts([newPost, ...posts]);
    }

    setIsEditorOpen(false);
  };

  const handleDeletePost = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المقال نهائياً؟')) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameAr || !catNameEn) return;
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      nameAr: catNameAr,
      nameEn: catNameEn,
      slug: catSlug || catNameEn.toLowerCase().replace(/\s+/g, '-'),
    };
    setCategories([...categories, newCat]);
    setCatNameAr('');
    setCatNameEn('');
    setCatSlug('');
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة المدونة والمحتوى (Blog CMS)</h1>
          <p className="text-sm text-slate-500 mt-1">
            كتابة مقالات الصيانة الثنائية (عربي / إنجليزي)، إدارة التصنيفات، وهيكلة العناوين للسيو
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'posts' ? (
            <button
              onClick={handleOpenNewPost}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              <span>كتابة مقال جديد</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700"
            >
              <FolderPlus className="w-4 h-4" />
              <span>إضافة تصنيف جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'posts'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>المقالات المنشورة ({posts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>التصنيفات والكاتيجوري ({categories.length})</span>
        </button>
      </div>

      {/* Posts Table */}
      {activeTab === 'posts' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">عنوان المقال (عربي / English)</th>
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
                  <td className="py-3.5 px-4 font-bold text-slate-900 max-w-md">
                    <div>{p.titleAr}</div>
                    <div className="text-[11px] font-normal text-slate-400 mt-0.5">{p.titleEn}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="px-2 py-0.5 text-xs bg-slate-100 rounded-md font-medium">
                      {p.categoryName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{p.slug}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        p.status === 'منشور' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
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
                        onClick={() => handleOpenEditPost(p)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                        title="تعديل المقال"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(p.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                        title="حذف المقال"
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
      )}

      {/* Categories Table */}
      {activeTab === 'categories' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">اسم التصنيف (عربي)</th>
                <th className="py-3 px-4">اسم التصنيف (إنجليزي)</th>
                <th className="py-3 px-4">الرابط اللاتيني (Slug)</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.nameAr}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{c.nameEn}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{c.slug}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                      title="حذف التصنيف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Full Article Editor Modal with Typography Structure Toolbar */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>{editingPost ? 'تعديل المقال الاحترافي' : 'كتابة مقال جديد وهيكلته للسيو'}</span>
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="p-6 space-y-6">
              {/* Titles in Arabic and English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    العنوان الرئيسي (H1 بالعربية)
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitleAr}
                    onChange={(e) => {
                      setFormTitleAr(e.target.value);
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
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    العنوان الرئيسي (H1 بالإنجليزية)
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    placeholder="iPhone Screen Repair Complete Guide"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Slug and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الرابط اللاتيني (Slug - إلزامي لاتيني للسيو)
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">التصنيف (Category)</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr} ({c.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Excerpts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">مقتطف قصير (عربي)</label>
                  <textarea
                    rows={2}
                    value={formExcerptAr}
                    onChange={(e) => setFormExcerptAr(e.target.value)}
                    placeholder="مقدمة سريعة تظهر في كارت المقال..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">مقتطف قصير (English)</label>
                  <textarea
                    rows={2}
                    value={formExcerptEn}
                    onChange={(e) => setFormExcerptEn(e.target.value)}
                    placeholder="Short excerpt for article card..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Rich Typography Editor Tools for Headings & Structure */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">شريط تنسيق العناوين والمحتوى:</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => insertTag('## ')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-xs font-bold flex items-center gap-1 text-slate-800"
                      title="عنوان فرعي كبير H2"
                    >
                      <Heading2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>عنوان رئيسي H2</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTag('### ')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-xs font-bold flex items-center gap-1 text-slate-800"
                      title="عنوان فرعي متوسط H3"
                    >
                      <Heading3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>عنوان فرعي H3</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTag('- ')}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-xs font-bold flex items-center gap-1 text-slate-800"
                      title="قائمة نقطية"
                    >
                      <List className="w-3.5 h-3.5 text-slate-600" />
                      <span>قائمة نقطية</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTag('**', '**')}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-xs font-bold flex items-center gap-1 text-slate-800"
                      title="خط عريض"
                    >
                      <Bold className="w-3.5 h-3.5 text-slate-600" />
                      <span>خط عريض</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    محتوى المقال الكامل (بالعربية - استخدم H2 و H3 للترتيب)
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={formContentAr}
                    onChange={(e) => setFormContentAr(e.target.value)}
                    placeholder="اكتب المقال هنا، يمكنك إضافة عناوين فرعية H2 وفصل الفقرات..."
                    className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    محتوى المقال الكامل (بالإنجليزية - English Body)
                  </label>
                  <textarea
                    rows={6}
                    value={formContentEn}
                    onChange={(e) => setFormContentEn(e.target.value)}
                    placeholder="Write English article content here..."
                    className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
              </div>

              {/* SEO Checklist & Meta */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>إعدادات السيو والظهور في نتائج بحث جوجل (SEO Meta)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Meta Title (عنوان جوجل)
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
                      Meta Description (وصف جوجل)
                    </label>
                    <input
                      type="text"
                      value={formSeoDesc}
                      onChange={(e) => setFormSeoDesc(e.target.value)}
                      placeholder="مقتطف يظهر تحت رابط الموقع في جوجل..."
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">حالة النشر:</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="منشور">منشور (Live on Site)</option>
                    <option value="مسودة">مسودة (Draft)</option>
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
                    <span>حفظ ونشر المقال</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">إضافة تصنيف مقالات جديد</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم التصنيف (عربي)</label>
                <input
                  type="text"
                  required
                  value={catNameAr}
                  onChange={(e) => setCatNameAr(e.target.value)}
                  placeholder="مثال: شاشات الآيفون"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم التصنيف (English)</label>
                <input
                  type="text"
                  required
                  value={catNameEn}
                  onChange={(e) => setCatNameEn(e.target.value)}
                  placeholder="Example: iPhone Screens"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الرابط اللاتيني (Slug)</label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="screens"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ التصنيف</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
