import React from 'react';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from './providers';
import ErrorBoundary from '@/components/ErrorBoundary';
import generateMetadata from '@/utils/metadata';

const robotoFont = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Promise<Metadata> = generateMetadata({});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${robotoFont.className} font-normal text-white antialiased`}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
