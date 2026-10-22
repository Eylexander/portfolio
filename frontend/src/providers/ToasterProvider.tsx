'use client';

import { useSyncExternalStore } from 'react';
import { Toaster } from 'react-hot-toast';

const subscribeResize = (cb: () => void) => {
  window.addEventListener('resize', cb);
  return () => window.removeEventListener('resize', cb);
};

export default function ToasterProvider() {
  // null on the server so nothing renders until the client knows the viewport
  const isMobile = useSyncExternalStore(subscribeResize, () => window.innerWidth < 768, () => null);

  if (isMobile === null) {
    return null;
  }

  return (
    <Toaster
      position={isMobile ? 'top-center' : 'bottom-center'}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
