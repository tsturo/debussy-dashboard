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
      <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <span className="w-2 h-2 bg-white rounded-full"></span>
        <span>No internet connection</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        <span>{errorMessage || 'Connection error - retrying...'}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        <span>Loading...</span>
      </div>
    );
  }

  return null;
}
