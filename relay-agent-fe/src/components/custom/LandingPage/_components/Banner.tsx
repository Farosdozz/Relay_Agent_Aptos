'use client';
import Icons from '@/components/main/Icons';
import useAppLogin from '@/hooks/useAppLogin';

const Banner: React.FC = () => {
  const { login } = useAppLogin();

  return (
    <section className="relative h-[769px] w-full overflow-hidden bg-[#07081a]">
      {/* Background with gradient and grid */}
      <div className="absolute inset-0">
        {/* Main gradient background - purple to pink */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4a2a7c] via-[#6b3c8f] to-[#d473b8] opacity-60" />
        </div>
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #9178ff 1px, transparent 1px),
              linear-gradient(to bottom, #9178ff 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Large gradient blur for glow effect */}
        <div className="absolute -right-48 -top-48 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-purple-500/50 via-pink-400/40 to-transparent blur-[150px]" />
        
        {/* Pixelated shapes on the right side */}
        <div className="absolute right-[10%] top-[25%] opacity-70">
          <div className="relative h-[400px] w-[400px]">
            {/* Top row */}
            <div className="absolute left-[120px] top-[0px] h-20 w-20 bg-purple-400/30"></div>
            <div className="absolute left-[200px] top-[0px] h-20 w-20 bg-purple-300/40"></div>
            
            {/* Middle row */}
            <div className="absolute left-[40px] top-[80px] h-20 w-20 bg-purple-400/25"></div>
            <div className="absolute left-[120px] top-[80px] h-20 w-20 bg-purple-300/50"></div>
            <div className="absolute left-[200px] top-[80px] h-20 w-20 bg-purple-400/35"></div>
            
            {/* Bottom middle */}
            <div className="absolute left-[40px] top-[160px] h-20 w-20 bg-purple-300/30"></div>
            <div className="absolute left-[120px] top-[160px] h-20 w-20 bg-purple-400/40"></div>
            <div className="absolute left-[200px] top-[160px] h-20 w-20 bg-purple-300/25"></div>
            
            {/* Bottom row */}
            <div className="absolute left-[120px] top-[240px] h-20 w-20 bg-purple-400/30"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative mx-auto flex h-full max-w-[1366px] items-center px-6 md:px-[120px] pt-20">
        <div className="flex w-full max-w-[583px] flex-col items-start gap-8">
          <div className="space-y-6">
            <h1 className="font-roboto text-[40px] font-semibold leading-[48px] text-white">
              The Relay copilot
            </h1>
            <p className="font-roboto text-[18px] font-normal leading-[18px] text-white">
              Learn everything you need to in the Relay world
            </p>
          </div>

          <button
            type="button"
            onClick={() => login()}
            className="flex items-center gap-[18px] rounded-3xl bg-[#9178ff] px-[38px] py-2.5 transition-all duration-200 hover:bg-[#8068e0]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 7H17V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-roboto text-[20px] font-medium leading-[30px] text-white">
              Get Started
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Banner;
