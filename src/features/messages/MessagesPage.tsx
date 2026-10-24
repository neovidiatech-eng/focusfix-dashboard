import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { MessageCircle, Mail, RefreshCw, CheckCircle, Clock } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface QuoteRequest {
  id: string;
  type: string;
  name: string;
  phone: string;
  details?: string | null;
  status: string;
  created_at: string;
}

export function MessagesPage() {
  const [activeTab, setActiveTab] = useState<'messages' | 'quotes'>('messages');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [msgsData, quotesData] = await Promise.allSettled([
        api.getMessages(),
        api.getQuotes(),
      ]);

      if (msgsData.status === 'fulfilled' && Array.isArray(msgsData.value)) {
        setMessages(msgsData.value);
      }
      if (quotesData.status === 'fulfilled' && Array.isArray(quotesData.value)) {
        setQuotes(quotesData.value);
      }
    } catch (err) {
      console.error('Failed to load messages or quotes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await api.updateMessageStatus(id, newStatus);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
    } catch (err) {
      console.error('Failed to update message status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الرسائل وطلبات التواصل</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة استفسارات العملاء، طلبات التسعير لموديلات غير مدرجة، واقتراحات تغطية المناطق
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          تحديث البيانات
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'messages'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          رسائل التواصل ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'quotes'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          طلبات التسعير والمناطق ({quotes.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading && messages.length === 0 && quotes.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            جاري تحميل البيانات...
          </div>
        ) : activeTab === 'messages' ? (
          messages.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
              لا توجد رسائل تواصل حالياً
            </div>
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">المرسل</th>
                  <th className="py-3 px-4">رقم الهاتف والتواصل</th>
                  <th className="py-3 px-4">الرسالة</th>
                  <th className="py-3 px-4">الوقت</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{m.name}</div>
                      {m.email && <div className="text-xs font-normal text-slate-400">{m.email}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-700">{m.phone}</span>
                        <a
                          href={`https://wa.me/2${m.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded"
                          title="محادثة واتساب"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-sm break-words">
                      {m.message}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(m.created_at).toLocaleString('ar-EG', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          m.status === 'new'
                            ? 'bg-amber-100 text-amber-800'
                            : m.status === 'replied' || m.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.status === 'new' ? 'جديد' : m.status === 'replied' ? 'تم الرد' : m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {m.status === 'new' ? (
                        <button
                          onClick={() => handleUpdateStatus(m.id, 'replied')}
                          disabled={updatingId === m.id}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center justify-center gap-1 mx-auto"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          تحديد كمقروء / تم الرد
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">مكتمل</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : quotes.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            لا توجد طلبات تسعير حالياً
          </div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">العميل</th>
                <th className="py-3 px-4">الهاتف</th>
                <th className="py-3 px-4">نوع الطلب</th>
                <th className="py-3 px-4">التفاصيل</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{q.name}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-700">{q.phone}</span>
                      <a
                        href={`https://wa.me/2${q.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {q.type === 'model_request' ? 'طلب موديل جديد' : 'طلب تغطية منطقة'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 text-xs">{q.details || '—'}</td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(q.created_at).toLocaleString('ar-EG', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {q.status}
                    </span>
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
