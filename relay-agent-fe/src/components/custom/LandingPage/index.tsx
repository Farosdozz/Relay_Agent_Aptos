'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { REFERRAL_CODE_KEY } from '@/constants';
import mixpanel from 'mixpanel-browser';
import { MIXPANEL_EVENTS } from '@/constants/mix-panel';
import Header from './_components/Header';
import Banner from './_components/Banner';
import Products from './_components/Products';
import Features from './_components/Features';
import AskRelay from './_components/AskRelay';
import FAQ from './_components/FAQ';
import Footer from './_components/Footer';

const ReferralCodeHandler = () => {
  const searchParams = useSearchParams();

  // Get referral code from URL if present
  const refCode = searchParams.get('ref');

  useEffect(() => {
    if (refCode) {
      // Store the referral code in localStorage or context if needed
      localStorage.setItem(REFERRAL_CODE_KEY, refCode);
    }
  }, [refCode]);

  return null;
};

const LandingPage = () => {
  useEffect(() => {
    mixpanel.track(MIXPANEL_EVENTS.VIEW_LANDING_PAGE);
  }, []);

  return (
    <>
      <Suspense>
        <ReferralCodeHandler />
      </Suspense>
      <div className="min-h-screen bg-[#07081a]">
        <Header />
        <Banner />
        {/* <Products /> */}
        <Features />
        {/* <FAQ /> */}
        {/* <AskRelay /> */}
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
