import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Loader from '../components/common/Loader';

const AuthLayout = () => {
  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Subtle dotted grid, faded towards the edges */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.35] dark:opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style={{
          backgroundImage: 'radial-gradient(rgba(99,102,241,0.35) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      {/* Ambient colour orbs (indigo / sky / violet) */}
      <div aria-hidden="true" className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-indigo-500/20 dark:bg-indigo-500/15 blur-[120px] pointer-events-none animate-pulse [animation-duration:6s]" />
      <div aria-hidden="true" className="absolute -bottom-32 -right-24 w-[420px] h-[420px] rounded-full bg-sky-400/20 dark:bg-sky-500/10 blur-[120px] pointer-events-none animate-pulse [animation-duration:8s]" />
      <div aria-hidden="true" className="absolute top-1/3 right-1/4 w-[260px] h-[260px] rounded-full bg-violet-500/10 dark:bg-violet-500/10 blur-[100px] pointer-events-none" />

      <main className="w-full max-w-md relative z-10">
        <Suspense fallback={<Loader message="Loading..." />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AuthLayout;
