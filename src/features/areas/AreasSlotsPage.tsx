import { Plus, MapPin, Clock, Calendar } from 'lucide-react';

export function AreasSlotsPage() {
  const areas = [
    { id: '1', name_ar: 'المعادي', city: 'القاهرة', fee: 0, status: 'مفعل', slotsCount: 3 },
    { id: '2', name_ar: 'مدينة نصر', city: 'القاهرة', fee: 0, status: 'مفعل', slotsCount: 3 },
    { id: '3', name_ar: 'مصر الجديدة', city: 'القاهرة', fee: 0, status: 'مفعل', slotsCount: 3 },
    { id: '4', name_ar: 'التجمع الخامس', city: 'القاهرة', fee: 0, status: 'مفعل', slotsCount: 3 },
    { id: '5', name_ar: 'الدقي والمهندسين', city: 'الجيزة', fee: 0, status: 'مفعل', slotsCount: 3 },
    { id: '6', name_ar: '6 أكتوبر', city: 'الجيزة', fee: 150, status: 'مفعل', slotsCount: 3 },
    { id: '7', name_ar: 'الشيخ زايد', city: 'الجيزة', fee: 150, status: 'مفعل', slotsCount: 3 },
    { id: '8', name_ar: 'الشروق ومدينتي', city: 'القاهرة', fee: 150, status: 'مفعل', slotsCount: 3 },
  ];

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
          <button className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700">
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
                <td className="py-3.5 px-4 text-slate-600">{a.city}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  {a.fee === 0 ? (
                    <span className="text-emerald-600 font-bold">مجاناً</span>
                  ) : (
                    <span className="text-amber-600 font-bold">+{a.fee} ج.م</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    {a.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600">3 فترات (حد أقصى 3 حجوزات/فترة)</td>
                <td className="py-3.5 px-4 text-center">
                  <button className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 border border-slate-200 rounded">
                    تعديل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
