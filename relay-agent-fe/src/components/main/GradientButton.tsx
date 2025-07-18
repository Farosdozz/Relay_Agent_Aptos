import React from 'react';
import { ButtonProps } from '@/interfaces/components.interface';

export const GradientButton = ({
  classes,
  loading = false,
  disabled = false,
  label,
  onClick,
  prefixIcon,
  suffixIcon,
  ...rest
}: ButtonProps) => {
  return (
    <button
      {...rest}
      onClick={onClick}
      disabled={loading || disabled}
      className={`w-full appearance-none ${label ? 'rounded-3xl' : 'rounded-full'} ${classes} flex items-center justify-center gap-2 text-sm font-normal text-white transition-all duration-300 disabled:opacity-30`}
      style={{
        background: 'linear-gradient(91deg, #06222E 7.43%, #24906B 103.76%)',
      }}
    >
      {prefixIcon || null}
      {label || null}
      {suffixIcon || null}
    </button>
  );
};
