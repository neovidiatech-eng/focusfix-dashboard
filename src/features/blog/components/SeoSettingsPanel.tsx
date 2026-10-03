import { useState, useMemo } from 'react';
import {
  Globe,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  Search,
} from 'lucide-react';
import { SeoAuditReport, SeoCheckResult } from '../types/blog.types';

interface SeoSettingsPanelProps {
  title: string;
  slug: string;
  contentHtml: string;
  excerpt: string;
  featuredImageAlt?: string;
  focusKeyword: string;
  seoTitle: string;
  seoDesc: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  onChangeFocusKeyword: (val: string) => void;
  onChangeSeoTitle: (val: string) => void;
  onChangeSeoDesc: (val: string) => void;
  onChangeCanonicalUrl: (val: string) => void;
  onChangeRobotsIndex: (val: boolean) => void;
  onChangeRobotsFollow: (val: boolean) => void;
}

export function SeoSettingsPanel({
  title,
  slug,
  contentHtml,
  featuredImageAlt,
  focusKeyword,
  seoTitle,
  seoDesc,
  canonicalUrl,
  robotsIndex,
  robotsFollow,
  onChangeFocusKeyword,
  onChangeSeoTitle,
  onChangeSeoDesc,
  onChangeCanonicalUrl,
  onChangeRobotsIndex,
  onChangeRobotsFollow,
}: SeoSettingsPanelProps) {
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'general' | 'advanced' | 'checklist'>('checklist');

  const displayTitle = seoTitle || title || 'عنوان المقال التجريبي - FocusFix';
  const displayDesc =
    seoDesc ||
    'احصل على أفضل خدمة صيانة أجهزة أبل أمام منزلك في القاهرة والجيزة بقطع أصلية وضمان رسمي.';
  const displayUrl = `https://focusfix.net/blog/${slug || 'article-slug'}`;

  // Real-time SEO analysis engine
  const seoReport: SeoAuditReport = useMemo(() => {
    const checks: SeoCheckResult[] = [];
    const keyword = (focusKeyword || '').trim().toLowerCase();
    const cleanTitle = (title || '').toLowerCase();
    const cleanSlug = (slug || '').toLowerCase();
    const cleanDesc = (seoDesc || '').toLowerCase();

    // Strip HTML to count words & inspect text
    const textContent = contentHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const wordsCount = textContent ? textContent.split(/\s+/).length : 0;

    // Check 1: Single H1 check
    const h1CountInContent = (contentHtml.match(/<h1[^>]*>/gi) || []).length;
    checks.push({
      id: 'single-h1',
      titleAr: 'عنوان رئيسي H1 واحد فقط',
      titleEn: 'Single H1 structure',
      passed: h1CountInContent === 0, // Content must have ZERO H1 because page title is the single H1!
      importance: 'critical',
      messageAr:
        h1CountInContent === 0
          ? 'ممتاز: عنوان المقال هو الـ H1 الوحيد في الصفحة ولا توجد H1 داخلية مخالفة.'
          : 'تحذير SEO: تم العثور على وسوم H1 داخل المحتوى، يجب إزالتها والاعتماد على H2 فقط.',
      messageEn:
        h1CountInContent === 0
          ? 'Single H1 preserved (Article title only).'
          : 'Multiple H1 tags detected. Switch body headings to H2.',
    });

    // Check 2: Focus Keyword Presence
    checks.push({
      id: 'has-keyword',
      titleAr: 'تحديد الكلمة المفتاحية المستهدفة',
      titleEn: 'Target Keyword Specified',
      passed: Boolean(keyword),
      importance: 'critical',
      messageAr: keyword ? `الكلمة المفتاحية المستهدفة: "${focusKeyword}"` : 'يرجى تحديد كلمة مفتاحية مستهدفة للمقال.',
      messageEn: keyword ? `Focus keyword: "${focusKeyword}"` : 'Specify a target keyword.',
    });

    if (keyword) {
      // Check 3: Keyword in Title
      const inTitle = Boolean(cleanTitle.includes(keyword) || (seoTitle && seoTitle.toLowerCase().includes(keyword)));
      checks.push({
        id: 'keyword-in-title',
        titleAr: 'الكلمة المفتاحية في العنوان الرئيسي',
        titleEn: 'Keyword in Title',
        passed: inTitle,
        importance: 'critical',
        messageAr: inTitle
          ? 'الكلمة المفتاحية موجودة في عنوان المقال بنجاح.'
          : 'يفضل تضمين الكلمة المفتاحية في بداية عنوان المقال.',
        messageEn: inTitle ? 'Keyword present in title.' : 'Include keyword in the title.',
      });

      // Check 4: Keyword in Slug
      const inSlug = cleanSlug.includes(encodeURIComponent(keyword)) || cleanSlug.includes(keyword.replace(/\s+/g, '-'));
      checks.push({
        id: 'keyword-in-slug',
        titleAr: 'الكلمة المفتاحية في رابط الـ Slug',
        titleEn: 'Keyword in URL Slug',
        passed: inSlug,
        importance: 'recommended',
        messageAr: inSlug
          ? 'الرابط المختصر يحتوي على الكلمة المستهدفة.'
          : 'يفضل أن يحتوي رابط المقال (Slug) على الكلمة المفتاحية.',
        messageEn: inSlug ? 'Keyword in URL slug.' : 'Include keyword in slug.',
      });

      // Check 5: Keyword in Meta Description
      const inDesc = cleanDesc.includes(keyword);
      checks.push({
        id: 'keyword-in-desc',
        titleAr: 'الكلمة المفتاحية في الوصف التعريفي (Meta Description)',
        titleEn: 'Keyword in Meta Description',
        passed: inDesc,
        importance: 'recommended',
        messageAr: inDesc
          ? 'الكلمة المفتاحية موجودة في وصف محرك البحث.'
          : 'احرص على ذكر الكلمة المفتاحية في Meta Description لجذب النقرات CTR.',
        messageEn: inDesc ? 'Keyword found in Meta Description.' : 'Mention keyword in meta description.',
      });

      // Check 6: Keyword in first paragraph
      const firstParagraph = contentHtml.match(/<p>(.*?)<\/p>/i)?.[1]?.toLowerCase() || '';
      const inFirstP = firstParagraph.includes(keyword);
      checks.push({
        id: 'keyword-in-first-p',
        titleAr: 'الكلمة المفتاحية في الفقرة الأولى',
        titleEn: 'Keyword in first paragraph',
        passed: inFirstP,
        importance: 'optional',
        messageAr: inFirstP
          ? 'ظهرت الكلمة المفتاحية مبكرًا في مقدمة المقال.'
          : 'يفضل ذكر الكلمة المفتاحية خلال أول 100 كلمة من المقال.',
        messageEn: inFirstP ? 'Keyword in intro paragraph.' : 'Mention keyword in first 100 words.',
      });
    }

    // Check 7: Headings H2 structure
    const hasH2 = /<h2[^>]*>/i.test(contentHtml);
    checks.push({
      id: 'headings-h2',
      titleAr: 'تقسيم المحتوى بترويسات H2',
      titleEn: 'Subheadings (H2)',
      passed: hasH2,
      importance: 'recommended',
      messageAr: hasH2
        ? 'تم تقسيم المقال باستخدام ترويسات H2 لتسهيل القراءة وفهرسة جوجل.'
        : 'أضف عنوانًا فرعيًا H2 على الأقل لتنظيم المقال.',
      messageEn: hasH2 ? 'H2 headings exist.' : 'Add at least one H2 heading.',
    });

    // Check 8: Featured Image & Alt Text
    const hasAlt = Boolean(featuredImageAlt && featuredImageAlt.trim().length > 3);
    checks.push({
      id: 'featured-image-alt',
      titleAr: 'النص البديل للصورة البارزة (Alt Text)',
      titleEn: 'Featured Image Alt Text',
      passed: hasAlt,
      importance: 'recommended',
      messageAr: hasAlt
        ? 'الصورة البارزة تحتوي على نص بديل يصفها بدقة لمحركات البحث.'
        : 'أضف نصًا بديلاً (Alt Text) معبرًا للصورة البارزة.',
      messageEn: hasAlt ? 'Featured image has Alt Text.' : 'Add descriptive Alt Text to featured image.',
    });

    // Check 9: Internal Links
    const hasInternalLinks = /href=["'](\/|https?:\/\/(www\.)?focusfix\.net)/i.test(contentHtml);
    checks.push({
      id: 'internal-links',
      titleAr: 'روابط داخلية لصفحات الموقع (Internal Links)',
      titleEn: 'Internal links',
      passed: hasInternalLinks,
      importance: 'recommended',
      messageAr: hasInternalLinks
        ? 'المقال يحتوي على روابط لصفحات أو مقالات داخلية أخرى.'
        : 'أضف رابطًا داخليًا على الأقل لخدمات FocusFix أو مقالات ذات صلة.',
      messageEn: hasInternalLinks ? 'Internal links found.' : 'Add internal links to other pages.',
    });

    // Check 10: External Links
    const hasExternalLinks = /href=["']https?:\/\/(?!(www\.)?focusfix\.net)/i.test(contentHtml);
    checks.push({
      id: 'external-links',
      titleAr: 'روابط خارجية موثوقة (External Links)',
      titleEn: 'External links',
      passed: hasExternalLinks,
      importance: 'optional',
      messageAr: hasExternalLinks
        ? 'المقال يستشهد بمصادر وروابط خارجية موثوقة.'
        : 'استشهد بمصادر خارجية موثوقة لتعزيز موثوقية المقال.',
      messageEn: hasExternalLinks ? 'External links present.' : 'Optional: link to authority sources.',
    });

    // Check 11: Content length
    const goodLength = wordsCount >= 300;
    checks.push({
      id: 'word-count',
      titleAr: 'طول المحتوى (عدد الكلمات)',
      titleEn: 'Content Word Count',
      passed: goodLength,
      importance: 'recommended',
      messageAr: goodLength
        ? `طول المحتوى ممتاز (${wordsCount} كلمة) ويقدم قيمة تفصيلية للقارئ.`
        : `المحتوى قصير نسبيًا (${wordsCount} كلمة). يفضل الوصول إلى 300 كلمة على الأقل.`,
      messageEn: goodLength ? `Word count is good (${wordsCount} words).` : `Content is short (${wordsCount} words). Aim for 300+.`,
    });

    // Calculate score
    const passedCount = checks.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    return { score, checks };
  }, [focusKeyword, title, slug, contentHtml, featuredImageAlt, seoTitle, seoDesc]);

  // Score color helper
  const scoreColor =
    seoReport.score >= 80
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : seoReport.score >= 60
      ? 'text-amber-600 bg-amber-50 border-amber-200'
      : 'text-rose-600 bg-rose-50 border-rose-200';

  const progressBg =
    seoReport.score >= 80 ? 'bg-emerald-500' : seoReport.score >= 60 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header with Live Score */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">مساعد تحسين محركات البحث (SEO Suite)</h3>
            <p className="text-[11px] text-slate-500">فحص فوري للمعايير وتوليد المعاينة لمحركات البحث</p>
          </div>
        </div>

        {/* Real-time score badge */}
        <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${scoreColor}`}>
          <span>تقييم SEO:</span>
          <span>{seoReport.score}/100</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-100">
        <div
          className={`h-full transition-all duration-500 ${progressBg}`}
          style={{ width: `${seoReport.score}%` }}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-4 gap-1 text-xs font-semibold bg-slate-50/30">
        <button
          type="button"
          onClick={() => setActiveTab('checklist')}
          className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'checklist'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>قائمة التدقيق ({seoReport.checks.filter((c) => c.passed).length}/{seoReport.checks.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'preview'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>معاينة جوجل (SERP)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'general'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>البيانات الوصفية</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('advanced')}
          className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'advanced'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>توجيهات الروبوت</span>
        </button>
      </div>

      {/* Tab 1: Checklist */}
      {activeTab === 'checklist' && (
        <div className="p-4 space-y-2.5 max-h-96 overflow-y-auto">
          {seoReport.checks.map((chk) => (
            <div
              key={chk.id}
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-colors ${
                chk.passed
                  ? 'bg-emerald-50/40 border-emerald-100 text-slate-800'
                  : chk.importance === 'critical'
                  ? 'bg-rose-50/40 border-rose-200 text-slate-800'
                  : 'bg-amber-50/40 border-amber-200 text-slate-800'
              }`}
            >
              <div className="mt-0.5">
                {chk.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle
                    className={`w-4 h-4 shrink-0 ${
                      chk.importance === 'critical' ? 'text-rose-600' : 'text-amber-600'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{chk.titleAr}</span>
                  {chk.importance === 'critical' && !chk.passed && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-100/70 px-1.5 py-0.5 rounded">
                      حاسم
                    </span>
                  )}
                </div>
                <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">{chk.messageAr}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Google SERP Preview */}
      {activeTab === 'preview' && (
        <div className="p-5 space-y-4">
          {/* Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">شكل الظهور في نتائج بحث جوجل:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                  previewDevice === 'desktop' ? 'bg-white font-bold shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>كمبيوتر</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                  previewDevice === 'mobile' ? 'bg-white font-bold shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>موبايل</span>
              </button>
            </div>
          </div>

          {/* SERP Box - Authentic Google Styling */}
          <div
            className={`p-4 bg-white border border-slate-200 rounded-xl font-sans shadow-xs transition-all ${
              previewDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
            }`}
            dir="rtl"
          >
            {/* Google Site snippet header */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
                F
              </div>
              <div>
                <div className="text-xs text-slate-900 font-medium leading-none">FocusFix Egypt</div>
                <div className="text-[11px] text-slate-500 font-mono ltr text-right mt-0.5" dir="ltr">
                  {displayUrl}
                </div>
              </div>
            </div>

            {/* Title */}
            <h4 className="text-[#1a0dab] hover:underline cursor-pointer text-base font-medium leading-snug line-clamp-2 mt-1">
              {displayTitle}
            </h4>

            {/* Description */}
            <p className="text-xs text-[#4d5156] mt-1.5 leading-relaxed line-clamp-2">
              {displayDesc}
            </p>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            💡 ملاحظة: تحرص جوجل على عرض ما بين 50-60 حرفًا للعنوان، وما بين 140-160 حرفًا للوصف التعريفي.
          </div>
        </div>
      )}

      {/* Tab 3: General Metadata Fields */}
      {activeTab === 'general' && (
        <div className="p-5 space-y-4">
          {/* Focus Keyword */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>الكلمة المفتاحية المستهدفة (Focus Keyword)</span>
              <span className="text-[11px] text-emerald-600 font-normal">الكلمة الأساسية لمقالك</span>
            </label>
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => onChangeFocusKeyword(e.target.value)}
              placeholder="مثال: تغيير بطارية آيفون 16"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* SEO Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">عنوان السيو (SEO Title)</label>
              <span
                className={`text-[10px] font-mono ${
                  seoTitle.length >= 50 && seoTitle.length <= 60
                    ? 'text-emerald-600 font-bold'
                    : seoTitle.length > 60
                    ? 'text-rose-500'
                    : 'text-slate-400'
                }`}
              >
                {seoTitle.length} / 60 حرف
              </span>
            </div>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => onChangeSeoTitle(e.target.value)}
              placeholder={title || 'العنوان المخصص للظهور في محركات البحث'}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                الوصف التعريفي (Meta Description)
              </label>
              <span
                className={`text-[10px] font-mono ${
                  seoDesc.length >= 130 && seoDesc.length <= 160
                    ? 'text-emerald-600 font-bold'
                    : seoDesc.length > 160
                    ? 'text-rose-500'
                    : 'text-slate-400'
                }`}
              >
                {seoDesc.length} / 160 حرف
              </span>
            </div>
            <textarea
              rows={3}
              value={seoDesc}
              onChange={(e) => onChangeSeoDesc(e.target.value)}
              placeholder="ملخص جذاب يشجع مستخدم محرك بحث جوجل على النقر وزيارة موقعك..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Canonical URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>الرابط الأساسي (Canonical URL)</span>
              <span className="text-[10px] text-slate-400">اتركه فارغًا للاعتماد على الرابط الافتراضي</span>
            </label>
            <input
              type="text"
              value={canonicalUrl}
              onChange={(e) => onChangeCanonicalUrl(e.target.value)}
              placeholder={displayUrl}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-left ltr focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Advanced Robots Settings */}
      {activeTab === 'advanced' && (
        <div className="p-5 space-y-4">
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>توجيهات محركات البحث (Robots Meta Directives)</span>
            </h4>

            {/* Indexing */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={robotsIndex}
                onChange={(e) => onChangeRobotsIndex(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  السماح بفهرسة المقال في جوجل (Index)
                </span>
                <span className="text-[11px] text-slate-500">
                  {robotsIndex
                    ? 'سيظهر المقال في نتائج البحث بشكل طبيعي.'
                    : 'تنبيه: تم تعيين noindex وسيتم إخفاء هذا المقال من جميع نتائج البحث.'}
                </span>
              </div>
            </label>

            {/* Follow */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                checked={robotsFollow}
                onChange={(e) => onChangeRobotsFollow(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  تتبع الروابط الموجودة داخل المقال (Follow)
                </span>
                <span className="text-[11px] text-slate-500">
                  {robotsFollow
                    ? 'تتبع محركات البحث لكافة الروابط الداخلية والخارجية.'
                    : 'عدم تتبع محركات البحث للروابط (nofollow على مستوى الصفحة بالكامل).'}
                </span>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
