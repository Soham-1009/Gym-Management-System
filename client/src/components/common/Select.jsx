import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(
  ({ label, error, helperText, options = [], children, className = '', id, ...props }, ref) => {
    const autoId = useId();
    const selectId = id || autoId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={`w-full appearance-none pl-3.5 pr-10 py-2.5 bg-white dark:bg-zinc-900/60 border rounded-xl text-zinc-900 dark:text-zinc-100 text-sm shadow-sm dark:shadow-none cursor-pointer focus:outline-none focus:ring-4 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${
              error
                ? 'border-rose-400 dark:border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/15'
                : 'border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] focus:border-indigo-500 focus:ring-indigo-500/15'
            } ${className}`}
            {...props}
          >
            {children
              ? children
              : options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100"
                  >
                    {opt.label}
                  </option>
                ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        </div>
        {error && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        {!error && helperText && (
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
