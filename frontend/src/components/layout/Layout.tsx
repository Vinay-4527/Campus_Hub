"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isSectionTransitioning, setIsSectionTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'down' | 'up' | null>(null);
  const pathname = usePathname();
  const router = useRouter();

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

  useEffect(() => {
    const nextSectionByPath: Record<string, string> = {
      '/dashboard': '/dashboard/lost-found',
      '/dashboard/lost-found': '/dashboard/events',
      '/dashboard/events': '/dashboard/notes',
      '/dashboard/notes': '/dashboard/mess-feedback',
    };
    const previousSectionByPath: Record<string, string> = {
      '/dashboard/lost-found': '/dashboard',
      '/dashboard/events': '/dashboard/lost-found',
      '/dashboard/notes': '/dashboard/events',
      '/dashboard/mess-feedback': '/dashboard/notes',
    };

    const nextPath = nextSectionByPath[pathname];
    const previousPath = previousSectionByPath[pathname];
    if (!nextPath && !previousPath) return;

    let lastTriggerAt = 0;
    let edgeDownIntent = 0;
    let edgeUpIntent = 0;
    let isNavigating = false;
    const onWheel = (event: WheelEvent) => {
      // Ignore section-switch scrolling while overlays/forms/modals are open.
      // Prevents accidental navigation when users scroll inside popups.
      const hasActiveOverlay = Array.from(
        document.querySelectorAll<HTMLElement>('.fixed.inset-0.z-50')
      ).some((element) => {
        if (element.classList.contains('hidden')) return false;
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return false;
        }
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if (hasActiveOverlay) {
        return;
      }

      const now = Date.now();
      if (isNavigating) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      if (now - lastTriggerAt < 2200) return;

      const nearBottom = scrollTop + viewportHeight >= fullHeight - 8;
      const nearTop = scrollTop <= 8;

      // Build intent only while scrolling at edges to avoid accidental switches.
      if (nearBottom && event.deltaY > 20) {
        edgeDownIntent += event.deltaY;
      } else {
        edgeDownIntent = 0;
      }

      if (nearTop && event.deltaY < -20) {
        edgeUpIntent += Math.abs(event.deltaY);
      } else {
        edgeUpIntent = 0;
      }

      // Scroll down at bottom => next dashboard section
      if (nextPath && edgeDownIntent >= 320) {
        lastTriggerAt = now;
        edgeDownIntent = 0;
        edgeUpIntent = 0;
        isNavigating = true;
        setTransitionDirection('down');
        setIsSectionTransitioning(true);
        event.preventDefault();
        window.setTimeout(() => {
          router.push(nextPath, { scroll: true });
        }, 340);
        return;
      }

      // Scroll up at top => previous dashboard section
      if (previousPath && edgeUpIntent >= 320) {
        lastTriggerAt = now;
        edgeDownIntent = 0;
        edgeUpIntent = 0;
        isNavigating = true;
        setTransitionDirection('up');
        setIsSectionTransitioning(true);
        event.preventDefault();
        window.setTimeout(() => {
          router.push(previousPath, { scroll: true });
        }, 340);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [pathname, router]);

  useEffect(() => {
    const hasActiveOverlay = () =>
      Array.from(document.querySelectorAll<HTMLElement>('.fixed.inset-0.z-50')).some((element) => {
        if (element.classList.contains('hidden')) return false;
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return false;
        }
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    const syncScrollLock = () => {
      const shouldLock = hasActiveOverlay();
      document.body.style.overflow = shouldLock ? 'hidden' : previousBodyOverflow;
      document.documentElement.style.overflow = shouldLock ? 'hidden' : previousHtmlOverflow;
    };

    syncScrollLock();

    const observer = new MutationObserver(() => {
      syncScrollLock();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      observer.disconnect();
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    // Keep landing cleanly at each section heading.
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.requestAnimationFrame(() => {
      setIsSectionTransitioning(false);
      setTransitionDirection(null);
    });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#fcde67]">
      <Sidebar />
      <div className={collapsed ? 'lg:pl-20' : 'lg:pl-64'} id="layout-content">
        <main className="min-h-screen pt-14 sm:pt-16 lg:pt-0">
          <div className="px-2 py-2 sm:px-4 sm:py-4 lg:px-8 lg:py-8">
            <div className={`w-full max-w-[1400px] mx-auto bg-white min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)] rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm lg:shadow-xl border border-[#030e12]/10 transition-all duration-700 ${
              isSectionTransitioning
                ? transitionDirection === 'down'
                  ? 'opacity-0 -translate-y-3'
                  : 'opacity-0 translate-y-3'
                : 'opacity-100'
            }`}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}



