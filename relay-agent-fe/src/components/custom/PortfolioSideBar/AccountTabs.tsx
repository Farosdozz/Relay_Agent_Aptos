import { CustomSkeleton } from '@/components/main/CustomSkeleton';
import { useBalancesQuery } from '@/hooks/useBalancesQuery';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';
// import { ActivityTab } from './ActivityTab';
import { PortfolioTab } from './PortfolioTab';
import { useTotalAssets } from '@/hooks/useTotalAssets';
type TabType = 'portfolio' | 'activity';

interface TabConfig {
  id: TabType;
  label: string;
  component: React.ReactNode;
}

export const AccountTabs = () => {
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');

  // Get native balance from the balances context
  // const { data, isLoading } = useBalancesQuery();
  // const nativeBalance = data?.nativeBalance;
  const { totalValue, isLoading } = useTotalAssets();

  const tabsConfig: TabConfig[] = [
    {
      id: 'portfolio',
      label: 'Portfolio',
      component: <PortfolioTab />,
    },
    // {
    //   id: 'activity',
    //   label: 'Activity',
    //   component: <ActivityTab />,
    // },
  ];

  if (isLoading) {
    return (
      <div className={'mt-4 flex flex-1 flex-col gap-2'}>
        <CustomSkeleton count={6} />
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-1 flex-col py-4">
      {totalValue > 0 ? (
        <>
          {/* <div className="flex-shrink-0">
            <motion.div
              className="relative flex w-full overflow-hidden rounded-lg bg-background-action"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex w-full">
                {tabsConfig.map((tab) => (
                  <motion.div
                    key={tab.id}
                    className={`flex-1 cursor-pointer py-1 text-center text-sm font-medium ${
                      activeTab === tab.id ? 'text-components-buttons-primary' : 'text-text-gray'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    {tab.label}
                  </motion.div>
                ))}

                <motion.div
                  className="absolute bottom-0 h-0.5 rounded-full bg-components-buttons-primary"
                  initial={false}
                  animate={{
                    left: '0%',
                    width: '100%',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              </div>
            </motion.div>
          </div> */}
          <div className="flex-shrink-0">Your assets</div>

          <div className="mt-4 flex-grow overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {tabsConfig.find((tab) => tab.id === activeTab)?.component}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      ) : (
        <div className="flex w-full flex-1 flex-col items-start justify-start gap-4">
          <div className="flex w-full flex-col gap-1.5 rounded-lg border border-solid border-border-primary bg-background-gray p-3">
            <p className="text-base font-bold text-white">Henlo, welcome!</p>
            <p className="text-base text-white">
              Please deposit funds to your wallet to make transactions.
            </p>
          </div>
          <Image src="/images/deposit-fund.png" alt="Deposit" width={161} height={156} />
        </div>
      )}
    </div>
  );
};
