'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Search, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Lost & Found', href: '/dashboard/lost-found', icon: Search },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Notes', href: '/dashboard/notes', icon: FileText },
  { name: 'Mess Feedback', href: '/dashboard/mess-feedback', icon: MessageSquare },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sidebarCollapsed') : null;
    setCollapsed(stored === '1');
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', next ? '1' : '0');
      window.dispatchEvent(new Event('sidebar-collapsed-changed'));
    }
  };

  const handleLogout = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        await fetch('http://localhost:8000/api/auth/logout/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {});
      }
    } catch (_) {
      // ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      setSidebarOpen(false);
      router.replace('/auth?mode=login');
      setTimeout(() => { if (typeof window !== 'undefined' && window.location.pathname !== '/auth') window.location.href = '/auth?mode=login'; }, 100);
    }
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 text-xl font-bold text-slate-900 hover:text-sky-700 transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-sky-500 text-white shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </span>
              Campus Hub
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button onClick={handleLogout} className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className={`grid grid-cols-[1fr_auto] h-16 items-center ${collapsed ? 'px-2' : 'px-4'} w-full`}>
            <div className={`${collapsed ? 'flex justify-center' : 'flex items-center pl-2'}`}>
              <Link href="/dashboard" className={`flex items-center ${collapsed ? 'gap-0' : 'gap-2'} text-xl font-bold text-slate-900 hover:text-sky-700 transition-colors cursor-pointer`}>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-sky-500 text-white shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </span>
                {!collapsed && <span>Campus Hub</span>}
              </Link>
            </div>
            <div className="pl-2 flex justify-end">
              <button
                onClick={toggleCollapsed}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md border border-gray-200"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <nav className={`flex-1 space-y-1 ${collapsed ? 'px-1' : 'px-2'} py-4`}>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center ${collapsed ? 'justify-center' : ''} px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`${collapsed ? '' : 'mr-3'} h-5 w-5`} />
                  {!collapsed && item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button onClick={handleLogout} className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">
              <LogOut className={`${collapsed ? '' : 'mr-3'} h-5 w-5`} />
              {!collapsed && 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 text-gray-400 hover:text-gray-600"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  );
}



