import { useState } from 'react';
import { Image as ImageIcon, Upload, Trash2, RefreshCw, Sparkles, Check } from 'lucide-react';

interface FeaturedImageUploaderProps {
  imageUrl: string;
  altText: string;
  caption: string;
  onChangeImage: (url: string) => void;
  onChangeAltText: (alt: string) => void;
  onChangeCaption: (cap: string) => void;
}

export function FeaturedImageUploader({
  imageUrl,
  altText,
  caption,
  onChangeImage,
  onChangeAltText,
  onChangeCaption,
}: FeaturedImageUploaderProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Curated stock photos relevant for Apple repairs & FocusFix
  const presetImages = [
    {
      url: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=1200&q=80',
      title: 'بطارية آيفون',
      alt: 'فحص واستبدال بطارية هاتف آيفون الأصلية',
    },
    {
      url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80',
      title: 'شاشة آيفون',
      alt: 'شاشة آيفون سوبر ريتينا أصلية في الصيانة',
    },
    {
      url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      title: 'أمان وخصوصية البيانات',
      alt: 'حماية خصوصية بيانات المستخدم أثناء الصيانة',
    },
    {
      url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80',
      title: 'شواحن ودوائر كهربائية',
      alt: 'شاحن معتمد وفحص دائرة الشحن في أجهزة أبل',
    },
    {
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      title: 'أدوات صيانة دقيقة',
      alt: 'معدات صيانة دقيقة لفك وتركيب أجهزة أبل',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          <span>الصورة البارزة للمقال (Featured Image)</span>
        </label>
        <span className="text-[10px] text-slate-400 font-mono">1200 × 630 px</span>
      </div>

      {imageUrl ? (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-900 aspect-video flex items-center justify-center">
            <img
              src={imageUrl}
              alt={altText || 'Featured preview'}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
            />
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsLibraryOpen(true)}
                className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow-md hover:bg-slate-100 flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تغيير</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeImage('')}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-rose-700 flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إزالة</span>
              </button>
            </div>
          </div>

          {/* Alt Text Input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>النص البديل (Alt Text) — حيوي لمحركات البحث</span>
              {!altText && <span className="text-rose-500 font-bold">* مطلوب</span>}
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => onChangeAltText(e.target.value)}
              placeholder="وصف واضح للصورة يساعد في تصدر بحث صور جوجل..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              التعليق التوضيحي (Caption)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => onChangeCaption(e.target.value)}
              placeholder="يظهر أسفل الصورة البارزة في صفحة المقال..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center space-y-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">أضف الصورة البارزة لمقالك</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              تظهر في بطاقة المقال، شبكات التواصل الاجتماعي، ونتائج البحث
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>اختر من المكتبة</span>
            </button>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>مكتبة صور FocusFix</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {presetImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChangeImage(img.url);
                      if (!altText) onChangeAltText(img.alt);
                      setIsLibraryOpen(false);
                    }}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 aspect-video"
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-white text-xs font-bold drop-shadow-sm truncate">
                        {img.title}
                      </span>
                    </div>
                    {imageUrl === img.url && (
                      <div className="absolute top-2 left-2 bg-emerald-600 text-white p-1 rounded-full shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Direct URL input option */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  أو أدخل رابط صورة مخصص (Direct Image URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    defaultValue={imageUrl}
                    id="custom-img-url-input"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono ltr text-left focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('custom-img-url-input') as HTMLInputElement;
                      if (el && el.value) {
                        onChangeImage(el.value);
                        setIsLibraryOpen(false);
                      }
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    اعتماد
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
