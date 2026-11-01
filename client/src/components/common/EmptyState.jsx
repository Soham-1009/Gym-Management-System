import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items to display at this moment.',
  actionText,
  onAction,
}) => {
  return (
    // Previously used dark-only colours (e.g. text-zinc-200), making the title invisible in light mode.
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-white/[0.1] bg-zinc-50/60 dark:bg-white/[0.02] my-4 animate-fade-in">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl" />
        <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 border border-zinc-200 dark:border-white/[0.08] shadow-sm flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">{title}</h4>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-4">{description}</p>
      {actionText && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
