import React from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center space-y-4">
      <div className="max-w-md w-full flex justify-start">
        <BackButton fallback="/" label="Go Back" />
      </div>
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-sm space-y-6">
        <span className="text-6xl font-black text-brand-600 tracking-tighter">404</span>
        <h1 className="text-2xl font-black text-navy-900 dark:text-white">Page Not Found</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The requested page or product route could not be found. It may have been moved or deleted.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-navy-900 dark:bg-brand-600 hover:bg-brand-600 text-white font-bold text-xs transition-colors"
        >
          <Home className="w-4 h-4" /> Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
