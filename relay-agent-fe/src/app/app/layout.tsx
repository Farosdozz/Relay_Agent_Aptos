import React from 'react';
import LayoutApp from '@/components/custom/Layouts/LayoutApp';
// import AccessCodeWrapper from '@/components/custom/CheckCode/AccessCodeWrapper';
import 'react-loading-skeleton/dist/skeleton.css';
import 'react-tooltip/dist/react-tooltip.css';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LayoutApp>{children}</LayoutApp>;
}
