import { Plus, Smartphone, Wrench, Layers } from 'lucide-react';

export function CatalogPage() {
  const deviceTypes = [
    { id: 'iphone', name: 'iPhone', modelsCount: 28, status: 'نشط' },
    { id: 'ipad', name: 'iPad', modelsCount: 14, status: 'نشط' },
    { id: 'watch', name: 'Apple Watch', modelsCount: 8, status: 'نشط' },
    { id: 'macbook', name: 'MacBook', modelsCount: 0, status: 'قريباً' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الكتالوج والأجهزة</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة أنواع الأجهزة، الموديلات، وقائمة الخدمات المتاحة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700">
            <Plus className="w-4 h-4" />
            <span>إضافة موديل جديد</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {deviceTypes.map((dt) => (
          <div key={dt.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">{dt.name}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                dt.status === 'نشط' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {dt.status}
              </span>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              عدد الموديلات: <strong className="text-slate-800">{dt.modelsCount}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
