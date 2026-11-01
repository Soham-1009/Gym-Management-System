import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Loader from '../components/common/Loader';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* md:ml-64 offsets the fixed sidebar; previously md:pl-64 overrode md:p-8's left padding,
            leaving page content flush against the sidebar edge. */}
        <main className="flex-1 min-w-0 md:ml-64 p-4 sm:p-6 lg:p-8">
          {/* Keyed on pathname so each page gets a subtle entrance animation. */}
          <div key={location.pathname} className="max-w-7xl mx-auto space-y-6 animate-fade-up">
            <Suspense fallback={<Loader message="Loading page..." />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
