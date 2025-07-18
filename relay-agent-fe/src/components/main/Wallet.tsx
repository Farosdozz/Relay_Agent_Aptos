'use client';
import { Button } from '@/components/main/Button';
import { formatEllipsisText } from '@/utils/format';
import Image from 'next/image';
import { useState } from 'react';
import { PortfolioSideBar } from '../custom/PortfolioSideBar';
import { useMediaQuery } from 'usehooks-ts';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

interface WalletProps {
  onWalletClick?: () => void;
}

const Wallet = ({ onWalletClick }: WalletProps) => {
  const { wallet, account, connected } = useWallet();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!connected || !account) return null;

  const handleWalletClick = () => {
    if (isMobile) {
      onWalletClick?.();
    } else {
      setOpenModal(!openModal);
    }
  };

  return (
    <>
      <div className="flex h-full flex-col items-end justify-center px-1 md:px-4">
        <Button
          color="transparent"
          border="primary"
          label={formatEllipsisText(account.address.toString())}
          onClick={handleWalletClick}
          style={{ width: isMobile ? 140 : 180, fontSize: isMobile ? 12 : 17, height: 40 }}
          prefixIcon={
            wallet?.icon ? (
              <Image
                src={wallet.icon}
                alt={wallet.name}
                width={isMobile ? 16 : 20}
                height={isMobile ? 16 : 20}
                className="rounded-full"
              />
            ) : null
          }
          suffixIcon={
            <Image
              src={`/icons/chevron-down.svg`}
              alt="chevron"
              width={isMobile ? 16 : 20}
              height={isMobile ? 16 : 20}
              className="float-right"
            />
          }
        />
      </div>
      {!isMobile && openModal && <PortfolioSideBar setOpenModal={setOpenModal} open={openModal} />}
    </>
  );
};

export default Wallet;
