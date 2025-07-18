import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  /* config options here */

  // Configure server external packages to handle Node.js dependencies
  serverExternalPackages: [
    'keyv',
    '@keyv/redis',
    '@keyv/mongo',
    '@keyv/sqlite',
    '@keyv/postgres',
    '@keyv/mysql',
    '@keyv/etcd',
    '@keyv/offline',
    '@keyv/tiered',
    'got',
    'cacheable-request',
  ],

  env: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  },
  compiler: {
    reactRemoveProperties: { properties: ['^data-testid$'] },
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Handle keyv and other Node.js specific modules
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        '@keyv/redis': 'commonjs @keyv/redis',
        '@keyv/mongo': 'commonjs @keyv/mongo',
        '@keyv/sqlite': 'commonjs @keyv/sqlite',
        '@keyv/postgres': 'commonjs @keyv/postgres',
        '@keyv/mysql': 'commonjs @keyv/mysql',
        '@keyv/etcd': 'commonjs @keyv/etcd',
        '@keyv/offline': 'commonjs @keyv/offline',
        '@keyv/tiered': 'commonjs @keyv/tiered',
      });
    }

    // Ignore warnings for optional dependencies
    config.ignoreWarnings = [
      {
        module: /keyv/,
        message: /Can't resolve/,
      },
      {
        module: /cacheable-request/,
      },
      {
        module: /got/,
      },
    ];

    return config;
  },

  // Add Content Security Policy headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' https://challenges.cloudflare.com https://unpkg.com https://api-js.mixpanel.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob: https:;
              font-src 'self';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors *;
              child-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org;
              frame-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com;
              connect-src 'self' http://localhost:3001 https://dev.api.relay-agent.io https://unpkg.com https://*.rive.app https://cdn.rive.app https://api-js.mixpanel.com https://api.binance.com https://coins.llama.fi https://api.dexscreener.com https://*.supabase.co wss://*.supabase.co wss://*.supabase.co/realtime/v1/websocket https://react-tweet.vercel.app/ https://prod.spline.design https://fullnode.mainnet.aptoslabs.com https://fullnode.testnet.aptoslabs.com https://fullnode.devnet.aptoslabs.com https://api.mainnet.aptoslabs.com https://api.testnet.aptoslabs.com https://api.devnet.aptoslabs.com;
              worker-src 'self' blob:;
              media-src 'self' blob: data:;
              manifest-src 'self'
            `
              .replace(/\s{2,}/g, ' ')
              .trim(),
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/mixpanel/:path*',
        destination: 'https://api-js.mixpanel.com/:path*',
      },
      {
        source: '/api/binance/:path*',
        destination: 'https://api.binance.com/api/v3/:path*',
      },
      {
        source: '/api/llama/:path*',
        destination: 'https://coins.llama.fi/:path*',
      },
      {
        source: '/api/aptos/mainnet/:path*',
        destination: 'https://fullnode.mainnet.aptoslabs.com/v1/:path*',
      },
      {
        source: '/api/aptos/testnet/:path*',
        destination: 'https://fullnode.testnet.aptoslabs.com/v1/:path*',
      },
      {
        source: '/api/aptos/devnet/:path*',
        destination: 'https://fullnode.devnet.aptoslabs.com/v1/:path*',
      },
      {
        source: '/logo.svg',
        destination: '/icons/logo-gradient.png',
      },
    ];
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Additional Sentry configuration
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
