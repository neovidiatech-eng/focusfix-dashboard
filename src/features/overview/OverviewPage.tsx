import {
  CalendarClock,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export function OverviewPage() {
  const stats = [
    {
      title: 'إجمالي الحجوزات (هذا الشهر)',
      value: '142',
      change: '+18%',
      isPositive: true,
      icon: CalendarClock,
      color: 'bg-blue-500',
    },
    {
      title: 'حجوزات بانتظار التأكيد',
      value: '7',
      change: 'يحتاج إجراء فوري',
      isWarning: true,
      icon: AlertCircle,
      color: 'bg-amber-500',
    },
    {
      title: 'الإيراد التقديري',
      value: '194,500 ج.م',
      change: '+24%',
      isPositive: true,
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
    {
      title: 'معدل إتمام الإصلاح',
      value: '96.4%',
      change: '+1.2%',
      isPositive: true,
      icon: TrendingUp,
      color: 'bg-indigo-500',
    },
  ];

  const recentBookings = [
    {
      id: 'FM-2026-00104',
      customer: 'أحمد محمود',
      phone: '01009911934',
      device: 'iPhone 15 Pro Max',
      service: 'تغيير شاشة',
      area: 'المعادي',
      time: 'اليوم، 02:00 م',
      total: '12,500 ج.م',
      status: 'pending',
    },
    {
      id: 'FM-2026-00103',
      customer: 'سارة خالد',
      phone: '01123456789',
      device: 'iPhone 14 Pro',
      service: 'تغيير بطارية',
      area: 'مدينة نصر',
      time: 'اليوم، 04:30 م',
      total: '3,200 ج.م',
      status: 'confirmed',
    },
    {
      id: 'FM-2026-00102',
      customer: 'محمد إبراهيم',
      phone: '01234567890',
      device: 'iPhone 13',
      service: 'تغيير ظهر ليزر',
      area: '6 أكتوبر (+150 ج.م)',
      time: 'غداً، 11:00 ص',
      total: '2,650 ج.م',
      status: 'confirmed',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">نظرة عامة ومؤشرات الأداء (KPIs)</h1>
          <p className="text-sm text-slate-500 mt-1">
            متابعة حركة الحجوزات، التحويلات، والإيرادات لمنصة FocusFix
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>اليوم</option>
            <option>آخر 7 أيام</option>
            <option selected>آخر 30 يوم</option>
            <option>هذا العام</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{stat.title}</span>
                <div className={`p-2.5 rounded-lg text-white ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-slate-900">{stat.value}</h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={`text-xs font-semibold ${
                      stat.isWarning
                        ? 'text-amber-600'
                        : stat.isPositive
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Action Needed */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>حجوزات تحتاج تأكيد فوري</span>
          </h2>
          <a href="/bookings" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>عرض كل الحجوزات</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">رقم الحجز</th>
                <th className="py-3 px-4">العميل</th>
                <th className="py-3 px-4">الجهاز والخدمة</th>
                <th className="py-3 px-4">المنطقة</th>
                <th className="py-3 px-4">الموعد</th>
                <th className="py-3 px-4">الإجمالي</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{b.customer}</div>
                    <div className="text-xs text-slate-500">{b.phone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{b.device}</div>
                    <div className="text-xs text-slate-500">{b.service}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{b.area}</td>
                  <td className="py-3.5 px-4 text-slate-700">{b.time}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{b.total}</td>
                  <td className="py-3.5 px-4">
                    {b.status === 'pending' ? (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                        بانتظار التأكيد
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        مؤكد
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                      تأكيد
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
