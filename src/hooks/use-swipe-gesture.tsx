
import { useState, useRef, useCallback, TouchEvent } from 'react';

interface SwipeState {
  isSwiping: boolean;
  startX: number;
  currentX: number;
  startY: number;
  currentY: number;
  swipeOffset: number;
  direction: 'left' | 'right' | 'none';
}

export interface SwipeGestureOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeEnd?: (offset: number, direction: 'left' | 'right' | 'none') => void;
}

export const useSwipeGesture = (options: SwipeGestureOptions = {}) => {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeEnd
  } = options;

  const [state, setState] = useState<SwipeState>({
    isSwiping: false,
    startX: 0,
    currentX: 0,
    startY: 0,
    currentY: 0,
    swipeOffset: 0,
    direction: 'none'
  });

  const elementRef = useRef<HTMLElement | null>(null);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setState(prev => ({
      ...prev,
      isSwiping: true,
      startX: touch.clientX,
      currentX: touch.clientX,
      startY: touch.clientY,
      currentY: touch.clientY,
      swipeOffset: 0,
      direction: 'none'
    }));
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!state.isSwiping) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;

    // If vertical movement is greater than horizontal, don't count as a swipe
    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      setState(prev => ({
        ...prev,
        isSwiping: false,
        swipeOffset: 0,
        direction: 'none'
      }));
      return;
    }

    // Determine direction
    const direction = deltaX > 0 ? 'right' : deltaX < 0 ? 'left' : 'none';

    setState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      swipeOffset: deltaX,
      direction
    }));
  }, [state.isSwiping, state.startX, state.startY]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!state.isSwiping) return;

    const { swipeOffset, direction } = state;

    if (Math.abs(swipeOffset) >= threshold) {
      if (direction === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (direction === 'right' && onSwipeRight) {
        onSwipeRight();
      }
    }

    if (onSwipeEnd) {
      onSwipeEnd(swipeOffset, direction);
    }

    setState(prev => ({
      ...prev,
      isSwiping: false,
      swipeOffset: 0,
      direction: 'none'
    }));
  }, [state, threshold, onSwipeLeft, onSwipeRight, onSwipeEnd]);

  // Handlers object to be used with element
  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };

  return {
    handlers,
    state,
    elementRef
  };
};
