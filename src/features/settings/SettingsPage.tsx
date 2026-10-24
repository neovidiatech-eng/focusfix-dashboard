import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Save, Phone, Globe, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';

export function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [phone, setPhone] = useState('+201009911934');
  const [whatsapp, setWhatsapp] = useState('201009911934');
  const [domain, setDomain] = useState('https://focusfix.net');
  const [supportEmail, setSupportEmail] = useState('support@focusfix.net');
  const [workingHoursMode, setWorkingHoursMode] = useState('12h');
  const [workingHoursStart, setWorkingHoursStart] = useState('10:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('18:00');
  const [slotCapacity, setSlotCapacity] = useState('3');
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [bannerText, setBannerText] = useState('خصم حصري 15% على صيانة أجهزة آيفون اليوم + فحص فوري وقطع غيار أصلية بضمان عام كامل');
  const [bannerTextEn, setBannerTextEn] = useState('Exclusive 15% OFF iPhone repairs today + instant inspection & genuine parts with 1-Year warranty');
  const [bannerBadge, setBannerBadge] = useState('خدمة الطوارئ متوفرة الآن 24/7');
  const [bannerBadgeEn, setBannerBadgeEn] = useState('Emergency 24/7 Service Available');
  const [bannerLink, setBannerLink] = useState('/book');
  const [bannerColorTheme, setBannerColorTheme] = useState('amber');

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSettings();
      if (Array.isArray(data)) {
        const map: Record<string, string> = {};
        data.forEach((item: { key: string; value: string }) => {
          map[item.key] = item.value;
        });

        if (map.phone) setPhone(map.phone);
        if (map.whatsapp) setWhatsapp(map.whatsapp);
        if (map.domain) setDomain(map.domain);
        if (map.supportEmail) setSupportEmail(map.supportEmail);
        if (map.working_hours_mode) setWorkingHoursMode(map.working_hours_mode);
        if (map.working_hours_start) setWorkingHoursStart(map.working_hours_start);
        if (map.working_hours_end) setWorkingHoursEnd(map.working_hours_end);
        if (map.slot_capacity) setSlotCapacity(map.slot_capacity);
        if (map.banner_enabled !== undefined) setBannerEnabled(map.banner_enabled === 'true');
        if (map.banner_text) setBannerText(map.banner_text);
        if (map.banner_text_en) setBannerTextEn(map.banner_text_en);
        if (map.banner_badge) setBannerBadge(map.banner_badge);
        if (map.banner_badge_en) setBannerBadgeEn(map.banner_badge_en);
        if (map.banner_link) setBannerLink(map.banner_link);
        if (map.banner_bg_color) {
          if (map.banner_bg_color.includes('emerald')) setBannerColorTheme('emerald');
          else if (map.banner_bg_color.includes('blue')) setBannerColorTheme('blue');
          else if (map.banner_bg_color.includes('slate')) setBannerColorTheme('dark');
          else setBannerColorTheme('amber');
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    let bgColor = 'from-amber-500 via-amber-400 to-amber-500';
    if (bannerColorTheme === 'emerald') bgColor = 'from-emerald-600 via-emerald-500 to-emerald-600';
    if (bannerColorTheme === 'blue') bgColor = 'from-blue-600 via-indigo-600 to-blue-700';
    if (bannerColorTheme === 'dark') bgColor = 'from-slate-900 via-slate-800 to-slate-950';

    const updates = [
      { key: 'phone', value: phone },
      { key: 'whatsapp', value: whatsapp },
      { key: 'domain', value: domain },
      { key: 'supportEmail', value: supportEmail },
      { key: 'working_hours_mode', value: workingHoursMode },
      { key: 'working_hours_start', value: workingHoursStart },
      { key: 'working_hours_end', value: workingHoursEnd },
      { key: 'slot_capacity', value: slotCapacity },
      { key: 'banner_enabled', value: String(bannerEnabled) },
      { key: 'banner_text', value: bannerText },
      { key: 'banner_text_en', value: bannerTextEn },
      { key: 'banner_badge', value: bannerBadge },
      { key: 'banner_badge_en', value: bannerBadgeEn },
      { key: 'banner_link', value: bannerLink },
      { key: 'banner_bg_color', value: bgColor },
    ];

    try {
      await api.updateSettings(updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      alert('حدث خطأ أثناء حفظ الإعدادات، يرجى المحاولة لاحقاً');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المحتوى والإعدادات العامة</h1>
          <p className="text-sm text-slate-500 mt-1">
            إعدادات المنصة المباشرة، أرقام التواصل، ساعات العمل، وشريط الإعلانات العلوي
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          إعادة تحميل
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
          جاري تحميل الإعدادات من السيرفر...
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 max-w-3xl">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              تم حفظ جميع الإعدادات وتحديث المنصة بنجاح!
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>بيانات التواصل والتشغيل</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رقم الهاتف الأساسي
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رقم الواتساب (بدون +)
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الدومين الأساسي للمنصة
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  إيميل الدعم الفني
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Working Hours & Slot Capacity */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>ساعات العمل ومواعيد استقبال الحجوزات</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نظام ساعات العمل
                </label>
                <select
                  value={workingHoursMode}
                  onChange={(e) => setWorkingHoursMode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="24h">خدمة على مدار 24 ساعة (24h)</option>
                  <option value="12h">خدمة 12 ساعة (من 10:00 ص إلى 10:00 م)</option>
                  <option value="8h">خدمة 8 ساعات (من 10:00 ص إلى 06:00 م)</option>
                  <option value="custom">مخصص (تحديد الساعات يدوياً)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  سعة الحجوزات القصوى لكل فترة (Slot Capacity)
                </label>
                <input
                  type="number"
                  value={slotCapacity}
                  onChange={(e) => setSlotCapacity(e.target.value)}
                  min={1}
                  max={20}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  من الساعة
                </label>
                <input
                  type="time"
                  value={workingHoursStart}
                  onChange={(e) => setWorkingHoursStart(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  إلى الساعة
                </label>
                <input
                  type="time"
                  value={workingHoursEnd}
                  onChange={(e) => setWorkingHoursEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Announcement Banner Management */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <span>شريط الإعلانات العلوي بالموقع (Top Announcement Bar)</span>
              </h2>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bannerEnabled}
                  onChange={(e) => setBannerEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span>تفعيل الشريط أعلى الهيدر</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نص الإعلان (بالعربية - Arabic)
                </label>
                <input
                  type="text"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نص الإعلان (بالإنجليزية - English)
                </label>
                <input
                  type="text"
                  value={bannerTextEn}
                  onChange={(e) => setBannerTextEn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نص الشارة (بالعربية)
                </label>
                <input
                  type="text"
                  value={bannerBadge}
                  onChange={(e) => setBannerBadge(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نص الشارة (بالإنجليزية)
                </label>
                <input
                  type="text"
                  value={bannerBadgeEn}
                  onChange={(e) => setBannerBadgeEn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رابط التوجيه (Link URL)
                </label>
                <input
                  type="text"
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                لون وشكل الشريط (Color Theme)
              </label>
              <select
                value={bannerColorTheme}
                onChange={(e) => setBannerColorTheme(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="amber">برتقالي ذهبي متدرج (Amber Gold)</option>
                <option value="emerald">أخضر زمردي فاخر (Emerald Green)</option>
                <option value="blue">أزرق داكن تقني (Navy Blue)</option>
                <option value="dark">أسود كربوني (Carbon Dark)</option>
              </select>
            </div>

            {/* Live Preview */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                معاينة حية للشريط كما سيظهر لزوار الموقع:
              </label>
              <div
                className={`w-full px-4 py-2.5 rounded-xl flex items-center justify-center gap-3 text-xs sm:text-sm font-bold shadow-sm ${
                  bannerColorTheme === 'emerald'
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white'
                    : bannerColorTheme === 'blue'
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white'
                    : bannerColorTheme === 'dark'
                    ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-amber-400'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950'
                }`}
              >
                <span className="flex items-center gap-1">⚡ {bannerText}</span>
                <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-slate-950/80 text-amber-300 text-[11px] font-bold">
                  {bannerBadge}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
