import { useState } from 'react';
import { Plus, Smartphone, Wrench, Edit, Trash2, X, Save } from 'lucide-react';

interface DeviceModel {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  seriesAr: string;
  seriesEn: string;
  typeId: string;
  year: number;
}

interface ServiceItem {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  estimatedMinutes: number;
  iconName: string;
}

export function CatalogPage() {
  const [activeTab, setActiveTab] = useState<'models' | 'services'>('models');
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<DeviceModel | null>(null);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [models, setModels] = useState<DeviceModel[]>([
    { id: '1', nameAr: 'آيفون 16 برو ماكس', nameEn: 'iPhone 16 Pro Max', slug: 'iphone-16-pro-max', seriesAr: 'سلسلة آيفون 16', seriesEn: 'iPhone 16 Series', typeId: 'iphone', year: 2024 },
    { id: '2', nameAr: 'آيفون 16 برو', nameEn: 'iPhone 16 Pro', slug: 'iphone-16-pro', seriesAr: 'سلسلة آيفون 16', seriesEn: 'iPhone 16 Series', typeId: 'iphone', year: 2024 },
    { id: '3', nameAr: 'آيفون 15 برو ماكس', nameEn: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', seriesAr: 'سلسلة آيفون 15', seriesEn: 'iPhone 15 Series', typeId: 'iphone', year: 2023 },
    { id: '4', nameAr: 'آيفون 15 برو', nameEn: 'iPhone 15 Pro', slug: 'iphone-15-pro', seriesAr: 'سلسلة آيفون 15', seriesEn: 'iPhone 15 Series', typeId: 'iphone', year: 2023 },
    { id: '5', nameAr: 'آيفون 14 برو ماكس', nameEn: 'iPhone 14 Pro Max', slug: 'iphone-14-pro-max', seriesAr: 'سلسلة آيفون 14', seriesEn: 'iPhone 14 Series', typeId: 'iphone', year: 2022 },
  ]);

  const [services, setServices] = useState<ServiceItem[]>([
    { id: '1', nameAr: 'تغيير شاشة أصلية', nameEn: 'Screen Replacement', slug: 'screen-replacement', estimatedMinutes: 25, iconName: 'Smartphone' },
    { id: '2', nameAr: 'تغيير بطارية أبل', nameEn: 'Battery Replacement', slug: 'battery-replacement', estimatedMinutes: 15, iconName: 'Battery' },
    { id: '3', nameAr: 'تغيير ظهر زجاجي ليزر', nameEn: 'Back Glass Repair', slug: 'back-glass', estimatedMinutes: 45, iconName: 'Shield' },
    { id: '4', nameAr: 'صيانة كاميرا أصلية', nameEn: 'Camera Replacement', slug: 'camera-repair', estimatedMinutes: 20, iconName: 'Camera' },
    { id: '5', nameAr: 'فلكس ومدخل شحن', nameEn: 'Charging Port Port', slug: 'charging-port', estimatedMinutes: 20, iconName: 'Zap' },
  ]);

  // Model Form States
  const [modelNameAr, setModelNameAr] = useState('');
  const [modelNameEn, setModelNameEn] = useState('');
  const [modelSlug, setModelSlug] = useState('');
  const [modelSeriesAr, setModelSeriesAr] = useState('');
  const [modelSeriesEn, setModelSeriesEn] = useState('');
  const [modelYear, setModelYear] = useState(2024);

  // Service Form States
  const [serviceNameAr, setServiceNameAr] = useState('');
  const [serviceNameEn, setServiceNameEn] = useState('');
  const [serviceSlug, setServiceSlug] = useState('');
  const [serviceMinutes, setServiceMinutes] = useState(25);

  const handleOpenNewModel = () => {
    setEditingModel(null);
    setModelNameAr('');
    setModelNameEn('');
    setModelSlug('');
    setModelSeriesAr('سلسلة آيفون 16');
    setModelSeriesEn('iPhone 16 Series');
    setModelYear(2024);
    setIsModelModalOpen(true);
  };

  const handleOpenEditModel = (m: DeviceModel) => {
    setEditingModel(m);
    setModelNameAr(m.nameAr);
    setModelNameEn(m.nameEn);
    setModelSlug(m.slug);
    setModelSeriesAr(m.seriesAr);
    setModelSeriesEn(m.seriesEn);
    setModelYear(m.year);
    setIsModelModalOpen(true);
  };

  const handleSaveModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModel) {
      setModels((prev) =>
        prev.map((item) =>
          item.id === editingModel.id
            ? { ...item, nameAr: modelNameAr, nameEn: modelNameEn, slug: modelSlug, seriesAr: modelSeriesAr, seriesEn: modelSeriesEn, year: modelYear }
            : item
        )
      );
    } else {
      const newModel: DeviceModel = {
        id: String(Date.now()),
        nameAr: modelNameAr,
        nameEn: modelNameEn,
        slug: modelSlug || modelNameEn.toLowerCase().replace(/\s+/g, '-'),
        seriesAr: modelSeriesAr,
        seriesEn: modelSeriesEn,
        typeId: 'iphone',
        year: modelYear,
      };
      setModels([newModel, ...models]);
    }
    setIsModelModalOpen(false);
  };

  const handleDeleteModel = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموديل؟')) {
      setModels((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleOpenNewService = () => {
    setEditingService(null);
    setServiceNameAr('');
    setServiceNameEn('');
    setServiceSlug('');
    setServiceMinutes(25);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (s: ServiceItem) => {
    setEditingService(s);
    setServiceNameAr(s.nameAr);
    setServiceNameEn(s.nameEn);
    setServiceSlug(s.slug);
    setServiceMinutes(s.estimatedMinutes);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      setServices((prev) =>
        prev.map((item) =>
          item.id === editingService.id
            ? { ...item, nameAr: serviceNameAr, nameEn: serviceNameEn, slug: serviceSlug, estimatedMinutes: serviceMinutes }
            : item
        )
      );
    } else {
      const newService: ServiceItem = {
        id: String(Date.now()),
        nameAr: serviceNameAr,
        nameEn: serviceNameEn,
        slug: serviceSlug || serviceNameEn.toLowerCase().replace(/\s+/g, '-'),
        estimatedMinutes: serviceMinutes,
        iconName: 'Wrench',
      };
      setServices([...services, newService]);
    }
    setIsServiceModalOpen(false);
  };

  const handleDeleteService = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

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
        <div className="flex items-center gap-2">
          {activeTab === 'models' ? (
            <button
              onClick={handleOpenNewModel}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موديل جديد</span>
            </button>
          ) : (
            <button
              onClick={handleOpenNewService}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة خدمة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('models')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
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
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'services'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>قائمة الخدمات ({services.length})</span>
        </button>
      </div>

      {/* Models Table */}
      {activeTab === 'models' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">اسم الموديل (عربي)</th>
                <th className="py-3 px-4">اسم الموديل (إنجليزي)</th>
                <th className="py-3 px-4">السلسلة والفئة</th>
                <th className="py-3 px-4">الرابط اللاتيني (Slug)</th>
                <th className="py-3 px-4">سنة الإصدار</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{m.nameAr}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{m.nameEn}</td>
                  <td className="py-3.5 px-4 text-slate-600">{m.seriesAr}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{m.slug}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-700">{m.year}</td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditModel(m)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteModel(m.id)}
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
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.nameAr}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{s.nameEn}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{s.slug}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">{s.estimatedMinutes} دقيقة</td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditService(s)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(s.id)}
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

      {/* Model Modal */}
      {isModelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingModel ? 'تعديل بيانات الموديل' : 'إضافة موديل جهاز جديد'}
              </h3>
              <button onClick={() => setIsModelModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم بالعربية</label>
                  <input
                    type="text"
                    required
                    value={modelNameAr}
                    onChange={(e) => setModelNameAr(e.target.value)}
                    placeholder="آيفون 16 برو ماكس"
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
                    placeholder="iPhone 16 Pro Max"
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
                  placeholder="iphone-16-pro-max"
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
                    placeholder="سلسلة آيفون 16"
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
                    placeholder="iPhone 16 Series"
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ الموديل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingService ? 'تعديل بيانات الخدمة' : 'إضافة خدمة صيانة جديدة'}
              </h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4">
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ الخدمة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
