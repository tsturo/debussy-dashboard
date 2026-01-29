'use client';

import { useEffect, useState } from 'react';

interface ConnectionStatusProps {
  isError: boolean;
  isLoading: boolean;
  errorMessage?: string;
}

export function ConnectionStatus({ isError, isLoading, errorMessage }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in-right border-2 border-red-400">
        <span className="w-2.5 h-2.5 bg-white rounded-full animate-shake"></span>
        <span className="font-medium">No internet connection</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-600 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in-right border-2 border-yellow-400">
        <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
        <span className="font-medium">{errorMessage || 'Connection error - retrying...'}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in-right border-2 border-blue-400">
        <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
        <span className="font-medium">Loading...</span>
      </div>
    );
  }

  return null;
}
