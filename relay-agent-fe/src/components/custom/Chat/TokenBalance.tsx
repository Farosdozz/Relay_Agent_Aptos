import { Tool } from '@/interfaces/chat.interface';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { APTOS_TOKENS } from '@/constants/actions';
import { formatEllipsisText } from '@/utils/format';

interface TokenBalanceProps {
  tool: Tool;
}

interface TokenBalanceData {
  wallet?: string;
  tokenName?: string;
  balance?: string;
  error?: string;
}

export const TokenBalance = ({ tool }: TokenBalanceProps) => {
  const [tokenBalanceData, setTokenBalanceData] = useState<TokenBalanceData | null>(null);

  useEffect(() => {
    if (!tool || !tool.result) return;

    try {
      // Parse the result
      const result = tool.result;

      // Parse the arguments to get wallet and tokenName
      const args = JSON.parse(tool.arguments);

      // For Aptos, if tool is get_balance, set tokenName to "APT"
      const tokenName = tool.name === 'get_balance' ? 'APT' : args.tokenName;

      setTokenBalanceData({
        wallet: args.wallet,
        tokenName: tokenName,
        balance: result,
      });
    } catch (error) {
      console.error('Error parsing token balance data:', error);
    }
  }, [tool]);

  // Use Aptos tokens directly
  const TOKENS = APTOS_TOKENS;

  // Find token info from allowed tokens
  const tokenInfo = tokenBalanceData?.tokenName
    ? TOKENS.find(
        (t) => t.value.toLowerCase() === tokenBalanceData.tokenName?.toLowerCase(),
      )
    : null;

  if (!tokenBalanceData || !tokenInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full max-w-[100%] flex-col rounded-lg border border-solid border-border-divider md:max-w-[60%]"
    >
      <div className="flex flex-col gap-4 p-4">
        <motion.div
          key={tokenInfo.value}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={tokenInfo.icon}
                alt={tokenInfo.label}
                width={24}
                height={24}
                onError={(e) => {
                  // Fallback to a default token icon if the specific one doesn't exist
                  (e.target as HTMLImageElement).src = '/icons/tokens/default.svg';
                }}
              />
              <div className="flex flex-col text-sm text-black">
                <div className="flex items-center gap-1">
                  <p className="text-sm">{tokenInfo.label}</p>
                  <div className="flex h-[18px] items-center justify-center rounded-sm bg-background-dark px-1.5">
                    {tokenInfo.value}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-black">
              {Number(tokenBalanceData.balance).toFixed(2)}
            </div>
          </div>
          <div className="text-sm text-text-gray">
            Wallet:{' '}
            <span className="text-black">{formatEllipsisText(tokenBalanceData.wallet || '')}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
