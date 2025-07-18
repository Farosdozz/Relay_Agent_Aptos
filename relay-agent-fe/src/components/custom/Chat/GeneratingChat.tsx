// import { GradientButton } from '@/components/main/GradientButton';
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import Image from 'next/image';
import { useEffect } from 'react';

export const GeneratingChat = () => {
  const { rive: rivePointButton, RiveComponent: PointButton } = useRive({
    stateMachines: 'button',
    src: `/rive/generating.riv`,
    autoplay: true,
    layout: new Layout({
      alignment: Alignment.Center,
      fit: Fit.Contain,
    }),
  });

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (rivePointButton) {
        rivePointButton.stop();
      }
    };
  }, [rivePointButton]);

  const handleMouseEnter = () => {
    if (rivePointButton) {
      rivePointButton.play();
    }
  };

  const handleMouseLeave = () => {
    if (rivePointButton) {
      rivePointButton.stop();
    }
  };

  return (
    <div className={'flex items-center gap-2 pb-4'}>
      <Image src={'/icons/relay-logo-white.svg'} alt={''} width={32} height={32} />
      <div className={'h-[60px] w-[120px]'}>
        {/* <GradientButton
          label={'Waiting for response'}
          suffixIcon={<Image src={'/icons/logo.svg'} width={20} height={20} alt={''} />}
          classes={'h-full'}
        /> */}
        loading
      </div>
    </div>
  );
};
