import { useState } from 'react';
import {
  Save,
  FileSpreadsheet,
  Upload,
  Search,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

interface MatrixRow {
  modelId: string;
  modelName: string;
  series: string;
  prices: Record<string, { price: number; warranty: string; status: 'available' | 'on_request' | 'unavailable' }>;
}

export function PricingMatrixPage() {
  const [search, setSearch] = useState<string>('');
  const [isAddPriceModalOpen, setIsAddPriceModalOpen] = useState(false);

  const [services] = useState([
    { id: 'screen', nameAr: 'تغيير شاشة أصلية', nameEn: 'Screen Replacement' },
    { id: 'battery', nameAr: 'تغيير بطارية أبل', nameEn: 'Battery Replacement' },
    { id: 'back', nameAr: 'تغيير ظهر ليزر', nameEn: 'Back Glass' },
    { id: 'camera', nameAr: 'صيانة كاميرا', nameEn: 'Camera Repair' },
    { id: 'charging', nameAr: 'مدخل وفلكس شحن', nameEn: 'Charging Port' },
  ]);

  const [rows, setRows] = useState<MatrixRow[]>([
    {
      modelId: 'ip-16-pm',
      modelName: 'iPhone 16 Pro Max',
      series: 'iPhone 16 Series',
      prices: {
        screen: { price: 14500, warranty: '360 يوم', status: 'available' },
        battery: { price: 3800, warranty: '180 يوم', status: 'available' },
        back: { price: 3200, warranty: '180 يوم', status: 'available' },
        camera: { price: 4200, warranty: '90 يوم', status: 'available' },
        charging: { price: 2100, warranty: '90 يوم', status: 'available' },
      },
    },
    {
      modelId: 'ip-16-p',
      modelName: 'iPhone 16 Pro',
      series: 'iPhone 16 Series',
      prices: {
        screen: { price: 13200, warranty: '360 يوم', status: 'available' },
        battery: { price: 3600, warranty: '180 يوم', status: 'available' },
        back: { price: 2900, warranty: '180 يوم', status: 'available' },
        camera: { price: 3900, warranty: '90 يوم', status: 'available' },
        charging: { price: 1950, warranty: '90 يوم', status: 'available' },
      },
    },
    {
      modelId: 'ip-15-pm',
      modelName: 'iPhone 15 Pro Max',
      series: 'iPhone 15 Series',
      prices: {
        screen: { price: 9500, warranty: '360 يوم', status: 'available' },
        battery: { price: 2800, warranty: '180 يوم', status: 'available' },
        back: { price: 2400, warranty: '180 يوم', status: 'available' },
        camera: { price: 3100, warranty: '90 يوم', status: 'available' },
        charging: { price: 1750, warranty: '90 يوم', status: 'available' },
      },
    },
    {
      modelId: 'ip-15-p',
      modelName: 'iPhone 15 Pro',
      series: 'iPhone 15 Series',
      prices: {
        screen: { price: 8800, warranty: '360 يوم', status: 'available' },
        battery: { price: 2700, warranty: '180 يوم', status: 'available' },
        back: { price: 2200, warranty: '180 يوم', status: 'available' },
        camera: { price: 2900, warranty: '90 يوم', status: 'available' },
        charging: { price: 1650, warranty: '90 يوم', status: 'available' },
      },
    },
    {
      modelId: 'ip-14-pm',
      modelName: 'iPhone 14 Pro Max',
      series: 'iPhone 14 Series',
      prices: {
        screen: { price: 7800, warranty: '360 يوم', status: 'available' },
        battery: { price: 2400, warranty: '180 يوم', status: 'available' },
        back: { price: 1950, warranty: '180 يوم', status: 'available' },
        camera: { price: 2600, warranty: '90 يوم', status: 'available' },
        charging: { price: 1450, warranty: '90 يوم', status: 'available' },
      },
    },
  ]);

  // Modal Form States
  const [formModelId, setFormModelId] = useState('ip-16-pm');
  const [formServiceId, setFormServiceId] = useState('screen');
  const [formPrice, setFormPrice] = useState(5000);
  const [formWarranty, setFormWarranty] = useState('360 يوم');
  const [formStatus, setFormStatus] = useState<'available' | 'on_request' | 'unavailable'>('available');

  const handleSavePriceModal = (e: React.FormEvent) => {
    e.preventDefault();
    setRows((prev) =>
      prev.map((row) => {
        if (row.modelId === formModelId) {
          return {
            ...row,
            prices: {
              ...row.prices,
              [formServiceId]: {
                price: Number(formPrice),
                warranty: formWarranty,
                status: formStatus,
              },
            },
          };
        }
        return row;
      })
    );
    setIsAddPriceModalOpen(false);
  };

  const handleDeleteModelRow = (modelId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموديل وأسعاره بالكامل من المصفوفة؟')) {
      setRows((prev) => prev.filter((r) => r.modelId !== modelId));
    }
  };

  const filteredRows = rows.filter((r) =>
    r.modelName.toLowerCase().includes(search.toLowerCase()) ||
    r.series.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مصفوفة الأسعار (Pricing Matrix)</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة وتحديث أسعار الصيانة، مدد الضمان، والخصومات لجميع الموديلات
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setFormModelId(rows[0]?.modelId || '');
              setFormServiceId(services[0]?.id || '');
              setFormPrice(3500);
              setFormWarranty('360 يوم');
              setIsAddPriceModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة / تحديث سعر خدمة</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>استيراد Excel</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن موديل أو فئة..."
            className="w-full pl-4 pr-10 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          💡 يمكنك النقر على زر التعديل أو الحذف بجانب كل موديل وخدمة.
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
                  <th key={s.id} className="py-3 px-4 text-center border-l border-slate-700 last:border-l-0 min-w-[150px]">
                    <div>{s.nameAr}</div>
                    <div className="text-[10px] font-normal text-slate-400">{s.nameEn}</div>
                  </th>
                ))}
                <th className="py-3 px-4 text-center w-24">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRows.map((r) => (
                <tr key={r.modelId} className="hover:bg-slate-50">
                  <td className="py-3 px-4 bg-slate-50 border-l border-slate-200 font-bold text-slate-900">
                    <div>{r.modelName}</div>
                    <div className="text-[11px] font-normal text-slate-500">{r.series}</div>
                  </td>
                  {services.map((s) => {
                    const cell = r.prices[s.id];
                    return (
                      <td key={s.id} className="p-2 border-l border-slate-100 last:border-l-0 text-center">
                        {cell ? (
                          <div
                            onClick={() => {
                              setFormModelId(r.modelId);
                              setFormServiceId(s.id);
                              setFormPrice(cell.price);
                              setFormWarranty(cell.warranty);
                              setFormStatus(cell.status);
                              setIsAddPriceModalOpen(true);
                            }}
                            className="border border-slate-200 rounded-lg p-2 bg-white hover:border-emerald-500 hover:shadow-xs cursor-pointer transition-all group"
                          >
                            <div className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700">
                              {cell.price.toLocaleString()} ج.م
                            </div>
                            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                              {cell.warranty}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setFormModelId(r.modelId);
                              setFormServiceId(s.id);
                              setFormPrice(2000);
                              setFormWarranty('180 يوم');
                              setIsAddPriceModalOpen(true);
                            }}
                            className="text-xs text-slate-400 hover:text-emerald-600 font-semibold p-2 border border-dashed border-slate-200 rounded-lg w-full"
                          >
                            + إضافة
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDeleteModelRow(r.modelId)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 transition-colors"
                      title="حذف الموديل من المصفوفة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Price Modal */}
      {isAddPriceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">تعديل سعر وضمان الخدمة</h3>
              <button
                onClick={() => setIsAddPriceModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePriceModal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الموديل المستهدف</label>
                <select
                  value={formModelId}
                  onChange={(e) => setFormModelId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {rows.map((r) => (
                    <option key={r.modelId} value={r.modelId}>
                      {r.modelName} ({r.series})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع الخدمة</label>
                <select
                  value={formServiceId}
                  onChange={(e) => setFormServiceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameAr} ({s.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السعر (ج.م)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مدة الضمان</label>
                  <select
                    value={formWarranty}
                    onChange={(e) => setFormWarranty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="360 يوم">360 يوم (سنة كاملة)</option>
                    <option value="180 يوم">180 يوم (6 شهور)</option>
                    <option value="90 يوم">90 يوم (3 شهور)</option>
                    <option value="30 يوم">30 يوم (شهر)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">حالة التوفر</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="available">متاح للصيانة الفورية</option>
                  <option value="on_request">عند الطلب (مراجعة السعر)</option>
                  <option value="unavailable">غير متاح حالياً</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPriceModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>تطبيق وحفظ السعر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
