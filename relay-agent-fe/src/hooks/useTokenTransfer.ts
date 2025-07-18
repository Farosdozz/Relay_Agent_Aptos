import {
  SendTransactionModalUIOptions,
  UnsignedTransactionRequest,
  usePrivy,
  useSendTransaction,
} from '@privy-io/react-auth';
import { Address, encodeFunctionData, erc20Abi, parseUnits, zeroAddress } from 'viem';

export const useTokenTransfer = ({
  recipientWalletAddress,
}: {
  recipientWalletAddress: Address;
}) => {
  const { sendTransaction } = useSendTransaction();

  /**
   * Creates encoded function data for token transfers
   * @param tokenAddress The address of the token to transfer
   * @param amount The amount to transfer (in token units)
   * @param decimals The number of decimals for the token
   */
  const createTransferData = ({
    tokenAddress,
    amount,
    decimals = 18,
  }: {
    tokenAddress: Address;
    amount: string;
    decimals?: number;
  }) => {
    try {
      // Convert amount to proper units based on token decimals
      const amountInWei = parseUnits(amount, decimals);

      // For native token (BERA), we don't need encoded function data
      if (tokenAddress === zeroAddress) {
        return '0x';
      }

      // For ERC-20 tokens, create the transfer function call
      return encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [recipientWalletAddress, amountInWei],
      });
    } catch (err) {
      console.error('Error encoding function data:', err);
      return '0x';
    }
  };

  /**
   * Execute the token transfer transaction
   * @param tokenAddress The address of the token to transfer
   * @param tokenSymbol The symbol of the token (for UI display)
   * @param amount The amount to transfer
   * @param decimals The number of decimals for the token
   */
  const transferToken = async ({
    tokenAddress,
    tokenSymbol,
    amount,
    decimals = 18,
  }: {
    tokenAddress: Address;
    tokenSymbol: string;
    amount: string;
    decimals?: number;
  }) => {
    try {
      const data = createTransferData({ tokenAddress, amount, decimals });

      // For native token (BERA), set value and send to recipient
      const requestData: UnsignedTransactionRequest =
        tokenAddress === zeroAddress
          ? {
              to: recipientWalletAddress,
              value: parseUnits(amount, decimals),
            }
          : {
              to: tokenAddress, // For ERC-20, send to token contract
              data, // With transfer function data
            };

      const uiConfig: SendTransactionModalUIOptions = {
        header: `Transfer ${tokenSymbol}`,
        description: `Transfer ${amount} ${tokenSymbol} to ${recipientWalletAddress.substring(0, 6)}...${recipientWalletAddress.substring(recipientWalletAddress.length - 4)}`,
        buttonText: 'Confirm Transfer',
        successHeader: 'Transfer Complete',
        successDescription: `Successfully transferred ${amount} ${tokenSymbol}`,
      };

      const result = await sendTransaction(requestData, uiConfig);
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  return { transferToken };
};
