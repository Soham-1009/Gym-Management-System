import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none select-none tracking-tight whitespace-nowrap';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5',
  };

  const variants = {
    primary: 'bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white shadow-sm shadow-indigo-600/20 hover:shadow-glow-primary hover:-translate-y-px active:translate-y-0 active:scale-[0.98] ring-1 ring-inset ring-white/10',
    accent: 'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-400 text-zinc-950 shadow-sm hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
    secondary: 'bg-white hover:bg-zinc-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.15] shadow-sm dark:shadow-none active:scale-[0.98]',
    danger: 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:border-rose-300 dark:hover:border-rose-500/40 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-zinc-100 dark:hover:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {!loading && Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </button>
  );
};

export default Button;
