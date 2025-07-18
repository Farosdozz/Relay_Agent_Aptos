import React from 'react';
import { ButtonProps } from '@/interfaces/components.interface';

export const OutlinedButton = ({
  classes,
  loading = false,
  disabled = false,
  label,
  onClick,
  prefixIcon,
  suffixIcon,
  variant = 'primary',
  ...rest
}: ButtonProps ) =>
{
  
  const colorSelector = {
    primary: '#00BB7B',
    secondary: '#9178FF',
    error: '#EA4141',
  };

  return (
    <button
      {...rest}
      onClick={onClick}
      disabled={loading || disabled}
      className={`w-full appearance-none border border-solid ${label ? 'rounded-3xl' : 'rounded-full'} ${classes} flex items-center justify-center gap-2.5 bg-transparent text-sm font-normal transition-all duration-300 disabled:opacity-30 lg:text-base`}
      style={{
        border: `1px solid ${colorSelector[variant]}`,
        color: colorSelector[variant],
      }}
    >
      {prefixIcon || null}
      {label || null}
      {suffixIcon || null}
    </button>
  );
};
