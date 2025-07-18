'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/main/Button';
import { AptosErrorCode } from '@/types/aptos';
import Image from 'next/image';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Wallet Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <WalletErrorDisplay
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface WalletErrorDisplayProps {
  error: Error | null;
  onRetry: () => void;
}

const WalletErrorDisplay: React.FC<WalletErrorDisplayProps> = ({ error, onRetry }) => {
  const getErrorMessage = (error: Error | null) => {
    if (!error) {
      return {
        title: 'Unknown Error',
        message: 'An unknown error occurred',
        suggestion: 'Please try again.',
        showInstallButton: false,
      };
    }

    // Check if it's an Aptos-specific error
    if ('code' in error) {
      const aptosError = error as any;
      switch (aptosError.code) {
        case AptosErrorCode.WALLET_NOT_INSTALLED:
          return {
            title: 'Wallet Not Installed',
            message: 'The selected wallet is not installed in your browser.',
            suggestion: 'Please install the wallet extension and try again.',
            showInstallButton: true,
          };
        case AptosErrorCode.WALLET_NOT_CONNECTED:
          return {
            title: 'Wallet Not Connected',
            message: 'Your wallet is not connected to the application.',
            suggestion: 'Please connect your wallet to continue.',
            showInstallButton: false,
          };
        case AptosErrorCode.USER_REJECTED:
          return {
            title: 'Connection Rejected',
            message: 'You rejected the wallet connection request.',
            suggestion: 'Please try connecting again and approve the request.',
            showInstallButton: false,
          };
        case AptosErrorCode.NETWORK_ERROR:
          return {
            title: 'Network Error',
            message: 'Unable to connect to the Aptos network.',
            suggestion: 'Please check your internet connection and try again.',
            showInstallButton: false,
          };
        case AptosErrorCode.CONNECTION_TIMEOUT:
          return {
            title: 'Connection Timeout',
            message: 'The wallet connection request timed out.',
            suggestion: 'Please try again. Make sure your wallet is unlocked.',
            showInstallButton: false,
          };
        default:
          return {
            title: 'Wallet Error',
            message: aptosError.message || 'An error occurred with your wallet.',
            suggestion: 'Please try again or contact support if the problem persists.',
            showInstallButton: false,
          };
      }
    }

    return {
      title: 'Connection Error',
      message: error.message || 'An unexpected error occurred.',
      suggestion: 'Please refresh the page and try again.',
      showInstallButton: false,
    };
  };

  const errorDetails = getErrorMessage(error);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-background-secondary rounded-lg border border-border-secondary">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <Image
          src="/icons/close.svg"
          alt="Error"
          width={32}
          height={32}
          className="text-red-500"
        />
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-text-primary">
          {errorDetails.title}
        </h3>
        <p className="text-text-secondary">
          {errorDetails.message}
        </p>
        <p className="text-sm text-text-secondary">
          {errorDetails.suggestion}
        </p>
      </div>

      <div className="flex space-x-3">
        <Button
          color="primary"
          label="Try Again"
          onClick={onRetry}
          classes="px-6 py-2"
        />

        {errorDetails.showInstallButton && (
          <Button
            color="secondary"
            label="Install Wallet"
            onClick={() => {
              // This would open the wallet installation guide
              window.open('https://petra.app/', '_blank');
            }}
            classes="px-6 py-2"
          />
        )}
      </div>

      {process.env.NODE_ENV === 'development' && error && (
        <details className="w-full mt-4">
          <summary className="text-xs text-text-secondary cursor-pointer">
            Error Details (Development)
          </summary>
          <pre className="text-xs text-text-secondary mt-2 p-2 bg-background-primary rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
};

export default WalletErrorBoundary;
