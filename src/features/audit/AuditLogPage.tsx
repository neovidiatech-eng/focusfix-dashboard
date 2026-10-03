
export function AuditLogPage() {
  const logs = [
    {
      id: '1',
      action: 'تعديل سعر خدمة',
      details: 'تم تعديل سعر شاشة iPhone 16 Pro Max من 14,000 إلى 13,500 ج.م',
      user: 'Super Admin',
      ip: '197.34.12.8',
      time: '2026-10-02 13:40',
    },
    {
      id: '2',
      action: 'تحديث رسوم منطقة',
      details: 'تعديل رسم انتقال منطقة 6 أكتوبر (+150 ج.م)',
      user: 'Super Admin',
      ip: '197.34.12.8',
      time: '2026-10-01 16:15',
    },
    {
      id: '3',
      action: 'تسجيل دخول لوحة التحكم',
      details: 'نجاح تسجيل الدخول للوحة التحكم',
      user: 'Super Admin',
      ip: '197.34.12.8',
      time: '2026-10-01 09:30',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">سجل التدقيق والأمان (Audit Log)</h1>
        <p className="text-sm text-slate-500 mt-1">
          تسجيل غير قابل للتعديل لجميع العمليات الحساسة وتغييرات الأسعار والإعدادات
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">نوع العملية</th>
              <th className="py-3 px-4">التفاصيل والتغييرات</th>
              <th className="py-3 px-4">المستخدم</th>
              <th className="py-3 px-4">عنوان IP</th>
              <th className="py-3 px-4">التاريخ والوقت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-bold text-slate-900">{l.action}</td>
                <td className="py-3.5 px-4 text-slate-700">{l.details}</td>
                <td className="py-3.5 px-4 font-medium text-slate-800">{l.user}</td>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{l.ip}</td>
                <td className="py-3.5 px-4 text-slate-500 text-xs">{l.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
