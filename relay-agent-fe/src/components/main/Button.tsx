import React from 'react';
import { ButtonProps } from '@/interfaces/components.interface';

interface MainButtonProps extends ButtonProps {
  color: 'primary' | 'secondary' | 'black' | 'transparent' | 'white';
  border?: 'primary';
}

export const Button = ({
  classes,
  loading = false,
  disabled = false,
  label,
  onClick,
  color = 'primary',
  previousIcon,
  prefixIcon,
  suffixIcon,
  border,
  ...rest
}: MainButtonProps) => {
  const borderClassname = {
    primary: 'border-2 border-border-primary',
  };

  const bgClassName = {
    primary: 'bg-components-buttons-primary',
    secondary: 'bg-components-buttons-secondary',
    black: 'bg-black',
    transparent: 'bg-transparent',
    white: 'bg-white',
  };

  return (
    <button
      {...rest}
      onClick={onClick}
      disabled={loading || disabled}
      className={`w-full appearance-none ${label ? 'rounded-3xl' : 'rounded-full'} ${classes} ${bgClassName?.[color]} ${borderClassname?.[border!]} flex items-center justify-center gap-2 text-base ${bgClassName?.[color] === 'bg-white' ? 'text-text-primary' : 'text-black'} transition-all duration-300 disabled:opacity-30 md:text-lg lg:text-xl`}
    >
      {previousIcon}
      {label || null}
      {prefixIcon || null}
      {suffixIcon || null}
    </button>
  );
};
