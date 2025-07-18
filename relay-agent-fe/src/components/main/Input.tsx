import React, { HTMLAttributes } from 'react';

interface InputProps extends HTMLAttributes<HTMLInputElement> {
  value?: string;
  classes?: string;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type: 'text' | 'password' | 'number';
  placeholder?: string;
  error?: string;
}

export const Input = ({
  value,
  classes,
  disabled,
  onChange,
  type,
  placeholder,
  error,
  ...rest
}: InputProps) => {
  return (
    <div className="h-full w-full">
      <input
        value={value}
        className={`w-full appearance-none bg-transparent px-4 text-sm focus:outline-none lg:text-base ${error ? 'border border-red-500' : ''} ${classes}`}
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        onChange={onChange}
        {...rest}
      />
      {/* {error && <div className="mt-1 text-xs text-red-500">{error}</div>} */}
    </div>
  );
};
