import { render, screen } from '@testing-library/react';
import { ConnectButton } from './ConnectButton';
import { describe, it, vi, expect } from 'vitest';

// Mock RainbowKit's ConnectButton
vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: {
    Custom: ({ children }: { children: any }) => {
      // Mock the render props function with a connected state
      return children({
        account: {
          address: '0x123',
          displayName: '0x123...456',
          displayBalance: '1 ETH',
        },
        chain: {
          id: 1,
          name: 'Ethereum',
          unsupported: false,
          hasIcon: true,
          iconBackground: '#fff',
          iconUrl: 'https://example.com/icon.png',
        },
        openAccountModal: vi.fn(),
        openChainModal: vi.fn(),
        openConnectModal: vi.fn(),
        authenticationStatus: 'authenticated',
        mounted: true,
      });
    },
  },
}));

describe('ConnectButton', () => {
  it('renders the connected state correctly', () => {
    render(<ConnectButton />);
    
    // Check if chain name is displayed
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    
    // Check if account display name is shown
    expect(screen.getByText('0x123...456 (1 ETH)')).toBeInTheDocument();
  });
}); 