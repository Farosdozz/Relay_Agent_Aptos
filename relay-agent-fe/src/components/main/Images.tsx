'use client';
import Image, { ImageProps } from 'next/image';

const ImageObj = {
  relayPoint: require('@/assets/images/relay-point.png'),
  relayYap: require('@/assets/images/relay-yap.png'),
  relayYapTogether: require('@/assets/images/relay-yap-together.png'),
  relayYapBointMobile: require('@/assets/images/relay-yap-boint-mobile.png'),
  relayYapPartnerPlan: require('@/assets/images/relay-yap-partner-plan.png'),
  blur: require('@/assets/images/blur.png'),
  relayLook: require('@/assets/images/relay-look.webp'),
  mobileAnnouncement: require('@/assets/images/mobile-announ.svg'),
  relay: require('@/assets/images/relay.png'),
  blackLogo: require('@/assets/images/black-logo.svg'),
  whiteLogo: require('@/assets/images/white-logo.svg'),
  smartYield: require('@/assets/images/smart-yield.svg'),
  smartYieldMobile: require('@/assets/images/smart-yeild-mobile.svg'),
  powered: require('@/assets/images/powered.svg'),
  poweredMobile: require('@/assets/images/powered-mobile.svg'),
  advanced: require('@/assets/images/advanced.svg'),
  advancedMobile: require('@/assets/images/advanced-mobile.svg'),
  arbitrum: require('@/assets/images/arbitrum-logo.svg'),
  base: require('@/assets/images/base-logo.svg'),
  haiku: require('@/assets/images/haiku.svg'),
  kodiak: require('@/assets/images/kodiak.svg'),
  sonic: require('@/assets/images/sonic.svg'),
  berachain: require('@/assets/images/berachain.svg'),
  webera: require('@/assets/images/webera.svg'),
  virtualProtocol: require('@/assets/images/virtual-protocol.svg'),
  askRelay: require('@/assets/images/ask-relay.svg'),
  relayBanner: require('@/assets/images/relay-banner.svg'),
};

export type ImagesType = keyof typeof ImageObj;

interface Images extends Omit<ImageProps, 'src'> {
  image: ImagesType;
  disabled?: boolean;
  color?: string;
  className?: string;
}

const Images = ({ image, color, className, ...props }: Images) => {
  return <Image {...props} src={ImageObj[image]} color={color} className={className} />;
};

export default Images;
