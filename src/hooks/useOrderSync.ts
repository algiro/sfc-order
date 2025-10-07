import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useOrderSync = () => {
  const { loadOrdersFromAPI, syncOrders, lastOrderSync } = useAppStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load orders when the hook is first used (app starts)
    loadOrdersFromAPI();

    // Set up periodic syncing every 10 seconds
    intervalRef.current = setInterval(() => {
      syncOrders();
    }, 10000);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Sync when tab becomes visible (handles case where user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncOrders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncOrders]);

  return {
    lastOrderSync,
    manualSync: syncOrders,
  };
};