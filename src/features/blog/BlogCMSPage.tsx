import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

export function BlogCMSPage() {
  const posts = [
    {
      id: '1',
      title: 'دليل شامل: كيف تحافظ على صحة بطارية الآيفون لأطول فترة ممكنة؟',
      category: 'نصائح صيانة',
      status: 'منشور',
      views: 1420,
      date: '2026-09-28',
    },
    {
      id: '2',
      title: 'مقارنة بين تغيير الشاشة الأصلية والشاشات المقلدة ومخاطرها',
      category: 'الشاشات',
      status: 'منشور',
      views: 980,
      date: '2026-09-20',
    },
    {
      id: '3',
      title: 'حل مشكلة ارتفاع حرارة آيفون 15 برو ماكس أثناء الشحن',
      category: 'حلول أعطال',
      status: 'مسودة',
      views: 0,
      date: '2026-10-01',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة المدونة (Blog CMS)</h1>
          <p className="text-sm text-slate-500 mt-1">
            كتابة ونشر مقالات الصيانة المتوافقة مع SEO لزيادة الزيارات العضوية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700">
            <Plus className="w-4 h-4" />
            <span>كتابة مقال جديد</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">عنوان المقال</th>
              <th className="py-3 px-4">التصنيف</th>
              <th className="py-3 px-4">الحالة</th>
              <th className="py-3 px-4">المشاهدات</th>
              <th className="py-3 px-4">تاريخ النشر</th>
              <th className="py-3 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-bold text-slate-900 max-w-md">{p.title}</td>
                <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    p.status === 'منشور' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{p.views}</td>
                <td className="py-3.5 px-4 text-slate-500 text-xs">{p.date}</td>
                <td className="py-3.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-1.5 text-slate-500 hover:text-slate-800 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-rose-500 hover:text-rose-700 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
