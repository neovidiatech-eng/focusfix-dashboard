import { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  CalendarClock,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowUpRight,
  RefreshCw,
  MessageCircle,
  Phone,
  CalendarDays,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api, BookingStatus } from '../../lib/api';
import { useToast } from '../../shared/components/ui/Toast';
import { StatusBadge, formatMoney, formatSlotLabel, whatsappNumber } from '../../shared/utils/format';

type Range = 'today' | '7d' | '30d' | 'year';

const RANGES: Array<{ id: Range; label: string }> = [
  { id: 'today', label: 'اليوم' },
  { id: '7d', label: 'آخر 7 أيام' },
  { id: '30d', label: 'آخر 30 يوم' },
  { id: 'year', label: 'آخر 12 شهر' },
];

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  completionRate: number;
  revenue: number;
  pipelineRevenue: number;
  series: Array<{ date: string; total: number; completed: number }>;
  topServices: Array<{ name: string; count: number }>;
  topAreas: Array<{ name: string; count: number }>;
  todaysAppointments: Array<{
    id: string;
    bookingNumber: string;
    customer: string;
    phone: string;
    device: string;
    services: string[];
    area: string;
    slot: string;
    status: BookingStatus;
    total: number;
  }>;
}

export function OverviewPage() {
  const outlet = useOutletContext<{ refreshBadges?: () => void }>();
  const toast = useToast();
  const [range, setRange] = useState<Range>('30d');
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.getStats(range),
        api.getBookings({ status: 'pending', limit: '8' }),
      ]);
      setStats(statsRes);
      setPending(pendingRes?.data || []);
    } catch (e: any) {
      toast.error(e.message || 'تعذر تحميل المؤشرات');
    } finally {
      setIsLoading(false);
    }
  }, [range, toast]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const confirmBooking = async (id: string, number: string) => {
    setConfirmingId(id);
    try {
      await api.updateBookingStatus(id, 'confirmed');
      toast.success(`تم تأكيد الحجز ${number}`);
      outlet?.refreshBadges?.();
      await fetchOverview();
    } catch (e: any) {
      toast.error(e.message || 'تعذر تأكيد الحجز');
    } finally {
      setConfirmingId(null);
    }
  };

  const cards = [
    {
      title: 'إجمالي الحجوزات',
      value: stats ? String(stats.totalBookings) : '…',
      hint: stats ? `${stats.cancelledBookings} ملغي / لم يحضر` : '',
      icon: CalendarClock,
      color: 'bg-blue-500',
    },
    {
      title: 'بانتظار التأكيد (الآن)',
      value: stats ? String(stats.pendingBookings) : '…',
      hint: stats && stats.pendingBookings > 0 ? 'يحتاج إجراء فوري' : 'لا يوجد متأخرات',
      warn: !!stats && stats.pendingBookings > 0,
      icon: AlertCircle,
      color: 'bg-amber-500',
    },
    {
      title: 'إيراد الحجوزات المكتملة',
      value: stats ? formatMoney(stats.revenue) : '…',
      hint: stats ? `+ ${formatMoney(stats.pipelineRevenue)} قيد التنفيذ` : '',
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
    {
      title: 'مكتملة / نسبة الإنجاز',
      value: stats ? `${stats.completedBookings}` : '…',
      hint: stats ? `${stats.completionRate}% من الحجوزات • ${stats.confirmedBookings} قيد التنفيذ` : '',
      icon: TrendingUp,
      color: 'bg-indigo-500',
    },
  ];

  const chartData = (stats?.series || []).map((d) => ({
    ...d,
    label: new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(d.date)),
  }));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Title & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">نظرة عامة ومؤشرات الأداء</h1>
          <p className="text-sm text-slate-500 mt-1">متابعة حركة الحجوزات والإيرادات لمنصة FocusFix</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOverview}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            تحديث
          </button>
          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  range === r.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{card.title}</span>
                <div className={`p-2.5 rounded-lg text-white ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-4">{card.value}</h3>
              <p className={`text-xs font-semibold mt-2 ${card.warn ? 'text-amber-600' : 'text-slate-500'}`}>{card.hint}</p>
            </div>
          );
        })}
      </div>

      {/* Chart + top lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4">الحجوزات الجديدة يومياً</h2>
          <div className="h-64" dir="ltr">
            {range === 'today' ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                اختر فترة أطول لعرض الرسم البياني
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} interval="preserveStartEnd" minTickGap={20} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, direction: 'rtl' }}
                    formatter={(value: number, name: string) => [value, name === 'total' ? 'حجوزات' : 'مكتملة']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#fillTotal)" />
                  <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <TopList title="أكثر الخدمات طلباً" items={stats?.topServices || []} />
          <TopList title="أكثر المناطق حجزاً" items={stats?.topAreas || []} />
        </div>
      </div>

      {/* Today's appointments */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-emerald-600" />
          <span>مواعيد اليوم</span>
          <span className="text-xs font-semibold text-slate-500">({stats?.todaysAppointments.length || 0})</span>
        </h2>
        {stats && stats.todaysAppointments.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">لا توجد مواعيد مجدولة اليوم</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {stats?.todaysAppointments.map((a) => (
              <div key={a.id} className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">{formatSlotLabel(a.slot)}</span>
                  <StatusBadge status={a.status} />
                </div>
                <div className="font-bold text-slate-900">{a.customer}</div>
                <div className="text-xs text-slate-600">
                  {a.device} — {a.services.join(' + ')}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{a.area}</span>
                  <div className="flex items-center gap-2">
                    <a href={`https://wa.me/${whatsappNumber(a.phone)}`} target="_blank" rel="noreferrer" className="text-emerald-600" title="واتساب">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <a href={`tel:${a.phone}`} className="text-slate-600" title="اتصال">
                      <Phone className="w-4 h-4" />
                    </a>
                    <Link to={`/bookings?open=${a.id}`} className="font-semibold text-slate-900 underline">
                      {a.bookingNumber}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending bookings */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>حجوزات تحتاج تأكيد</span>
          </h2>
          <Link to="/bookings?status=pending" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>عرض الكل</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {!isLoading && pending.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">لا توجد حجوزات بانتظار التأكيد 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">رقم الحجز</th>
                  <th className="py-3 px-4">العميل</th>
                  <th className="py-3 px-4">الجهاز والخدمة</th>
                  <th className="py-3 px-4">المنطقة والموعد</th>
                  <th className="py-3 px-4">الإجمالي</th>
                  <th className="py-3 px-4">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pending.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <Link to={`/bookings?open=${b.id}`} className="hover:underline">
                        {b.booking_number}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{b.customer?.name}</div>
                      <div className="text-xs text-slate-500" dir="ltr">
                        {b.customer?.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{b.model?.name}</div>
                      <div className="text-xs text-slate-500">{b.services?.map((s: any) => s.service?.name_ar).join(' + ')}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div>{b.area?.name_ar}</div>
                      <div className="text-xs text-slate-500">
                        {new Intl.DateTimeFormat('ar-EG', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(b.slot_date))}{' '}
                        — {formatSlotLabel(b.slot_label_snapshot)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatMoney(b.estimated_total)}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => confirmBooking(b.id, b.booking_number)}
                        disabled={confirmingId === b.id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        {confirmingId === b.id ? 'جاري…' : 'تأكيد'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TopList({ title, items }: { title: string; items: Array<{ name: string; count: number }> }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">لا توجد بيانات بعد</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">{item.name}</span>
                <span className="font-bold text-slate-900">{item.count}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
