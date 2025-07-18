import Images, { ImagesType } from '@/components/main/Images';
import React from 'react';
import Marquee from 'react-fast-marquee';

function Products() {
  const images: ImagesType[] = [
    'haiku',
    'arbitrum',
    'sonic',
    'base',
    'berachain',
    'kodiak',
    'webera',
    'virtualProtocol',
  ];

  return (
    <div className="relative flex h-[300px] items-center justify-between overflow-hidden bg-[#0a0b1f]">
      <div className="flex items-center gap-20">
        <Marquee loop={0} direction="left">
          {images.map((image) => (
            <div className="w-[65%]" key={image}>
              <Images image={image} alt={image} className="w-[300px]" />
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
}

export default Products;
