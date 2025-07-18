import { useBalancesQuery } from '@/hooks/useBalancesQuery';
import { useTotalAssets } from '@/hooks/useTotalAssets';
import { formatNumber, roundBalance } from '@/utils/format';
import * as motion from 'motion/react-client';
import Image from 'next/image';

export const PortfolioTab = () => {
  const { data } = useBalancesQuery();
  const { tokenPrices } = useTotalAssets();
  const balances = data?.balances || [];
  //HIDE BALANCE <=0
  const filteredTokenBalances = balances.filter((asset) => asset.balance > 0);

  const isZeroBalance = filteredTokenBalances.length === 0;
  // Filter out assets with zero or negative balance
  return (
    <motion.div
      key="portfolio"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex flex-1 flex-col gap-4 overflow-y-auto"
    >
      {isZeroBalance ? (
        <p className="text-sm text-text-gray">No assets found in your portfolio</p>
      ) : (
        <div>
          {filteredTokenBalances.map((asset, index) => (
            <div className="flex items-center justify-between" key={asset.symbol}>
              <div className="flex items-center gap-2">
                <Image
                  src={asset.icon}
                  alt={asset.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-white">{asset.symbol}</p>
                  <p className="text-sm text-text-gray">
                    {roundBalance(asset.balance)} {asset.symbol}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-white">
                ${formatNumber(tokenPrices[asset.symbol] * asset.balance)}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
