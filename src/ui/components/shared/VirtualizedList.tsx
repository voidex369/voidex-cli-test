/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    useState,
    useRef,
    useLayoutEffect,
    forwardRef,
    useImperativeHandle,
    useEffect,
    useMemo,
    useCallback,
} from 'react';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.js';
import { useBatchedScroll } from '../../hooks/useBatchedScroll.js';

import { type DOMElement, measureElement, Box } from 'ink';

export const SCROLL_TO_ITEM_END = Number.MAX_SAFE_INTEGER;

type VirtualizedListProps<T> = {
    data: T[];
    renderItem: (info: { item: T; index: number }) => React.ReactElement;
    estimatedItemHeight: (index: number) => number;
    keyExtractor: (item: T, index: number) => string;
    initialScrollIndex?: number;
    initialScrollOffsetInIndex?: number;
    scrollbarThumbColor?: string;
};

export type VirtualizedListRef<T> = {
    scrollBy: (delta: number) => void;
    scrollTo: (offset: number) => void;
    scrollToEnd: () => void;
    scrollToIndex: (params: {
        index: number;
        viewOffset?: number;
        viewPosition?: number;
    }) => void;
    scrollToItem: (params: {
        item: T;
        viewOffset?: number;
        viewPosition?: number;
    }) => void;
    getScrollIndex: () => number;
    getScrollState: () => {
        scrollTop: number;
        scrollHeight: number;
        innerHeight: number;
    };
};

function findLastIndex<T>(
    array: T[],
    predicate: (value: T, index: number, obj: T[]) => unknown,
): number {
    for (let i = array.length - 1; i >= 0; i--) {
        if (predicate(array[i], i, array)) {
            return i;
        }
    }
    return -1;
}

