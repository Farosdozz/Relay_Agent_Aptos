import { Button } from '@/components/main/Button';
import { Dialog } from '@/components/main/Dialog';
import { Input } from '@/components/main/Input';
import { APTOS_TOKENS } from '@/constants/actions';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface DialogWithdrawProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DialogWithdraw: React.FC<DialogWithdrawProps> = ({ open, setOpen }) => {
  const { account, connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState(APTOS_TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [receiverWallet, setReceiverWallet] = useState('');

  const handleWithdraw = async () => {
    if (!connected || !account) {
      toast.error('Please connect your Aptos wallet');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!receiverWallet) {
      toast.error('Please enter a receiver wallet address');
      return;
    }

    try {
      // TODO: Implement actual Aptos token transfer
      toast.info(`Withdrawal of ${amount} ${selectedToken.label} to ${receiverWallet} - Backend integration coming soon!`);
      setOpen(false);
      // Reset form
      setAmount('');
      setReceiverWallet('');
    } catch (error) {
      console.error('Withdrawal failed:', error);
      toast.error('Failed to withdraw. Please try again.');
    }
  };

  const isWithdrawDisabled = !amount || !receiverWallet;

  const renderBody = () => (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-text-primary">Withdraw Tokens</h2>

      {/* Token Selection */}
      <div className="space-y-2">
        <label className="text-sm text-text-secondary">Token</label>
        <div className="flex items-center gap-2 p-3 bg-background-primary rounded-lg">
          <Image
            src={selectedToken.icon}
            alt={selectedToken.label}
            width={24}
            height={24}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/icons/tokens/default.svg';
            }}
          />
          <span className="text-text-primary">{selectedToken.label}</span>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-sm text-text-secondary">Amount</label>
        <Input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Receiver Address Input */}
      <div className="space-y-2">
        <label className="text-sm text-text-secondary">Receiver Address</label>
        <Input
          type="text"
          placeholder="0x..."
          value={receiverWallet}
          onChange={(e) => setReceiverWallet(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Warning Message */}
      <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ This is a placeholder component. Actual withdrawal functionality will be implemented with backend integration.
        </p>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="flex gap-3">
      <Button
        color="transparent"
        label="Cancel"
        onClick={() => setOpen(false)}
        classes="flex-1"
      />
      <Button
        color="primary"
        label="Withdraw"
        onClick={handleWithdraw}
        disabled={isWithdrawDisabled}
        classes="flex-1"
      />
    </div>
  );

  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      body={renderBody()}
      footer={renderFooter()}
      className="max-w-md mx-auto"
    />
  );
};