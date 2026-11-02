import type { BookingStatus } from '../../lib/api';

export const STATUS_META: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: 'بانتظار التأكيد', className: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'مؤكد', className: 'bg-blue-100 text-blue-800' },
  assigned: { label: 'تم تعيين فني', className: 'bg-indigo-100 text-indigo-800' },
  on_the_way: { label: 'الفني في الطريق', className: 'bg-sky-100 text-sky-800' },
  in_progress: { label: 'جاري الإصلاح', className: 'bg-violet-100 text-violet-800' },
  completed: { label: 'مكتمل', className: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'ملغي', className: 'bg-rose-100 text-rose-800' },
  no_show: { label: 'العميل لم يحضر', className: 'bg-slate-200 text-slate-700' },
};

/** The order staff move a booking through */
export const STATUS_FLOW: BookingStatus[] = ['pending', 'confirmed', 'assigned', 'on_the_way', 'in_progress', 'completed'];

export function StatusBadge({ status }: { status: BookingStatus }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return <span className={`px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${meta.className}`}>{meta.label}</span>;
}

export function formatMoney(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString('en-US')} ج.م`;
}

/** "2026-11-03T00:00:00.000Z" → "الثلاثاء 3 نوفمبر" (dates are stored as UTC calendar days) */
export function formatDay(value: string | Date | null | undefined) {
  if (!value) return '';
  return new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(value));
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return '';
  return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' }).format(new Date(value));
}

/** "13:00 - 16:00" → "01:00 م - 04:00 م" */
export function formatSlotLabel(label: string | null | undefined) {
  if (!label) return '';
  return label.replace(/\b(\d{2}):(\d{2})\b/g, (_, h, m) => {
    const hour = Number(h);
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${String(h12).padStart(2, '0')}:${m} ${hour < 12 ? 'ص' : 'م'}`;
  });
}

/** Normalises an Egyptian number for wa.me links: "+201012345678" / "01012345678" → "201012345678" */
export function whatsappNumber(phone: string | null | undefined) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('20')) return digits;
  if (digits.startsWith('0')) return `2${digits}`;
  return digits;
}

export function todayCairo() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date());
}

/** Triggers a CSV download (UTF-8 BOM so Excel shows Arabic correctly) */
export function downloadCsv(filename: string, rows: Array<Array<string | number | null | undefined>>) {
  const escape = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = '﻿' + rows.map((r) => r.map(escape).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Minimal CSV parser (quoted fields, commas, newlines) for price imports */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== '')) rows.push(row);
  return rows;
}
