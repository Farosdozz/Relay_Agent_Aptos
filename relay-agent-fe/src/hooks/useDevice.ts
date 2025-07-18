import { useState, useEffect } from 'react';

type DeviceType = 'mobile' | 'desktop';

export const useDevice = (): {
  isMobile: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
} => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    // Function to detect device type based on screen width and user agent
    const detectDevice = () => {
      // Check for mobile user agent patterns
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileByAgent = mobileRegex.test(userAgent);

      // Check for screen size (below 768px is considered mobile)
      const isMobileBySize = window.innerWidth < 768;

      // Determine device type based on both checks
      // If either check indicates mobile, treat as mobile
      if (isMobileByAgent || isMobileBySize) {
        setDeviceType('mobile');
      } else {
        setDeviceType('desktop');
      }
    };

    // Detect on initial render
    detectDevice();

    // Set up listener for window resize
    window.addEventListener('resize', detectDevice);

    // Clean up
    return () => {
      window.removeEventListener('resize', detectDevice);
    };
  }, []);

  return {
    isMobile: deviceType === 'mobile',
    isDesktop: deviceType === 'desktop',
    deviceType,
  };
};
