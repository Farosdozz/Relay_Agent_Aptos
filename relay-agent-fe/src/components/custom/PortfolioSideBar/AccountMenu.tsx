import { useAptosAuth } from '@/hooks/useAptosAuth';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useEmbeddedWallet } from '@/hooks';
import * as motion from 'motion/react-client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { PrivateKeyDialog } from './PrivateKeyDialog';

export const AccountMenu = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  const { logout, user } = useAptosAuth();
  const { account, disconnect } = useWallet();
  const embeddedWallet = useEmbeddedWallet();
  const router = useRouter();
  const [isLogout, setIsLogout] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  
  // Use embedded wallet address if available, otherwise use connected wallet address
  const displayAddress = embeddedWallet?.address || account?.address?.toString() || '';

  const handleLogout = async () => {
    setIsLogout(true);
    try {
      await logout();
      await disconnect();
      router.push('/');
    } catch (error) {
      console.log(error);
      toast.error('Failed to logout');
    } finally {
      setIsLogout(false);
    }
  };

  const handleShowPrivateKey = () => {
    if (!embeddedWallet) {
      toast.error('No embedded wallet found');
      return;
    }
    setShowPrivateKey(true);
  };

  const menuItems = [
    {
      label: 'Show private key',
      icon: '/icons/key.svg',
      onClick: handleShowPrivateKey,
      className: 'text-white',
    },
    {
      label: 'View on explorer',
      icon: '/icons/explorer.svg',
      onClick: () => {
        if (displayAddress) {
          window.open(`https://explorer.aptoslabs.com/account/${displayAddress}`, '_blank');
        }
      },
      className: 'text-white',
    },
    {
      label: 'Logout',
      icon: '/icons/off.svg',
      onClick: handleLogout,
      className: 'text-red-500', // Adding red color for logout text
    },
  ];

  return (
    <>
      <motion.div
        className="absolute right-0 top-full z-20 mt-1 w-[180px] rounded-lg border border-solid border-border-menu bg-background-gray py-2 shadow-dialog"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isMenuOpen ? 1 : 0, y: isMenuOpen ? 0 : -10 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        style={{ display: isMenuOpen ? 'block' : 'none' }}
      >
        <div className="flex flex-col gap-1">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              className={`flex h-7 w-full cursor-pointer items-center gap-2 px-2 text-sm font-medium ${item.className}`}
              onClick={item.onClick}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              <div className="flex h-6 w-6 items-center justify-center">
                <Image src={item.icon} alt="" width={14} height={14} />
              </div>
              {item.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
      
      <PrivateKeyDialog open={showPrivateKey} setOpen={setShowPrivateKey} />
    </>
  );
};
