"use client";

import { CheckIconSm } from "../../../icons/icons";
import { cn } from '../../../lib/utils';
import * as React from "react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  checkboxClassName?: string;
  labelClassName?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      checkboxClassName,
      labelClassName,
      checked,
      defaultChecked,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(
      defaultChecked || false
    );

    const isControlled = checked !== undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <label
        className={cn(
          'relative flex cursor-pointer select-none items-center space-x-3',
          props.disabled && 'cursor-not-allowed opacity-70',
          className
        )}
      >
        <input
          type="checkbox"
          className="peer hidden"
          ref={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          disabled={props.disabled}
          {...props}
        />

        <div
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded border transition-all duration-200',
            'peer-checked:border-primary-500 peer-checked:bg-primary-500',
            'peer-not-checked:border-gray-300 peer-not-checked:bg-white dark:peer-not-checked:border-gray-700 dark:peer-not-checked:bg-transparent',
            props.disabled && 'opacity-50',
            checkboxClassName
          )}
        >
          {(isControlled ? checked : internalChecked) && <CheckIconSm />}
        </div>

        {label && (
          <span
            className={cn(
              'block text-sm text-gray-700 dark:text-gray-400',
              labelClassName
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };

