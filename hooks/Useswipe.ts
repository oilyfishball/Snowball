import { useRef } from 'react';
import { PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';

const SWIPE_THRESHOLD = 50;

interface UseSwipeOptions {
  activeTab: number;
  tabCount: number;
  onSwipe: (newIndex: number) => void;
}

export function useSwipe({ activeTab, tabCount, onSwipe }: UseSwipeOptions) {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const { dx } = gestureState;
        if (dx > SWIPE_THRESHOLD && activeTab > 0) {
          onSwipe(activeTab - 1);
        } else if (dx < -SWIPE_THRESHOLD && activeTab < tabCount - 1) {
          onSwipe(activeTab + 1);
        }
      },
    })
  ).current;

  return panResponder.panHandlers;
}