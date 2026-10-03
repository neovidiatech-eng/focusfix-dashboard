import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Copy,
  Trash2,
  RotateCcw,
  Globe,
  FileText,
  Clock,
  CheckCircle2,
  FolderTree,
  Tag,
  UserCheck,
} from 'lucide-react';
import { BlogPost, BlogCategory, BlogAuthor } from '../types/blog.types';
import { blogApi } from '../api/blogApi';
import { ArticlePreviewModal } from '../components/ArticlePreviewModal';

export function ArticlesListPage() {
  // Status Tab
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'scheduled' | 'trash'>('all');

  // Articles & Counts
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
    all: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    trash: 0,
  });
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedSeoStatus, setSelectedSeoStatus] = useState<'all' | 'good' | 'average' | 'poor'>('all');

  // Selection for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

  // Preview Modal
  const [previewingPost, setPreviewingPost] = useState<BlogPost | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [postsRes, catsRes, authorsRes] = await Promise.all([
        blogApi.getAllPosts({
          status: activeTab === 'trash' ? 'archived' : activeTab,
          search: search || undefined,
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
          authorId: selectedAuthor !== 'all' ? selectedAuthor : undefined,
        }),
        blogApi.getCategories(),
        blogApi.getAuthors(),
      ]);

      setPosts(postsRes.posts);
      setCounts(postsRes.counts);
      setCategories(catsRes);
      setAuthors(authorsRes);
    } catch {
      // Handled in api fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setSelectedIds([]);
  }, [activeTab, selectedCategory, selectedAuthor]);

  // Handle client-side search debounce / filter
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // SEO status filter
      if (selectedSeoStatus === 'good' && (p.seoScore || 85) < 80) return false;
      if (selectedSeoStatus === 'average' && ((p.seoScore || 85) < 60 || (p.seoScore || 85) >= 80)) return false;
      if (selectedSeoStatus === 'poor' && (p.seoScore || 85) >= 60) return false;

      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.titleAr.toLowerCase().includes(q) ||
        p.titleEn.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    });
  }, [posts, search, selectedSeoStatus]);

  // Select all handler
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredPosts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Toggle single item
  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk actions execution
  const handleExecuteBulk = async () => {
    if (selectedIds.length === 0 || !bulkAction) return;

    if (bulkAction === 'delete') {
      if (confirm(`هل أنت متأكد من الحذف النهائي لـ ${selectedIds.length} مقال؟`)) {
        await blogApi.bulkAction(selectedIds, 'delete');
      }
    } else if (bulkAction === 'trash') {
      await blogApi.bulkAction(selectedIds, 'trash');
    } else if (bulkAction === 'restore') {
      await blogApi.bulkAction(selectedIds, 'restore');
    } else if (bulkAction === 'publish') {
      await blogApi.bulkAction(selectedIds, 'publish');
    } else if (bulkAction === 'draft') {
      await blogApi.bulkAction(selectedIds, 'draft');
    }

    setSelectedIds([]);
    setBulkAction('');
    await loadData();
  };

  // Duplicate handler
  const handleDuplicate = async (id: string) => {
    await blogApi.duplicatePost(id);
    await loadData();
  };

  // Move to trash handler
  const handleMoveToTrash = async (id: string) => {
    await blogApi.moveToTrash(id);
    await loadData();
  };

  // Restore handler
  const handleRestore = async (id: string) => {
    await blogApi.restoreFromTrash(id);
    await loadData();
  };

  // Permanently delete handler
  const handleDeletePermanent = async (id: string) => {
    if (confirm('هل أنت متأكد من الحذف النهائي لهذا المقال؟ لا يمكن التراجع عن هذا الإجراء.')) {
      await blogApi.permanentlyDelete(id);
      await loadData();
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>إدارة مقالات المدونة (Blog Articles)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            نظام إدارة محتوى متكامل ومتوافق كليًا مع معايير محركات البحث SEO وتجربة ووردبريس الاحترافية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/blog/new"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>كتابة مقال جديد (Add Article)</span>
          </Link>
        </div>
      </div>

      {/* Quick Navigation sub-tabs (Articles, Categories, Tags, Authors) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Link
          to="/blog"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-2xs flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>كل المقالات</span>
        </Link>
        <Link
          to="/blog/categories"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <FolderTree className="w-3.5 h-3.5 text-emerald-600" />
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
          <span>الكتاب والمحررون ({authors.length})</span>
        </Link>
      </div>

      {/* Status Tabs Bar */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>الكل</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('published')}
          className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'published'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          <span>المنشورة</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
            {counts.published}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('draft')}
          className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'draft'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-500" />
          <span>المسودات</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
            {counts.draft}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scheduled')}
          className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'scheduled'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>المجدولة</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">
            {counts.scheduled}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trash')}
          className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 mr-auto ${
            activeTab === 'trash'
              ? 'border-rose-600 text-rose-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          <span>سلة المهملات</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px]">
            {counts.trash}
          </span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث باسم المقال، الرابط المختصر، أو الكلمات المفتاحية..."
            className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 focus:outline-none"
            >
              <option value="all">كل التصنيفات</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Author Filter */}
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 focus:outline-none"
          >
            <option value="all">كل الكتاب</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nameAr}
              </option>
            ))}
          </select>

          {/* SEO Score Filter */}
          <select
            value={selectedSeoStatus}
            onChange={(e) => setSelectedSeoStatus(e.target.value as 'all' | 'good' | 'average' | 'poor')}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 focus:outline-none"
          >
            <option value="all">كل حالات الـ SEO</option>
            <option value="good">ممتاز (80-100)</option>
            <option value="average">متوسط (60-79)</option>
            <option value="poor">يحتاج تحسين (&lt; 60)</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-emerald-950 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تم تحديد {selectedIds.length} مقال</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs focus:outline-none"
            >
              <option value="">-- اختر إجراء مجمع --</option>
              {activeTab === 'trash' ? (
                <>
                  <option value="restore">استرجاع إلى المسودات</option>
                  <option value="delete">حذف نهائي لا رجعة فيه</option>
                </>
              ) : (
                <>
                  <option value="publish">تغيير الحالة إلى: منشور</option>
                  <option value="draft">تغيير الحالة إلى: مسودة</option>
                  <option value="trash">نقل لسلة المهملات</option>
                  <option value="delete">حذف نهائي</option>
                </>
              )}
            </select>

            <button
              type="button"
              onClick={handleExecuteBulk}
              disabled={!bulkAction}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-2xs transition-colors disabled:opacity-50"
            >
              تنفيذ الإجراء
            </button>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredPosts.length > 0 && selectedIds.length === filteredPosts.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                </th>
                <th className="py-3.5 px-3 w-16">الصورة</th>
                <th className="py-3.5 px-4">عنوان المقال ورابط الـ Slug</th>
                <th className="py-3.5 px-4">التصنيف</th>
                <th className="py-3.5 px-4">الوسوم</th>
                <th className="py-3.5 px-4">الكاتب</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4">المشاهدات</th>
                <th className="py-3.5 px-4">تقييم SEO</th>
                <th className="py-3.5 px-4">تاريخ النشر</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    جاري تحميل المقالات...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    لا توجد مقالات مطابقة للمعايير المحددة.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const isChecked = selectedIds.includes(post.id);
                  const seoScore = post.seoScore || 85;
                  const seoBadgeColor =
                    seoScore >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : seoScore >= 60
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200';

                  return (
                    <tr
                      key={post.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isChecked ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(post.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                      </td>

                      {/* Featured Image Thumbnail */}
                      <td className="py-3 px-3">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage}
                            alt={post.featuredImageAlt || post.titleAr}
                            className="w-12 h-9 rounded-lg object-cover border border-slate-200 shadow-2xs"
                          />
                        ) : (
                          <div className="w-12 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      {/* Title & Slug */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1 hover:text-emerald-700">
                          <Link to={`/blog/edit/${post.id}`}>{post.titleAr}</Link>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono ltr text-right mt-0.5 truncate" dir="ltr">
                          /blog/{post.slug}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {post.category ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                            {post.category.nameAr}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Tags */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {post.tags && post.tags.length > 0 ? (
                            post.tags.slice(0, 2).map((t) => (
                              <span
                                key={t.id}
                                className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-medium"
                              >
                                #{t.nameAr}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                          {post.tags && post.tags.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {post.author?.avatarUrl ? (
                            <img
                              src={post.author.avatarUrl}
                              alt={post.author.nameAr}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
                              A
                            </div>
                          )}
                          <span className="text-slate-700 font-medium">{post.author?.nameAr || 'المدير'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : post.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : post.status === 'archived'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {post.status === 'published'
                            ? 'منشور'
                            : post.status === 'scheduled'
                            ? 'مجدول'
                            : post.status === 'archived'
                            ? 'محذوف'
                            : 'مسودة'}
                        </span>
                      </td>

                      {/* Views */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                        {post.viewsCount.toLocaleString('ar-EG')}
                      </td>

                      {/* SEO Score */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${seoBadgeColor}`}
                        >
                          {seoScore} / 100
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString('ar-EG')
                          : new Date(post.createdAt).toLocaleDateString('ar-EG')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            title="معاينة حية للمقال"
                            onClick={() => setPreviewingPost(post)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <Link
                            to={`/blog/edit/${post.id}`}
                            title="تعديل المقال"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            title="تكرار / نسخ كمسودة"
                            onClick={() => handleDuplicate(post.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {activeTab === 'trash' ? (
                            <>
                              <button
                                type="button"
                                title="استرجاع المقال من المهملات"
                                onClick={() => handleRestore(post.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="حذف نهائي"
                                onClick={() => handleDeletePermanent(post.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              title="نقل لسلة المهملات"
                              onClick={() => handleMoveToTrash(post.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Preview Modal */}
      {previewingPost && (
        <ArticlePreviewModal
          post={previewingPost}
          onClose={() => setPreviewingPost(null)}
        />
      )}
    </div>
  );
}
