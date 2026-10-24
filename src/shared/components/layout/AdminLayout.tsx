import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { api } from '../../../lib/api';

export function AdminLayout() {
  const [badges, setBadges] = useState<{ bookings: number }>({ bookings: 0 });
  const location = useLocation();

  const fetchBadges = useCallback(async () => {
    try {
      const data = await api.getBadges();
      if (data && typeof data.bookings === 'number') {
        setBadges({ bookings: data.bookings });
      }
    } catch {
      // Ignore background polling errors
    }
  }, []);

  useEffect(() => {
    fetchBadges();
    // Refresh badges every 15 seconds to reflect new bookings
    const interval = setInterval(fetchBadges, 15000);
    return () => clearInterval(interval);
  }, [fetchBadges, location.pathname]);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar badges={badges} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ refreshBadges: fetchBadges }} />
          </div>
        </main>
      </div>
    </div>
  );
}
