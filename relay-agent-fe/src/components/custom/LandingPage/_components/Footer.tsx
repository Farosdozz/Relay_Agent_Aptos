import Icons from '@/components/main/Icons';
import Images from '@/components/main/Images';
import Link from 'next/link';
import React from 'react';

const Footer: React.FC = () => {
  const handleLinkKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>, url: string) => {
    if (event.key === 'Enter') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="bg-[#07081a] py-20 text-white border-t border-gray-800">
      <div className="container mx-auto px-4">
        {/* Top section with logo */}

        <div className="mb-10">
          <img 
            src="/icons/relay-logo-transparent.svg" 
            alt="Relay Logo" 
            className="h-10 w-auto"
          />
        </div>
        {/* Bottom section with links and social icons */}
        <div className="flex flex-wrap items-start justify-between gap-8">
          {/* Column 1: Description */}
          <div className="w-full md:w-1/4">
            <p className="text-[#FFF] opacity-70">
              The AI-powered Yield Strategy <br /> Execution Agent
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="w-full sm:w-auto">
            <ul className="space-y-2">
              <li>
                <a
                  className="text-[#FFF] opacity-70"
                  aria-label="Features"
                  onKeyDown={(e) => handleLinkKeyDown(e, '#')}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="https://relay-agent.gitbook.io/relay"
                  className="text-[#FFF] opacity-70"
                  aria-label="Our Docs"
                  onKeyDown={(e) => handleLinkKeyDown(e, '#')}
                >
                  Our Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="w-full space-y-2 sm:w-auto">
            <h3 className="text-[#FFF] opacity-70">Contact</h3>
            <Link target="_blank" href="mailto:hi@relay-agent.io">
              hi@relay-agent.io
            </Link>
          </div>

          {/* Column 4: Social Icons */}
          <div className="w-full sm:w-auto">
            <div className="flex space-x-4">
              <Link
                href="https://x.com/relay_ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-white hover:text-gray-400"
              >
                <Icons icon="whiteTwitter" size={30} />
              </Link>
              <Link
                href="https://discord.gg/relay-agent"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="text-white hover:text-gray-400"
              >
                <Icons icon="whiteDiscord" size={30} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
