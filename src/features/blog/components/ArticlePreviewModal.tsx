import { useState } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Calendar,
  Clock,
  User,
  Share2,
  Bookmark,
  ChevronLeft,
} from 'lucide-react';
import { BlogPost } from '../types/blog.types';

interface ArticlePreviewModalProps {
  post: Partial<BlogPost>;
  onClose: () => void;
}

export function ArticlePreviewModal({ post, onClose }: ArticlePreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const readingTime = post.readingMinutes || 4;
  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'تاريخ النشر الافتراضي';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between">
      {/* Top Preview Control Bar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between text-white select-none">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-emerald-400">معاينة المقال الحية (Live Public Preview)</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {post.slug ? `/blog/${post.slug}` : '/blog/draft'}
          </span>
        </div>

        {/* Viewport switch */}
        <div className="flex bg-slate-800 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              device === 'desktop' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>عرض الحاسوب (Desktop)</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              device === 'mobile' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>عرض الموبايل (Mobile)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950/40 flex justify-center">
        <div
          className={`bg-white text-slate-900 shadow-2xl transition-all duration-300 overflow-hidden ${
            device === 'mobile'
              ? 'w-[390px] rounded-[40px] border-[10px] border-slate-800 shadow-2xl min-h-[844px] my-auto'
              : 'w-full max-w-4xl rounded-2xl border border-slate-200'
          }`}
          dir="rtl"
        >
          {/* Mock Public Website Navbar */}
          <div className="border-b border-slate-100 px-6 py-3.5 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-sm">
                F
              </div>
              <span className="font-bold text-slate-900 text-sm">FocusFix</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>الرئيسية</span>
              <ChevronLeft className="w-3 h-3 text-slate-400" />
              <span>المدونة</span>
              {post.category && (
                <>
                  <ChevronLeft className="w-3 h-3 text-slate-400" />
                  <span className="text-emerald-700 font-medium">{post.category.nameAr}</span>
                </>
              )}
            </div>
          </div>

          {/* Article View Header */}
          <article className="p-6 md:p-12 space-y-6">
            {/* Category badge & Reading time */}
            <div className="flex flex-wrap items-center gap-3">
              {post.category && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {post.category.nameAr}
                </span>
              )}
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{readingTime} دقائق قراءة</span>
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{publishDate}</span>
              </span>
            </div>

            {/* Single H1 Title */}
            <h1 className="text-2xl md:text-4xl font-black text-slate-950 leading-tight">
              {post.titleAr || 'عنوان المقال التجريبي هنا'}
            </h1>

            {/* Excerpt */}
            {post.excerptAr && (
              <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium border-r-4 border-emerald-500 pr-4">
                {post.excerptAr}
              </p>
            )}

            {/* Author Bar */}
            <div className="flex items-center justify-between py-4 border-y border-slate-100">
              <div className="flex items-center gap-3">
                {post.author?.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.nameAr}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{post.author?.nameAr || 'فريق FocusFix'}</h4>
                  <p className="text-xs text-slate-500">{post.author?.roleTitle || 'خبير معتمد'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="مشاركة المقال"
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="حفظ المقال"
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <figure className="space-y-2">
                <div className="rounded-2xl overflow-hidden shadow-md aspect-video">
                  <img
                    src={post.featuredImage}
                    alt={post.featuredImageAlt || post.titleAr}
                    className="w-full h-full object-cover"
                  />
                </div>
                {post.featuredImageCaption && (
                  <figcaption className="text-center text-xs text-slate-500 italic">
                    {post.featuredImageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Article Body Content */}
            <div
              className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-base pt-4 border-t border-slate-100"
              dangerouslySetInnerHTML={{ __html: post.contentHtml || '<p>لا يوجد محتوى مكتوب حتى الآن.</p>' }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-600 block">الوسوم والكلمات الدلالية:</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <span
                      key={t.id}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      #{t.nameAr}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
