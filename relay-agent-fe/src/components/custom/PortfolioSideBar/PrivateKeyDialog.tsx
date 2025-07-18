import { apiBackend } from '@/utils/axios';
import Image from 'next/image';
import React, { useEffect, useState, SetStateAction, Dispatch, useRef } from 'react';
import { toast } from 'react-toastify';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { useOnClickOutside } from 'usehooks-ts';

interface PrivateKeyDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const PrivateKeyDialog = ({ open, setOpen }: PrivateKeyDialogProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef as React.RefObject<HTMLElement>, () => setOpen(false));
  const [privateKey, setPrivateKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPrivateKey();
    } else {
      // Reset state when dialog closes
      setPrivateKey('');
      setShowKey(false);
    }
  }, [open]);

  const fetchPrivateKey = async () => {
    setIsLoading(true);
    try {
      const response = await apiBackend.get('/user/embedded-wallet/export');
      
      if (response.data.hasEmbeddedWallet === false) {
        toast.error(response.data.message || 'No embedded wallet found');
        setOpen(false);
        return;
      }

      if (response.data.privateKey) {
        setPrivateKey(response.data.privateKey);
      } else {
        throw new Error('Private key not found in response');
      }
    } catch (error: any) {
      console.error('Error fetching private key:', error);
      toast.error(error.message || 'Failed to fetch private key');
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrivateKey = async () => {
    try {
      await navigator.clipboard.writeText(privateKey);
      toast.success('Private key copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy private key');
    }
  };

  const maskPrivateKey = (key: string) => {
    if (!key) return '';
    // Show first 10 and last 6 characters
    const start = key.slice(0, 10);
    const end = key.slice(-6);
    const middle = '•'.repeat(Math.max(0, key.length - 16));
    return `${start}${middle}${end}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            className="relative w-full max-w-[520px] bg-[#0a0b0d] rounded-3xl border border-gray-800/50 shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-800/50">
              <h2 className="text-white text-2xl font-bold">Private Key</h2>
              <motion.button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </div>
            
            {/* Body */}
            <div className="p-8 space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : privateKey ? (
                <>
                  {/* Private Key Section */}
                  <div className="bg-[#141518] rounded-2xl p-6 border border-gray-800/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Private Key</span>
                      <motion.button
                        onClick={() => setShowKey(!showKey)}
                        className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {showKey ? 'Hide' : 'Show'}
                      </motion.button>
                    </div>
                    
                    <div className="bg-black/40 rounded-xl p-5 border border-gray-800/30">
                      <p className="font-mono text-base text-gray-100 break-all select-all leading-relaxed">
                        {showKey ? privateKey : maskPrivateKey(privateKey)}
                      </p>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <motion.button
                    onClick={handleCopyPrivateKey}
                    className="w-full flex items-center justify-center gap-3 bg-[#4169E1] hover:bg-[#5179F1] text-white py-4 px-6 rounded-2xl font-semibold text-base shadow-lg shadow-blue-500/10 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.333 7.5v-2a2 2 0 00-2-2H5.5a2 2 0 00-2 2v5.833a2 2 0 002 2h2M8.667 12.5h5.833a2 2 0 002-2V8.667a2 2 0 00-2-2H8.667a2 2 0 00-2 2v1.833a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copy Private Key
                  </motion.button>

                  {/* Warning Section */}
                  <div className="bg-red-950/20 backdrop-blur-sm border border-red-900/30 rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <span className="text-red-400 text-xl font-bold">!</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-red-300 font-semibold text-base">
                          Never Send to your Private Key.
                        </p>
                        <p className="text-red-200/70 text-sm leading-relaxed">
                          Sending to your Private Key will result in permanent loss of funds.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};