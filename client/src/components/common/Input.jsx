import React, { forwardRef, useId } from 'react';

const Input = forwardRef(
  ({ label, error, helperText, className = '', type = 'text', id, ...props }, ref) => {
    // Associate the <label> with the input for accessibility & click-to-focus.
    const autoId = useId();
    const inputId = id || autoId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error || helperText ? `${inputId}-hint` : undefined}
          className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900/60 border rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm shadow-sm dark:shadow-none focus:outline-none focus:ring-4 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-400 dark:border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/15'
              : 'border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] focus:border-indigo-500 focus:ring-indigo-500/15'
          } ${className}`}
          {...props}
        />
        {error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
