'use client';

import React, { useState } from 'react';
import { Button } from '@/components/main/Button';
import { formatEllipsisText } from '@/utils/format';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useMediaQuery } from 'usehooks-ts';
import * as motion from 'motion/react-client';
import clsx from 'clsx';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

interface WalletStatusProps {
  onWalletClick?: () => void;
  showDropdown?: boolean;
}

export const WalletStatus: React.FC<WalletStatusProps> = ({
  onWalletClick,
  showDropdown = true
}) => {
  const { wallet, account, connected, disconnect, wallets, isLoading } = useWallet();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleWalletClick = () => {
    if (isMobile) {
      onWalletClick?.();
    } else if (showDropdown) {
      setShowWalletMenu(!showWalletMenu);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowWalletMenu(false);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const handleCopyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address.toString());
      toast.success('Address copied to clipboard');
      setShowWalletMenu(false);
    }
  };

  if (!connected || !wallet || !account) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex h-full flex-col items-end justify-center px-1 md:px-4">
        <Button
          color="transparent"
          border="primary"
          label={formatEllipsisText(account.address.toString())}
          onClick={handleWalletClick}
          style={{
            width: isMobile ? 140 : 180,
            fontSize: isMobile ? 12 : 17,
            height: 40
          }}
          prefixIcon={
            wallet.icon ? (
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
            showDropdown ? (
              <Image
                src="/icons/chevron-down.svg"
                alt="chevron"
                width={isMobile ? 16 : 20}
                height={isMobile ? 16 : 20}
                className={clsx(
                  'transition-transform duration-200',
                  showWalletMenu && 'rotate-180'
                )}
              />
            ) : null
          }
          disabled={isLoading}
        />
      </div>

      {/* Wallet Dropdown Menu */}
      {showWalletMenu && showDropdown && !isMobile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 top-full mt-2 w-64 bg-background-secondary border border-border-secondary rounded-lg shadow-lg z-50"
        >
          <div className="p-4 space-y-4">
            {/* Wallet Info */}
            <div className="flex items-center space-x-3 pb-3 border-b border-border-secondary">
              <div className="w-10 h-10 rounded-full bg-background-primary flex items-center justify-center">
                <Image
                  src={wallet.icon}
                  alt={wallet.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <div>
                <div className="font-medium text-text-primary">
                  {wallet.name}
                </div>
                <div className="text-xs text-text-secondary">
                  Connected
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <div className="text-xs text-text-secondary">Address</div>
              <div className="flex items-center justify-between bg-background-primary rounded-lg p-2">
                <span className="text-sm font-mono text-text-primary">
                  {formatEllipsisText(account.address.toString(), 6, 4)}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <Image
                    src="/icons/copy.svg"
                    alt="copy"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-border-secondary">
              <button
                onClick={() => {
                  window.open(`https://explorer.aptoslabs.com/account/${account.address.toString()}`, '_blank');
                  setShowWalletMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-background-primary rounded-lg transition-colors"
              >
                View on Explorer
              </button>

              <button
                onClick={handleDisconnect}
                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-background-primary rounded-lg transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Click outside to close */}
      {showWalletMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowWalletMenu(false)}
        />
      )}
    </div>
  );
};

export default WalletStatus;
