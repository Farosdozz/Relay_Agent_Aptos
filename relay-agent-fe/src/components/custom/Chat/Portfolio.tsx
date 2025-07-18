import { APTOS_TOKENS } from '@/constants/actions';
import { Tool } from '@/interfaces/chat.interface';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface PortfolioProps {
  tool: Tool;
}

interface Token {
  symbol: string;
  name: string;
  formattedAmount: string;
  usdValue: string;
  address: string;
}

interface PortfolioData {
  portfolioValue: string;
  tokens: Token[];
}

export const Portfolio = ({ tool }: PortfolioProps) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    if (!tool || !tool.result) return;

    try {
      const parsedData = JSON.parse(tool.result) as PortfolioData;
      setPortfolioData(parsedData);
    } catch (error) {
      console.error('Error parsing portfolio data:', error);
    }
  }, [tool]);

  // Use Aptos tokens directly
  const TOKENS = APTOS_TOKENS;


  if (!portfolioData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full max-w-[100%] flex-col rounded-lg border border-solid border-border-divider md:max-w-[70%]"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between bg-[#E2E2E2] p-4"
      >
        <div className="flex items-center gap-2">
          <Image src="/icons/portfolio.svg" alt="portfolio" width={20} height={20} />
          <div className="text-xs uppercase text-black md:text-sm">Portfolio</div>
        </div>
        <div className="text-sm font-bold text-black md:text-xl">
          ${portfolioData.portfolioValue}
        </div>
      </motion.div>
      <motion.hr
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="w-full border-border-divider"
      />
      <div className="flex flex-col gap-4 p-4">
        {portfolioData.tokens.map((token, index) => (
          <motion.div
            key={token.address}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Image
                src={
                  TOKENS.find(
                    (t) => t.address.toLowerCase() === token.address.toLowerCase(),
                  )?.icon || ''
                }
                alt={token.name}
                width={24}
                height={24}
                onError={(e) => {
                  // Fallback to a default token icon if the specific one doesn't exist
                  (e.target as HTMLImageElement).src = '/icons/tokens/default.svg';
                }}
              />
              <div className="flex flex-col text-sm uppercase text-black">
                <div className="flex items-center gap-1">
                  <p className="line-clamp-1 max-w-[90px] text-xs md:text-sm">{token.name}</p>
                  <div className="flex h-[18px] items-center justify-center rounded-sm bg-background-secondary px-1.5">
                    {token.symbol}
                  </div>
                </div>
                <p className="text-xs md:text-sm">
                  {Number(token.formattedAmount).toFixed(4)}{' '}
                  <span className="text-text-gray">{token.symbol}</span>
                </p>
              </div>
            </div>
            <div className="text-xs font-bold text-black md:text-xl">${token.usdValue}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