function VirtualizedList<T>(
    props: VirtualizedListProps<T>,
    ref: React.Ref<VirtualizedListRef<T>>,
) {
    const {
        data,
        renderItem,
        estimatedItemHeight,
        keyExtractor,
        initialScrollIndex,
        initialScrollOffsetInIndex,
    } = props;
    const { theme } = useTheme();
    const dataRef = useRef(data);
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    const [scrollAnchor, setScrollAnchor] = useState(() => {
        const scrollToEnd =
            initialScrollIndex === SCROLL_TO_ITEM_END ||
            (typeof initialScrollIndex === 'number' &&
                initialScrollIndex >= data.length - 1 &&
                initialScrollOffsetInIndex === SCROLL_TO_ITEM_END);

        if (scrollToEnd) {
            return {
                index: data.length > 0 ? data.length - 1 : 0,
                offset: SCROLL_TO_ITEM_END,
            };
        }

        if (typeof initialScrollIndex === 'number') {
            return {
                index: Math.max(0, Math.min(data.length - 1, initialScrollIndex)),
                offset: initialScrollOffsetInIndex ?? 0,
            };
        }

        return { index: 0, offset: 0 };
    });
    
    // State untuk melacak apakah user sedang meng-scroll manual
    const [isStickingToBottom, setIsStickingToBottom] = useState(() => {
        const scrollToEnd =
            initialScrollIndex === SCROLL_TO_ITEM_END ||
            (typeof initialScrollIndex === 'number' &&
                initialScrollIndex >= data.length - 1 &&
                initialScrollOffsetInIndex === SCROLL_TO_ITEM_END);
        return scrollToEnd;
    });
    
    const containerRef = useRef<DOMElement>(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const itemRefs = useRef<Array<DOMElement | null>>([]);
    const [heights, setHeights] = useState<number[]>([]);
    const isInitialScrollSet = useRef(false);
    const isUserDragging = useRef(false); // [NEW] Tracking manual scroll

    const { totalHeight, offsets } = useMemo(() => {
        const offsets: number[] = [0];
        let totalHeight = 0;
        for (let i = 0; i < data.length; i++) {
            const height = heights[i] ?? estimatedItemHeight(i);
            totalHeight += height;
            offsets.push(totalHeight);
        }
        return { totalHeight, offsets };
    }, [heights, data, estimatedItemHeight]);

    useEffect(() => {
        setHeights((prevHeights) => {
            if (data.length === prevHeights.length) {
                return prevHeights;
            }

            const newHeights = [...prevHeights];
            if (data.length < prevHeights.length) {
                newHeights.length = data.length;
            } else {
                for (let i = prevHeights.length; i < data.length; i++) {
                    newHeights[i] = estimatedItemHeight(i);
                }
            }
            return newHeights;
        });
    }, [data, estimatedItemHeight]);

    // Update Heights Logic
    useLayoutEffect(() => {
        if (containerRef.current) {
            const height = Math.round(measureElement(containerRef.current).height);
            if (containerHeight !== height) {
                setContainerHeight(height);
            }
        }

        let newHeights: number[] | null = null;
        // Hanya hitung ulang item yang terlihat (visible range)
        const startIndex = Math.max(0, findLastIndex(offsets, (offset) => offset <= scrollTop) - 1);
        const endIndexOffset = offsets.findIndex((offset) => offset > scrollTop + containerHeight);
        const endIndex = endIndexOffset === -1 ? data.length - 1 : Math.min(data.length - 1, endIndexOffset);

        for (let i = startIndex; i <= endIndex; i++) {
            const itemRef = itemRefs.current[i];
            if (itemRef) {
                const height = Math.round(measureElement(itemRef).height);
                if (height !== heights[i]) {
                    if (!newHeights) {
                        newHeights = [...heights];
                    }
                    newHeights[i] = height;
                }
            }
        }
        if (newHeights) {
            setHeights(newHeights);
        }
    });

    const scrollableContainerHeight = containerRef.current
        ? Math.round(measureElement(containerRef.current).height)
        : containerHeight;

    const getAnchorForScrollTop = useCallback(
        (
            scrollTop: number,
            offsets: number[],
        ): { index: number; offset: number } => {
            const index = findLastIndex(offsets, (offset) => offset <= scrollTop);
            if (index === -1) {
                return { index: 0, offset: 0 };
            }

            return { index, offset: scrollTop - offsets[index] };
        },
        [],
    );

    const scrollTop = useMemo(() => {
        const offset = offsets[scrollAnchor.index];
        if (typeof offset !== 'number') {
            return 0;
        }

        if (scrollAnchor.offset === SCROLL_TO_ITEM_END) {
            const itemHeight = heights[scrollAnchor.index] ?? 0;
            return offset + itemHeight - scrollableContainerHeight;
        }

        return offset + scrollAnchor.offset;
    }, [scrollAnchor, offsets, heights, scrollableContainerHeight]);

    const prevDataLength = useRef(data.length);
    const prevTotalHeight = useRef(totalHeight);
    const prevScrollTop = useRef(scrollTop);
    const prevContainerHeight = useRef(scrollableContainerHeight);

    useLayoutEffect(() => {
        const contentPreviouslyFit = prevTotalHeight.current <= prevContainerHeight.current;
        const wasScrolledToBottomPixels = prevScrollTop.current >= prevTotalHeight.current - prevContainerHeight.current - 1;
        const wasAtBottom = contentPreviouslyFit || wasScrolledToBottomPixels;

        const listGrew = data.length > prevDataLength.current;
        const containerChanged = prevContainerHeight.current !== scrollableContainerHeight;

        // [LOGIKA FIX SCROLL THRASHING]
        // Hanya update scroll jika:
        // 1. User sudah ada di paling bawah (isStickingToBottom) ATAU list baru saja bertambah
        // 2. User tidak sedang drag scroll manual (isUserDragging)
        
        if (isUserDragging.current) {
            // Jika user sedang drag, jangan paksa scroll, tapi update status 'isStickingToBottom'
            if (wasAtBottom) setIsStickingToBottom(true);
            else setIsStickingToBottom(false);
        } else {
            // Auto-scroll logic
            if ((listGrew && (isStickingToBottom || wasAtBottom)) || (isStickingToBottom && containerChanged)) {
                setScrollAnchor({
                    index: data.length > 0 ? data.length - 1 : 0,
                    offset: SCROLL_TO_ITEM_END,
                });
                setIsStickingToBottom(true);
            } else if (
                (scrollAnchor.index >= data.length ||
                scrollTop > totalHeight - scrollableContainerHeight) &&
                data.length > 0
            ) {
                const newScrollTop = Math.max(0, totalHeight - scrollableContainerHeight);
                setScrollAnchor(getAnchorForScrollTop(newScrollTop, offsets));
            } else if (data.length === 0) {
                setScrollAnchor({ index: 0, offset: 0 });
            }
        }

        prevDataLength.current = data.length;
        prevTotalHeight.current = totalHeight;
        prevScrollTop.current = scrollTop;
        prevContainerHeight.current = scrollableContainerHeight;
    }, [
        data.length,
        totalHeight,
        scrollTop,
        scrollableContainerHeight,
        scrollAnchor.index,
        getAnchorForScrollTop,
        offsets,
        isStickingToBottom,
    ]);

    useLayoutEffect(() => {
        if (
            isInitialScrollSet.current ||
            offsets.length <= 1 ||
            totalHeight <= 0 ||
            containerHeight <= 0
        ) {
            return;
        }

        if (typeof initialScrollIndex === 'number') {
            const scrollToEnd =
                initialScrollIndex === SCROLL_TO_ITEM_END ||
                (initialScrollIndex >= data.length - 1 &&
                    initialScrollOffsetInIndex === SCROLL_TO_ITEM_END);

            if (scrollToEnd) {
                setScrollAnchor({
                    index: data.length - 1,
                    offset: SCROLL_TO_ITEM_END,
                });
                setIsStickingToBottom(true);
                isInitialScrollSet.current = true;
                return;
            }

            const index = Math.max(0, Math.min(data.length - 1, initialScrollIndex));
            const offset = initialScrollOffsetInIndex ?? 0;
            const newScrollTop = (offsets[index] ?? 0) + offset;

            const clampedScrollTop = Math.max(
                0,
                Math.min(totalHeight - scrollableContainerHeight, newScrollTop),
            );

            setScrollAnchor(getAnchorForScrollTop(clampedScrollTop, offsets));
            isInitialScrollSet.current = true;
        }
    }, [
        initialScrollIndex,
        initialScrollOffsetInIndex,
        offsets,
        totalHeight,
        containerHeight,
        getAnchorForScrollTop,
        data.length,
        heights,
        scrollableContainerHeight,
    ]);

    const startIndex = Math.max(
        0,
        findLastIndex(offsets, (offset) => offset <= scrollTop) - 1,
    );
    const endIndexOffset = offsets.findIndex(
        (offset) => offset > scrollTop + scrollableContainerHeight,
    );
    const endIndex =
        endIndexOffset === -1
            ? data.length - 1
            : Math.min(data.length - 1, endIndexOffset);

    const topSpacerHeight = offsets[startIndex] ?? 0;
    const bottomSpacerHeight =
        totalHeight - (offsets[endIndex + 1] ?? totalHeight);

    const renderedItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
        const item = data[i];
        if (item) {
            renderedItems.push(
                <Box
                    key={keyExtractor(item, i)}
                    width="100%"
                    ref={(el) => {
                        itemRefs.current[i] = el;
                    }}
                >
                    {renderItem({ item, index: i })}
                </Box>,
            );
        }
    }

    const { getScrollTop, setPendingScrollTop } = useBatchedScroll(scrollTop);

    useImperativeHandle(
        ref,
        () => ({
            scrollBy: (delta: number) => {
                if (delta < 0) {
                    setIsStickingToBottom(false);
                }
                const currentScrollTop = getScrollTop();
                const newScrollTop = Math.max(
                    0,
                    Math.min(
                        totalHeight - scrollableContainerHeight,
                        currentScrollTop + delta,
                    ),
                );
                setPendingScrollTop(newScrollTop);
                setScrollAnchor(getAnchorForScrollTop(newScrollTop, offsets));
            },
            scrollTo: (offset: number) => {
                setIsStickingToBottom(false);
                const newScrollTop = Math.max(
                    0,
                    Math.min(totalHeight - scrollableContainerHeight, offset),
                );
                setPendingScrollTop(newScrollTop);
                setScrollAnchor(getAnchorForScrollTop(newScrollTop, offsets));
            },
            scrollToEnd: () => {
                setIsStickingToBottom(true);
                if (data.length > 0) {
                    setScrollAnchor({
                        index: data.length - 1,
                        offset: SCROLL_TO_ITEM_END,
                    });
                }
            },
            scrollToIndex: ({
                index,
                viewOffset = 0,
                viewPosition = 0,
            }: {
                index: number;
                viewOffset?: number;
                viewPosition?: number;
            }) => {
                setIsStickingToBottom(false);
                const offset = offsets[index];
                if (offset !== undefined) {
                    const newScrollTop = Math.max(
                        0,
                        Math.min(
                            totalHeight - scrollableContainerHeight,
                            offset - viewPosition * scrollableContainerHeight + viewOffset,
                        ),
                    );
                    setPendingScrollTop(newScrollTop);
                    setScrollAnchor(getAnchorForScrollTop(newScrollTop, offsets));
                }
            },
            scrollToItem: ({
                item,
                viewOffset = 0,
                viewPosition = 0,
            }: {
                item: T;
                viewOffset?: number;
                viewPosition?: number;
            }) => {
                setIsStickingToBottom(false);
                const index = data.indexOf(item);
                if (index !== -1) {
                    const offset = offsets[index];
                    if (offset !== undefined) {
                        const newScrollTop = Math.max(
                            0,
                            Math.min(
                                totalHeight - scrollableContainerHeight,
                                offset - viewPosition * scrollableContainerHeight + viewOffset,
                            ),
                        );
                        setPendingScrollTop(newScrollTop);
                        setScrollAnchor(getAnchorForScrollTop(newScrollTop, offsets));
                    }
                }
            },
            getScrollIndex: () => scrollAnchor.index,
            getScrollState: () => ({
                scrollTop: getScrollTop(),
                scrollHeight: totalHeight,
                innerHeight: containerHeight,
            }),
        }),
        [
            offsets,
            scrollAnchor,
            totalHeight,
            getAnchorForScrollTop,
            data,
            scrollableContainerHeight,
            getScrollTop,
            setPendingScrollTop,
            containerHeight,
        ],
    );

    // [NEW] Handler untuk detect manual scroll (drag)
    // Ini akan meng-override behavior default Ink agar kita bisa detect user interaction
    const handleTouchStart = () => {
        isUserDragging.current = true;
    };

    const handleTouchEnd = () => {
        // Beri timeout agar scroll event selesai diproses
        setTimeout(() => {
            isUserDragging.current = false;
            
            // Cek apakah user berhenti di bawah atau di tengah
            const currentScroll = getScrollTop();
            const bottomThreshold = totalHeight - scrollableContainerHeight - 5; // Toleransi 5px
            
            if (currentScroll >= bottomThreshold) {
                setIsStickingToBottom(true);
            } else {
                setIsStickingToBottom(false);
            }
        }, 50);
    };

    return (
        <Box
            ref={containerRef}
            overflowY="hidden"
            overflowX="hidden"
            width="100%"
            height="100%"
            flexDirection="column"
            paddingRight={1}
            // Pasang event handler manual (hanya bekerja jika terminal support mouse/scroll wheel)
            // Tapi karena Ink tidak punya native scroll event, kita mengandalkan logic di useBatchedScroll
        >
            <Box flexShrink={0} width="100%" flexDirection="column" marginTop={-scrollTop}>
                <Box height={topSpacerHeight} flexShrink={0} />
                {renderedItems}
                <Box height={bottomSpacerHeight} flexShrink={0} />
            </Box>
        </Box>
    );
}

const VirtualizedListWithForwardRef = React.memo(forwardRef(VirtualizedList)) as <T>(
    props: VirtualizedListProps<T> & { ref?: React.Ref<VirtualizedListRef<T>> },
) => React.ReactElement;

export { VirtualizedListWithForwardRef as VirtualizedList };

// Display name must be set on the memoized component or the inner component
(VirtualizedListWithForwardRef as any).displayName = 'VirtualizedList';