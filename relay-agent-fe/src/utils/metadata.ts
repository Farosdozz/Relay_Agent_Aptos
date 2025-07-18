import { Metadata } from 'next';

async function generateMetadata({
  title,
  description,
  image,
  keywords = [],
}: {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
}): Promise<Metadata> {
  const defaultTitle = 'Relay | The AI-powered Yield Strategy Execution Agent';
  const defaultDescription =
    'Relay is a no-code AI agent that simplifies DeFi. Execute swaps, staking to complex yield strategies across chains seamlessly with one command. Join the future of DeFAI.';
  const defaultOGImage = '/opengraph.png';
  const defaultTwitterImage = '/twitter.png';

  const metaTitle = title ? `${title}` : defaultTitle;
  const metaDescription = description || defaultDescription;
  const metaOGImage = image || defaultOGImage;
  const metaTwitterImage = image || defaultTwitterImage || defaultOGImage;

  const baseUrl = 'https://relay-agent.io';

  return {
    icons: { icon: '/logo.svg' },
    metadataBase: new URL(baseUrl),
    title: metaTitle,
    description: metaDescription,
    keywords: ['landing page', 'tokens', 'blockchain', 'relay-agent', ...keywords],
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [
        {
          url: metaOGImage,
          width: 1200,
          height: 900,
          alt: metaTitle,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaTwitterImage],
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      'virtual-protocol-site-verification': '151f7bac2de10099b73ee1e0ecc2dc3d',
    },
  };
}

export default generateMetadata;
