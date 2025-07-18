'use client';
import Image, { ImageProps } from 'next/image';

const ImageObj = {
  prism: require('@/assets/icons/prism.svg'),
  lockHighlight: require('@/assets/icons/lock-highlight.svg'),
  lockDisabled: require('@/assets/icons/lock-disabled.svg'),
  gift: require('@/assets/icons/gift.svg'),
  copy: require('@/assets/icons/copy.svg'),
  clock: require('@/assets/icons/clock.svg'),
  swap: require('@/assets/icons/swap.svg'),
  addLiquidity: require('@/assets/icons/add-liquidity.svg'),
  staking: require('@/assets/icons/staking.svg'),
  delegation: require('@/assets/icons/delegation.svg'),
  wallet: require('@/assets/icons/wallet.svg'),
  deposit: require('@/assets/icons/deposit.svg'),
  borrow: require('@/assets/icons/borrow.svg'),
  long: require('@/assets/icons/long.svg'),
  short: require('@/assets/icons/short.svg'),
  close: require('@/assets/icons/close.svg'),
  closeBlack: require('@/assets/icons/close-black.svg'),
  meme: require('@/assets/icons/meme.svg'),
  invite: require('@/assets/icons/invite.svg'),
  bug: require('@/assets/icons/bug.svg'),
  chevronRight: require('@/assets/icons/chevron-right.svg'),
  whiteTwitter: require('@/assets/icons/white-twitter.svg'),
  whiteDiscord: require('@/assets/icons/white-discord.svg'),
  blackTwitter: require('@/assets/icons/black-twitter.svg'),
  blackDiscord: require('@/assets/icons/black-discord.svg'),
  menu: require('@/assets/icons/menu.svg'),
};

export type IconsType = keyof typeof ImageObj;

interface Icons extends Omit<ImageProps, 'src' | 'width' | 'height' | 'alt'> {
  icon: IconsType;
  disabled?: boolean;
  color?: string;
  size?: number;
  className?: string;
}

const Icons = ({ icon, color, className, size, ...props }: Icons) => {
  return (
    <Image
      {...props}
      alt={icon}
      src={ImageObj[icon]}
      width={size}
      height={size}
      color={color}
      className={className}
    />
  );
};

export default Icons;
