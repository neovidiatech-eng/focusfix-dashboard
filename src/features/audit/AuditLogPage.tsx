import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { RefreshCw, ShieldCheck, History } from 'lucide-react';

interface AuditItem {
  id: string;
  action: string;
  details: string;
  user_id?: string | null;
  ip_address?: string | null;
  created_at: string;
}

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLog();
      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>سجل التدقيق والأمان (Audit Log)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            تسجيل حي وغير قابل للتعديل لجميع العمليات الحساسة وتغييرات الأسعار والإعدادات
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          تحديث السجل
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading && logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            جاري تحميل سجل التدقيق...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
            لا توجد سجلات مسجلة حالياً
          </div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">نوع العملية</th>
                <th className="py-3 px-4">التفاصيل والتغييرات</th>
                <th className="py-3 px-4">المستخدم</th>
                <th className="py-3 px-4">عنوان IP</th>
                <th className="py-3 px-4">التاريخ والوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className="inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-mono text-xs max-w-md break-words">
                    {l.details}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {l.user_id ? l.user_id.slice(0, 8) : 'النظام / الأدمن'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                    {l.ip_address || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
