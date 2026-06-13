import { useCallback, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

const HEIGHT_EPSILON = 2;

export function useFooterMeasurement() {
  const [footerHeight, setFooterHeight] = useState(0);
  const lastHeightRef = useRef(0);

  const handleFooterLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    if (Math.abs(nextHeight - lastHeightRef.current) > HEIGHT_EPSILON) {
      lastHeightRef.current = nextHeight;
      setFooterHeight(nextHeight);
    }
  }, []);

  return { footerHeight, handleFooterLayout };
}
