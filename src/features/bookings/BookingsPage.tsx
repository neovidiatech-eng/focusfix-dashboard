import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Search,
  Phone,
  MessageCircle,
  FileSpreadsheet,
  X,
  MapPin,
  Calendar,
  User,
  Smartphone,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  History,
  StickyNote,
  Save,
} from 'lucide-react';
import { api, BookingStatus } from '../../lib/api';
import { useToast } from '../../shared/components/ui/Toast';
import {
  STATUS_META,
  STATUS_FLOW,
  StatusBadge,
  formatMoney,
  formatDay,
  formatDateTime,
  formatSlotLabel,
  whatsappNumber,
  downloadCsv,
} from '../../shared/utils/format';

const STATUS_TABS: Array<{ id: 'all' | BookingStatus; label: string }> = [
  { id: 'all', label: 'الكل' },
  { id: 'pending', label: 'بانتظار التأكيد' },
  { id: 'confirmed', label: 'مؤكد' },
  { id: 'assigned', label: 'تم تعيين فني' },
  { id: 'on_the_way', label: 'في الطريق' },
  { id: 'in_progress', label: 'جاري الإصلاح' },
  { id: 'completed', label: 'مكتمل' },
  { id: 'cancelled', label: 'ملغي' },
  { id: 'no_show', label: 'لم يحضر' },
];

const PAGE_SIZE = 20;

