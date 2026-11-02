import { Bell, Globe, LogOut, Menu, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SITE_URL } from '../../../lib/api';

interface HeaderProps {
  pendingBookings: number;
  onMenuClick: () => void;
}

export function Header({ pendingBookings, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm sm:text-base font-semibold text-slate-800">إدارة منصة FocusFix</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 border border-slate-200 rounded-md px-3 py-1.5"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>زيارة الموقع</span>
        </a>

        <Link
          to="/bookings?status=pending"
          className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 relative"
          title={pendingBookings > 0 ? `${pendingBookings} حجز بانتظار التأكيد` : 'لا توجد حجوزات معلقة'}
        >
          <Bell className="w-4 h-4" />
          {pendingBookings > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center">
              {pendingBookings}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-slate-200 text-sm">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
            <User className="w-4 h-4" />
          </div>
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-xs text-slate-800">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
