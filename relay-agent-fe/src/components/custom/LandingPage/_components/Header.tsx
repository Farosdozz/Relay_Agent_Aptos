'use client';
import Icons, { IconsType } from '@/components/main/Icons';
import Images from '@/components/main/Images';
import useAppLogin from '@/hooks/useAppLogin';
import React, { useRef, useState, useEffect } from 'react';
import { useOnClickOutside, useMediaQuery } from 'usehooks-ts';
import { navItems } from '@/constants';
import Dropdown from './Dropdown';
import Link from 'next/link';
import { AptosConnectModal } from '@/components/aptos';


const Navigation: React.FC = () => {
  const navigationItems = [
    { label: 'Docs', href: '/docs' },
    { label: 'Change log', href: '/changelog' },
  ];
  
  return (
    <nav className="flex flex-row items-center gap-[50px]">
      {navigationItems.map((item) => (
        <div
          key={item.label}
          className="cursor-pointer transition-colors duration-200 hover:text-gray-300"
          tabIndex={0}
          role="button"
          aria-label={`Navigate to ${item.label}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              // Handle navigation here
            }
          }}
        >
          <Link
            href={item.href}
            className="font-roboto whitespace-nowrap text-[18px] font-normal leading-[1.2] text-white"
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
};

const Header: React.FC = () => {
  const { login, showConnectModal, setShowConnectModal, onWalletConnected } = useAppLogin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef as any, () => {
    setIsMobileMenuOpen(false);
  });

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMobileMenuToggle();
    }
  };

  return (
    <header className="fixed top-0 z-50 flex h-20 w-full items-center bg-transparent">
      <div className="relative mx-auto flex w-full max-w-[1366px] items-center justify-between px-6 md:px-[120px]">
        <div className="flex items-center">
          <img 
            src="/icons/relay-logo-transparent.svg" 
            alt="Relay Logo" 
            className="h-8 w-auto"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <Navigation />
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex">
          <button
            onClick={() => login()}
            className="flex items-center justify-center rounded-3xl bg-[#ce66b4] px-8 py-2.5 transition-all duration-200 hover:bg-[#b85aa0]"
            aria-label="Get Started"
          >
            <span className="font-roboto whitespace-nowrap text-[20px] font-medium leading-[30px] text-white">
              Try Now
            </span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="block md:hidden" ref={menuRef}>
          <button
            onClick={handleMobileMenuToggle}
            onKeyDown={handleKeyDown}
            className="cursor-pointer p-2 transition-opacity duration-200 hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <Icons icon={isMobileMenuOpen ? 'close' : 'menu'} size={30} />
          </button>
          <Dropdown isOpen={isMobileMenuOpen} onClose={handleMobileMenuToggle} onLogin={login} />
          {/* Mobile Menu */}
        </div>
      </div>
      
      {/* Aptos Connect Modal */}
      <AptosConnectModal open={showConnectModal} setOpen={setShowConnectModal} onConnected={onWalletConnected} />
    </header>
  );
};

export default Header;
