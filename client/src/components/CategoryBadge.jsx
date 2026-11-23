import React from 'react';

const categoryColorMap = {
  'E-books': 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800',
  'Tutorials': 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
  'Study Materials': 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
  'Templates': 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800',
  'PDFs': 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800',
  'Design Resources': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/80 dark:bg-fuchsia-950/70 dark:text-fuchsia-300 dark:border-fuchsia-800',
  'Notes & Guides': 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800',
};

const CategoryBadge = ({ category, className = '' }) => {
  const colorClass = categoryColorMap[category] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border backdrop-blur-xs tracking-tight ${colorClass} ${className}`}>
      {category || 'Digital'}
    </span>
  );
};

export default CategoryBadge;
