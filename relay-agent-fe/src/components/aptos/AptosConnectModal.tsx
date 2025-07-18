'use client';

import React, { useState } from 'react';
import { useWallet, groupAndSortWallets } from '@aptos-labs/wallet-adapter-react';
import { AdapterWallet } from '@aptos-labs/wallet-adapter-core';
import clsx from 'clsx';

interface AptosConnectModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onConnected?: () => void;
}

interface WalletRowProps {
  wallet: AdapterWallet;
  onConnect: () => void;
  isConnecting: boolean;
}

const WalletRow: React.FC<WalletRowProps> = ({ wallet, onConnect, isConnecting }) => {
  const isAptosConnect = wallet.name.includes('Aptos Connect');
  const walletName = wallet.name.replace('Aptos Connect - ', '');
  
  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className={clsx(
        'w-full flex items-center justify-between p-4 rounded-2xl transition-all',
        'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700',
        'border border-gray-200 dark:border-gray-700',
        isAptosConnect && 'border-2 border-blue-500 dark:border-blue-400',
        isConnecting && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center">
          <img 
            src={wallet.icon} 
            alt={wallet.name} 
            className="w-8 h-8 object-contain"
          />
        </div>
        <span className="font-medium text-gray-900 dark:text-white">
          {isAptosConnect ? `Continue with ${walletName}` : wallet.name}
        </span>
      </div>
      {isConnecting ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-white" />
      ) : (
        <svg 
          className="w-5 h-5 text-gray-400" 
          fill="none" 
          strokeWidth="2" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
};

export const AptosConnectModal: React.FC<AptosConnectModalProps> = ({ open, setOpen, onConnected }) => {
  const { wallets, connect } = useWallet();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [showAboutAptosConnect, setShowAboutAptosConnect] = useState(false);

  // Use groupAndSortWallets to properly categorize wallets
  const { aptosConnectWallets, availableWallets, installableWallets } = groupAndSortWallets(wallets);

  const handleConnect = async (walletName: string) => {
    try {
      setConnectingWallet(walletName);
      connect(walletName);
      
      // Close modal immediately
      setOpen(false);
      
      // Call the onConnected callback after a delay to ensure state propagation
      if (onConnected) {
        setTimeout(() => {
          onConnected();
        }, 300);
      }
    } catch (error) {
      console.error('[AptosConnectModal] Failed to connect wallet:', error);
    } finally {
      setTimeout(() => {
        setConnectingWallet(null);
      }, 300);
    }
  };

  if (!open) return null;

  if (showAboutAptosConnect) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">About Aptos Connect</h2>
            
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                Aptos Connect enables you to access decentralized applications on Aptos using just your Google or Apple account.
              </p>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Key Features:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>No seed phrases or private keys to manage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Sign in with accounts you already have</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Enterprise-grade security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Seamless user experience</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setShowAboutAptosConnect(false)}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-colors"
              >
                Back to wallets
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Log in or sign up</h2>
            <p className="text-gray-600 dark:text-gray-400">
              with Social + Aptos Connect
            </p>
          </div>

          <div className="space-y-3">
            {/* AptosConnect Wallets */}
            {aptosConnectWallets.map((wallet) => (
              <WalletRow
                key={wallet.name}
                wallet={wallet}
                onConnect={() => handleConnect(wallet.name)}
                isConnecting={connectingWallet === wallet.name}
              />
            ))}

            {/* Learn more link */}
            {aptosConnectWallets.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAboutAptosConnect(true)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Learn more about{' '}
                  <span className="text-blue-600 dark:text-blue-400 hover:underline">
                    Aptos Connect →
                  </span>
                </button>
              </div>
            )}

            {/* Separator */}
            {aptosConnectWallets.length > 0 && availableWallets.length > 0 && (
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">Or</span>
                </div>
              </div>
            )}

            {/* Available Wallets (Installed) */}
            {availableWallets.map((wallet) => (
              <WalletRow
                key={wallet.name}
                wallet={wallet}
                onConnect={() => handleConnect(wallet.name)}
                isConnecting={connectingWallet === wallet.name}
              />
            ))}

            {/* More wallets (Installable) */}
            {installableWallets.length > 0 && (
              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <span>More wallets</span>
                    <svg 
                      className="w-4 h-4 transition-transform group-open:rotate-180" 
                      fill="none" 
                      strokeWidth="2" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </summary>
                <div className="mt-3 space-y-3">
                  {installableWallets.map((wallet) => (
                    <a
                      key={wallet.name}
                      href={wallet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-4 rounded-2xl transition-all bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center">
                          <img 
                            src={wallet.icon} 
                            alt={wallet.name} 
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {wallet.name}
                        </span>
                      </div>
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Install
                      </span>
                    </a>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              By continuing, you agree to Aptos Labs&apos;{' '}
              <a
                href="https://aptoslabs.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Privacy Policy
              </a>
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>Powered by</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span>Aptos Labs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};