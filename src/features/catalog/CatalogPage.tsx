import { useState, useEffect } from 'react';
import { Plus, Smartphone, Wrench, Edit, Trash2, X, Save, RefreshCw, Layers, Eye, EyeOff, ImageIcon, Tablet } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../shared/components/ui/Toast';
import { ImageField } from '../../shared/components/ui/ImageField';

function Thumb({ src }: { src?: string | null }) {
  return src ? (
    <img src={src} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-slate-50 object-contain ring-1 ring-slate-200" />
  ) : (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-300 ring-1 ring-dashed ring-slate-200" title="بدون صورة">
      <ImageIcon className="h-4 w-4" />
    </span>
  );
}

interface DeviceType {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  image_url?: string | null;
  intro_ar?: string | null;
  is_active?: boolean;
  is_coming_soon?: boolean;
}

interface DeviceModel {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  seriesAr: string;
  seriesEn: string;
  typeId: string;
  typeName?: string;
  year: number;
  imageUrl: string;
  isActive: boolean;
  bookingsCount: number;
}

interface ServiceItem {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  estimatedMinutes: number;
  iconName: string;
  imageUrl: string;
  description: string;
  isActive: boolean;
  bookingsCount: number;
}

export function CatalogPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'models' | 'services' | 'types'>('models');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<DeviceModel | null>(null);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Model Form States
  const [modelTypeId, setModelTypeId] = useState('');
  const [modelNameAr, setModelNameAr] = useState('');
  const [modelNameEn, setModelNameEn] = useState('');
  const [modelSlug, setModelSlug] = useState('');
  const [modelSeriesAr, setModelSeriesAr] = useState('');
  const [modelSeriesEn, setModelSeriesEn] = useState('');
  const [modelYear, setModelYear] = useState(2024);
  const [modelImage, setModelImage] = useState('');

  // Service Form States
  const [serviceNameAr, setServiceNameAr] = useState('');
  const [serviceNameEn, setServiceNameEn] = useState('');
  const [serviceSlug, setServiceSlug] = useState('');
  const [serviceMinutes, setServiceMinutes] = useState(25);
  const [serviceImage, setServiceImage] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const catalog = await api.getAdminCatalog();
      const typesList: DeviceType[] = catalog.deviceTypes || [];
      setDeviceTypes(typesList);
      setModels(
        (catalog.models || []).map((m: any) => ({
          id: m.id,
          nameAr: m.name,
          nameEn: m.name,
          slug: m.slug,
          seriesAr: m.series_ar || '',
          seriesEn: m.series_en || '',
          typeId: m.type_id || '',
          typeName: m.type?.name_ar || typesList.find((t) => t.id === m.type_id)?.name_ar,
          year: m.release_year || new Date().getFullYear(),
          imageUrl: m.image_url || '',
          isActive: m.is_active,
          bookingsCount: m._count?.bookings || 0,
        }))
      );
      setServices(
        (catalog.services || []).map((s: any) => ({
          id: s.id,
          nameAr: s.name_ar,
          nameEn: s.name_en || s.name_ar,
          slug: s.slug,
          estimatedMinutes: s.estimated_minutes || 30,
          iconName: s.icon || 'Wrench',
          imageUrl: s.image_url || '',
          description: s.description_ar || '',
          isActive: s.is_active,
          bookingsCount: s._count?.booking_services || 0,
        }))
      );
    } catch (err: any) {
      toast.error(err.message || 'تعذر تحميل الكتالوج');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleOpenNewModel = () => {
    setEditingModel(null);
    setModelTypeId(deviceTypes[0]?.id || '');
    setModelNameAr('');
    setModelNameEn('');
    setModelSlug('');
    setModelSeriesAr('سلسلة آيفون 16');
    setModelSeriesEn('iPhone 16 Series');
    setModelYear(2024);
    setModelImage('');
    setIsModelModalOpen(true);
  };

  const handleOpenEditModel = (m: DeviceModel) => {
    setEditingModel(m);
    setModelTypeId(m.typeId || deviceTypes[0]?.id || '');
    setModelNameAr(m.nameAr);
    setModelNameEn(m.nameEn);
    setModelSlug(m.slug);
    setModelSeriesAr(m.seriesAr);
    setModelSeriesEn(m.seriesEn);
    setModelYear(m.year);
    setModelImage(m.imageUrl);
    setIsModelModalOpen(true);
  };

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: modelNameAr,
        slug: modelSlug || modelNameEn.toLowerCase().replace(/\s+/g, '-'),
        type_id: modelTypeId || deviceTypes[0]?.id,
        series_ar: modelSeriesAr,
        series_en: modelSeriesEn || modelSeriesAr,
        release_year: Number(modelYear),
        image_url: modelImage || null,
      };

      if (editingModel) {
        await api.updateModel(editingModel.id, payload);
      } else {
        await api.createModel(payload);
      }

      toast.success(editingModel ? 'تم تحديث الموديل' : 'تمت إضافة الموديل — أضف أسعاره من مصفوفة الأسعار');
      await fetchCatalog();
      setIsModelModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'فشل حفظ الموديل');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModel = async (m: DeviceModel) => {
    const msg = m.bookingsCount
      ? `هذا الموديل عليه ${m.bookingsCount} حجز، لذلك سيتم إخفاؤه من الموقع بدلاً من حذفه. متابعة؟`
      : 'هل أنت متأكد من حذف هذا الموديل؟ سيتم حذف جميع أسعاره المسجلة.';
    if (!confirm(msg)) return;
    try {
      const res = await api.deleteModel(m.id);
      toast.success(res.deactivated ? 'تم إخفاء الموديل من الموقع' : 'تم حذف الموديل');
      await fetchCatalog();
    } catch (err: any) {
      toast.error(err.message || 'فشل حذف الموديل');
    }
  };

  const toggleModel = async (m: DeviceModel) => {
    try {
      await api.updateModel(m.id, { is_active: !m.isActive });
      toast.success(m.isActive ? 'تم إخفاء الموديل من الموقع' : 'تم إظهار الموديل على الموقع');
      await fetchCatalog();
    } catch (err: any) {
      toast.error(err.message || 'تعذر التحديث');
    }
  };

  const toggleService = async (svc: ServiceItem) => {
    try {
      await api.updateService(svc.id, { is_active: !svc.isActive });
      toast.success(svc.isActive ? 'تم إخفاء الخدمة من الموقع' : 'تم إظهار الخدمة على الموقع');
      await fetchCatalog();
    } catch (err: any) {
      toast.error(err.message || 'تعذر التحديث');
    }
  };

  const handleOpenNewService = () => {
    setEditingService(null);
    setServiceNameAr('');
    setServiceNameEn('');
    setServiceSlug('');
    setServiceMinutes(25);
    setServiceImage('');
    setServiceDesc('');
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (s: ServiceItem) => {
    setEditingService(s);
    setServiceNameAr(s.nameAr);
    setServiceNameEn(s.nameEn);
    setServiceSlug(s.slug);
    setServiceMinutes(s.estimatedMinutes);
    setServiceImage(s.imageUrl);
    setServiceDesc(s.description);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name_ar: serviceNameAr,
        name_en: serviceNameEn || serviceNameAr,
        slug: serviceSlug,
        estimated_minutes: Number(serviceMinutes),
        image_url: serviceImage || null,
        description_ar: serviceDesc || null,
      };

      if (editingService) {
        await api.updateService(editingService.id, payload);
      } else {
        await api.createService(payload);
      }
      toast.success(editingService ? 'تم تحديث الخدمة' : 'تمت إضافة الخدمة');
      await fetchCatalog();
      setIsServiceModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'فشل حفظ الخدمة');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (svc: ServiceItem) => {
    const msg = svc.bookingsCount
      ? `هذه الخدمة مستخدمة في ${svc.bookingsCount} حجز، لذلك سيتم إخفاؤها بدلاً من حذفها. متابعة؟`
      : 'هل أنت متأكد من حذف هذه الخدمة وكل أسعارها؟';
    if (!confirm(msg)) return;
    try {
      const res = await api.deleteService(svc.id);
      toast.success(res.deactivated ? 'تم إخفاء الخدمة من الموقع' : 'تم حذف الخدمة');
      await fetchCatalog();
    } catch (err: any) {
      toast.error(err.message || 'فشل حذف الخدمة');
    }
  };

  const updateType = async (t: DeviceType, data: Partial<DeviceType>, okMsg: string) => {
    try {
      await api.updateDeviceType(t.id, data);
      setDeviceTypes((list) => list.map((x) => (x.id === t.id ? { ...x, ...data } : x)));
      toast.success(okMsg);
    } catch (err: any) {
      toast.error(err.message || 'تعذر التحديث');
    }
  };

  const filteredModels = models.filter((m) => {
    if (selectedTypeFilter === 'all') return true;
    const typeObj = deviceTypes.find((t) => t.slug === selectedTypeFilter);
    return m.typeId === typeObj?.id;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الكتالوج والأجهزة (Catalog)</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة موديلات الهواتف والأجهزة، والخدمات المتاحة للحجز والصيانة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCatalog}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>تحديث</span>
          </button>

          {activeTab === 'types' ? null : activeTab === 'models' ? (
            <button
              onClick={handleOpenNewModel}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موديل جديد</span>
            </button>
          ) : (
            <button
              onClick={handleOpenNewService}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة خدمة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('models')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'models'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>موديلات الأجهزة ({models.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'services'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>قائمة الخدمات ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('types')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'types'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tablet className="w-4 h-4" />
          <span>أنواع الأجهزة ({deviceTypes.length})</span>
        </button>
      </div>

      {/* Models Sub-filter by Device Type */}
      {activeTab === 'models' && deviceTypes.length > 0 && (
        <div className="flex items-center gap-2 pt-1 pb-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>تصفية الفئة:</span>
          </span>
          <button
            onClick={() => setSelectedTypeFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              selectedTypeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({models.length})
          </button>
          {deviceTypes.map((t) => {
            const count = models.filter((m) => m.typeId === t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTypeFilter(t.slug)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  selectedTypeFilter === t.slug
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.name_ar} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Models Table */}
      {activeTab === 'models' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">اسم الموديل</th>
                <th className="py-3 px-4">نوع الجهاز (الفئة)</th>
                <th className="py-3 px-4">السلسلة</th>
                <th className="py-3 px-4">الرابط اللاتيني (Slug)</th>
                <th className="py-3 px-4 text-center">سنة الإصدار</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredModels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    لا توجد أجهزة مضافة في هذه الفئة حالياً.
                  </td>
                </tr>
              ) : (
                filteredModels.map((m) => (
                  <tr key={m.id} className={`hover:bg-slate-50 ${m.isActive ? '' : 'opacity-60'}`}>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <Thumb src={m.imageUrl} />
                        <span>
                          {m.nameAr}
                          {!m.isActive && <span className="mr-2 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">مخفي</span>}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {m.typeName || 'جهاز'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{m.seriesAr}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{m.slug}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-700">{m.year}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleModel(m)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                          title={m.isActive ? 'إخفاء من الموقع' : 'إظهار على الموقع'}
                        >
                          {m.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleOpenEditModel(m)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteModel(m)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Services Table */}
      {activeTab === 'services' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">اسم الخدمة (عربي)</th>
                <th className="py-3 px-4">اسم الخدمة (إنجليزي)</th>
                <th className="py-3 px-4">الرابط اللاتيني (Slug)</th>
                <th className="py-3 px-4">متوسط مدة التركيب</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => (
                <tr key={s.id} className={`hover:bg-slate-50 ${s.isActive ? '' : 'opacity-60'}`}>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <Thumb src={s.imageUrl} />
                      <span>
                        {s.nameAr}
                        {!s.isActive && <span className="mr-2 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">مخفية</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{s.nameEn}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{s.slug}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">{s.estimatedMinutes} دقيقة</td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleService(s)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                        title={s.isActive ? 'إخفاء من الموقع' : 'إظهار على الموقع'}
                      >
                        {s.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenEditService(s)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(s)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Device Types */}
      {activeTab === 'types' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {deviceTypes.map((t) => (
            <div key={t.id} className={`bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3 ${t.is_active === false ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{t.name_ar}</div>
                  <div className="text-xs text-slate-400">{t.name_en} · {models.filter((m) => m.typeId === t.id).length} موديل</div>
                </div>
                <button
                  onClick={() => updateType(t, { is_active: t.is_active === false }, t.is_active === false ? 'ظهر على الموقع' : 'اتخفى من الموقع')}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                  title={t.is_active === false ? 'إظهار على الموقع' : 'إخفاء من الموقع'}
                >
                  {t.is_active === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <ImageField
                label="صورة الجهاز (بتظهر في الحجز والأسعار)"
                value={t.image_url}
                onChange={(url) => updateType(t, { image_url: url || null }, url ? 'تم حفظ الصورة' : 'تم حذف الصورة')}
              />
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={!!t.is_coming_soon}
                  onChange={(e) => updateType(t, { is_coming_soon: e.target.checked }, e.target.checked ? 'اتعلم "قريباً"' : 'اتشال "قريباً"')}
                  className="accent-emerald-600"
                />
                قريباً (يظهر من غير حجز)
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Model Modal */}
      {isModelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingModel ? 'تعديل بيانات الموديل' : 'إضافة موديل جهاز جديد'}
              </h3>
              <button onClick={() => setIsModelModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="p-6 space-y-4">
              <ImageField label="صورة الموديل" value={modelImage} onChange={setModelImage} />

              {/* Device Type Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع الجهاز (الفئة / التصنيف)</label>
                <select
                  value={modelTypeId}
                  onChange={(e) => setModelTypeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {deviceTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name_ar} ({t.name_en})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم بالعربية</label>
                  <input
                    type="text"
                    required
                    value={modelNameAr}
                    onChange={(e) => setModelNameAr(e.target.value)}
                    placeholder="iPad Pro 13 (M4)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    required
                    value={modelNameEn}
                    onChange={(e) => setModelNameEn(e.target.value)}
                    placeholder="iPad Pro 13 (M4)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الرابط اللاتيني (Slug)</label>
                <input
                  type="text"
                  required
                  value={modelSlug}
                  onChange={(e) => setModelSlug(e.target.value)}
                  placeholder="ipad-pro-13-m4"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السلسلة (عربي)</label>
                  <input
                    type="text"
                    required
                    value={modelSeriesAr}
                    onChange={(e) => setModelSeriesAr(e.target.value)}
                    placeholder="سلسلة آيباد برو"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السلسلة (إنجليزي)</label>
                  <input
                    type="text"
                    required
                    value={modelSeriesEn}
                    onChange={(e) => setModelSeriesEn(e.target.value)}
                    placeholder="iPad Pro Series"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سنة الإصدار</label>
                <input
                  type="number"
                  required
                  value={modelYear}
                  onChange={(e) => setModelYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModelModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الموديل'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingService ? 'تعديل بيانات الخدمة' : 'إضافة خدمة صيانة جديدة'}
              </h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4">
              <ImageField label="صورة الخدمة (بتظهر في صفحة الخدمات والحجز)" value={serviceImage} onChange={setServiceImage} aspect="aspect-[4/3]" hint="صورة أفقية. " />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الخدمة (عربي)</label>
                  <input
                    type="text"
                    required
                    value={serviceNameAr}
                    onChange={(e) => setServiceNameAr(e.target.value)}
                    placeholder="تغيير شاشة أصلية"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الخدمة (إنجليزي)</label>
                  <input
                    type="text"
                    required
                    value={serviceNameEn}
                    onChange={(e) => setServiceNameEn(e.target.value)}
                    placeholder="Screen Replacement"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الرابط اللاتيني (Slug)</label>
                <input
                  type="text"
                  required
                  value={serviceSlug}
                  onChange={(e) => setServiceSlug(e.target.value)}
                  placeholder="screen-replacement"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف قصير للعميل (اختياري)</label>
                <textarea
                  rows={2}
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  placeholder="شاشة مكسورة أو فيها خطوط؟ بنركب شاشة أصلية قدامك."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">متوسط مدة الصيانة (بالدقائق)</label>
                <input
                  type="number"
                  required
                  min={5}
                  value={serviceMinutes}
                  onChange={(e) => setServiceMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الخدمة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
