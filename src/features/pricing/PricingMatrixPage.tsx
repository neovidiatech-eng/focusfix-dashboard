import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Save,
  Search,
  Plus,
  Trash2,
  X,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface ServiceColumn {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
}

interface MatrixRow {
  modelId: string;
  modelName: string;
  series: string;
  prices: Record<string, {
    serviceId: string;
    price: number;
    warranty: string;
    warrantyDays: number;
    status: 'available' | 'on_request' | 'unavailable' | 'included';
  }>;
}

export function PricingMatrixPage() {
  const [search, setSearch] = useState<string>('');
  const [isAddPriceModalOpen, setIsAddPriceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [services, setServices] = useState<ServiceColumn[]>([
    { id: 'screen', slug: 'screen', nameAr: 'تغيير شاشة أصلية', nameEn: 'Screen Replacement' },
    { id: 'battery', slug: 'battery', nameAr: 'تغيير بطارية أبل', nameEn: 'Battery Replacement' },
    { id: 'back', slug: 'back', nameAr: 'تغيير ظهر ليزر', nameEn: 'Back Glass' },
    { id: 'camera', slug: 'camera', nameAr: 'صيانة كاميرا', nameEn: 'Camera Repair' },
    { id: 'charging', slug: 'charging', nameAr: 'مدخل وفلكس شحن', nameEn: 'Charging Port' },
  ]);

  const [rows, setRows] = useState<MatrixRow[]>([]);

  // Modal Form States
  const [formModelId, setFormModelId] = useState('');
  const [formServiceId, setFormServiceId] = useState('');
  const [formPrice, setFormPrice] = useState(3500);
  const [formWarranty, setFormWarranty] = useState('360 يوم');
  const [formStatus, setFormStatus] = useState<'available' | 'on_request' | 'unavailable' | 'included'>('available');

  const fetchMatrix = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPricingMatrix('iphone');
      if (data) {
        // 1. Map columns / services
        let cols: ServiceColumn[] = [];
        if (Array.isArray(data.services) && data.services.length > 0) {
          cols = data.services.map((s: any) => ({
            id: s.id,
            slug: s.slug,
            nameAr: s.name_ar,
            nameEn: s.name_en || s.name_ar,
          }));
        } else if (Array.isArray(data.columns) && data.columns.length > 0) {
          cols = data.columns.map((c: any) => ({
            id: c.id,
            slug: c.slug,
            nameAr: c.name_ar,
            nameEn: c.name_en || c.name_ar,
          }));
        }

        if (cols.length > 0) {
          setServices(cols);
        }

        // 2. Map rows / models
        const flatRows: MatrixRow[] = [];

        // Check if data.models (admin format)
        if (Array.isArray(data.models) && data.models.length > 0) {
          data.models.forEach((m: any) => {
            const pricesMap: MatrixRow['prices'] = {};
            (m.prices || []).forEach((p: any) => {
              const matchedCol = cols.find((c) => c.id === p.service_id);
              if (matchedCol) {
                pricesMap[matchedCol.slug] = {
                  serviceId: p.service_id,
                  price: Number(p.price || 0),
                  warranty: `${p.warranty_days || 180} يوم`,
                  warrantyDays: p.warranty_days || 180,
                  status: p.status || 'available',
                };
              }
            });

            flatRows.push({
              modelId: m.id,
              modelName: m.name,
              series: m.series_ar || m.series_en || 'سلسلة آيفون',
              prices: pricesMap,
            });
          });
        }
        // Check if data.series (public format)
        else if (Array.isArray(data.series) && data.series.length > 0) {
          data.series.forEach((sGroup: any) => {
            (sGroup.models || []).forEach((m: any) => {
              const pricesMap: MatrixRow['prices'] = {};
              cols.forEach((col) => {
                const cell = m.cells?.[col.slug];
                if (cell && cell.price !== null && cell.price !== undefined) {
                  pricesMap[col.slug] = {
                    serviceId: col.id,
                    price: Number(cell.price),
                    warranty: `${cell.warrantyDays || 180} يوم`,
                    warrantyDays: cell.warrantyDays || 180,
                    status: cell.status || 'available',
                  };
                }
              });

              flatRows.push({
                modelId: m.id,
                modelName: m.name,
                series: sGroup.title || 'سلسلة آيفون',
                prices: pricesMap,
              });
            });
          });
        }

        if (flatRows.length > 0) {
          setRows(flatRows);
        }
      }
    } catch (err) {
      console.error('Failed to load pricing matrix:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleSavePriceModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const targetService = services.find((s) => s.id === formServiceId || s.slug === formServiceId);
    if (!targetService) {
      setIsSaving(false);
      return;
    }

    let warrantyDays = 180;
    if (formWarranty.includes('360')) warrantyDays = 360;
    else if (formWarranty.includes('90')) warrantyDays = 90;
    else if (formWarranty.includes('30')) warrantyDays = 30;

    try {
      // If valid UUIDs, send update to backend
      const isValidUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      if (isValidUuid(formModelId) && isValidUuid(targetService.id)) {
        await api.updatePricingMatrix([
          {
            modelId: formModelId,
            serviceId: targetService.id,
            price: Number(formPrice),
            warrantyDays,
            status: formStatus,
          },
        ]);
        setSuccessMsg('تم تحديث وحفظ السعر في قاعدة البيانات بنجاح!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }

      // Optimistically update local state
      setRows((prev) =>
        prev.map((row) => {
          if (row.modelId === formModelId) {
            return {
              ...row,
              prices: {
                ...row.prices,
                [targetService.slug]: {
                  serviceId: targetService.id,
                  price: Number(formPrice),
                  warranty: formWarranty,
                  warrantyDays,
                  status: formStatus,
                },
              },
            };
          }
          return row;
        })
      );
    } catch (err) {
      console.error('Failed to save price:', err);
      alert('حدث خطأ أثناء حفظ السعر على السيرفر');
    } finally {
      setIsSaving(false);
      setIsAddPriceModalOpen(false);
    }
  };

  const handleDeleteModelRow = (modelId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموديل وأسعاره من العرض؟')) {
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
            إدارة وتحديث أسعار الصيانة الحية، مدد الضمان، والخصومات لجميع الموديلات
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              if (rows[0]) setFormModelId(rows[0].modelId);
              if (services[0]) setFormServiceId(services[0].id);
              setFormPrice(3500);
              setFormWarranty('360 يوم');
              setIsAddPriceModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة / تحديث سعر خدمة</span>
          </button>
          <button
            onClick={fetchMatrix}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>تحديث الأسعار</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

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
          💡 انقر على أي سعر في الجدول لتعديله فوراً في قاعدة البيانات.
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading && rows.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            جاري تحميل مصفوفة الأسعار من السيرفر...
          </div>
        ) : (
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
                      const cell = r.prices[s.slug];
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
                        title="إخفاء الموديل من المصفوفة"
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
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? 'جاري الحفظ...' : 'تطبيق وحفظ السعر'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
