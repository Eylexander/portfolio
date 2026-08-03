'use client';

import { useEffect } from 'react';
import { init } from '@plausible-analytics/tracker';

export function PlausibleProvider() {
  useEffect(() => {
    const domain = "eylexander.fr";
    if (!domain) return;

    init({
      domain,
      endpoint: process.env.NEXT_PUBLIC_PLAUSIBLE_ENDPOINT,
      outboundLinks: true,
      fileDownloads: true,
    });
  }, []);

  return null;
}

export default PlausibleProvider;
