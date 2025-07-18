import { useEffect } from 'react';
import mixpanel from 'mixpanel-browser';
import { identifyUser } from '@/utils/mix-panel';
import { useEmbeddedWallet } from '@/hooks';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export const Mixpanel = () => {
  const { connected, account } = useWallet();
  const wallet = useEmbeddedWallet();

  const token = process.env.MIXPANEL_TOKEN || '';

  mixpanel.init(token, {
    track_pageview: false,
    persistence: 'cookie',
    debug: false,
  });

  useEffect(() => {
    if (connected && account) {
      // For Aptos, we use the wallet address as the user ID since there's no separate user concept
      identifyUser(account.address.toString(), wallet?.address || account.address.toString());
    }
  }, [connected, account, wallet?.address]);

  return null;
};
