import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4 text-center overflow-hidden">
      <div className="pointer-events-none absolute top-1/4 -left-24 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute bottom-1/4 -right-24 w-96 h-96 rounded-full bg-sky-400/15 blur-3xl animate-pulse" />

      <div className="glass-card relative rounded-3xl p-10 max-w-md w-full shadow-2xl animate-fade-up">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center mx-auto mb-5">
          <Dumbbell className="w-7 h-7" />
        </div>
        <h1 className="text-7xl font-extrabold tracking-tighter text-gradient-brand leading-none">404</h1>
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mt-3">Page not found</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-7 leading-relaxed">
          The portal resource, routine, or analytics view you're looking for doesn't exist or has moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button icon={Home} onClick={() => navigate('/')}>
            Portal Home
          </Button>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
