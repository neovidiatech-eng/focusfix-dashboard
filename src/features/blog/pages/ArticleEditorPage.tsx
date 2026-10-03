import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Save,
  Globe,
  Eye,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  History,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BlogPost, PostStatus } from '../types/blog.types';
import { blogApi } from '../api/blogApi';
import { RichTextEditor } from '../components/RichTextEditor';
import { SeoSettingsPanel } from '../components/SeoSettingsPanel';
import { FeaturedImageUploader } from '../components/FeaturedImageUploader';
import { TagInput } from '../components/TagInput';
import { CategoryPicker } from '../components/CategoryPicker';
import { AuthorPicker } from '../components/AuthorPicker';
import { ArticlePreviewModal } from '../components/ArticlePreviewModal';

export function ArticleEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Active Language tab in editor
  const [activeLang, setActiveLang] = useState<'ar' | 'en'>('ar');

  // Form States
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [slug, setSlug] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const [excerptAr, setExcerptAr] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [contentHtmlAr, setContentHtmlAr] = useState('');
  const [contentHtmlEn, setContentHtmlEn] = useState('');

  const [categoryId, setCategoryId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [tags, setTags] = useState<BlogPost['tags']>([]);

  // Featured Image
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageAlt, setFeaturedImageAlt] = useState('');
  const [featuredImageCaption, setFeaturedImageCaption] = useState('');

  // SEO Fields
  const [focusKeyword, setFocusKeyword] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [robotsFollow, setRobotsFollow] = useState(true);

  // Publish States
  const [status, setStatus] = useState<PostStatus>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [viewsCount, setViewsCount] = useState(0);

  // Related posts
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [relatedPostIds, setRelatedPostIds] = useState<string[]>([]);

  // Helper to generate slug from title
  const generateSlug = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[\s\-_]+/g, '-')
      .replace(/[^\w\u0600-\u06FF\-]+/g, '')
      .replace(/^-+|-+$/g, '');
  };

  // Load existing article or initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { posts } = await blogApi.getAllPosts();
        setAllPosts(posts);

        if (id) {
          setIsLoading(true);
          const post = await blogApi.getPostById(id);
          if (post) {
            setTitleAr(post.titleAr || '');
            setTitleEn(post.titleEn || '');
            setSlug(post.slug || '');
            setOriginalSlug(post.slug || '');
            setExcerptAr(post.excerptAr || '');
            setExcerptEn(post.excerptEn || '');
            setContentHtmlAr(post.contentHtml || '');
            setContentHtmlEn(post.contentHtmlEn || '');
            setCategoryId(post.categoryId || '');
            setAuthorId(post.authorId || '');
            setTags(post.tags || []);
            setFeaturedImage(post.featuredImage || '');
            setFeaturedImageAlt(post.featuredImageAlt || '');
            setFeaturedImageCaption(post.featuredImageCaption || '');
            setFocusKeyword(post.focusKeyword || '');
            setSeoTitle(post.seoTitle || '');
            setSeoDesc(post.seoDesc || '');
            setCanonicalUrl(post.canonicalUrl || '');
            setRobotsIndex(post.robotsIndex ?? true);
            setRobotsFollow(post.robotsFollow ?? true);
            setStatus(post.status || 'draft');
            setViewsCount(post.viewsCount || 0);
            setRelatedPostIds(post.relatedPostIds || []);

            if (post.scheduledAt) {
              const dt = new Date(post.scheduledAt);
              setScheduledDate(dt.toISOString().split('T')[0]);
              setScheduledTime(dt.toTimeString().slice(0, 5));
            }
          }
        } else {
          // Pre-populate default category & author
          const cats = await blogApi.getCategories();
          if (cats.length > 0) setCategoryId(cats[0].id);
          const authors = await blogApi.getAuthors();
          if (authors.length > 0) setAuthorId(authors[0].id);
        }
      } catch (err) {
        setErrorMessage('تعذر تحميل بيانات المقال');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Handle Title Ar change -> auto generate slug if not manually locked
  const handleTitleArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitleAr(val);
    if (!isEditingSlug && (!id || !slug)) {
      setSlug(generateSlug(val));
    }
  };

  // Submit Save
  const handleSave = async (forcedStatus?: PostStatus) => {
    if (!titleAr.trim()) {
      setErrorMessage('عنوان المقال بالعربية مطلوب كـ H1 رئيسي');
      return;
    }
    if (!slug.trim()) {
      setErrorMessage('رابط المقال (Slug) مطلوب');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const targetStatus = forcedStatus || status;

    let scheduledAtString: string | null = null;
    if (targetStatus === 'scheduled' && scheduledDate) {
      scheduledAtString = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
    }

    const payload: Partial<BlogPost> = {
      titleAr,
      titleEn: titleEn || titleAr,
      slug: slug.trim().toLowerCase(),
      excerptAr,
      excerptEn: excerptEn || excerptAr,
      contentHtml: contentHtmlAr,
      contentHtmlEn,
      categoryId,
      authorId,
      tags,
      featuredImage,
      featuredImageAlt,
      featuredImageCaption,
      focusKeyword,
      seoTitle,
      seoDesc,
      canonicalUrl,
      robotsIndex,
      robotsFollow,
      status: targetStatus,
      scheduledAt: scheduledAtString,
      relatedPostIds,
    };

    try {
      if (id) {
        await blogApi.updatePost(id, payload);
        setSuccessMessage('تم تحديث المقال بنجاح وحفظ التغييرات!');
      } else {
        const created = await blogApi.createPost(payload);
        setSuccessMessage('تم إنشاء المقال بنجاح!');
        setTimeout(() => {
          navigate(`/blog/edit/${created.id}`, { replace: true });
        }, 800);
      }
      setStatus(targetStatus);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ المقال';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        جاري تحميل بيئة كتابة المقال...
      </div>
    );
  }

  // Current post object for preview modal
  const previewPost: Partial<BlogPost> = {
    titleAr,
    titleEn,
    slug,
    excerptAr,
    excerptEn,
    contentHtml: activeLang === 'ar' ? contentHtmlAr : contentHtmlEn || contentHtmlAr,
    featuredImage,
    featuredImageAlt,
    featuredImageCaption,
    status,
    readingMinutes: Math.max(2, Math.round((contentHtmlAr.replace(/<[^>]+>/g, '').split(/\s+/).length || 100) / 150)),
    publishedAt: status === 'published' ? new Date().toISOString() : null,
    category: allPosts.find((p) => p.categoryId === categoryId)?.category,
    author: allPosts.find((p) => p.authorId === authorId)?.author,
    tags,
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/blog"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="العودة لكل المقالات"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {isEditing ? 'تعديل المقال' : 'إضافة مقال جديد'}
              </h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  status === 'published'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'scheduled'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {status === 'published' ? 'منشور' : status === 'scheduled' ? 'مجدول' : 'مسودة'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              محرر مخصص متوافق مع معايير SEO وهيكلية WordPress المتطورة
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>معاينة حية للمقال</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>حفظ كمسودة</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Globe className="w-4 h-4" />
            <span>{status === 'published' ? 'تحديث ونشر' : 'نشر الآن'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Left/Center Content (2/3) + Right Sidebar (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ======================================================== */}
        {/* COLUMN 1 & 2: MAIN EDITOR AREA */}
        {/* ======================================================== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language Switcher Tabs */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setActiveLang('ar')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeLang === 'ar'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                المحتوى باللغة العربية (الأساسي)
              </button>
              <button
                type="button"
                onClick={() => setActiveLang('en')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeLang === 'en'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                English Translation (إنجليزي)
              </button>
            </div>
            <span className="text-[11px] text-slate-400 pl-3">
              {activeLang === 'ar' ? 'العربية (RTL)' : 'English (LTR)'}
            </span>
          </div>

          {/* Article Title (H1 Single Rule Enforcement) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>عنوان المقال الرئيسي</span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  H1 الوحيد في صفحة المقال
                </span>
              </label>
              <span className="text-[11px] text-slate-400">
                {activeLang === 'ar' ? titleAr.length : titleEn.length} حرف
              </span>
            </div>

            {activeLang === 'ar' ? (
              <input
                type="text"
                value={titleAr}
                onChange={handleTitleArChange}
                placeholder="اكتب هنا عنوان المقال الرئيسي الجذاب..."
                className="w-full text-xl md:text-2xl font-black text-slate-950 placeholder-slate-300 focus:outline-none border-b-2 border-transparent focus:border-emerald-500 py-2 transition-colors"
              />
            ) : (
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Enter the English Article Title (H1)..."
                className="w-full text-xl md:text-2xl font-bold text-slate-950 placeholder-slate-300 focus:outline-none border-b-2 border-transparent focus:border-emerald-500 py-2 transition-colors ltr text-left"
              />
            )}

            {/* URL Slug Control Box */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-mono text-slate-500 truncate ltr" dir="ltr">
                <span className="text-slate-400">https://focusfix.net/blog/</span>
                {isEditingSlug ? (
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    className="px-2 py-0.5 border border-emerald-500 rounded font-mono text-xs bg-emerald-50/50 text-emerald-950 focus:outline-none"
                  />
                ) : (
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {slug || 'article-slug'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditingSlug ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingSlug(false)}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    اعتماد الـ Slug
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingSlug(true)}
                    className="text-emerald-600 hover:text-emerald-700 font-bold underline"
                  >
                    تعديل الرابط
                  </button>
                )}
              </div>
            </div>

            {/* 301 Redirect Notice if existing slug changes */}
            {isEditing && originalSlug && slug !== originalSlug && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  ميزة SEO الذكية: سيقوم النظام تلقائيًا بإنشاء تحويل <strong>301 Redirect</strong> من الرابط القديم ({originalSlug}) إلى الجديد لتفادي الروابط المعطلة 404!
                </span>
              </div>
            )}
          </div>

          {/* Excerpt / Short Description */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900">
                الوصف المختصر / المقتطف (Excerpt)
              </label>
              <span className="text-[10px] text-slate-400">يظهر في بطاقات المدونة وشبكات التواصل</span>
            </div>
            {activeLang === 'ar' ? (
              <textarea
                rows={2}
                value={excerptAr}
                onChange={(e) => setExcerptAr(e.target.value)}
                placeholder="ملخص مكثف من سطرين يوضح الفكرة الرئيسية للمقال..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            ) : (
              <textarea
                rows={2}
                value={excerptEn}
                onChange={(e) => setExcerptEn(e.target.value)}
                placeholder="Concise two-line summary of the article..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed ltr text-left"
              />
            )}
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>محتوى المقال الكامل (Rich Body Content)</span>
              <span className="text-[11px] text-emerald-600">
                ترويسات المحتوى تبدأ من H2 لتنظيم الأقسام
              </span>
            </label>

            {activeLang === 'ar' ? (
              <RichTextEditor
                value={contentHtmlAr}
                onChange={(html) => setContentHtmlAr(html)}
                placeholder="ابدأ بكتابة فقرات المقال بالعربية، أضف ترويسات H2، صور، روابط، وجداول..."
              />
            ) : (
              <RichTextEditor
                value={contentHtmlEn}
                onChange={(html) => setContentHtmlEn(html)}
                placeholder="Start writing the English content, H2 subheadings, images, links..."
              />
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 3: STICKY SIDEBAR (SETTINGS, SEO, PUBLISHING) */}
        {/* ======================================================== */}
        <div className="space-y-6">
          {/* 1. PUBLISHING & SCHEDULE BOX */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>إعدادات النشر والجدولة</span>
              </h3>
              {viewsCount > 0 && (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                  {viewsCount} مشاهدة
                </span>
              )}
            </div>

            {/* Status Radio / Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">حالة المقال</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all ${
                    status === 'draft'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  مسودة
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('published')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all ${
                    status === 'published'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  منشور
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('scheduled')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all ${
                    status === 'scheduled'
                      ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  مجدول
                </button>
              </div>
            </div>

            {/* Schedule Date & Time Picker */}
            {status === 'scheduled' && (
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2 animate-in fade-in">
                <label className="block text-[11px] font-bold text-blue-900">
                  تاريخ ووقت النشر التلقائي:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-blue-500 absolute right-2.5 top-2.5 pointer-events-none" />
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full pr-8 pl-2 py-1.5 border border-blue-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-blue-500 absolute right-2.5 top-2.5 pointer-events-none" />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full pr-8 pl-2 py-1.5 border border-blue-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* History Info */}
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>يتم حفظ المراجعات تلقائيًا في قاعدة البيانات</span>
            </div>

            {/* Trash button if editing */}
            {isEditing && (
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={async () => {
                    if (id && confirm('هل أنت متأكد من نقل هذا المقال إلى سلة المهملات؟')) {
                      await blogApi.moveToTrash(id);
                      navigate('/blog');
                    }
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>نقل لسلة المهملات</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. FEATURED IMAGE */}
          <FeaturedImageUploader
            imageUrl={featuredImage}
            altText={featuredImageAlt}
            caption={featuredImageCaption}
            onChangeImage={setFeaturedImage}
            onChangeAltText={setFeaturedImageAlt}
            onChangeCaption={setFeaturedImageCaption}
          />

          {/* 3. CATEGORY */}
          <CategoryPicker
            selectedCategoryId={categoryId}
            onChange={setCategoryId}
          />

          {/* 4. TAGS */}
          <TagInput
            selectedTags={tags}
            onChange={setTags}
          />

          {/* 5. AUTHOR */}
          <AuthorPicker
            selectedAuthorId={authorId}
            onChange={setAuthorId}
          />

          {/* 6. SEO SUITE & CHECKLIST & GOOGLE PREVIEW */}
          <SeoSettingsPanel
            title={titleAr}
            slug={slug}
            contentHtml={contentHtmlAr}
            excerpt={excerptAr}
            featuredImageAlt={featuredImageAlt}
            focusKeyword={focusKeyword}
            seoTitle={seoTitle}
            seoDesc={seoDesc}
            canonicalUrl={canonicalUrl}
            robotsIndex={robotsIndex}
            robotsFollow={robotsFollow}
            onChangeFocusKeyword={setFocusKeyword}
            onChangeSeoTitle={setSeoTitle}
            onChangeSeoDesc={setSeoDesc}
            onChangeCanonicalUrl={setCanonicalUrl}
            onChangeRobotsIndex={setRobotsIndex}
            onChangeRobotsFollow={setRobotsFollow}
          />

          {/* 7. RELATED ARTICLES */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>المقالات ذات الصلة (Related Articles)</span>
              </label>
              <span className="text-[10px] text-slate-400">يدوي أو تلقائي</span>
            </div>

            <p className="text-[11px] text-slate-500">
              اختر مقالات ترشحها للقارئ أسفل المقال لزيادة وقت بقائه في الموقع:
            </p>

            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {allPosts
                .filter((p) => p.id !== id)
                .map((post) => {
                  const isChecked = relatedPostIds.includes(post.id);
                  return (
                    <label
                      key={post.id}
                      className="p-2.5 flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRelatedPostIds([...relatedPostIds, post.id]);
                          } else {
                            setRelatedPostIds(relatedPostIds.filter((rid) => rid !== post.id));
                          }
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="text-slate-800 line-clamp-1 flex-1 font-medium">
                        {post.titleAr}
                      </span>
                    </label>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Full Modal */}
      {isPreviewOpen && (
        <ArticlePreviewModal
          post={previewPost}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
