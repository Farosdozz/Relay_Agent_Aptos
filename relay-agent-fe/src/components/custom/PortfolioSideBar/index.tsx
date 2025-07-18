import { AnimatePresence } from 'motion/react';
import * as motion from 'motion/react-client';
import Image from 'next/image';
import { RefObject, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { Account } from './Account';
import { AccountTabs } from './AccountTabs';

interface Props {
  className?: string;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
}

export const PortfolioSideBar = ({ className, setOpenModal, open }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref as RefObject<HTMLElement>, () => setOpenModal(false));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
              exit: { duration: 0.3 },
            }}
            key="portfolio-backdrop"
          />

          {/* Sidebar */}
          <motion.div
            ref={ref}
            className={`black-linear-gradient fixed right-0 top-0 z-[1001] flex h-screen w-80 flex-col rounded-l-2xl px-4 py-5 shadow-[-4px_0_12px_rgba(0,0,0,0.1)] ${className}`}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
              exit: { duration: 0.3 },
            }}
            key="portfolio-sidebar"
          >
            <div className="flex h-full flex-col overflow-hidden">
              <div className="flex flex-shrink-0 justify-end">
                <button className="ml-auto appearance-none" onClick={() => setOpenModal(false)}>
                  <Image src={`/icons/close-white.svg`} alt="Close" width={12} height={12} />
                </button>
              </div>

              <div className="flex-shrink-0">
                <Account />
              </div>

              <div className="flex-grow overflow-hidden">
                <AccountTabs />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
