import { Fragment, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Save, Search, RefreshCw, Download, Upload, X, Undo2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../shared/components/ui/Toast';
import { downloadCsv, parseCsv } from '../../shared/utils/format';

type PriceStatus = 'available' | 'on_request' | 'unavailable' | 'included';

interface Cell {
  price: number | null;
  discountPrice: number | null;
  warrantyDays: number;
  status: PriceStatus;
  note_ar: string | null;
}

interface ServiceCol {
  id: string;
  slug: string;
  name_ar: string;
  default_warranty_days: number;
  is_active: boolean;
}

interface ModelRow {
  id: string;
  name: string;
  slug: string;
  series: string;
  is_active: boolean;
  cells: Record<string, Cell>; // keyed by service id
}

const STATUS_OPTIONS: Array<{ id: PriceStatus; label: string; className: string }> = [
  { id: 'available', label: 'متاح', className: 'text-emerald-700' },
  { id: 'on_request', label: 'حسب الفحص', className: 'text-amber-700' },
  { id: 'included', label: 'مشمول', className: 'text-indigo-700' },
  { id: 'unavailable', label: 'غير متاح', className: 'text-slate-400' },
];

const cellKey = (modelId: string, serviceId: string) => `${modelId}:${serviceId}`;
const num = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v));

export function PricingMatrixPage() {
  const toast = useToast();
  const [deviceTypes, setDeviceTypes] = useState<Array<{ slug: string; name_ar: string }>>([]);
  const [deviceType, setDeviceType] = useState('iphone');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [services, setServices] = useState<ServiceCol[]>([]);
  const [models, setModels] = useState<ModelRow[]>([]);
  const [edits, setEdits] = useState<Record<string, Cell>>({});
  const [editing, setEditing] = useState<{ modelId: string; serviceId: string } | null>(null);
  const [importPreview, setImportPreview] = useState<{ rows: any[]; diff: any } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirtyCount = Object.keys(edits).length;

  const fetchMatrix = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getPricingMatrix(deviceType);
      setServices((data.services || []).filter((s: ServiceCol) => s.is_active));
      setModels(
        (data.models || []).map((m: any) => {
          const cells: Record<string, Cell> = {};
          (m.prices || []).forEach((p: any) => {
            cells[p.service_id] = {
              price: num(p.price),
              discountPrice: num(p.discount_price),
              warrantyDays: p.warranty_days,
              status: p.status,
              note_ar: p.note_ar,
            };
          });
          return { id: m.id, name: m.name, slug: m.slug, series: m.series_ar || 'أخرى', is_active: m.is_active, cells };
        })
      );
      setEdits({});
    } catch (e: any) {
      toast.error(e.message || 'تعذر تحميل الأسعار');
    } finally {
      setIsLoading(false);
    }
  }, [deviceType, toast]);

  useEffect(() => {
    api
      .getAdminCatalog()
      .then((c) => setDeviceTypes(c.deviceTypes || []))
      .catch(() => setDeviceTypes([{ slug: 'iphone', name_ar: 'آيفون' }]));
  }, []);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  // Warn before leaving with unsaved price edits
  useEffect(() => {
    if (!dirtyCount) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirtyCount]);

  const switchType = (slug: string) => {
    if (dirtyCount && !confirm('لديك تعديلات غير محفوظة. هل تريد تجاهلها؟')) return;
    setDeviceType(slug);
  };

  const getCell = (m: ModelRow, s: ServiceCol): Cell =>
    edits[cellKey(m.id, s.id)] ||
    m.cells[s.id] || { price: null, discountPrice: null, warrantyDays: s.default_warranty_days || 180, status: 'unavailable', note_ar: null };

  const setCell = (m: ModelRow, s: ServiceCol, next: Cell) => {
    const original = m.cells[s.id];
    const same =
      original &&
      original.price === next.price &&
      original.discountPrice === next.discountPrice &&
      original.warrantyDays === next.warrantyDays &&
      original.status === next.status &&
      (original.note_ar || '') === (next.note_ar || '');
    setEdits((prev) => {
      const copy = { ...prev };
      if (same) delete copy[cellKey(m.id, s.id)];
      else copy[cellKey(m.id, s.id)] = next;
      return copy;
    });
  };

  const handleSave = async () => {
    const updates = Object.entries(edits).map(([key, c]) => {
      const [modelId, serviceId] = key.split(':');
      return {
        modelId,
        serviceId,
        price: c.price,
        discountPrice: c.discountPrice,
        warrantyDays: c.warrantyDays,
        status: c.status,
        note_ar: c.note_ar || null,
      };
    });
    if (updates.some((u) => u.status === 'available' && (u.price === null || u.price <= 0))) {
      toast.error('كل خدمة "متاحة" يجب أن يكون لها سعر أكبر من صفر');
      return;
    }
    if (updates.some((u) => u.discountPrice !== null && u.price !== null && u.discountPrice >= u.price)) {
      toast.error('سعر الخصم يجب أن يكون أقل من السعر الأساسي');
      return;
    }
    setIsSaving(true);
    try {
      await api.updatePricingMatrix(updates);
      toast.success(`تم حفظ ${updates.length} سعر وتحديث الموقع`);
      await fetchMatrix();
    } catch (e: any) {
      toast.error(e.message || 'تعذر حفظ الأسعار');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const header = ['modelSlug', 'model', 'serviceSlug', 'service', 'price', 'discountPrice', 'warrantyDays', 'status'];
    const rows = models.flatMap((m) =>
      services.map((s) => {
        const c = getCell(m, s);
        return [m.slug, m.name, s.slug, s.name_ar, c.price ?? '', c.discountPrice ?? '', c.warrantyDays, c.status];
      })
    );
    downloadCsv(`focusfix-prices-${deviceType}.csv`, [header, ...rows]);
  };

  const handleImportFile = async (file: File) => {
    try {
      const table = parseCsv(await file.text());
      const [header, ...body] = table;
      const idx = (name: string) => header.findIndex((h) => h.trim() === name);
      const [iModel, iService, iPrice, iDiscount, iWarranty, iStatus] = ['modelSlug', 'serviceSlug', 'price', 'discountPrice', 'warrantyDays', 'status'].map(idx);
      if (iModel < 0 || iService < 0 || iPrice < 0) {
        toast.error('الملف يجب أن يحتوي على الأعمدة: modelSlug, serviceSlug, price');
        return;
      }
      const rows = body
        .filter((r) => r[iModel]?.trim() && r[iService]?.trim() && r[iPrice]?.trim() !== '')
        .map((r) => ({
          modelSlug: r[iModel].trim(),
          serviceSlug: r[iService].trim(),
          price: Number(r[iPrice]),
          discountPrice: iDiscount >= 0 && r[iDiscount]?.trim() ? Number(r[iDiscount]) : null,
          warrantyDays: iWarranty >= 0 && r[iWarranty]?.trim() ? Number(r[iWarranty]) : undefined,
          status: iStatus >= 0 && r[iStatus]?.trim() ? r[iStatus].trim() : undefined,
        }));
      const res = await api.importPrices(rows, true);
      setImportPreview({ rows, diff: res.diff });
    } catch (e: any) {
      toast.error(e.message || 'تعذر قراءة الملف');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const applyImport = async () => {
    if (!importPreview) return;
    setIsSaving(true);
    try {
      const res = await api.importPrices(importPreview.rows, false);
      toast.success(`تم الاستيراد: ${res.diff.added} جديد، ${res.diff.updated} محدث`);
      setImportPreview(null);
      await fetchMatrix();
    } catch (e: any) {
      toast.error(e.message || 'فشل الاستيراد');
    } finally {
      setIsSaving(false);
    }
  };

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const groups = new Map<string, ModelRow[]>();
    models
      .filter((m) => !q || m.name.toLowerCase().includes(q) || m.series.toLowerCase().includes(q))
      .forEach((m) => {
        if (!groups.has(m.series)) groups.set(m.series, []);
        groups.get(m.series)!.push(m);
      });
    return [...groups.entries()];
  }, [models, search]);

  const editingModel = editing && models.find((m) => m.id === editing.modelId);
  const editingService = editing && services.find((s) => s.id === editing.serviceId);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مصفوفة الأسعار</h1>
          <p className="text-sm text-slate-500 mt-1">اضغط على أي خانة لتعديل السعر، الخصم، الضمان، والحالة — ثم احفظ التغييرات مرة واحدة</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchMatrix}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            تحديث
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            تصدير Excel
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            استيراد من Excel (CSV)
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImportFile(e.target.files[0])}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm w-fit">
          {deviceTypes.map((t) => (
            <button
              key={t.slug}
              onClick={() => switchType(t.slug)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                deviceType === t.slug ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.name_ar}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن موديل أو سلسلة..."
            className="w-full pr-9 pl-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm border-collapse">
            <thead className="bg-slate-800 text-white text-xs">
              <tr>
                <th className="py-3 px-4 sticky right-0 bg-slate-800 z-10 min-w-[170px]">الموديل</th>
                {services.map((s) => (
                  <th key={s.id} className="py-3 px-3 text-center min-w-[120px] border-r border-slate-700">
                    {s.name_ar}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!isLoading && grouped.length === 0 && (
                <tr>
                  <td colSpan={services.length + 1} className="py-10 text-center text-slate-400">
                    لا توجد موديلات. أضف موديلات من صفحة الكتالوج.
                  </td>
                </tr>
              )}
              {grouped.map(([series, rows]) => (
                <Fragment key={series}>
                  <tr className="bg-slate-100">
                    <td colSpan={services.length + 1} className="py-2 px-4 text-xs font-bold text-slate-600">
                      {series}
                    </td>
                  </tr>
                  {rows.map((m) => (
                    <tr key={m.id} className="border-b border-slate-100">
                      <td className="py-2.5 px-4 font-semibold text-slate-900 sticky right-0 bg-white z-10">
                        {m.name}
                        {!m.is_active && <span className="text-[10px] text-rose-500 mr-1">(مخفي)</span>}
                      </td>
                      {services.map((s) => {
                        const c = getCell(m, s);
                        const dirty = !!edits[cellKey(m.id, s.id)];
                        const opt = STATUS_OPTIONS.find((o) => o.id === c.status)!;
                        return (
                          <td key={s.id} className="p-1 border-r border-slate-100">
                            <button
                              onClick={() => setEditing({ modelId: m.id, serviceId: s.id })}
                              className={`w-full rounded-lg px-2 py-2 text-center transition-colors hover:bg-emerald-50 ${
                                dirty ? 'bg-amber-50 ring-1 ring-amber-300' : ''
                              }`}
                            >
                              {c.status === 'available' && c.price !== null ? (
                                <>
                                  <div className="font-bold text-slate-900">
                                    {(c.discountPrice ?? c.price).toLocaleString('en-US')}
                                  </div>
                                  {c.discountPrice !== null && (
                                    <div className="text-[10px] text-slate-400 line-through">{c.price.toLocaleString('en-US')}</div>
                                  )}
                                  <div className="text-[10px] text-slate-400">{c.warrantyDays} يوم</div>
                                </>
                              ) : (
                                <div className={`text-xs font-semibold ${opt.className}`}>{opt.label}</div>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky save bar */}
      {dirtyCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 lg:translate-x-[calc(-50%-8rem)] z-40 bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4">
          <span className="text-sm font-semibold">{dirtyCount} تعديل غير محفوظ</span>
          <button onClick={() => setEdits({})} className="flex items-center gap-1 text-xs text-slate-300 hover:text-white">
            <Undo2 className="w-3.5 h-3.5" />
            تراجع
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold rounded-xl disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'جاري الحفظ…' : 'حفظ ونشر'}
          </button>
        </div>
      )}

      {editingModel && editingService && (
        <CellEditor
          title={`${editingModel.name} — ${editingService.name_ar}`}
          cell={getCell(editingModel, editingService)}
          onClose={() => setEditing(null)}
          onApply={(c) => {
            setCell(editingModel, editingService, c);
            setEditing(null);
          }}
        />
      )}

      {importPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">معاينة الاستيراد</h3>
              <button onClick={() => setImportPreview(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">{importPreview.diff.added} جديد</span>
                <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold">{importPreview.diff.updated} تحديث</span>
                <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold">{importPreview.diff.errors.length} خطأ</span>
              </div>
              {importPreview.diff.errors.length > 0 && (
                <ul className="text-xs text-rose-600 space-y-1 max-h-32 overflow-y-auto">
                  {importPreview.diff.errors.map((e: string, i: number) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  {importPreview.diff.preview.slice(0, 200).map((p: any, i: number) => (
                    <tr key={i}>
                      <td className="py-1.5">{p.model}</td>
                      <td>{p.service}</td>
                      <td className="text-slate-400 line-through">{p.oldPrice !== undefined ? Number(p.oldPrice).toLocaleString('en-US') : '—'}</td>
                      <td className="font-bold">{Number(p.newPrice ?? p.price).toLocaleString('en-US')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setImportPreview(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold">
                إلغاء
              </button>
              <button
                onClick={applyImport}
                disabled={isSaving || importPreview.diff.added + importPreview.diff.updated === 0}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
              >
                {isSaving ? 'جاري الاستيراد…' : 'تطبيق الاستيراد'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CellEditor({ title, cell, onClose, onApply }: { title: string; cell: Cell; onClose: () => void; onApply: (c: Cell) => void }) {
  const [status, setStatus] = useState<PriceStatus>(cell.status);
  const [price, setPrice] = useState(cell.price !== null ? String(cell.price) : '');
  const [discount, setDiscount] = useState(cell.discountPrice !== null ? String(cell.discountPrice) : '');
  const [warranty, setWarranty] = useState(String(cell.warrantyDays));
  const [note, setNote] = useState(cell.note_ar || '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      status,
      price: price === '' ? null : Number(price),
      discountPrice: discount === '' ? null : Number(discount),
      warrantyDays: Number(warranty) || 0,
      note_ar: note.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((o) => (
            <button
              type="button"
              key={o.id}
              onClick={() => setStatus(o.id)}
              className={`py-2 rounded-lg text-xs font-bold border ${status === o.id ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-700'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-bold text-slate-700">
            السعر (ج.م)
            <input
              autoFocus
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full p-2 border border-slate-200 rounded-lg text-sm font-normal"
            />
          </label>
          <label className="text-xs font-bold text-slate-700">
            سعر بعد الخصم
            <input
              type="number"
              min={0}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="اختياري"
              className="mt-1 w-full p-2 border border-slate-200 rounded-lg text-sm font-normal"
            />
          </label>
          <label className="text-xs font-bold text-slate-700">
            الضمان (يوم)
            <select value={warranty} onChange={(e) => setWarranty(e.target.value)} className="mt-1 w-full p-2 border border-slate-200 rounded-lg text-sm font-normal bg-white">
              {[0, 30, 90, 180, 365].concat([Number(warranty)]).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b).map((d) => (
                <option key={d} value={d}>
                  {d === 0 ? 'بدون ضمان' : `${d} يوم`}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-700">
            ملاحظة للعميل
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="اختياري" className="mt-1 w-full p-2 border border-slate-200 rounded-lg text-sm font-normal" />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold">
            إلغاء
          </button>
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">
            تطبيق
          </button>
        </div>
      </form>
    </div>
  );
}
