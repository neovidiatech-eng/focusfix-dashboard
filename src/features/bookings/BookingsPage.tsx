import { useState } from 'react';
import {
  Search,
  Phone,
  MessageCircle,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock,
  X,
  MapPin,
  Calendar,
  User,
  Smartphone,
} from 'lucide-react';

interface Booking {
  id: string;
  date: string;
  customer: string;
  phone: string;
  whatsapp: string;
  device: string;
  services: string[];
  area: string;
  transportFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  slot: string;
  address: string;
  notes?: string;
}

export function BookingsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeNotes, setActiveNotes] = useState<string>('');

  const [bookings, setBookings] = useState<Booking[]>([
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
      notes: 'العميل يفضل الاتصال قبل التحرك بنصف ساعة.',
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
      transportFee: 0,
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
  ]);

  const handleOpenDetails = (b: Booking) => {
    setSelectedBooking(b);
    setActiveNotes(b.notes || '');
  };

  const handleUpdateStatus = (newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    if (!selectedBooking) return;
    setBookings((prev) =>
      prev.map((item) =>
        item.id === selectedBooking.id
          ? { ...item, status: newStatus, notes: activeNotes }
          : item
      )
    );
    setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus, notes: activeNotes } : null));
  };

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
            متابعة الحجوزات الواردة، تأكيد المواعيد، وإدارة الحالات
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
                <th className="py-3 px-4 text-center">إجراءات</th>
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
                        href={`https://wa.me/2${b.whatsapp}?text=${encodeURIComponent(
                          `مرحباً ${b.customer}، بخصوص حجز صيانة ${b.device} برقم ${b.id} من FocusFix.`
                        )}`}
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
                    <button
                      onClick={() => handleOpenDetails(b)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      تفاصيل وإجراء
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal / Drawer */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 block">
                  {selectedBooking.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">تفاصيل الحجز والإجراءات</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer and Contact */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-slate-900">{selectedBooking.customer}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-1 mr-6">
                    {selectedBooking.phone}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/2${selectedBooking.whatsapp}?text=${encodeURIComponent(
                      `مرحباً ${selectedBooking.customer}، بخصوص حجز صيانة ${selectedBooking.device} برقم ${selectedBooking.id} من FocusFix.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                    title="محادثة واتساب"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <a
                    href={`tel:${selectedBooking.phone}`}
                    className="p-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
                    title="اتصال هاتفي"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Device and Services */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>الجهاز والخدمات المطلوبة</span>
                </h4>
                <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900">{selectedBooking.device}</div>
                  <div className="text-sm text-slate-600">
                    {selectedBooking.services.map((s, idx) => (
                      <span key={idx} className="inline-block bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium ml-1.5 mb-1.5">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
                    <span className="text-slate-500">الإجمالي التقديري:</span>
                    <span className="font-extrabold text-emerald-600 text-base">
                      {selectedBooking.total.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Location and Appointment */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>الموقع والموعد</span>
                </h4>
                <div className="p-4 border border-slate-200 rounded-xl text-sm space-y-1.5">
                  <div className="font-semibold text-slate-800">{selectedBooking.area}</div>
                  <div className="text-xs text-slate-600">{selectedBooking.address}</div>
                  <div className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{selectedBooking.slot}</span>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  ملاحظات تشغيلية داخلية (Internal Notes)
                </label>
                <textarea
                  value={activeNotes}
                  onChange={(e) => setActiveNotes(e.target.value)}
                  placeholder="أضف أي ملاحظات للفني أو سبب التعديل..."
                  rows={2}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block">تحديث حالة الحجز:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleUpdateStatus('confirmed')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                      selectedBooking.status === 'confirmed'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}
                  >
                    تأكيد الحجز
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('completed')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                      selectedBooking.status === 'completed'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    تم الإصلاح
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('cancelled')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                      selectedBooking.status === 'cancelled'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'border-slate-200 text-slate-700 hover:bg-rose-50'
                    }`}
                  >
                    إلغاء الطلب
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('pending')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                      selectedBooking.status === 'pending'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'border-slate-200 text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    انتظار
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
              >
                حفظ وإغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
