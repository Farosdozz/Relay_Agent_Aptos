# Introduce

This is a [Next.js](https://nextjs.org) frontend project of [relay-agent.io](https://relay-agent.io)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or (highly recommend)
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Project structure

```sh
relay-agent-fe/
├── public/                          # Static assets
├── src/
│   ├── app/                         # Next.js App Router pages
│   │   ├── app/                     # Main app pages
│   │   │   └── campaign/            # Campaign-related pages
│   │
│   ├── components/                  # Reusable React components
│   │   ├── custom/                  # Custom business logic components
│   │   │   ├── Animations/          # Animation components
│   │   │   ├── Button/              # Custom button components
│   │   │   ├── Chat/                # Chat interface components
│   │   │   ├── CheckCode/           # Access code verification
│   │   │   ├── LandingPage/         # Landing page components
│   │   │   ├── Layouts/             # Layout wrapper components
│   │   │   ├── PortfolioSideBar/    # Portfolio sidebar components
│   │   │   ├── RefCode/             # Referral code components
│   │   │   └── Select/              # Custom select components
│   │   └── main/                    # Core UI components
│   │
│   ├── constants/                   # Application constants
│   ├── hooks/                       # Custom React hooks
│   │   └── useTokenPrice.ts         # Token price hooks
│   │
│   ├── interfaces/                  # TypeScript interfaces
│   │   ├── chat.interface.ts        # Chat-related types
│   │   └── user.interface.ts        # User-related types
│   │
│   ├── providers/                   # React context providers
│   │   ├── BeraKitProvider.tsx      # Berachain kit provider
│   │   ├── ChatProvider.tsx         # Chat state management
│   │   └── PrivyAuthProvider.tsx    # Authentication provider
│   │
│   ├── utils/                       # Utility functions
│   │
│   └── views/                       # Page-level view components
│       ├── app/                     # App-specific views
│       │   ├── campaign/            # Campaign page views
│       │   └── chat/                # Chat interface views
│
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and scripts
└── vitest.config.ts                 # Testing configuration
```

### Key Features

- **Chat Interface**: AI-powered chat system with action buttons and portfolio integration
- **Campaign System**: User campaigns with quests, leaderboards, and rewards
- **Portfolio Management**: Wallet integration with balance tracking and transaction history
- **DeFi Actions**: Support for various DeFi operations (swap, stake, lend, etc.)
- **Authentication**: Integrated with Privy for wallet-based authentication
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Animation Support**: Lottie, Rive, and Spline animations for enhanced UX

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: Privy
- **Blockchain**: Berachain integration via BeraKit
- **Testing**: Vitest
- **Analytics**: Mixpanel
- **Error Tracking**: Sentry
