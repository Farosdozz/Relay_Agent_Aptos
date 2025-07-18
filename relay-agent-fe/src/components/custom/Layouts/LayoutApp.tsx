'use client';
import { Button } from '@/components/main/Button';
import { useChatContext } from '@/providers/ChatProvider';
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useMediaQuery } from 'usehooks-ts';
import Sidebar from '../../main/Sidebar';
import Wallet from '../../main/Wallet';
import { ChatHistory } from '../Chat/ChatHistory';
import { PortfolioSideBar } from '../PortfolioSideBar';
import { useRouter } from 'next/navigation';

const LayoutApp = ({
  children,
  hasLeftBar = true,
}: {
  children: React.ReactNode;
  hasLeftBar?: boolean;
}) => {
  const isShowMobileMenu = useMediaQuery('(max-width: 1024px)');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const { rive: rivePointButton, RiveComponent: PointButton } = useRive({
    stateMachines: 'State Machine 1',
    src: `/rive/point-program.riv`,
    autoplay: true,
    layout: new Layout({
      alignment: Alignment.Center,
      fit: Fit.FitHeight,
    }),
  });

  const handleClick = () => {
    router.push('/app/campaign');
  };

  const { isLoadingSessions, sessions, createNewSession } = useChatContext();
  const { rive: riveNewChat, RiveComponent: NewChatButton } = useRive({
    stateMachines: 'button',
    src: `/rive/new-chat.riv`,
    autoplay: true,
    layout: new Layout({
      alignment: Alignment.Center,
      fit: Fit.FitHeight,
    }),
    onLoad: () => {
      // Ensure state machines are initialized
      if (riveNewChat) {
        console.log('Rive animation loaded');
      }
    },
  });
  const handleCreateNewSession = async () => {
    console.log('handleCreateNewSession');
    try {
      if (!sessions || sessions.length <= 0) {
        // toast.error('You need to have at least one chat history to create a new session');
        return;
      }
      createNewSession('New conversation', true);
      if (isMenuOpen) setIsMenuOpen(false);
    } catch (error) {
      toast.error('Failed to create new chat');
      console.error(error);
    }
  };

  const handleWalletClick = () => {
    if (isShowMobileMenu) {
      setIsWalletOpen(true);
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
  };

  return (
    <main
      className={
        'white-linear-gradient relative mx-auto flex h-full min-h-screen w-full flex-col overflow-y-hidden'
      }
    >
      <div
        className={`fixed right-0 top-0 z-50 flex h-16 w-full items-center justify-end transition-all duration-300 ${
          isScrolled
            ? 'shadow-[0px_4px_8px_0px_rgba(13,90,79,0.24)] backdrop-blur-[2px]'
            : 'bg-transparent'
        }`}
      >
        {isShowMobileMenu ? (
          <div className="flex h-full w-full items-center px-4 shadow-[0_4px_8px_-2px_rgba(13,90,79,0.26)]">
            <div className="shrink-0">
              <Image src="/images/black-logo.svg" alt="Relay Logo" width={128} height={36} />
            </div>
            <div className="ml-auto flex w-full items-center justify-end gap-3">
              <div className="relative h-[40px] w-[120px]">
                {/* Clickable transparent overlay for mobile */}
                <button
                  onClick={() => {
                    handleCreateNewSession();
                    setIsMenuOpen(false);
                  }}
                  className="w-full cursor-pointer rounded-lg bg-black p-2"
                >
                  New chat
                </button>
              </div>
              <div
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-background-dark"
                onClick={() => setIsMenuOpen(true)}
              >
                <Image src="/icons/menu-icon.svg" alt="menu icon" width={16} height={16} />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex items-center">
            <Wallet onWalletClick={handleWalletClick} />
          </div>
        )}
      </div>
      <div className={'relative flex w-full flex-row items-start overflow-y-hidden'}>
        <div className="items-star absolute top-0 flex w-full">
          {hasLeftBar ? (
            <Sidebar />
          ) : (
            <Link href={'/app'} className={'p-4'}>
              <Image src={'/images/black-logo.svg'} alt={''} width={120} height={36} />
            </Link>
          )}
        </div>
        <div
          className={`ml-0 h-screen w-full overflow-y-auto pb-0 pt-20 md:pb-20 ${
            hasLeftBar ? 'lg:ml-40' : 'lg:ml-0'
          }`}
          onScroll={(e) => {
            const target = e.currentTarget;
            setIsScrolled(target.scrollTop > 0);
          }}
        >
          {children}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[60] bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
            {/* Menu Panel */}
            <motion.div
              className="fixed bottom-0 left-0 top-0 z-[70] w-[80%] rounded-r-2xl border-r border-[#2F3E37] bg-background-secondary shadow-xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex h-full flex-col p-4">
                <div className="flex items-center justify-between pb-4">
                  <Link href={'/'} className="flex items-center gap-2.5">
                    <Image
                      src={'/images/black-logo.svg'}
                      alt={'Relay Logo'}
                      width={100}
                      height={28}
                    />
                  </Link>
                  <div className="relative">
                    <Wallet onWalletClick={handleWalletClick} />
                  </div>
                </div>
                <div className="relative h-[40px] w-[120px]">
                  {/* Clickable transparent overlay for mobile */}
                  <div className={'absolute left-0 top-0 flex w-full gap-2'}>
                    <button
                      onClick={() => {
                        handleCreateNewSession();
                        setIsMenuOpen(false);
                      }}
                      className="cursor-pointer rounded-lg bg-black p-2"
                    >
                      New chat
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                  {/* Mobile Chat History Component */}
                  <div className="relative z-[120] flex flex-col gap-3">
                    {isLoadingSessions ? (
                      <div className="animate-pulse space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-10 rounded-md bg-gray-700/40"></div>
                        ))}
                      </div>
                    ) : (
                      <ChatHistory onItemClick={() => setIsMenuOpen(false)} />
                    )}
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-4">
                  <div className="flex flex-row gap-2">
                    <div className="h-8 w-8">
                      <Button
                        color={'black'}
                        classes={'h-full'}
                        prefixIcon={
                          <Image alt={'docs'} src={'/icons/docs.svg'} width={14} height={14} />
                        }
                      />
                    </div>
                    <div className="h-8 w-8">
                      <Button
                        color={'black'}
                        classes={'h-full'}
                        prefixIcon={
                          <Image alt={'docs'} src={'/icons/help.svg'} width={14} height={14} />
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Portfolio Sidebar - Only for mobile */}
      {isShowMobileMenu && (
        <PortfolioSideBar setOpenModal={setIsWalletOpen} open={isWalletOpen} className="w-[80%]" />
      )}
    </main>
  );
};
export default LayoutApp;
