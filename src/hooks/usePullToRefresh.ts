import { useState, useEffect, useRef } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => void;
  threshold?: number;
}

export const usePullToRefresh = ({ onRefresh, threshold = 50 }: UsePullToRefreshProps) => {
  const [pullToRefreshActive, setPullToRefreshActive] = useState(false);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const touchDelta = touchY - touchStartY.current;

    // Only trigger pull to refresh at the top of the page
    if (window.scrollY === 0 && touchDelta > threshold) {
      setPullToRefreshActive(true);
    }
  };

  const handleTouchEnd = () => {
    if (pullToRefreshActive) {
      onRefresh();
    }
    setPullToRefreshActive(false);
  };

  useEffect(() => {
    // Touch events for pull to refresh
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullToRefreshActive, onRefresh, threshold]);

  return { pullToRefreshActive };
};