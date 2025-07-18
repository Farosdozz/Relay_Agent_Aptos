'use client';
import React from 'react';
import Image from 'next/image';

const LayoutGateway = ({ children }: { children: React.ReactNode }) => {
  return (
    <main
      className={
        'relative mx-auto flex h-full min-h-screen w-full flex-col overflow-hidden px-4 md:px-10 lg:px-[120px]'
      }
      style={{ background: 'linear-gradient(180deg, #06222E 0%, #246D54 70.01%)' }}
    >
      <Image
        src={`/images/vector.svg`}
        alt="vector"
        width={600}
        height={600}
        className="absolute bottom-0 left-0 right-0 z-0 w-full object-fill"
      />
      <div className="z-1 relative">{children}</div>
    </main>
  );
};

export default LayoutGateway;
