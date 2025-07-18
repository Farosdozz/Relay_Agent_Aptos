import React, { HTMLAttributes, MouseEvent } from 'react';

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  classes?: string;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  previousIcon?: React.ReactNode;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'error';
}
