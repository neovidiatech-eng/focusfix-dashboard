import { useState } from 'react';
import {
  Search,
  Phone,
  MessageCircle,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';

export function BookingsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const bookings = [
    {
      id: 'FM-2026-00104',
      date: '2026-10-02 14:15',
      customer: 'أحمد محمود',
      phone: '01009911934',
      whatsapp: '01009911934',
      device: 'iPhone 15 Pro Max',
      services: ['تغيير شاشة أصلية'],
      area: 'المعادي',
      transportFee: 0,
      total: 12500,
      status: 'pending',
      slot: 'اليوم، 02:00 م - 04:00 م',
      address: 'شارع 9، عمارة 12، الدور 3',
    },
    {
      id: 'FM-2026-00103',
      date: '2026-10-02 12:30',
      customer: 'سارة خالد',
      phone: '01123456789',
      whatsapp: '01123456789',
      device: 'iPhone 14 Pro',
      services: ['تغيير بطارية أصلية'],
      area: 'مدينة نصر',
      transportFee: 0,
      total: 3200,
      status: 'confirmed',
      slot: 'اليوم، 04:30 م - 06:30 م',
      address: 'عباس العقاد، أمام الحديقة الدولية',
    },
    {
      id: 'FM-2026-00102',
      date: '2026-10-01 19:10',
      customer: 'محمد إبراهيم',
      phone: '01234567890',
      whatsapp: '01234567890',
      device: 'iPhone 13',
      services: ['تغيير ظهر ليزر', 'تغيير بطارية'],
      area: '6 أكتوبر',
      transportFee: 150,
      total: 4800,
      status: 'completed',
      slot: 'أمس، 11:00 ص',
      address: 'الحي المتميز، فيلا 15',
    },
    {
      id: 'FM-2026-00101',
      date: '2026-10-01 15:00',
      customer: 'هاني فؤاد',
      phone: '01512345678',
      whatsapp: '01512345678',
      device: 'iPad Pro 11"',
      services: ['فحص باور ومذربورد'],
      area: 'التجمع الخامس',
      transportFee: 0,
      total: 1500,
      status: 'cancelled',
      slot: 'أمس، 01:00 م',
      address: 'التجمع الخامس، شارع التسعين الشمالي',
    },
  ];

  const filtered = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.includes(search) ||
      b.phone.includes(search) ||
      b.device.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة الحجوزات</h1>
          <p className="text-sm text-slate-500 mt-1">
            متابعة الحجوزات الواردة، تعيين الفنيين، وتأكيد المواعيد
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الحجز، الاسم، الهاتف، أو الموديل..."
            className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'بانتظار التأكيد' },
            { id: 'confirmed', label: 'مؤكد' },
            { id: 'completed', label: 'مكتمل' },
            { id: 'cancelled', label: 'ملغي' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">رقم الحجز</th>
                <th className="py-3 px-4">العميل والتواصل</th>
                <th className="py-3 px-4">الجهاز والخدمات</th>
                <th className="py-3 px-4">المكان والموعد</th>
                <th className="py-3 px-4">الإجمالي التقديري</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">
                    {b.id}
                    <div className="text-[11px] font-sans font-normal text-slate-400 mt-0.5">
                      {b.date}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{b.customer}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`https://wa.me/2${b.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>واتساب</span>
                      </a>
                      <span className="text-slate-300">•</span>
                      <a
                        href={`tel:${b.phone}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 font-medium"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>اتصال</span>
                      </a>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900">{b.device}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {b.services.join(' + ')}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-800">{b.area}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{b.slot}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">
                      {b.total.toLocaleString()} ج.م
                    </div>
                    {b.transportFee > 0 && (
                      <div className="text-[11px] text-amber-600 font-medium">
                        يشمل {b.transportFee} ج.م انتقال
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {b.status === 'pending' && (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        بانتظار التأكيد
                      </span>
                    )}
                    {b.status === 'confirmed' && (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        مؤكد
                      </span>
                    )}
                    {b.status === 'completed' && (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        مكتمل
                      </span>
                    )}
                    {b.status === 'cancelled' && (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        ملغي
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                        إجراء
                      </button>
                    </div>
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
