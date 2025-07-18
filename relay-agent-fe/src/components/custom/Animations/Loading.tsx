import React, { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  borderColor: string;
}

function Loading({ className, borderColor, ...props }: Props) {
  return (
    <div
      {...props}
      className={`${className} inline-block animate-spin rounded-full border-2 border-solid ${borderColor} border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
      role="status"
    ></div>
  );
}

export default Loading;
