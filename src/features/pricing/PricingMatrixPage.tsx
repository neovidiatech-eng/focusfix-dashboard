import { useState } from 'react';
import {
  Save,
  RotateCcw,
  FileSpreadsheet,
  Upload,
  Search,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface CellData {
  price: number;
  discountPrice?: number;
  warrantyDays: number;
  status: 'available' | 'included' | 'on_request' | 'unavailable';
  note?: string;
}

export function PricingMatrixPage() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(true);
  const [unsavedCount, setUnsavedCount] = useState<number>(3);
  const [search, setSearch] = useState<string>('');

  const services = [
    { id: 'screen', name: 'تغيير شاشة' },
    { id: 'battery', name: 'تغيير بطارية' },
    { id: 'back', name: 'تغيير ظهر ليزر' },
    { id: 'camera', name: 'صيانة كاميرا' },
    { id: 'charging', name: 'فلكس شحن' },
  ];

  const models = [
    { id: 'ip-16-pm', series: 'iPhone 16 Series', name: 'iPhone 16 Pro Max' },
    { id: 'ip-16-p', series: 'iPhone 16 Series', name: 'iPhone 16 Pro' },
    { id: 'ip-15-pm', series: 'iPhone 15 Series', name: 'iPhone 15 Pro Max' },
    { id: 'ip-15-p', series: 'iPhone 15 Series', name: 'iPhone 15 Pro' },
    { id: 'ip-14-pm', series: 'iPhone 14 Series', name: 'iPhone 14 Pro Max' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner if unsaved */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 text-amber-800 text-sm font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>لديك {unsavedCount} تعديلات في الأسعار غير محفوظة. لن تظهر على الموقع إلا بعد الحفظ.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHasUnsavedChanges(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تراجع</span>
            </button>
            <button
              onClick={() => setHasUnsavedChanges(false)}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ ونشر التعديلات فوراً</span>
            </button>
          </div>
        </div>
      )}

      {/* Header & Excel tools */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مصفوفة الأسعار (Pricing Matrix)</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة وتحديث أسعار الصيانة، مدد الضمان، والخصومات لجميع الموديلات
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>استيراد Excel مع معاينة</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن موديل..."
            className="w-full pl-4 pr-10 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          💡 يمكنك النقر على أي خلية لتعديل السعر والضمان مباشرة.
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm border-collapse">
            <thead className="bg-slate-800 text-white font-semibold">
              <tr>
                <th className="py-3 px-4 w-60 border-l border-slate-700">الموديل والسلسلة</th>
                {services.map((s) => (
                  <th key={s.id} className="py-3 px-4 text-center border-l border-slate-700 last:border-l-0 min-w-[140px]">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 bg-slate-50 border-l border-slate-200 font-bold text-slate-900">
                    <div>{m.name}</div>
                    <div className="text-[11px] font-normal text-slate-500">{m.series}</div>
                  </td>
                  {services.map((s, idx) => {
                    const price = (idx + 1) * 2200 + (m.id === 'ip-16-pm' ? 3000 : 0);
                    return (
                      <td key={s.id} className="p-2 border-l border-slate-100 last:border-l-0 text-center">
                        <div className="border border-slate-200 rounded-lg p-2 bg-white hover:border-emerald-500 hover:shadow-sm cursor-pointer transition-all">
                          <div className="font-extrabold text-slate-900 text-sm">
                            {price.toLocaleString()} ج.م
                          </div>
                          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                            ضمان 6 شهور
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
