import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = "Loading digital products..." }) => {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-brand-100 dark:border-brand-950 border-t-brand-600 animate-spin" />
        <Loader2 className="w-5 h-5 text-brand-600 absolute inset-0 m-auto animate-pulse" />
      </div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
