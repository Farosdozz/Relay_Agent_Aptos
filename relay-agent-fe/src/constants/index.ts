export const SOCIALS = [
  {
    name: 'Discord',
    icon: '/icons/discord-green.svg',
    href: 'https://discord.gg/relay-agent',
    url: 'discord',
  },
  {
    name: 'Twitter',
    icon: '/icons/twitter-green.svg',
    href: 'https://x.com/relay_ai',
    url: 'twitter',
  },
];

export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/' },
  { label: 'Our Docs', href: 'https://relay-agent.gitbook.io/relay' },
];

export const CHAIN_ID = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
};

export const CHAINS = {
  [CHAIN_ID.MAINNET]: 'Aptos Mainnet',
  [CHAIN_ID.TESTNET]: 'Aptos Testnet',
};

export const apiKey = process.env.OPENAI_API_KEY;

export const REFERRAL_CODE_KEY = 'relay-referralCode';
