import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit, Trash2, X, RefreshCw, Search, CalendarClock, CalendarOff, Copy } from 'lucide-react';
import { api, SlotRow } from '../../lib/api';
import { useToast } from '../../shared/components/ui/Toast';
import { formatDay, formatSlotLabel, todayCairo } from '../../shared/utils/format';

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

interface AreaForm {
  name_ar: string;
  name_en: string;
  slug: string;
  city_ar: string;
  transport_fee: string;
  order: string;
  intro_ar: string;
  seo_title: string;
  seo_desc: string;
}

const EMPTY_FORM: AreaForm = {
  name_ar: '',
  name_en: '',
  slug: '',
  city_ar: 'القاهرة',
  transport_fee: '0',
  order: '0',
  intro_ar: '',
  seo_title: '',
  seo_desc: '',
};

export function AreasSlotsPage() {
  const toast = useToast();
  const [areas, setAreas] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingArea, setEditingArea] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scheduleArea, setScheduleArea] = useState<any | null>(null);

  const fetchAreas = useCallback(async () => {
    setIsLoading(true);
    try {
      setAreas(await api.getAreas());
    } catch (e: any) {
      toast.error(e.message || 'تعذر تحميل المناطق');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return areas.filter(
      (a) => !q || a.name_ar.toLowerCase().includes(q) || (a.name_en || '').toLowerCase().includes(q) || (a.city_ar || '').includes(q)
    );
  }, [areas, search]);

  const toggleActive = async (a: any) => {
    try {
      await api.updateArea(a.id, { is_active: !a.is_active });
      toast.success(a.is_active ? `تم إيقاف ${a.name_ar} — لن تظهر في الحجز` : `تم تفعيل ${a.name_ar}`);
      fetchAreas();
    } catch (e: any) {
      toast.error(e.message || 'تعذر التحديث');
    }
  };

  const deleteArea = async (a: any) => {
    if (a._count?.bookings) {
      toast.error(`لا يمكن حذف ${a.name_ar} لأن عليها ${a._count.bookings} حجز. يمكنك إيقافها بدلاً من ذلك.`);
      return;
    }
    if (!confirm(`حذف منطقة "${a.name_ar}" ومواعيدها نهائياً؟`)) return;
    try {
      await api.deleteArea(a.id);
      toast.success('تم حذف المنطقة');
      fetchAreas();
    } catch (e: any) {
      toast.error(e.message || 'تعذر حذف المنطقة');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المناطق والمواعيد</h1>
          <p className="text-sm text-slate-500 mt-1">مناطق التغطية، رسوم الانتقال، جدول المواعيد الأسبوعي، والإجازات</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAreas}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            تحديث
          </button>
          <button
            onClick={() => {
              setEditingArea(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            إضافة منطقة
          </button>
        </div>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن منطقة أو مدينة..."
          className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm bg-white"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">المنطقة</th>
                <th className="py-3 px-4">المدينة</th>
                <th className="py-3 px-4">رسوم الانتقال</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">الحجوزات</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    لا توجد مناطق
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
                <tr key={a.id} className={`hover:bg-slate-50 ${a.is_active ? '' : 'opacity-60'}`}>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{a.name_ar}</div>
                    <div className="text-[11px] text-slate-400 font-mono">/areas/{a.slug}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{a.city_ar}</td>
                  <td className="py-3.5 px-4 font-semibold">
                    {Number(a.transport_fee) === 0 ? (
                      <span className="text-emerald-600">مجاناً</span>
                    ) : (
                      <span className="text-amber-600">+{Number(a.transport_fee)} ج.م</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleActive(a)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        a.is_active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                      title="اضغط للتبديل"
                    >
                      {a.is_active ? 'مفعّلة' : 'متوقفة'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{a._count?.bookings || 0}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setScheduleArea(a)}
                        className="text-xs font-semibold text-emerald-700 px-2.5 py-1 border border-emerald-200 rounded-md hover:bg-emerald-50 flex items-center gap-1"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        المواعيد ({a._count?.time_slots || 0})
                      </button>
                      <button
                        onClick={() => {
                          setEditingArea(a);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteArea(a)} className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50" title="حذف">
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

      {isFormOpen && (
        <AreaFormModal
          area={editingArea}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => {
            setIsFormOpen(false);
            fetchAreas();
          }}
        />
      )}

      {scheduleArea && <ScheduleModal area={scheduleArea} onClose={() => setScheduleArea(null)} onSaved={fetchAreas} />}
    </div>
  );
}

function AreaFormModal({ area, onClose, onSaved }: { area: any | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState<AreaForm>(
    area
      ? {
          name_ar: area.name_ar || '',
          name_en: area.name_en || '',
          slug: area.slug || '',
          city_ar: area.city_ar || 'القاهرة',
          transport_fee: String(Number(area.transport_fee || 0)),
          order: String(area.order || 0),
          intro_ar: area.intro_ar || '',
          seo_title: area.seo_title || '',
          seo_desc: area.seo_desc || '',
        }
      : EMPTY_FORM
  );
  const [isSaving, setIsSaving] = useState(false);
  const set = (k: keyof AreaForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...form, transport_fee: Number(form.transport_fee || 0), order: Number(form.order || 0) };
      if (area) await api.updateArea(area.id, payload);
      else await api.createArea(payload);
      toast.success(area ? 'تم تحديث المنطقة' : 'تمت إضافة المنطقة مع جدول مواعيد افتراضي');
      onSaved();
    } catch (err: any) {
      toast.error(err.message || 'تعذر حفظ المنطقة');
    } finally {
      setIsSaving(false);
    }
  };

  const input = 'mt-1 w-full p-2 border border-slate-200 rounded-lg text-sm font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="font-bold text-slate-900">{area ? 'تعديل المنطقة' : 'إضافة منطقة جديدة'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <label className="text-xs font-bold text-slate-700">
            الاسم بالعربي *
            <input required value={form.name_ar} onChange={set('name_ar')} className={input} placeholder="مثال: المعادي" />
          </label>
          <label className="text-xs font-bold text-slate-700">
            الاسم بالإنجليزي
            <input value={form.name_en} onChange={set('name_en')} className={input} placeholder="Maadi" dir="ltr" />
          </label>
          <label className="text-xs font-bold text-slate-700">
            رابط الصفحة (slug)
            <input value={form.slug} onChange={set('slug')} className={input} placeholder="maadi" dir="ltr" />
          </label>
          <label className="text-xs font-bold text-slate-700">
            المدينة
            <select value={form.city_ar} onChange={set('city_ar')} className={`${input} bg-white`}>
              <option>القاهرة</option>
              <option>الجيزة</option>
              <option>القليوبية</option>
            </select>
          </label>
          <label className="text-xs font-bold text-slate-700">
            رسوم الانتقال (ج.م)
            <input type="number" min={0} value={form.transport_fee} onChange={set('transport_fee')} className={input} />
          </label>
          <label className="text-xs font-bold text-slate-700">
            ترتيب العرض
            <input type="number" value={form.order} onChange={set('order')} className={input} />
          </label>
          <label className="col-span-2 text-xs font-bold text-slate-700">
            نبذة تظهر في صفحة المنطقة على الموقع
            <textarea value={form.intro_ar} onChange={set('intro_ar')} rows={3} className={input} placeholder="خدمة صيانة آيفون منزلية في ..." />
          </label>
          <label className="col-span-2 text-xs font-bold text-slate-700">
            عنوان SEO (اختياري)
            <input value={form.seo_title} onChange={set('seo_title')} className={input} />
          </label>
          <label className="col-span-2 text-xs font-bold text-slate-700">
            وصف SEO (اختياري)
            <textarea value={form.seo_desc} onChange={set('seo_desc')} rows={2} className={input} />
          </label>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold">
            إلغاء
          </button>
          <button type="submit" disabled={isSaving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold disabled:opacity-50">
            {isSaving ? 'جاري الحفظ…' : 'حفظ'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ScheduleModal({ area, onClose, onSaved }: { area: any; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [tab, setTab] = useState<'weekly' | 'closures'>('weekly');
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSlot, setNewSlot] = useState({ start: '19:00', end: '22:00', capacity: '3' });
  const [closure, setClosure] = useState({ date: '', slotId: '', reason: '' });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [s, ex] = await Promise.all([api.getAreaSlots(area.id), api.getAreaExceptions(area.id)]);
      setSlots(s);
      setExceptions(ex);
    } catch (e: any) {
      toast.error(e.message || 'تعذر تحميل المواعيد');
    } finally {
      setIsLoading(false);
    }
  }, [area.id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // Distinct periods across the week form the rows of the grid
  const periods = useMemo(() => {
    const keys = new Map<string, { start: string; end: string }>();
    slots.forEach((s) => keys.set(`${s.start_time}-${s.end_time}`, { start: s.start_time, end: s.end_time }));
    return [...keys.values()].sort((a, b) => a.start.localeCompare(b.start));
  }, [slots]);

  const findSlot = (day: number, p: { start: string; end: string }) =>
    slots.find((s) => s.day_of_week === day && s.start_time === p.start && s.end_time === p.end);

  const updateSlot = (day: number, p: { start: string; end: string }, changes: Partial<SlotRow>) => {
    setSlots((prev) => {
      const existing = prev.find((s) => s.day_of_week === day && s.start_time === p.start && s.end_time === p.end);
      if (existing) return prev.map((s) => (s === existing ? { ...s, ...changes } : s));
      return [...prev, { day_of_week: day, start_time: p.start, end_time: p.end, max_bookings: 3, is_active: true, ...changes }];
    });
  };

  const addPeriod = () => {
    if (!newSlot.start || !newSlot.end || newSlot.start >= newSlot.end) {
      toast.error('وقت البداية يجب أن يكون قبل وقت النهاية');
      return;
    }
    const capacity = Math.max(1, Number(newSlot.capacity) || 1);
    setSlots((prev) => [
      ...prev.filter((s) => !(s.start_time === newSlot.start && s.end_time === newSlot.end)),
      ...DAYS.map((_, day) => ({ day_of_week: day, start_time: newSlot.start, end_time: newSlot.end, max_bookings: capacity, is_active: true })),
    ]);
  };

  const removePeriod = (p: { start: string; end: string }) => {
    setSlots((prev) => prev.filter((s) => !(s.start_time === p.start && s.end_time === p.end)));
  };

  const copySundayToAll = () => {
    setSlots((prev) => {
      const sunday = prev.filter((s) => s.day_of_week === 0);
      return DAYS.flatMap((_, day) => sunday.map((s) => ({ ...s, id: undefined, day_of_week: day })));
    });
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const saved = await api.saveAreaSlots(
        area.id,
        slots.map(({ day_of_week, start_time, end_time, max_bookings, is_active }) => ({ day_of_week, start_time, end_time, max_bookings, is_active }))
      );
      setSlots(saved);
      toast.success('تم حفظ جدول المواعيد');
      onSaved();
    } catch (e: any) {
      toast.error(e.message || 'تعذر حفظ الجدول');
    } finally {
      setIsSaving(false);
    }
  };

  const addClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSlotException({
        area_id: area.id,
        slot_id: closure.slotId || null,
        date: closure.date,
        is_closed: true,
        reason: closure.reason || undefined,
      });
      toast.success('تم إغلاق الموعد في هذا اليوم');
      setClosure({ date: '', slotId: '', reason: '' });
      load();
    } catch (err: any) {
      toast.error(err.message || 'تعذر الإضافة');
    }
  };

  const removeClosure = async (id: string) => {
    try {
      await api.deleteSlotException(id);
      setExceptions((prev) => prev.filter((x) => x.id !== id));
      toast.success('تم إلغاء الإغلاق');
    } catch (err: any) {
      toast.error(err.message || 'تعذر الحذف');
    }
  };

  const closureDay = closure.date ? new Date(`${closure.date}T00:00:00Z`).getUTCDay() : null;
  const closureSlots = closureDay === null ? [] : slots.filter((s) => s.day_of_week === closureDay && s.id && s.is_active);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">مواعيد {area.name_ar}</h3>
            <p className="text-xs text-slate-500 mt-0.5">السعة = أقصى عدد حجوزات في الفترة. 0 أو إلغاء التفعيل يغلق الفترة.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pt-4 flex gap-2">
          {(
            [
              ['weekly', 'الجدول الأسبوعي', CalendarClock],
              ['closures', `الإجازات والإغلاقات (${exceptions.length})`, CalendarOff],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${tab === id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-10 text-center text-slate-400">جاري التحميل…</div>
          ) : tab === 'weekly' ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-2 text-right">الفترة</th>
                      {DAYS.map((d) => (
                        <th key={d} className="p-2 font-bold text-slate-700">
                          {d}
                        </th>
                      ))}
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {periods.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-6 text-slate-400">
                          لا توجد فترات — أضف فترة بالأسفل
                        </td>
                      </tr>
                    )}
                    {periods.map((p) => (
                      <tr key={`${p.start}-${p.end}`} className="border-b border-slate-100">
                        <td className="p-2 text-right font-semibold text-slate-800 whitespace-nowrap">{formatSlotLabel(`${p.start} - ${p.end}`)}</td>
                        {DAYS.map((_, day) => {
                          const s = findSlot(day, p);
                          const active = !!s && s.is_active && s.max_bookings > 0;
                          return (
                            <td key={day} className="p-1">
                              <div className={`rounded-lg border p-1 ${active ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                                <input
                                  type="number"
                                  min={0}
                                  max={50}
                                  value={s && s.is_active ? s.max_bookings : 0}
                                  onChange={(e) => {
                                    const v = Math.max(0, Number(e.target.value) || 0);
                                    updateSlot(day, p, { max_bookings: v, is_active: v > 0 });
                                  }}
                                  className="w-12 text-center bg-transparent font-bold text-slate-900 focus:outline-none"
                                  aria-label={`سعة ${DAYS[day]} ${p.start}`}
                                />
                              </div>
                            </td>
                          );
                        })}
                        <td className="p-1">
                          <button onClick={() => removePeriod(p)} className="p-1 text-rose-500 hover:bg-rose-50 rounded" title="حذف الفترة من كل الأيام">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-end gap-3 p-3 bg-slate-50 rounded-xl">
                <label className="text-xs font-bold text-slate-700">
                  من
                  <input type="time" value={newSlot.start} onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })} className="block mt-1 p-1.5 border border-slate-200 rounded-lg" />
                </label>
                <label className="text-xs font-bold text-slate-700">
                  إلى
                  <input type="time" value={newSlot.end} onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })} className="block mt-1 p-1.5 border border-slate-200 rounded-lg" />
                </label>
                <label className="text-xs font-bold text-slate-700">
                  السعة
                  <input type="number" min={1} value={newSlot.capacity} onChange={(e) => setNewSlot({ ...newSlot, capacity: e.target.value })} className="block mt-1 w-16 p-1.5 border border-slate-200 rounded-lg" />
                </label>
                <button onClick={addPeriod} className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100">
                  <Plus className="w-3.5 h-3.5" />
                  إضافة فترة لكل الأيام
                </button>
                <button onClick={copySundayToAll} className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100">
                  <Copy className="w-3.5 h-3.5" />
                  نسخ جدول الأحد لكل الأيام
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <form onSubmit={addClosure} className="flex flex-wrap items-end gap-3 p-3 bg-slate-50 rounded-xl">
                <label className="text-xs font-bold text-slate-700">
                  التاريخ
                  <input
                    required
                    type="date"
                    min={todayCairo()}
                    value={closure.date}
                    onChange={(e) => setClosure({ ...closure, date: e.target.value, slotId: '' })}
                    className="block mt-1 p-1.5 border border-slate-200 rounded-lg"
                  />
                </label>
                <label className="text-xs font-bold text-slate-700">
                  الفترة
                  <select value={closure.slotId} onChange={(e) => setClosure({ ...closure, slotId: e.target.value })} className="block mt-1 p-1.5 border border-slate-200 rounded-lg bg-white">
                    <option value="">اليوم بالكامل</option>
                    {closureSlots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {formatSlotLabel(`${s.start_time} - ${s.end_time}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold text-slate-700 flex-1 min-w-[160px]">
                  السبب (اختياري)
                  <input value={closure.reason} onChange={(e) => setClosure({ ...closure, reason: e.target.value })} placeholder="إجازة رسمية..." className="block mt-1 w-full p-1.5 border border-slate-200 rounded-lg" />
                </label>
                <button type="submit" className="px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold">
                  إغلاق الموعد
                </button>
              </form>

              {exceptions.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">لا توجد إغلاقات قادمة</p>
              ) : (
                <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
                  {exceptions.map((x) => (
                    <li key={x.id} className="flex items-center justify-between p-3 text-sm">
                      <div>
                        <span className="font-bold text-slate-900">{formatDay(x.date)}</span>
                        <span className="text-slate-500 mr-2">
                          {x.slot ? formatSlotLabel(`${x.slot.start_time} - ${x.slot.end_time}`) : 'اليوم بالكامل'}
                          {x.is_closed ? ' — مغلق' : ` — سعة ${x.max_override}`}
                        </span>
                        {x.reason && <span className="text-xs text-slate-400 mr-2">({x.reason})</span>}
                      </div>
                      <button onClick={() => removeClosure(x.id)} className="text-xs font-semibold text-rose-600 hover:underline">
                        إلغاء
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {tab === 'weekly' && (
          <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold">
              إغلاق
            </button>
            <button onClick={save} disabled={isSaving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold disabled:opacity-50">
              {isSaving ? 'جاري الحفظ…' : 'حفظ الجدول'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
