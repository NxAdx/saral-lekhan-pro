import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';

const MIN_EDITOR_BODY_HEIGHT = 220;
const EDITOR_VIEWPORT_PADDING = 8;
const CARET_TOP_BUFFER = 56;
const CARET_BOTTOM_BUFFER = 88;
const CARET_BOTTOM_BUFFER_VISUAL_PADDING = 20;
const HEIGHT_EPSILON = 2;

export function useRichEditorViewport(initialContentHeight = 260, measuredFooterHeight = 0) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const [editorContentHeight, setEditorContentHeight] = useState(initialContentHeight);
  const [viewportHeight, setViewportHeight] = useState(0);

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    setViewportHeight((current) => (Math.abs(current - nextHeight) > HEIGHT_EPSILON ? nextHeight : current));
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  const handleCursorPosition = useCallback(
    (cursorY: number) => {
      if (!scrollRef.current || viewportHeight <= 0) {
        return;
      }

      // Use measured footer height if available, otherwise fall back to safe default
      const effectiveFooterHeight = measuredFooterHeight > 0 ? measuredFooterHeight : CARET_BOTTOM_BUFFER;
      const bottomBuffer = effectiveFooterHeight + CARET_BOTTOM_BUFFER_VISUAL_PADDING;

      const visibleTop = scrollYRef.current;
      const visibleBottom = visibleTop + viewportHeight;
      const safeTop = visibleTop + CARET_TOP_BUFFER;
      const safeBottom = visibleBottom - bottomBuffer;

      let targetY: number | null = null;

      if (cursorY > safeBottom) {
        targetY = Math.max(0, cursorY - (viewportHeight - bottomBuffer));
      } else if (cursorY < safeTop) {
        targetY = Math.max(0, cursorY - CARET_TOP_BUFFER);
      }

      if (targetY !== null && Math.abs(targetY - scrollYRef.current) > HEIGHT_EPSILON) {
        scrollYRef.current = targetY;
        scrollRef.current.scrollTo({ y: targetY, animated: true });
      }
    },
    [viewportHeight, measuredFooterHeight]
  );

  const handleEditorHeightChange = useCallback((height: number) => {
    const nextHeight = Math.max(MIN_EDITOR_BODY_HEIGHT, Math.ceil(height) + 32);
    setEditorContentHeight((current) => (Math.abs(current - nextHeight) > HEIGHT_EPSILON ? nextHeight : current));
  }, []);

  const editorSurfaceMinHeight = useMemo(() => {
    const viewportFillHeight =
      viewportHeight > 0 ? Math.max(MIN_EDITOR_BODY_HEIGHT, viewportHeight - EDITOR_VIEWPORT_PADDING * 2) : MIN_EDITOR_BODY_HEIGHT;

    return Math.max(editorContentHeight, viewportFillHeight);
  }, [editorContentHeight, viewportHeight]);

  return {
    editorSurfaceMinHeight,
    handleCursorPosition,
    handleEditorHeightChange,
    handleScroll,
    handleViewportLayout,
    scrollRef,
  };
}
