import { useEffect, useMemo, useState } from 'react';
import { Code2, Save, RefreshCw, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api, SITE_URL } from '../../lib/api';
import { useToast } from '../../shared/components/ui/Toast';

type Place = 'head' | 'body' | 'footer';
type Codes = Record<Place, string>;

const FIELDS: Array<{ key: Place; title: string; where: string; hint: string; placeholder: string }> = [
  {
    key: 'head',
    title: 'أكواد الهيدر',
    where: 'جوه <head> في كل صفحات الموقع',
    hint: 'هنا أغلب الأكواد: Google Tag Manager، Meta (Facebook / Instagram) Pixel، TikTok Pixel، Google Ads (gtag)، Snapchat Pixel، وكود توثيق Google Search Console.',
    placeholder: '<!-- Meta Pixel Code -->\n<script>\n  !function(f,b,e,v,n,t,s){...}\n  fbq(\'init\', \'YOUR_PIXEL_ID\');\n  fbq(\'track\', \'PageView\');\n</script>',
  },
  {
    key: 'body',
    title: 'أكواد أول البادي',
    where: 'بعد <body> مباشرة',
    hint: 'الأكواد اللي المنصة بتقول تتحط "بعد فتح body"، زي جزء <noscript> بتاع Google Tag Manager.',
    placeholder: '<!-- Google Tag Manager (noscript) -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX" ...></iframe></noscript>',
  },
  {
    key: 'footer',
    title: 'أكواد الفوتر',
    where: 'قبل </body> في آخر الصفحة',
    hint: 'للأكواد اللي مش لازم تحمّل الأول: ويدجت الشات، أكواد التحويلات الإضافية، أي سكريبت تقيل.',
    placeholder: '<script src="https://example.com/chat-widget.js" async></script>',
  },
];

// What the admin pasted, recognised so they can see at a glance it's in place
const PLATFORMS: Array<{ name: string; test: RegExp }> = [
  { name: 'Google Tag Manager', test: /googletagmanager\.com\/(gtm|ns)\.|GTM-[A-Z0-9]+/i },
  { name: 'Google Ads / Analytics (gtag)', test: /gtag\(|googletagmanager\.com\/gtag\/js|AW-\d+|G-[A-Z0-9]{6,}/ },
  { name: 'Meta Pixel (Facebook / Instagram)', test: /fbq\(|connect\.facebook\.net/ },
  { name: 'TikTok Pixel', test: /ttq\.|analytics\.tiktok\.com/ },
  { name: 'Snapchat Pixel', test: /snaptr\(|sc-static\.net/ },
  { name: 'Google Search Console', test: /google-site-verification/ },
];

function problems(code: string): string[] {
  const out: string[] = [];
  const open = (code.match(/<script\b/gi) || []).length;
  const close = (code.match(/<\/script>/gi) || []).length;
  if (open !== close) out.push(`عدد <script> (${open}) مش زي عدد </script> (${close}) — غالباً الكود اتنسخ ناقص.`);
  const nsOpen = (code.match(/<noscript\b/gi) || []).length;
  const nsClose = (code.match(/<\/noscript>/gi) || []).length;
  if (nsOpen !== nsClose) out.push('فيه <noscript> مش مقفول.');
  return out;
}

export function TrackingCodesPage() {
  const toast = useToast();
  const [saved, setSaved] = useState<Codes>({ head: '', body: '', footer: '' });
  const [codes, setCodes] = useState<Codes>({ head: '', body: '', footer: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dirty = (Object.keys(codes) as Place[]).some((k) => codes[k] !== saved[k]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getTrackingCodes();
      setSaved(data);
      setCodes(data);
    } catch (e: any) {
      toast.error(e.message || 'تعذر تحميل الأكواد');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const data = await api.updateTrackingCodes(codes);
      setSaved(data);
      setCodes(data);
      toast.success('اتحفظت الأكواد وظهرت على الموقع');
    } catch (e: any) {
      toast.error(e.message || 'تعذر حفظ الأكواد');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Ctrl/Cmd + S saves; warn before leaving with unsaved code
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (dirty && !saving) save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', onLeave);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('beforeunload', onLeave);
    };
  });

  const detected = useMemo(() => {
    const all = `${codes.head}\n${codes.body}\n${codes.footer}`;
    return PLATFORMS.filter((p) => p.test.test(all)).map((p) => p.name);
  }, [codes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-emerald-600" />
            أكواد التتبع (الهيدر والفوتر)
          </h1>
          <p className="text-sm text-slate-500 mt-1">الصق أكواد Google وMeta وTikTok وغيرها هنا، وبعد الحفظ بتظهر في كل صفحات الموقع على طول.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <ExternalLink className="w-3.5 h-3.5" /> افتح الموقع
          </a>
          <button onClick={load} disabled={loading || saving} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> تحديث
          </button>
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'جاري الحفظ…' : dirty ? 'حفظ ونشر' : 'محفوظ'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 flex gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>الأكواد دي بتشتغل على الموقع زي ما هي. انسخ الكود من المنصة نفسها (Google / Meta / TikTok) كامل، وما تحطش نفس الكود مرتين عشان الزيارات ما تتحسبش مرتين.</span>
      </div>

      {detected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-600">متركب على الموقع:</span>
          {detected.map((d) => (
            <span key={d} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> {d}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-5">
        {FIELDS.map((f) => {
          const issues = problems(codes[f.key]);
          const changed = codes[f.key] !== saved[f.key];
          return (
            <section key={f.key} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    {f.title}
                    {changed && <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">غير محفوظ</span>}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl">{f.hint}</p>
                </div>
                <code className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded" dir="ltr">
                  {f.where}
                </code>
              </div>
              <textarea
                dir="ltr"
                spellCheck={false}
                aria-label={f.title}
                value={codes[f.key]}
                onChange={(e) => setCodes((c) => ({ ...c, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                rows={f.key === 'body' ? 5 : 9}
                disabled={loading}
                className="w-full block px-5 py-4 font-mono text-xs leading-relaxed text-slate-800 bg-slate-50/50 placeholder:text-slate-300 focus:outline-none focus:bg-white resize-y"
              />
              <div className="px-5 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{codes[f.key].length.toLocaleString('en-US')} / 50,000 حرف</span>
                {issues.length > 0 && <span className="text-rose-600 font-semibold">{issues.join(' ')}</span>}
              </div>
            </section>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-400">اختصار: Ctrl + S (أو ⌘ + S) للحفظ.</p>
    </div>
  );
}
