import { Save, Phone, Mail, Globe, Shield } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">المحتوى والإعدادات العامة</h1>
        <p className="text-sm text-slate-500 mt-1">
          إعدادات المنصة، أرقام التواصل، إيميلات التنبيهات، وأكواد التتبع
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 max-w-3xl">
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>بيانات التواصل والتشغيل</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                رقم الهاتف والواتساب الأساسي
              </label>
              <input
                type="text"
                defaultValue="+201009911934"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الدومين الأساسي للمنصة
              </label>
              <input
                type="text"
                defaultValue="https://focusfix.net"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>إيميلات استقبال تنبيهات الأدمن</span>
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              قائمة الإيميلات (مفصولة بفواصل)
            </label>
            <input
              type="text"
              defaultValue="admin@focusfix.net, alerts@focusfix.net"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              يتم إرسال إشعار فوري لهذه الإيميلات عند وصول أي حجز جديد أو رسالة تواصل
            </p>
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
                defaultValue="12h"
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
                سعة الحجوزات القصوى لكل فترة (Slot)
              </label>
              <input
                type="number"
                defaultValue={3}
                min={1}
                max={10}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                من الساعة
              </label>
              <input
                type="time"
                defaultValue="10:00"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                إلى الساعة
              </label>
              <input
                type="time"
                defaultValue="18:00"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              أيام العمل الأسبوعية
            </label>
            <div className="flex flex-wrap gap-2 text-xs">
              {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day, i) => (
                <label key={i} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked={i < 5} className="text-emerald-600 rounded" />
                  <span>{day}</span>
                </label>
              ))}
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
                defaultChecked={true}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span>تفعيل الشريط أعلى الهيدر</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              نص الإعلان والعرض (Text)
            </label>
            <input
              type="text"
              defaultValue="خصم حصري 15% على صيانة أجهزة آيفون اليوم + فحص فوري وقطع غيار أصلية بضمان عام كامل"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                نص الشارة البارزة (Badge Text)
              </label>
              <input
                type="text"
                defaultValue="خدمة الطوارئ متوفرة الآن 24/7"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                رابط التوجيه عند النقر (Link)
              </label>
              <input
                type="text"
                defaultValue="/book"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              لون وشكل الشريط (Color Theme)
            </label>
            <select
              defaultValue="amber"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="amber">برتقالي ذهبي متدرج (كما بالصورة - Amber Gold)</option>
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
            <div className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2.5 rounded-xl flex items-center justify-center gap-3 text-xs sm:text-sm font-bold shadow-sm">
              <span className="flex items-center gap-1">⚡ خصم حصري 15% على صيانة أجهزة آيفون اليوم + فحص فوري وقطع غيار أصلية بضمان عام كامل</span>
              <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-slate-950/80 text-amber-300 text-[11px] font-bold">
                خدمة الطوارئ متوفرة الآن 24/7
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-700">
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </div>
    </div>
  );
}
