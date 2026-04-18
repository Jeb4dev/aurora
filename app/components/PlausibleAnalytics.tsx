'use client';

import { useEffect } from 'react';

export const PlausibleAnalytics = (): null => {
  useEffect(() => {
    // Dynamically import only on client side to avoid SSR issues
    import('@plausible-analytics/tracker').then(({ init }) => {
      init({
        domain: 'aurora.jeb4.dev',
        endpoint: 'https://analytics.bittive.com/api/event',
        autoCapturePageviews: true,
        hashBasedRouting: false,
      });
    });
  }, []);

  return null;
};

