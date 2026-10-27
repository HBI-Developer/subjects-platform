import { Box, Center, Spinner } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";

const ITEM_HEIGHT = 115;
const OVERSCAN = 4;

interface Props<T extends { id: string }> {
  readonly items: Array<T>;
  readonly hasMore: boolean;
  readonly isLoadingMore: boolean;
  readonly onLoadMore: () => void;
  readonly renderItem: (item: T) => React.ReactNode;
}

/** A fixed-row window: only visible cards (plus a small buffer) are mounted. */
export default function VirtualPanelList<T extends { id: string }>({
  items,
  hasMore,
  isLoadingMore,
  onLoadMore,
  renderItem,
}: Props<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(0);

  const updateViewport = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    setScrollTop(element.scrollTop);
    setHeight(element.clientHeight);
    if (
      hasMore &&
      !isLoadingMore &&
      element.scrollTop + element.clientHeight >= element.scrollHeight - ITEM_HEIGHT * 4
    ) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    updateViewport();
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(updateViewport);
    observer.observe(element);
    return () => observer.disconnect();
  }, [updateViewport]);

  const first = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const count = Math.ceil(height / ITEM_HEIGHT) + OVERSCAN * 2;
  const visible = items.slice(first, first + count);

  return (
    <Box
      ref={containerRef}
      flex="1"
      minHeight="0"
      width="100%"
      overflowY="auto"
      onScroll={updateViewport}
    >
      <Box position="relative" minHeight={`${items.length * ITEM_HEIGHT}px`}>
        {visible.map((item, index) => (
          <Box
            key={item.id}
            position="absolute"
            top={`${(first + index) * ITEM_HEIGHT}px`}
            width="100%"
            height={`${ITEM_HEIGHT}px`}
            display="flex"
            justifyContent={{ base: "center", md: "flex-start" }}
          >
            {renderItem(item)}
          </Box>
        ))}
      </Box>
      {isLoadingMore && (
        <Center height={`${ITEM_HEIGHT}px`}>
          <Spinner size="sm" />
        </Center>
      )}
    </Box>
  );
}
