'use client';

import { cn } from '../../../lib/utils';
import { forwardRef, HTMLProps, useId, useState } from 'react';
import { Label } from '../label';
import { EyeCloseIcon, EyeIcon } from '../../../icons/icons';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type || 'text'}
        className={cn(
          'h-12 w-full rounded-full border border-gray-300 px-5 py-2.5 text-left text-sm text-gray-800 shadow-theme-xs',
          'placeholder:text-sm placeholder:text-gray-400 disabled:opacity-70',
          'focus:border-primary-300 focus:outline-0 focus:ring-3 focus:ring-primary-300/20',
          'dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-primary-500',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

type InputGroupProps = Omit<HTMLProps<HTMLInputElement>, 'id'> & {
  label: string;
  groupClassName?: string;
  error?: string;
};

export function InputGroup({
  label,
  groupClassName,
  error,
  ...props
}: InputGroupProps) {
  const id = useId();

  return (
    <div className={groupClassName}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
      {error && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
    </div>
  );
}

type PasswordInputProps = Omit<HTMLProps<HTMLInputElement>, 'id'> & {
  label: string;
  error?: string;
};

export function PasswordInput({ label, error, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>

      <div className="relative mt-1.5">
        <Input id={id} type={showPassword ? 'text' : 'password'} {...props} />
        <button
          type="button"
          title={showPassword ? 'Hide password' : 'Show password'}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 dark:text-gray-400"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeCloseIcon /> : <EyeIcon />}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
    </div>
  );
}
