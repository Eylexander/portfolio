'use client';

import { useEffect } from 'react';

let initialized = false;

export function PlausibleProvider({ domain, endpoint }: { domain?: string; endpoint?: string }) {
  useEffect(() => {
    if (initialized || !domain) return;
    initialized = true;

    import('@plausible-analytics/tracker').then(({ init }) => {
      init({
        domain,
        endpoint,
        outboundLinks: true,
        fileDownloads: true,
      });
    });
  }, [domain, endpoint]);

  return null;
}

export default PlausibleProvider;