export function BookingsPage() {
  const outlet = useOutletContext<{ refreshBadges?: () => void }>();
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const status = params.get('status') || 'all';
  const page = Math.max(1, parseInt(params.get('page') || '1', 10));
  const areaId = params.get('area') || '';
  const dateFrom = params.get('from') || '';
  const dateTo = params.get('to') || '';
  const openId = params.get('open');

  const [searchInput, setSearchInput] = useState(params.get('q') || '');
  const search = params.get('q') || '';
  const [bookings, setBookings] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 });
  const [areas, setAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const updateParams = useCallback(
    (changes: Record<string, string | null>, resetPage = true) => {
      const next = new URLSearchParams(params);
      Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      if (resetPage && !('page' in changes)) next.delete('page');
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const filters = useCallback(
    () => ({
      status,
      search,
      area_id: areaId,
      date_from: dateFrom,
      date_to: dateTo,
    }),
    [status, search, areaId, dateFrom, dateTo]
  );

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getBookings({ ...filters(), page: String(page), limit: String(PAGE_SIZE) });
      setBookings(res.data || []);
      setMeta({ total: res.meta?.total || 0, totalPages: res.meta?.totalPages || 0 });
    } catch (e: any) {
      toast.error(e.message || 'تعذر تحميل الحجوزات');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    api.getAreas().then(setAreas).catch(() => {});
  }, []);

  // Debounce search typing into the URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput.trim() !== search) updateParams({ q: searchInput.trim() || null });
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, search, updateParams]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await api.getBookings({ ...filters(), page: '1', limit: '1000' });
      const rows = (res.data || []).map((b: any) => [
        b.booking_number,
        formatDateTime(b.created_at),
        b.customer?.name,
        b.customer?.phone,
        b.whatsapp_number,
        b.customer?.email,
        b.model?.name,
        b.services?.map((s: any) => s.service?.name_ar).join(' + '),
        b.area?.name_ar,
        b.address,
        b.slot_date?.slice(0, 10),
        b.slot_label_snapshot,
        Number(b.estimated_total),
        b.total_final !== null ? Number(b.total_final) : '',
        STATUS_META[b.status as BookingStatus]?.label || b.status,
        b.notes,
        b.internal_notes,
      ]);
      downloadCsv(`focusfix-bookings-${new Date().toISOString().slice(0, 10)}.csv`, [
        [
          'رقم الحجز',
          'تاريخ الإنشاء',
          'العميل',
          'الهاتف',
          'واتساب',
          'البريد',
          'الجهاز',
          'الخدمات',
          'المنطقة',
          'العنوان',
          'تاريخ الموعد',
          'الفترة',
          'الإجمالي التقديري',
          'الإجمالي النهائي',
          'الحالة',
          'ملاحظات العميل',
          'ملاحظات داخلية',
        ],
        ...rows,
      ]);
      if ((res.meta?.total || 0) > 1000) toast.info('تم تصدير أول 1000 حجز فقط. ضيّق الفلاتر لتصدير الباقي.');
    } catch (e: any) {
      toast.error(e.message || 'تعذر التصدير');
    } finally {
      setIsExporting(false);
    }
  };

  const hasFilters = status !== 'all' || !!search || !!areaId || !!dateFrom || !!dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة الحجوزات</h1>
          <p className="text-sm text-slate-500 mt-1">
            {meta.total} حجز {hasFilters ? 'مطابق للفلاتر' : 'إجمالاً'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || meta.total === 0}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{isExporting ? 'جاري التصدير…' : 'تصدير Excel'}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="بحث برقم الحجز، الاسم، الهاتف، أو الموديل..."
              className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={areaId}
            onChange={(e) => updateParams({ area: e.target.value || null })}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-white"
          >
            <option value="">كل المناطق</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name_ar}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>موعد من</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => updateParams({ from: e.target.value || null })}
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
            />
            <span>إلى</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => updateParams({ to: e.target.value || null })}
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
            />
          </div>
          {hasFilters && (
            <button
              onClick={() => {
                setSearchInput('');
                setParams({}, { replace: true });
              }}
              className="text-xs font-semibold text-rose-600 hover:underline whitespace-nowrap"
            >
              مسح الفلاتر
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => updateParams({ status: tab.id === 'all' ? null : tab.id })}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                status === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                <th className="py-3 px-4">الإجمالي</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    جاري التحميل…
                  </td>
                </tr>
              )}
              {!isLoading && bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {hasFilters ? 'لا توجد حجوزات مطابقة للفلاتر' : 'لا توجد حجوزات بعد'}
                  </td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isLoading ? 'opacity-60' : ''}`}
                  onClick={() => updateParams({ open: b.id }, false)}
                >
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">
                    {b.booking_number}
                    <div className="text-[11px] font-sans font-normal text-slate-400 mt-0.5">{formatDateTime(b.created_at)}</div>
                  </td>
                  <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="font-bold text-slate-900">{b.customer?.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`https://wa.me/${whatsappNumber(b.whatsapp_number || b.customer?.phone)}?text=${encodeURIComponent(
                          `مرحباً ${b.customer?.name}، بخصوص حجز صيانة ${b.model?.name} برقم ${b.booking_number} من FocusFix.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>واتساب</span>
                      </a>
                      <span className="text-slate-300">•</span>
                      <a href={`tel:${b.customer?.phone}`} className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 font-medium">
                        <Phone className="w-3.5 h-3.5" />
                        <span dir="ltr">{b.customer?.phone}</span>
                      </a>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900">{b.model?.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{b.services?.map((s: any) => s.service?.name_ar).join(' + ')}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-800">{b.area?.name_ar}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {formatDay(b.slot_date)} — {formatSlotLabel(b.slot_label_snapshot)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{formatMoney(b.total_final ?? b.estimated_total)}</div>
                    {b.total_final !== null && <div className="text-[10px] text-emerald-600 font-semibold">نهائي</div>}
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                      تفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
            <span className="text-slate-500">
              صفحة {page} من {meta.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) }, false)}
                className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                aria-label="الصفحة السابقة"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => updateParams({ page: String(page + 1) }, false)}
                className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                aria-label="الصفحة التالية"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {openId && (
        <BookingDrawer
          id={openId}
          onClose={() => updateParams({ open: null }, false)}
          onChanged={() => {
            fetchBookings();
            outlet?.refreshBadges?.();
          }}
        />
      )}
    </div>
  );
}

function BookingDrawer({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const toast = useToast();
  const [booking, setBooking] = useState<any>(null);
  const [statusNote, setStatusNote] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [finalTotal, setFinalTotal] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const load = useCallback(async () => {
    try {
      const b = await api.getBooking(id);
      setBooking(b);
      setInternalNotes(b.internal_notes || '');
      setFinalTotal(b.total_final !== null ? String(Number(b.total_final)) : '');
    } catch (e: any) {
      toast.error(e.message || 'تعذر تحميل الحجز');
      onClose();
    }
  }, [id, toast, onClose]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const changeStatus = async (next: BookingStatus) => {
    if (!booking || next === booking.status) return;
    if ((next === 'cancelled' || next === 'no_show') && !confirm(`تأكيد تغيير الحالة إلى "${STATUS_META[next].label}"؟`)) return;
    setIsUpdating(true);
    try {
      const total = next === 'completed' && finalTotal !== '' ? Number(finalTotal) : undefined;
      await api.updateBookingStatus(booking.id, next, statusNote.trim(), total);
      toast.success(`تم تحديث الحالة إلى "${STATUS_META[next].label}"`);
      setStatusNote('');
      await load();
      onChanged();
    } catch (e: any) {
      toast.error(e.message || 'تعذر تحديث الحالة');
    } finally {
      setIsUpdating(false);
    }
  };

  const saveFinalTotal = async () => {
    if (!booking) return;
    setIsUpdating(true);
    try {
      await api.updateBookingStatus(booking.id, booking.status, 'تحديث الإجمالي النهائي', finalTotal === '' ? null : Number(finalTotal));
      toast.success('تم حفظ الإجمالي النهائي');
      await load();
      onChanged();
    } catch (e: any) {
      toast.error(e.message || 'تعذر الحفظ');
    } finally {
      setIsUpdating(false);
    }
  };

  const saveNotes = async () => {
    if (!booking) return;
    setIsSavingNotes(true);
    try {
      await api.updateBookingNotes(booking.id, internalNotes);
      toast.success('تم حفظ الملاحظات الداخلية');
      setBooking({ ...booking, internal_notes: internalNotes });
    } catch (e: any) {
      toast.error(e.message || 'تعذر حفظ الملاحظات');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const nextStep = booking ? STATUS_FLOW[STATUS_FLOW.indexOf(booking.status) + 1] : undefined;
  const notesDirty = booking && (booking.internal_notes || '') !== internalNotes;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-start" onClick={onClose}>
      <div
        className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl border-l border-slate-200 mr-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-600 block">{booking?.booking_number || '…'}</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">تفاصيل الحجز</h3>
          </div>
          <div className="flex items-center gap-2">
            {booking && <StatusBadge status={booking.status} />}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100" aria-label="إغلاق">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!booking ? (
          <div className="p-10 text-center text-slate-400">جاري التحميل…</div>
        ) : (
          <div className="p-5 sm:p-6 space-y-6">
            {/* Quick action */}
            {nextStep && booking.status !== 'cancelled' && booking.status !== 'no_show' && (
              <button
                disabled={isUpdating}
                onClick={() => changeStatus(nextStep)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm disabled:opacity-50"
              >
                {isUpdating ? 'جاري التحديث…' : `الخطوة التالية: ${STATUS_META[nextStep].label}`}
              </button>
            )}

            {/* Customer */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-900">{booking.customer?.name}</span>
                  {booking.customer?._count?.bookings > 1 && (
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      عميل متكرر ({booking.customer._count.bookings} حجوزات)
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1 mr-6" dir="ltr">
                  {booking.customer?.phone}
                </div>
                {booking.customer?.email && <div className="text-xs text-slate-500 mt-0.5 mr-6">{booking.customer.email}</div>}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${whatsappNumber(booking.whatsapp_number || booking.customer?.phone)}?text=${encodeURIComponent(
                    `مرحباً ${booking.customer?.name}، بخصوص حجز صيانة ${booking.model?.name} برقم ${booking.booking_number} من FocusFix.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                  title="محادثة واتساب"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a href={`tel:${booking.customer?.phone}`} className="p-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors" title="اتصال">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Device & services */}
            <Section icon={Smartphone} title="الجهاز والخدمات">
              <div className="font-bold text-slate-900">{booking.model?.name}</div>
              <div className="divide-y divide-slate-100">
                {booking.services?.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-700">
                      {s.service?.name_ar}
                      <span className="text-[11px] text-slate-400 mr-2">ضمان {s.warranty_days_snapshot} يوم</span>
                    </span>
                    <span className="font-semibold text-slate-900">{s.price_pending ? 'يحدد بعد الفحص' : formatMoney(s.price_snapshot)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-500">رسوم الانتقال</span>
                  <span className="font-semibold">{formatMoney(booking.transport_fee_snapshot)}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-500">الإجمالي التقديري</span>
                  <span className="font-extrabold text-emerald-600">{formatMoney(booking.estimated_total)}</span>
                </div>
              </div>
              <div className="flex items-end gap-2 pt-2">
                <label className="flex-1 text-xs font-bold text-slate-700">
                  الإجمالي النهائي المحصّل (ج.م)
                  <input
                    type="number"
                    min={0}
                    value={finalTotal}
                    onChange={(e) => setFinalTotal(e.target.value)}
                    placeholder={String(Number(booking.estimated_total))}
                    className="mt-1 w-full p-2 border border-slate-200 rounded-lg text-sm font-normal"
                  />
                </label>
                <button
                  onClick={saveFinalTotal}
                  disabled={isUpdating || finalTotal === (booking.total_final !== null ? String(Number(booking.total_final)) : '')}
                  className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold disabled:opacity-40"
                >
                  حفظ
                </button>
              </div>
            </Section>

            {/* Location */}
            <Section icon={MapPin} title="الموقع والموعد">
              <div className="font-semibold text-slate-800">
                {booking.area?.name_ar} {booking.property_type === 'office' ? '— مكتب' : '— منزل'}
              </div>
              <div className="text-sm text-slate-600">{booking.address}</div>
              {booking.location_lat && booking.location_lng && (
                <a
                  href={`https://maps.google.com/?q=${booking.location_lat},${booking.location_lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-700 underline"
                >
                  فتح الموقع على الخريطة
                </a>
              )}
              <div className="text-sm text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDay(booking.slot_date)} — {formatSlotLabel(booking.slot_label_snapshot)}
                </span>
              </div>
            </Section>

            {booking.notes && (
              <Section icon={StickyNote} title="ملاحظات العميل">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{booking.notes}</p>
              </Section>
            )}

            {/* Internal notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">ملاحظات داخلية (لا يراها العميل)</label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="ملاحظات للفني، قطع الغيار المطلوبة، ..."
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {notesDirty && (
                <button
                  onClick={saveNotes}
                  disabled={isSavingNotes}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingNotes ? 'جاري الحفظ…' : 'حفظ الملاحظات'}
                </button>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">تغيير الحالة</span>
              <input
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="سبب أو ملاحظة على التغيير (اختياري) — تظهر في سجل الحجز"
                className="w-full p-2 border border-slate-200 rounded-lg text-xs"
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(STATUS_META) as BookingStatus[]).map((s) => (
                  <button
                    key={s}
                    disabled={isUpdating}
                    onClick={() => changeStatus(s)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-colors disabled:opacity-50 ${
                      booking.status === s ? `${STATUS_META[s].className} border-transparent` : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {STATUS_META[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            <Section icon={History} title="سجل الحجز">
              <ol className="relative border-r border-slate-200 mr-1.5 space-y-4">
                {booking.events?.map((ev: any) => (
                  <li key={ev.id} className="mr-4">
                    <span className="absolute -right-1.5 mt-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    <div className="text-xs font-bold text-slate-800">{STATUS_META[ev.status as BookingStatus]?.label || ev.status}</div>
                    {ev.note && <div className="text-xs text-slate-600 mt-0.5">{ev.note}</div>}
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatDateTime(ev.created_at)} • {ev.created_by}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        <span>{title}</span>
      </h4>
      <div className="p-4 border border-slate-200 rounded-xl space-y-1.5">{children}</div>
    </div>
  );
}
