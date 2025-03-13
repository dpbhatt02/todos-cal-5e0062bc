
import { useState, useRef, useEffect, TouchEvent } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  preventScroll?: boolean;
}

export const useSwipeGesture = ({ 
  onSwipeLeft, 
  onSwipeRight, 
  threshold = 50,
  preventScroll = false
}: SwipeGestureOptions) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  // Reset swipe state when unmounting
  useEffect(() => {
    return () => {
      setTouchStart(null);
      setTouchEnd(null);
      setSwiping(false);
      setSwipeOffset(0);
    };
  }, []);

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwiping(true);
    setSwipeOffset(0);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!touchStart) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    // Calculate the swipe offset for animation
    const offset = currentTouch - touchStart;
    
    // Limit the swipe distance
    const maxOffset = 100;
    const limitedOffset = Math.min(Math.abs(offset), maxOffset) * Math.sign(offset);
    setSwipeOffset(limitedOffset);
    
    // Prevent scrolling if specified
    if (preventScroll && Math.abs(offset) > 10) {
      e.preventDefault();
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchEnd - touchStart;
    const isLeftSwipe = distance < -threshold;
    const isRightSwipe = distance > threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    } else if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    // Reset swipe state
    setTouchStart(null);
    setTouchEnd(null);
    setSwiping(false);
    setSwipeOffset(0);
  };

  return {
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    state: {
      swiping,
      swipeOffset,
    },
    elementRef,
  };
};
