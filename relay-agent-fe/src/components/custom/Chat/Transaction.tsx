import Image from 'next/image';

interface TransactionProps {
  type?: string;
  amount?: string;
  token?: {
    symbol: string;
    icon: string;
  };
  platform?: {
    name: string;
    icon: string;
  };
  collateralUsage?: boolean;
  slippageTolerance?: number;
  supplyAPY?: number;
  rewardAPY?: string;
  totalAPY?: number;
  estimatedRewards?: {
    amount: number;
    token: string;
  };
  gasEstimation?: string;
  protocolFees?: string;
  executionTime?: string;
}

export const Transaction = ({
  type = 'Lend',
  amount = '100',
  token = {
    symbol: '$BERA',
    icon: '/icons/tokens/wbera.png',
  },
  platform = {
    name: 'BERABORROW',
    icon: '/icons/bex.svg',
  },
  collateralUsage = true,
  slippageTolerance = 0.2,
  supplyAPY = 8.12,
  rewardAPY = 'XX.XX',
  totalAPY = 9.12,
  estimatedRewards = {
    amount: 9.12,
    token: '$BERA',
  },
  gasEstimation = '0.000012 $BERA',
  protocolFees = 'XX.XX',
  executionTime = '2m 5s',
}: TransactionProps) => {
  return (
    <div className="bg-background-rich-black w-full rounded-xl border border-solid border-border-divider p-4 text-white">
      {/* Header Section */}
      <div className="mb-4 flex items-center gap-2 text-lg">
        <span>{type}</span>
        <div className="bg-background-gray flex items-center gap-1 gap-2 rounded-lg px-2 py-1.5">
          <span>{amount}</span>
          <div className="flex h-full items-center gap-1">
            <Image
              src={token.icon}
              alt={token.symbol}
              width={20}
              height={20}
              className="rounded-full"
            />
            <span>{token.symbol}</span>
          </div>
        </div>
        <span>on</span>
        <div className="bg-background-gray flex items-center gap-1 gap-2 rounded-lg px-2 py-1.5">
          <Image
            src={platform.icon}
            alt={platform.name}
            width={20}
            height={20}
            className="rounded-full"
          />
          <span>{platform.name}</span>
        </div>
      </div>

      <div className="mb-4 space-y-2 text-sm text-text-gray">
        <div className="flex justify-between">
          <span>Allowing collateral usage</span>
          <span className="text-base text-white">{collateralUsage ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex justify-between">
          <span>Slippage tolerance</span>
          <span className="text-base text-white">{slippageTolerance}</span>
        </div>
      </div>

      {/* APY Section */}
      <div className="mb-4 grid grid-cols-2 gap-3 bg-background-main p-2 rounded-lg">
        <div>
          <div className="text-sm text-text-gray">Supply APY</div>
          <div className="text-base text-white">{supplyAPY}%</div>
        </div>
        <div>
          <div className="text-sm text-text-gray">Reward APY</div>
          <div className="text-base text-white">{rewardAPY}%</div>
        </div>
        <div>
          <div className="text-sm text-text-gray">Total APY</div>
          <div className="text-base text-border-primary">{totalAPY}%</div>
        </div>
        <div>
          <div className="text-sm text-text-gray">Estimated Rewards</div>
          <div className="text-base text-text-primary-light">
            +{estimatedRewards.amount} {estimatedRewards.token}
          </div>
        </div>
      </div>

      {/* Gas and Protocol Info */}
      <div className="space-y-2 text-sm text-text-gray bg-background-main p-2 rounded-lg">
        <div className="flex justify-between">
          <span>Gas estimation</span>
          <span className="text-white">{gasEstimation}</span>
        </div>
        <div className="flex justify-between">
          <span>Protocol fees</span>
          <span className="text-white">{protocolFees}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated execution time</span>
          <span className="text-white">{executionTime}</span>
        </div>
      </div>
    </div>
  );
};
