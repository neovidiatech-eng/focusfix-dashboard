import { MessageCircle } from 'lucide-react';

export function MessagesPage() {
  const messages = [
    {
      id: '1',
      name: 'كريم سعيد',
      phone: '01011223344',
      type: 'طلب سعر موديل غير مدرج (iPhone 11 Pro)',
      date: 'اليوم، 11:20 ص',
      status: 'جديد',
    },
    {
      id: '2',
      name: 'منى إبراهيم',
      phone: '01299887766',
      type: 'طلب تغطية منطقة جديدة (العاشر من رمضان)',
      date: 'أمس، 05:40 م',
      status: 'تم الرد',
    },
    {
      id: '3',
      name: 'محمود جابر',
      phone: '01155443322',
      type: 'استفسار تواصل عام بخصوص ضمان البوردة',
      date: '2026-09-30',
      status: 'تم الرد',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">الرسائل وطلبات الأسعار</h1>
        <p className="text-sm text-slate-500 mt-1">
          رسائل التواصل، طلبات تغطية المناطق الجديدة، واستفسارات الأسعار غير المدرجة
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">المرسل</th>
              <th className="py-3 px-4">رقم الهاتف والتواصل</th>
              <th className="py-3 px-4">نوع الطلب / الرسالة</th>
              <th className="py-3 px-4">الوقت</th>
              <th className="py-3 px-4">الحالة</th>
              <th className="py-3 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {messages.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-bold text-slate-900">{m.name}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-700">{m.phone}</span>
                    <a href={`https://wa.me/2${m.phone}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-700">{m.type}</td>
                <td className="py-3.5 px-4 text-slate-500 text-xs">{m.date}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    m.status === 'جديد' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {m.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button className="text-xs font-semibold text-emerald-600 hover:underline">
                    عرض التفاصيل
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
