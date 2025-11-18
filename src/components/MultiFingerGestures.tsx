import React, { useEffect, useRef } from 'react';
import { multiFingerGestures } from '../services/multiFingerGestures';

interface MultiFingerGesturesProps {
  onSwipe?: (direction: string) => void;
  onPinch?: (scale: number, rotation: number) => void;
  onLongPress?: (x: number, y: number, duration: number) => void;
  onMultiFingerTap?: (touchCount: number) => void;
  onEdgeSwipe?: (direction: 'left' | 'right' | 'top' | 'bottom') => void;
}

const MultiFingerGestures: React.FC<MultiFingerGesturesProps> = ({
  onSwipe,
  onPinch,
  onLongPress,
  onMultiFingerTap,
  onEdgeSwipe
}) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Add gesture listeners
    if (onSwipe) {
      multiFingerGestures.addGestureListener('swipe', (detail: any) => {
        onSwipe(detail.direction);
      });
    }

    if (onPinch) {
      multiFingerGestures.addGestureListener('pinch', (detail: any) => {
        onPinch(detail.scale, detail.rotation);
      });
    }

    if (onLongPress) {
      multiFingerGestures.addGestureListener('longpress', (detail: any) => {
        onLongPress(detail.x, detail.y, detail.duration);
      });
    }

    if (onMultiFingerTap) {
      multiFingerGestures.addGestureListener('multifingertap', (detail: any) => {
        onMultiFingerTap(detail.touchCount);
      });
    }

    // Handle touch events for edge swipe detection
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
        touchStartTime.current = Date.now();
        
        // Set up long press detection
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
        }
        
        longPressTimeout.current = setTimeout(() => {
          if (onLongPress) {
            onLongPress(touch.clientX, touch.clientY, 500);
          }
        }, 500);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Clear long press timeout when moving
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }
      
      // Handle edge swipe detection
      if (e.touches.length === 1 && onEdgeSwipe) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX.current;
        const deltaY = touch.clientY - touchStartY.current;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // Check if swipe started near edge
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const edgeThreshold = 50;
        
        const startedNearLeftEdge = touchStartX.current < edgeThreshold;
        const startedNearRightEdge = touchStartX.current > screenWidth - edgeThreshold;
        const startedNearTopEdge = touchStartY.current < edgeThreshold;
        const startedNearBottomEdge = touchStartY.current > screenHeight - edgeThreshold;
        
        // Determine edge swipe direction
        if (absDeltaX > absDeltaY && absDeltaX > 30) {
          if (startedNearLeftEdge && deltaX > 0) {
            onEdgeSwipe('right');
          } else if (startedNearRightEdge && deltaX < 0) {
            onEdgeSwipe('left');
          }
        } else if (absDeltaY > absDeltaX && absDeltaY > 30) {
          if (startedNearTopEdge && deltaY > 0) {
            onEdgeSwipe('bottom');
          } else if (startedNearBottomEdge && deltaY < 0) {
            onEdgeSwipe('top');
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Clear long press timeout
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }
      
      // Handle tap detection
      if (e.changedTouches.length === 1) {
        const touchEndTime = Date.now();
        const duration = touchEndTime - touchStartTime.current;
        
        // Simple tap detection
        if (duration < 200) {
          // In a real implementation, you would check for double tap
          // For now, we'll just emit a basic tap event
        }
      }
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
    };
  }, [onSwipe, onPinch, onLongPress, onMultiFingerTap, onEdgeSwipe]);

  return null; // This component doesn't render anything
};

export default MultiFingerGestures;