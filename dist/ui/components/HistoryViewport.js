import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useRef, useMemo, useCallback } from 'react';
import { Box, Static } from 'ink';
import { VirtualizedList } from './shared/VirtualizedList.js';
import MessageItem from './MessageItem.js';
import { useWindowSize } from '../hooks/useWindowSize.js';
const HistoryViewport = React.memo(({ messages, isFullScreen = false, isLoading = false }) => {
    const listRef = useRef(null);
    const containerRef = useRef(null);
    const { width } = useWindowSize();
    const safeWidth = Math.max(20, width - 5);
    // Initial estimation callback for VirtualizedList
    const estimatedItemHeight = useMemo(() => {
        return (index) => {
            const msg = messages[index];
            if (!msg)
                return 3;
            const contentLines = Math.max(1, (msg.content?.length || 0) / (safeWidth || 80));
            const toolLines = (msg.tool_calls?.length || 0) * 4;
            return contentLines + toolLines + 2;
        };
    }, [messages, safeWidth]);
    const keyExtractor = useCallback((item) => item.id, []);
    const renderItem = useCallback(({ item }) => (_jsx(Box, { paddingBottom: 1, width: safeWidth, children: _jsx(MessageItem, { msg: item }) })), [safeWidth]);
    // --- NORMAL MODE: Smart Static Splitting ---
    if (!isFullScreen) {
        let completedMessages = [];
        let activeMessages = [];
        if (isLoading && messages.length > 0) {
            completedMessages = messages.slice(0, -1);
            activeMessages = [messages[messages.length - 1]];
        }
        else {
            completedMessages = messages;
            activeMessages = [];
        }
        return (_jsxs(Box, { flexDirection: "column", width: safeWidth, children: [completedMessages.length > 0 && (_jsx(Static, { items: completedMessages, children: (msg, index) => (_jsx(Box, { paddingBottom: 1, width: safeWidth, children: _jsx(MessageItem, { msg: msg }) }, msg.id || index)) })), activeMessages.map((msg, index) => (_jsx(Box, { width: safeWidth, children: _jsx(MessageItem, { msg: msg }) }, msg.id || 'active')))] }));
    }
    // --- FULL SCREEN MODE: Virtualized List ---
    return (_jsx(Box, { ref: containerRef, flexDirection: "column", flexGrow: 1, height: "100%", width: safeWidth, children: _jsx(VirtualizedList, { ref: listRef, data: messages, renderItem: renderItem, estimatedItemHeight: estimatedItemHeight, keyExtractor: keyExtractor, initialScrollIndex: messages.length > 0 ? messages.length - 1 : 0, initialScrollOffsetInIndex: Number.MAX_SAFE_INTEGER }) }));
});
export default HistoryViewport;
