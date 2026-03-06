"use client";

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const readInitial = () => {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('sidebarCollapsed') : null;
      setCollapsed(stored === '1');
    };
    readInitial();
    const onChange = () => readInitial();
    if (typeof window !== 'undefined') {
      window.addEventListener('sidebar-collapsed-changed', onChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sidebar-collapsed-changed', onChange);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className={collapsed ? 'lg:pl-20' : 'lg:pl-64'} id="layout-content">
        <main className="min-h-screen pt-14 sm:pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}



