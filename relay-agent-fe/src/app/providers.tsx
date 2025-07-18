'use client';
import { Mixpanel } from '@/components/main/Mixpanel';
import { ChatContextProvider } from '@/providers/ChatProvider';
import { AptosConnectProvider } from '@/providers/AptosConnectProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => {

  return (
    <QueryClientProvider client={queryClient}>
      <AptosConnectProvider>
        <ChatContextProvider>
          <Mixpanel />
          {children}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </ChatContextProvider>
      </AptosConnectProvider>
    </QueryClientProvider>
  );
};
