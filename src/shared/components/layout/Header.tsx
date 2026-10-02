import { Bell, Globe, User } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold text-slate-800">إدارة منصة FocusFix</h2>
        <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-0.5 rounded-full">
          المرحلة الأولى (MVP)
        </span>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="https://focusfix.net"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 border border-slate-200 rounded-md px-3 py-1.5"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>زيارة الموقع</span>
        </a>

        <div className="relative">
          <button className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
          </button>
        </div>

        <div className="flex items-center gap-2 pr-2 border-r border-slate-200 text-sm">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
            <User className="w-4 h-4" />
          </div>
          <div className="text-right">
            <p className="font-semibold text-xs text-slate-800">Super Admin</p>
            <p className="text-[10px] text-slate-500">admin@focusfix.net</p>
          </div>
        </div>
      </div>
    </header>
  );
}
