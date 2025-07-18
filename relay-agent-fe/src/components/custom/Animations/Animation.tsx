import React from 'react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });

export const Animation = ({
  width,
  height,
  jsonData,
  speed,
}: {
  width?: number;
  height?: number;
  jsonData: any;
  speed?: number;
}) => {
  return (
    <Lottie
      animationData={jsonData}
      loop
      play
      style={{ cursor: 'default', width: width, height: height }}
      speed={speed}
    />
  );
};
