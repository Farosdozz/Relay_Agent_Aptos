'use client';
import Images from '@/components/main/Images';
import useAppLogin from '@/hooks/useAppLogin';
import { Orbitron } from 'next/font/google';
import Spline from '@splinetool/react-spline';

const orbitronFont = Orbitron({ display: 'swap', weight: ['700'], subsets: ['latin'] });

const AskRelay: React.FC = () => {
  const { login } = useAppLogin();
  return (
    <div className="relative w-full overflow-hidden bg-[#07081a]">
      <div className="container mx-auto px-3 py-28 md:py-20">
      <div className="absolute left-0 top-1/2 hidden h-full w-[1900px] -translate-y-1/2 max-lg:h-auto max-lg:w-[1000px] md:block">
        {/* <Spline
          scene={'https://prod.spline.design/q3zsxNhvD77pmyw6/scene.splinecode'}
          className="h-full w-full"
        /> */}
      </div>
      <div className="relative flex h-[800px] items-center">
        <div className="md:1/2 relative flex w-full flex-col items-center space-y-10 py-10 max-md:items-center md:items-end md:space-y-5 md:py-0">
          <div
            className="font-roboto text-nowrap text-center text-[50px] font-semibold uppercase leading-[0] text-white md:text-right md:text-[90px]"
            id="node-36952_28315"
          >
            <p className="flex space-x-4 leading-[1.05]">
              <span className="hidden md:block">Ask</span>{' '}
              <span className="block md:hidden">Try</span> <span>Relay</span>
            </p>
          </div>

          <div className="flex h-[65px] flex-col justify-end text-center text-lg font-normal leading-[1.2] text-white opacity-80 md:text-right md:text-[20px]">
            <p className="mb-0 block">Relay simplifies DeFi.</p>
            <p className="mb-0 block">Just type a prompt and let Relay handle everything.</p>
            <p className="block">{`Automation. Instant. Effortless. `}</p>
          </div>
          <Images alt="" image="askRelay" className="block w-full md:hidden" />
          
          <button
            className="flex flex-row items-center justify-center overflow-clip bg-gradient-to-r from-[#9178ff] to-[#ce66b4] rounded-full transition-all duration-200 hover:from-[#8068e0] hover:to-[#b85aa0]"
            onClick={() => login()}
          >
            <div
              className={`relative box-border flex flex-row content-stretch items-center justify-center gap-2.5 px-5 py-3 md:px-10 md:py-4`}
            >
              <div className="font-roboto relative flex shrink-0 flex-col justify-end text-nowrap text-right text-lg font-medium leading-[0] tracking-[12.24px] text-[#ffffff] md:text-[24px]">
                <p className="block whitespace-pre leading-[1.05]">TRY NOW</p>
              </div>
            </div>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AskRelay;
