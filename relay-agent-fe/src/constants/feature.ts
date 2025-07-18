import { ImagesType } from '@/components/main/Images';

export type TabType = 'smart' | 'powered' | 'advanced';

interface Feature {
  [key: string]: { image: ImagesType; imageMobile: ImagesType; content: string };
}

export enum FeatureEnum {
  SMART = 'smart',
  POWERED = 'powered',
  ADVANCED = 'advanced',
}

export const featureLists = [
  { type: 'smart', button: 'Smart Yield Discovery' },
  { type: 'powered', button: 'AI-Powered Strategy Execution' },
  { type: 'advanced', button: 'Advanced Strategy Command' },
];

export const featureType: Feature = {
  [FeatureEnum.SMART]: {
    image: 'smartYield',
    imageMobile: 'smartYieldMobile',
    content:
      'Relay simplifies yield discovery with real-time on-chain data: rapid, effortless, and accessible.',
  },
  [FeatureEnum.POWERED]: {
    image: 'powered',
    imageMobile: 'poweredMobile',
    content:
      'Executing multi-step DeFi strategies within a single command - zero coding and manual work required.',
  },
  [FeatureEnum.ADVANCED]: {
    image: 'advanced',
    imageMobile: 'advancedMobile',
    content:
      'Schedule orders, set conditions, auto-compound, and execute strategies with intents & natural language',
  },
};
