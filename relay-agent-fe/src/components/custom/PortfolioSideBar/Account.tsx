import Images from '@/components/main/Images';
import { useTotalAssets } from '@/hooks/useTotalAssets';
import { useFundWallet } from '@/hooks/useFundWallet';
import { formatEllipsisText, formatNumber } from '@/utils/format';
import * as motion from 'motion/react-client';
import Image from 'next/image';
import { RefObject, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useOnClickOutside } from 'usehooks-ts';
import { AccountMenu } from './AccountMenu';
import { DialogWithdraw } from './DialogWithdraw';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useEmbeddedWallet } from '@/hooks';

export const Account = () => {
  const { account, wallet } = useWallet();
  const embeddedWallet = useEmbeddedWallet();
  const { fundWallet } = useFundWallet();
  const { totalValue } = useTotalAssets();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Use embedded wallet address if available, otherwise use connected wallet address
  const displayAddress = embeddedWallet?.address || account?.address?.toString() || '';

  useOnClickOutside(menuRef as RefObject<HTMLDivElement>, () => {
    if (isMenuOpen) setIsMenuOpen(false);
  });

  const handleCopyText = async () => {
    if (displayAddress) {
      await navigator.clipboard.writeText(displayAddress);
      toast.success('Copied address successfully!');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const onDeposit = async () => {
    if (displayAddress) {
      try {
        await fundWallet(displayAddress, {
          amount: '1', // Default amount of 1 APT
        });
      } catch (error) {
        // Error handling is already done in the hook
        console.error('Deposit failed:', error);
      }
    } else {
      toast.error('No wallet connected');
    }
  };

  const onWithdraw = () => {
    setIsWithdrawOpen(true);
  };

  return (
    <div
      style={{ background: 'rgba(239, 239, 239, 0.08)' }}
      className="relative mt-2 flex flex-col justify-between gap-2.5 rounded-lg p-3 text-base font-medium shadow-dialog"
    >
      <div className="absolute right-0 top-0 z-0">
        <Images image="relay" alt="Relay" width={101} height={95} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-xl text-white">
          $ <span className="font-extrabold">{formatNumber(totalValue)}</span>
        </p>

        {/* <p className="text-sm text-text-gray">{balance?.balance || '0'} BERA</p> */}
      </div>
      <div className="relative z-10 flex h-6 w-full justify-between rounded-sm bg-background-gray pl-1.5">
        <div className="flex h-full cursor-pointer items-center gap-1" onClick={handleCopyText}>
          <p className="text-sm text-white">{formatEllipsisText(displayAddress)}</p>
          <Image src={`/icons/copy.svg`} alt="" width={20} height={20} />
        </div>
        <div className="relative" ref={menuRef}>
          <motion.button
            className="appearance-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMenu}
          >
            <Image src={`/icons/three-dot.svg`} alt="" width={24} height={24} />
          </motion.button>
          <AccountMenu isMenuOpen={isMenuOpen} />
        </div>
      </div>
      <div className="grid w-full grid-cols-2">
        <motion.button
          onClick={() => onDeposit()}
          className="flex items-center justify-center gap-2 rounded-lg py-2"
          whileHover={{ backgroundColor: '#424242' }}
        >
          <Image src={`/icons/deposit.svg`} alt="Deposit" width={24} height={24} />
          <p className="text-sm font-semibold text-white">Deposit</p>
        </motion.button>
        <motion.button
          onClick={() => onWithdraw()}
          className="flex items-center justify-center gap-2 rounded-lg py-2"
          whileHover={{ backgroundColor: '#424242' }}
        >
          <Image src={`/icons/withdraw.svg`} alt="Withdraw" width={24} height={24} />
          <p className="text-sm font-semibold text-white">Withdraw</p>
        </motion.button>
      </div>

      <DialogWithdraw open={isWithdrawOpen} setOpen={setIsWithdrawOpen} />
    </div>
  );
};
