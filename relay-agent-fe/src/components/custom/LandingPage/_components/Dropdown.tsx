'use client';
import Icons, { IconsType } from '@/components/main/Icons';
import { navItems } from '@/constants';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const SOCIAL_ICONS = [
  { name: 'Twitter', icon: 'whiteTwitter', href: 'https://x.com/relay_ai' },
  { name: 'Discord', icon: 'whiteDiscord', href: 'https://discord.gg/relay-agent' },
];

function Dropdown({ isOpen, onClose, onLogin }: Props) {
  const router = useRouter();
  const handleNavClick = (href: string) => {
    if (href.startsWith('/')) {
      router.push(href);
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  const handleSocialClick = (href: string) => {
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Mobile Menu Panel */}
          <motion.div
            className="fixed right-0 top-0 z-50 w-full rounded-bl-lg border-l border-gray-700 bg-[#07081a] shadow-xl"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
          >
            <div className="flex flex-col p-6">
              {/* Close Button */}
              <div className="mb-4 flex justify-end">
                <button
                  onClick={onClose}
                  onKeyDown={(e) => handleKeyDown(e, onClose)}
                  className="h-8 w-8 cursor-pointer rounded-full transition-colors duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
                  aria-label="Close menu"
                  tabIndex={0}
                >
                  <Icons icon="close" size={20} className="mx-auto" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="mb-8">
                <div className="flex flex-col gap-6">
                  {navItems.map((item) => (
                    <div key={item.label}>
                      <button
                        className="w-full cursor-pointer text-left transition-colors duration-200 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
                        onClick={() => handleNavClick(item.href)}
                        onKeyDown={(e) => handleKeyDown(e, () => handleNavClick(item.href))}
                        aria-label={`Navigate to ${item.label}`}
                      >
                        <p className="font-roboto text-center text-[18px] font-normal leading-[1.05] text-white">
                          {item.label}
                        </p>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Icons */}
              <div className="mb-8">
                <div className="flex justify-center gap-4">
                  {SOCIAL_ICONS.map((social) => (
                    <Link
                      href={social.href}
                      key={social.icon}
                      className="h-[30px] w-[30px] cursor-pointer transition-opacity duration-200 hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
                      target="_blank"
                    >
                      <Icons icon={social.icon as IconsType} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Try Now Button */}
              <button
                onClick={() => {
                  onLogin();
                }}
                className="w-full bg-gradient-to-r from-[#9178ff] to-[#ce66b4] px-6 py-4 text-white rounded-full transition-all duration-200 hover:from-[#8068e0] hover:to-[#b85aa0] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                aria-label="Try Relay now"
              >
                <span className="font-roboto text-[18px] font-normal leading-[1.05]">TRY NOW</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Dropdown;
