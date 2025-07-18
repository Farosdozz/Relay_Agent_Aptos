'use client';
import React from 'react';

const FAQ: React.FC = () => {
  const faqItems = [
    { id: 1, question: "What is Relay?" },
    { id: 2, question: "What is the On-Chain AI module?" },
    { id: 3, question: "What is Relay?" },
    { id: 4, question: "What is the On-Chain AI module?" },
    { id: 5, question: "What is Relay?" },
    { id: 6, question: "How long has Relay existed?" }
  ];

  return (
    <div className="relative w-full bg-[#07081a] py-20">
      {/* Background gradient effect */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-600/20 to-transparent blur-[120px]" />
        <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-gradient-to-br from-pink-600/20 to-transparent blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-[1366px] px-[120px]">
        {/* FAQ Grid Container */}
        <div className="relative mx-auto w-full]">
          <div className="overflow-hidden rounded-[40px] bg-[#07081a] shadow-[0px_2px_32px_0px_rgba(0,0,0,0.25)]">
            <div className="grid grid-cols-3">
              {/* Left Column - Questions 1, 3, 5 */}
              <div className="border-r border-[#ce66b4]">
                <div className="flex h-[240px] items-center border-b border-[#ce66b4] p-6">
                  <p className="font-roboto text-[20px] font-semibold text-white">
                    <span className="mr-2">1.</span>
                    {faqItems[0].question}
                  </p>
                </div>
                <div className="flex h-[240px] items-center border-b border-[#ce66b4] p-6">
                  <p className="font-roboto text-[20px] font-semibold text-white">
                    <span className="mr-2">3.</span>
                    {faqItems[2].question}
                  </p>
                </div>
                <div className="flex h-[240px] items-center p-6">
                  <p className="font-roboto text-[20px] font-semibold text-white">
                    <span className="mr-2">5.</span>
                    {faqItems[4].question}
                  </p>
                </div>
              </div>

              {/* Middle Column - Questions 2, 4, 6 */}
              <div className="border-r border-[#ce66b4]">
                <div className="flex h-[240px] items-center border-b border-[#ce66b4] p-6">
                  <p className="font-roboto text-[20px] font-semibold text-white">
                    <span className="mr-2">2.</span>
                    {faqItems[1].question}
                  </p>
                </div>
                <div className="flex h-[240px] items-center border-b border-[#ce66b4] p-6">
                  <p className="font-roboto text-[20px] font-semibold text-white">
                    <span className="mr-2">4.</span>
                    {faqItems[3].question}
                  </p>
                </div>
                <div className="flex h-[240px] items-center p-6">
                  <p className="font-roboto text-[20px] font-semibold text-white">
                    <span className="mr-2">6.</span>
                    {faqItems[5].question}
                  </p>
                </div>
              </div>

              {/* Right Column - Feature highlight */}
              <div className="relative">
                <div className="flex h-[360px] flex-col items-center justify-center p-8">
                  <h2 className="mb-8 text-center font-roboto text-[32px] font-semibold leading-[38px] text-white">
                    Decentralized AI agent automating blockchain tasks seamlessly.
                  </h2>
                </div>
                <div className="relative flex h-[360px] items-center justify-center">
                  {/* 3D Shape placeholder */}
                  <div className="relative h-48 w-48">
                    <div className="absolute inset-0 animate-pulse">
                      <svg viewBox="0 0 200 200" className="h-full w-full">
                        <defs>
                          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#9178ff" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#ce66b4" stopOpacity="0.8" />
                          </linearGradient>
                        </defs>
                        {/* Cube-like shape */}
                        <g transform="translate(100, 100)">
                          <rect x="-40" y="-40" width="40" height="40" fill="url(#gradient1)" opacity="0.9" />
                          <rect x="0" y="-40" width="40" height="40" fill="url(#gradient1)" opacity="0.7" />
                          <rect x="-40" y="0" width="40" height="40" fill="url(#gradient1)" opacity="0.8" />
                          <rect x="0" y="0" width="40" height="40" fill="url(#gradient1)" opacity="0.6" />
                          <rect x="-20" y="-60" width="40" height="40" fill="url(#gradient1)" opacity="0.5" />
                          <rect x="20" y="-20" width="40" height="40" fill="url(#gradient1)" opacity="0.4" />
                        </g>
                      </svg>
                    </div>
                  </div>
                  {/* Gradient glow effect */}
                  <div className="absolute bottom-0 h-64 w-full bg-gradient-to-t from-purple-500/20 via-transparent to-transparent blur-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;