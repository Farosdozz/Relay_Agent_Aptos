import mixpanel from 'mixpanel-browser';

export const identifyUser = (id: string, walletAddress: string) => {
  mixpanel.identify(id);
  mixpanel.people.set({
    name: walletAddress,
  });
};
export const trackingEvent = (eventName: string, properties?: Record<string, string>) => {
  mixpanel.track(eventName, properties);
};

export const resetUser = () => {
  mixpanel.reset();
};
