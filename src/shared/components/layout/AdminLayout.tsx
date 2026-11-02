import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { api } from '../../../lib/api';
import { useToast } from '../ui/Toast';

export function AdminLayout() {
  const [badges, setBadges] = useState<{ bookings: number }>({ bookings: 0 });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const lastPending = useRef<number | null>(null);
  const location = useLocation();
  const toast = useToast();

  const fetchBadges = useCallback(async () => {
    try {
      const data = await api.getBadges();
      if (data && typeof data.bookings === 'number') {
        // Alert staff when new pending bookings arrive while the dashboard is open
        if (lastPending.current !== null && data.bookings > lastPending.current) {
          toast.info(`وصل ${data.bookings - lastPending.current} حجز جديد بانتظار التأكيد`);
          if (document.hidden) document.title = `(${data.bookings}) حجز جديد — FocusFix`;
        }
        lastPending.current = data.bookings;
        setBadges({ bookings: data.bookings });
      }
    } catch {
      // Ignore background polling errors
    }
  }, [toast]);

  useEffect(() => {
    fetchBadges();
    // Refresh badges every 15 seconds to reflect new bookings
    const interval = setInterval(fetchBadges, 15000);
    return () => clearInterval(interval);
  }, [fetchBadges]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const restoreTitle = () => {
      if (!document.hidden) document.title = 'FocusFix — لوحة التحكم الإدارية';
    };
    document.addEventListener('visibilitychange', restoreTitle);
    return () => document.removeEventListener('visibilitychange', restoreTitle);
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar badges={badges} mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header pendingBookings={badges.bookings} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ refreshBadges: fetchBadges }} />
          </div>
        </main>
      </div>
    </div>
  );
}
