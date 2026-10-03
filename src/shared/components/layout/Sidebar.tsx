import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  TableProperties,
  Smartphone,
  MapPin,
  Newspaper,
  Inbox,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  badges?: {
    bookings: number;
    messages: number;
  };
}

export function Sidebar({ badges = { bookings: 3, messages: 2 } }: SidebarProps) {
  const links = [
    { to: '/overview', label: 'نظرة عامة (KPIs)', icon: LayoutDashboard },
    { to: '/bookings', label: 'الحجوزات', icon: CalendarCheck, badge: badges.bookings },
    { to: '/pricing', label: 'مصفوفة الأسعار', icon: TableProperties },
    { to: '/catalog', label: 'الكتالوج والأجهزة', icon: Smartphone },
    { to: '/areas', label: 'المناطق والمواعيد', icon: MapPin },
    { to: '/blog', label: 'المدونة (CMS)', icon: Newspaper },
    { to: '/messages', label: 'الرسائل والطلبات', icon: Inbox, badge: badges.messages },
    { to: '/settings', label: 'المحتوى والإعدادات', icon: Settings },
    { to: '/audit', label: 'سجل التدقيق (Audit)', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0 h-screen sticky top-0 border-l border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white text-lg">
          F
        </div>
        <div>
          <span className="font-bold text-lg text-white">FocusFix</span>
          <span className="text-xs text-emerald-400 block font-medium">لوحة التحكم المركزية</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isBlog = link.to === '/blog';
          return (
            <div key={link.to} className="space-y-1">
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && link.badge > 0 ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500 text-slate-950">
                    {link.badge}
                  </span>
                ) : null}
              </NavLink>

              {/* Blog Sub-menu */}
              {isBlog && (
                <div className="pr-7 pl-2 py-1 space-y-1 text-xs">
                  <NavLink
                    to="/blog"
                    end
                    className={({ isActive }) =>
                      `block px-2.5 py-1.5 rounded-md transition-colors ${
                        isActive
                          ? 'text-emerald-400 font-bold bg-slate-800/60'
                          : 'text-slate-400 hover:text-slate-200'
                      }`
                    }
                  >
                    • قائمة المقالات
                  </NavLink>
                  <NavLink
                    to="/blog/new"
                    className={({ isActive }) =>
                      `block px-2.5 py-1.5 rounded-md transition-colors ${
                        isActive
                          ? 'text-emerald-400 font-bold bg-slate-800/60'
                          : 'text-slate-400 hover:text-slate-200'
                      }`
                    }
                  >
                    • إضافة مقال جديد
                  </NavLink>
                  <NavLink
                    to="/blog/categories"
                    className={({ isActive }) =>
                      `block px-2.5 py-1.5 rounded-md transition-colors ${
                        isActive
                          ? 'text-emerald-400 font-bold bg-slate-800/60'
                          : 'text-slate-400 hover:text-slate-200'
                      }`
                    }
                  >
                    • التصنيفات (Categories)
                  </NavLink>
                  <NavLink
                    to="/blog/tags"
                    className={({ isActive }) =>
                      `block px-2.5 py-1.5 rounded-md transition-colors ${
                        isActive
                          ? 'text-emerald-400 font-bold bg-slate-800/60'
                          : 'text-slate-400 hover:text-slate-200'
                      }`
                    }
                  >
                    • الوسوم (Tags)
                  </NavLink>
                  <NavLink
                    to="/blog/authors"
                    className={({ isActive }) =>
                      `block px-2.5 py-1.5 rounded-md transition-colors ${
                        isActive
                          ? 'text-emerald-400 font-bold bg-slate-800/60'
                          : 'text-slate-400 hover:text-slate-200'
                      }`
                    }
                  >
                    • الكتاب (Authors)
                  </NavLink>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <p className="font-semibold text-slate-300">FocusFix Admin v1.0</p>
        <p className="mt-1">صيانة Apple المنزلية</p>
      </div>
    </aside>
  );
}
