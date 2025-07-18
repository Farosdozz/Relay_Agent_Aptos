import { OutlinedButton } from '@/components/main/OutlinedButton';
import { BASE_TOKENS, BERACHAIN_TOKENS, DAPPS } from '@/constants/actions';
import { Tool } from '@/interfaces/chat.interface';
import { useChatContext } from '@/providers/ChatProvider';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useEmbeddedWallet } from '@/hooks';
import { CHAIN_ID } from '@/constants';
import useTokens from '@/hooks/useTokens';
type SwapPreviewProps = {
  tool: Tool;
  isLastAssistantMessage?: boolean;
};
type SwapPreviewResult = {
  protocol: string;
  action: string;
  displayData: {
    Swap: string;
    'Expected Output': string;
    'Minimum Output': string;
    'Slippage Tolerance': string;
    'Price Impact': string;
    Pool: string;
    'Pool Fee': string;
    [key: string]: string;
  };
  executionData: {
    tokenIn: string;
    tokenOut: string;
    amount: number;
    slippage: number;
    amountOutMin: string;
  };
  gasEstimation: string;
  estimatedTime: string;
  warnings: string[];
};

type SwapPreviewArgs = {
  tokenIn: string;
  tokenOut: string;
  amount: number;
  slippage: number;
};

export const SwapPreview = ({ tool, isLastAssistantMessage }: SwapPreviewProps) => {
  const { onSubmit } = useChatContext();
  const [swapPreviewArgs, setSwapPreviewArgs] = useState<SwapPreviewArgs | null>(null);
  const [swapPreviewResult, setSwapPreviewResult] = useState<SwapPreviewResult | null>(null);
  const TOKENS = useTokens();

  useEffect(() => {
    if (!tool || !tool.result) return;

    try {
      // Parse the result
      const result = JSON.parse(tool.result);
      // Parse the arguments to get wallet and tokenName
      let args = JSON.parse(tool.arguments);
      try {
        const parsedArgs = JSON.parse(args);
        setSwapPreviewArgs(parsedArgs);
      } catch (error) {
        setSwapPreviewArgs(args);
      }
      setSwapPreviewResult(result);
    } catch (error) {
      console.error('Error parsing token balance data:', error);
    }
  }, [tool]);

  const tokenIn = TOKENS.find(
    (token) => token.address.toLowerCase() === swapPreviewArgs?.tokenIn?.toLowerCase(),
  );
  const tokenOut = TOKENS.find(
    (token) => token.address.toLowerCase() === swapPreviewArgs?.tokenOut?.toLowerCase(),
  );

  const protocol = DAPPS.find((dapp) => dapp.previewValue === swapPreviewResult?.protocol);

  if (!swapPreviewArgs || !swapPreviewResult || !tokenIn || !tokenOut || !protocol) return null;

  return (
    <>
      <div className="w-full rounded-xl border border-solid border-border-divider bg-background-rich-black p-4 text-black">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 flex flex-wrap items-center gap-2 text-lg"
        >
          <span>Swap</span>
          <div className="flex items-center gap-2 rounded-lg bg-background-gray px-2 py-1.5">
            <span>{swapPreviewArgs.amount}</span>
            <div className="flex h-full items-center gap-1">
              <Image
                src={tokenIn.icon}
                alt={tokenIn.label}
                width={20}
                height={20}
                className="rounded-full"
              />
              <span>{tokenIn.label}</span>
            </div>
          </div>
          <span>to</span>

          <div className="flex items-center gap-1 gap-2 rounded-lg bg-background-gray px-2 py-1.5">
            <div className="flex h-full items-center gap-1">
              <Image
                src={tokenOut.icon}
                alt={tokenOut.label}
                width={20}
                height={20}
                className="rounded-full"
              />
              <span>{tokenOut.label}</span>
            </div>
          </div>
          <span>on</span>
          <div className="flex items-center gap-1 gap-2 rounded-lg bg-background-gray px-2 py-1.5">
            <Image
              src={protocol.icon}
              alt={protocol.label}
              width={20}
              height={20}
              className="rounded-full"
            />
            <span>{protocol.label}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-4 space-y-2 text-sm text-text-gray"
        >
          <div className="flex justify-between">
            <span>
              Expected output amount <br /> (before fees)
            </span>
            <span className="text-base text-black">
              {swapPreviewResult.displayData['Expected Output']}
            </span>
          </div>
          <div className="flex justify-between">
            <span>
              Minimum output amount <br /> (considering slippage)
            </span>
            <span className="text-base text-black">
              {swapPreviewResult.displayData['Minimum Output']}
            </span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-2 rounded-lg bg-background-main p-2 text-sm text-text-gray"
        >
          <div className="flex justify-between">
            <span>Slippage tolerance</span>
            <span className="text-black">{swapPreviewArgs.slippage}%</span>
          </div>
          <div className="flex justify-between">
            <span>Gas estimation</span>
            <span className="text-black">{swapPreviewResult.gasEstimation}</span>
          </div>
          <div className="flex justify-between">
            <span>Protocol fees</span>
            <span className="text-black">{swapPreviewResult.displayData['Pool Fee']}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated execution time</span>
            <span className="text-black">{swapPreviewResult.estimatedTime}</span>
          </div>
        </motion.div>
      </div>
      {isLastAssistantMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex flex-col gap-3"
        >
          <span>Do you want to proceed with this transaction?</span>
          <div className="flex items-center gap-2">
            <OutlinedButton
              label="Yes"
              variant="primary"
              classes="!w-auto h-[26px] px-3 !rounded-lg !bg-background-secondary"
              disabled={!isLastAssistantMessage}
              onClick={() => {
                onSubmit({ value: 'Yes' });
              }}
            />
            <OutlinedButton
              label="No"
              variant="error"
              classes="!w-auto h-[26px] px-3 !rounded-lg !bg-background-secondary"
              disabled={!isLastAssistantMessage}
              onClick={() => {
                onSubmit({ value: 'No' });
              }}
            />
          </div>
        </motion.div>
      )}
    </>
  );
};
