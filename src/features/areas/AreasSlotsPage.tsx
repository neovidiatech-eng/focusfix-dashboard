import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Edit, X } from 'lucide-react';
import { api } from '../../lib/api';

export function AreasSlotsPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<any | null>(null);

  // Form states
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [cityAr, setCityAr] = useState('القاهرة');
  const [fee, setFee] = useState<number>(0);

  const fetchAreas = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAreas();
      if (Array.isArray(data) && data.length > 0) {
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
    setIsModalOpen(true);
  };

  const handleOpenEdit = (area: any) => {
    setEditingArea(area);
    setNameAr(area.name_ar || '');
    setNameEn(area.name_en || '');
    setCityAr(area.city_ar || 'القاهرة');
    setFee(Number(area.transport_fee || 0));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArea) {
        await api.updateArea(editingArea.id, {
          name_ar: nameAr,
          name_en: nameEn || nameAr,
          transport_fee: fee,
        });
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
      }
      setIsModalOpen(false);
      fetchAreas();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ المنطقة');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المناطق والمواعيد (Areas & Slots)</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة مناطق التغطية، رسوم الانتقال، وسعة الفترات اليومية
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

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
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
            {areas.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-bold text-slate-900">{a.name_ar}</td>
                <td className="py-3.5 px-4 text-slate-600">{a.city_ar || 'القاهرة'}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  {Number(a.transport_fee || 0) === 0 ? (
                    <span className="text-emerald-600 font-bold">مجاناً</span>
                  ) : (
                    <span className="text-amber-600 font-bold">+{Number(a.transport_fee)} ج.م</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    a.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {a.is_active !== false ? 'مفعل' : 'معطل'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600">3 فترات (حد أقصى 3 حجوزات/فترة)</td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => handleOpenEdit(a)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 border border-slate-200 rounded-md hover:bg-slate-100 flex items-center gap-1 mx-auto"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
