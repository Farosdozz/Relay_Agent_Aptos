import Image from 'next/image';
import { useMemo } from 'react';

type StrategyItemType = {
  label: string;
  value: string;
  icon?: string;
  highlights?: string[];
};

const mockStrategyData: StrategyItemType[] = [
  { label: 'TVL', value: '$540,000' },
  { label: 'Locked period', value: '3 months' },
  { label: 'Receive', value: 'BeraStone' },
  {
    label: 'Rewards',
    value:
      'A share of 1.5% total supply of Stakestone, ??% total supply of BERA, 1x Kodiak, 1x Dolomite',
    icon: '/icons/rewards.svg',
    highlights: ['1.5%', '1x', '1x'],
  },
];

const StrategyItem = ({ item }: { item: StrategyItemType }) => {
  const { label, value, icon, highlights } = item;
  
  const highlightedContent = useMemo(() => {
    if (!highlights?.length) return null;
    
    return highlights.reduce((acc, highlight) => {
      return acc.replace(
        highlight,
        `<span class="text-text-primary-light font-bold">${highlight}</span>`,
      );
    }, value);
  }, [value, highlights]);

  return (
    <div className="flex w-full items-center">
      <div className="flex min-w-[140px] items-center gap-1 text-sm text-text-gray">
        {icon && <Image src={icon} alt={label} width={18} height={18} />}
        {label}
      </div>
      <div className="flex-1 text-white">
        {highlightedContent ? (
          <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />
        ) : (
          value
        )}
      </div>
    </div>
  );
};

export const Strategy = () => {
  return (
    <div className="flex h-full w-full flex-col gap-2 rounded-lg border border-solid border-border-divider bg-background-rich-black p-4">
      {mockStrategyData.map((item, index) => (
        <StrategyItem key={index} item={item} />
      ))}
    </div>
  );
};
