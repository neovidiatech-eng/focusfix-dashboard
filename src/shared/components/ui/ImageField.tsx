import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Link2 } from 'lucide-react';
import { api } from '../../../lib/api';

/**
 * Upload (or paste a link to) one image. The API re-encodes uploads to WebP,
 * so any phone photo is fine. Calls onChange with the final URL ('' to clear).
 */
export function ImageField({
  value,
  onChange,
  label = 'الصورة',
  hint = 'JPG / PNG / WebP — لحد 8MB. يفضل خلفية بيضا أو شفافة.',
  aspect = 'aspect-square',
}: {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  aspect?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const [linkMode, setLinkMode] = useState(false);

  const upload = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { url } = await api.uploadImage(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل رفع الصورة');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">{label}</span>
        <button type="button" onClick={() => setLinkMode((v) => !v)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700">
          <Link2 className="h-3 w-3" />
          {linkMode ? 'رفع من الجهاز' : 'لصق رابط'}
        </button>
      </div>

      {linkMode ? (
        <input
          type="url"
          dir="ltr"
          defaultValue={value || ''}
          placeholder="https://…"
          onBlur={(e) => onChange(e.target.value.trim())}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            upload(e.dataTransfer.files?.[0]);
          }}
          className={`relative flex items-center gap-3 rounded-xl border-2 border-dashed p-2 transition-colors ${drag ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
        >
          <div className={`relative w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 ${aspect}`}>
            {value ? (
              <img src={value} alt="" className="h-full w-full object-contain" />
            ) : (
              <div className="grid h-full w-full place-items-center text-slate-300">
                <ImagePlus className="h-6 w-6" />
              </div>
            )}
            {busy && (
              <div className="absolute inset-0 grid place-items-center bg-white/70">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => input.current?.click()}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {value ? 'تغيير الصورة' : 'رفع صورة'}
              </button>
              {value && (
                <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50">
                  <Trash2 className="h-3 w-3" /> إزالة
                </button>
              )}
            </div>
            <p className="mt-1 text-[10px] text-slate-400">{hint} أو اسحب الصورة هنا.</p>
          </div>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
        </div>
      )}
      {error && <p className="mt-1 text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
