import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Edit, Trash2, X, Search, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

export function AreasSlotsPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<any | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [cityAr, setCityAr] = useState('القاهرة');
  const [fee, setFee] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  const fetchAreas = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAreas();
      if (Array.isArray(data)) {
        setAreas(data);
      }
    } catch (e) {
      console.error('Failed to load areas', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleOpenCreate = () => {
    setEditingArea(null);
    setNameAr('');
    setNameEn('');
    setCityAr('القاهرة');
    setFee(0);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (area: any) => {
    setEditingArea(area);
    setNameAr(area.name_ar || '');
    setNameEn(area.name_en || '');
    setCityAr(area.city_ar || 'القاهرة');
    setFee(Number(area.transport_fee || 0));
    setIsActive(area.is_active !== false);
    setIsModalOpen(true);
  };

  const handleDeleteArea = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف منطقة "${name}" نهائياً من قاعدة البيانات وموقع الحجز؟`)) {
      return;
    }
    try {
      await api.deleteArea(id);
      setSuccessMsg(`تم حذف منطقة "${name}" بنجاح!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchAreas();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف المنطقة');
    }
  };

  const handleToggleStatus = async (area: any) => {
    try {
      const updatedStatus = area.is_active === false;
      await api.updateArea(area.id, {
        is_active: updatedStatus,
      });
      setSuccessMsg(`تم ${updatedStatus ? 'تفعيل' : 'تعطيل'} المنطقة بنجاح!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchAreas();
    } catch (err: any) {
      alert(err.message || 'تعذر تحديث حالة المنطقة');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArea) {
        await api.updateArea(editingArea.id, {
          name_ar: nameAr,
          name_en: nameEn || nameAr,
          city_ar: cityAr,
          transport_fee: fee,
          is_active: isActive,
        });
        setSuccessMsg('تم تحديث بيانات المنطقة بنجاح!');
      } else {
        const slug = nameEn
          ? nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          : nameAr.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-');
        await api.createArea({
          name_ar: nameAr,
          name_en: nameEn || nameAr,
          slug,
          city_ar: cityAr,
          transport_fee: fee,
        });
        setSuccessMsg('تم إنشاء المنطقة الجديدة بنجاح!');
      }
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsModalOpen(false);
      fetchAreas();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ المنطقة');
    }
  };

  const filteredAreas = areas.filter(
    (a) =>
      (a.name_ar && a.name_ar.toLowerCase().includes(search.toLowerCase())) ||
      (a.name_en && a.name_en.toLowerCase().includes(search.toLowerCase())) ||
      (a.city_ar && a.city_ar.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المناطق والمواعيد (Areas & Slots)</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة مناطق التغطية، رسوم الانتقال، وسعة الفترات اليومية للحجز المباشر
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAreas}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منطقة جديدة</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن منطقة أو محافظة..."
            className="w-full pl-4 pr-10 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          💡 المناطق المضافة هنا تظهر مباشرة لعملاء الموقع العام في قائمة الحجز وصفحة الأسعار.
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading && areas.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            جاري تحميل المناطق من السيرفر...
          </div>
        ) : filteredAreas.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <p className="font-bold text-slate-700">لا توجد مناطق مطابقة للبحث</p>
            <p className="text-xs text-slate-400">جرّب كلمة بحث أخرى أو أضف منطقة جديدة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">المنطقة</th>
                  <th className="py-3 px-4">المحافظة / المدينة</th>
                  <th className="py-3 px-4">رسم الانتقال الإضافي</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">سعة الفترات اليومية</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAreas.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{a.name_ar}</div>
                      {a.name_en && <div className="text-[11px] text-slate-400 font-normal">{a.name_en}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{a.city_ar || 'القاهرة'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {Number(a.transport_fee || 0) === 0 ? (
                        <span className="text-emerald-600 font-bold">مجاناً (0 ج.م)</span>
                      ) : (
                        <span className="text-amber-600 font-bold">+{Number(a.transport_fee)} ج.م</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(a)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                          a.is_active !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="انقر لتبديل حالة المنطقة"
                      >
                        {a.is_active !== false ? 'مفعل (نشط)' : 'معطل (مخفي)'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">3 فترات (حد أقصى 3 حجوزات/فترة)</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(a)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 border border-slate-200 rounded-md hover:bg-slate-100 flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => handleDeleteArea(a.id, a.name_ar)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-700 px-2.5 py-1 border border-rose-100 rounded-md hover:bg-rose-50 flex items-center gap-1"
                          title="حذف المنطقة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editingArea ? 'تعديل بيانات المنطقة' : 'إضافة منطقة تغطية جديدة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم بالعربية</label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: التجمع الخامس"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم بالإنجليزية (اختياري)</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. New Cairo"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">المحافظة</label>
                <select
                  value={cityAr}
                  onChange={(e) => setCityAr(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="القاهرة">القاهرة</option>
                  <option value="الجيزة">الجيزة</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رسم الانتقال الإضافي (ج.م)</label>
                <input
                  type="number"
                  min="0"
                  value={fee}
                  onChange={(e) => setFee(Number(e.target.value))}
                  placeholder="0 للمناطق المجانية"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md"
                >
                  حفظ المنطقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
