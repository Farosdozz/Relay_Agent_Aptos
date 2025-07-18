import { Orbitron } from 'next/font/google';
import { HTMLAttributes, useState } from 'react';
import { featureLists, featureType, TabType } from '@/constants/feature';
import Images from '@/components/main/Images';

const orbitronFont = Orbitron({ display: 'swap', weight: ['700'], subsets: ['latin'] });

interface FeatureButtonProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const FeatureButton: React.FC<FeatureButtonProps> = ({
  children,
  variant = 'secondary',
  className,
  ...props
}) => {
  const baseClasses =
    'flex justify-center items-center px-9 py-5 h-[68px] rounded-[75px] w-full cursor-pointer';

  const variantClasses =
    variant === 'primary'
      ? 'bg-gradient-to-r from-[#9178ff] to-[#ce66b4] text-white'
      : 'border border-gray-600 border-solid text-white hover:border-gray-400';

  return (
    <div {...props} className={`${baseClasses} ${variantClasses} ${className}`}>
      <span className="font-roboto text-center text-2xl font-medium uppercase max-sm:text-base">{children}</span>
    </div>
  );
};

export const Features: React.FC = () => {
  const [tab, setTab] = useState<TabType>('smart');

  return (
    <section
      className="relative w-full overflow-hidden bg-[#07081a] pt-10 max-md:h-[1400px] md:pt-20"
      role="main"
      aria-labelledby="features-heading"
    >
      {/* Main heading */}
      <h1
        className="font-roboto h-[94px] text-center text-[50px] font-bold uppercase leading-[55px] tracking-[9px] text-white md:text-[80px]"
      >
        Our Features
      </h1>

      {/* Feature buttons navigation */}
      <div
        className="mt-16 flex flex-col items-center justify-center gap-5 md:my-8 md:flex-row"
        aria-label="Feature navigation"
      >
        {featureLists.map((feature) => (
          <div key={feature.button} className="flex items-center justify-center">
            <FeatureButton
              variant={tab === feature.type ? 'primary' : 'secondary'}
              onClick={() => setTab(feature.type as TabType)}
            >
              {feature.button}
            </FeatureButton>
          </div>
        ))}
      </div>

      {/* Content section */}
      {/* <div className="my-5 flex flex-col items-center">
        <p className="h-[42px] text-center text-xl leading-8 text-white">
          {featureType[tab].content}
        </p>
      </div> */}
      {/* Browser mockup */}
      {/* <div className="mx-auto hidden w-3/4 md:block">
        <Images
          alt={featureType[tab].image}
          image={featureType[tab].image}
          className="relative h-full w-full object-contain"
        />
      </div>
      <div
        className={`absolute ${tab === 'advanced' ? '-bottom-1/5' : 'bottom-0'} left-1/2 block w-[90%] -translate-x-1/2 md:hidden`}
      >
        <Images
          alt={featureType[tab].imageMobile}
          image={featureType[tab].imageMobile}
          className="h-full w-full object-contain"
        />
      </div> */}
    </section>
  );
};

export default Features;
