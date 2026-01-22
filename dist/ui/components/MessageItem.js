import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import { useTheme } from '../contexts/ThemeContext.js';
import { HelpMenu } from './HelpMenu.js';
/* ---------------- SUB COMPONENTS ---------------- */
export const ToolsList = React.memo(({ content }) => {
    const { theme } = useTheme();
    const tools = content.replace('Available Tools:\n', '').split('\n');
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: theme.status.success, padding: 1, marginBottom: 1, children: [_jsx(Text, { bold: true, color: theme.status.success, children: "Available Sovereign Tools:" }), tools.map((t, i) => (_jsxs(Text, { color: theme.text.primary, children: ["  ", t] }, i)))] }));
});
export const WelcomeBox = React.memo(() => {
    const { theme } = useTheme();
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Gradient, { name: "pastel", children: _jsx(Text, { bold: true, children: "VoidEx CLI | By VoidEx \uD83C\uDFF4\u2620\uFE0F" }) }), _jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: theme.text.accent, padding: 1, marginTop: 1, children: [_jsx(Text, { color: theme.text.primary, children: "By VoidEx | Telegram: https://t.me/voidex369" }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { color: theme.text.primary, children: ["Type ", _jsx(Text, { color: theme.status.warning, children: "/help" }), " to see available commands."] }) })] })] }));
});
export const TruncatedResultBox = React.memo(({ content, isSuccess }) => {
    const { theme } = useTheme();
    if (!content)
        return _jsx(Text, { dimColor: true, children: "(no output)" });
    const RENDER_LIMIT = 10000;
    if (content.length > RENDER_LIMIT) {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { dimColor: true, children: [content.slice(0, 1000), " ..."] }), _jsxs(Box, { marginY: 1, paddingX: 1, borderStyle: "single", borderColor: theme.status.error, children: [_jsxs(Text, { bold: true, color: theme.status.error, children: ["\u26A0 LARGE OUTPUT (", Math.round(content.length / 1024), " KB)"] }), _jsx(Text, { color: theme.status.warning, children: "Memory protected. Full output truncated in terminal." })] })] }));
    }
    const lines = content.split('\n');
    const MAX_LINES = 15;
    if (lines.length <= MAX_LINES)
        return _jsx(Text, { dimColor: true, children: content });
    const first7 = lines.slice(0, 7);
    const last7 = lines.slice(-7);
    const hidden = lines.length - 14;
    return (_jsxs(Box, { flexDirection: "column", children: [first7.map((l, i) => _jsx(Text, { dimColor: true, children: l }, `f-${i}`)), _jsx(Box, { marginY: 1, paddingX: 1, borderStyle: "single", borderColor: theme.ui.comment, children: _jsxs(Text, { italic: true, color: theme.status.warning, children: ["... [ ", hidden, " lines hidden for stability ] ..."] }) }), last7.map((l, i) => _jsx(Text, { dimColor: true, children: l }, `l-${i}`))] }));
});
/* ---------------- MESSAGE ITEM ---------------- */
const MessageItem = React.memo(({ msg }) => {
    const { theme } = useTheme();
    const boxProps = { flexDirection: "column", marginBottom: 1, flexShrink: 0, width: "100%" };
    /* ---------- SYSTEM ---------- */
    if (msg.role === 'system') {
        if (msg.name === 'welcome_msg')
            return _jsx(WelcomeBox, {});
        if (msg.name === 'help_menu')
            return _jsx(HelpMenu, {});
        if (msg.name === 'tools_list')
            return _jsx(ToolsList, { content: msg.content || '' });
        return _jsx(Box, { paddingX: 1, marginBottom: 1, flexShrink: 0, children: _jsxs(Text, { color: theme.ui.comment, italic: true, children: ["\u2726 ", msg.content] }) });
    }
    /* ---------- TOOL ---------- */
    if (msg.role === 'tool') {
        let displayContent = '';
        let isSuccess = true;
        // [FIX] Menggunakan format JSON yang dikirim dari LocalExecutor.ts
        try {
            if (msg.content && msg.content.trim().startsWith('{')) {
                const parsed = JSON.parse(msg.content);
                if (parsed.output !== undefined) {
                    // Format baru dari LocalExecutor
                    displayContent = parsed.output;
                    isSuccess = !parsed.isError;
                }
                else {
                    // Fallback format lama atau JSON lain
                    displayContent = msg.content;
                    isSuccess = !parsed.isError && !parsed.success === false;
                }
            }
            else {
                // Fallback jika bukan JSON (format lama)
                displayContent = msg.content || '';
                const textLower = displayContent.toLowerCase();
                isSuccess = !textLower.includes('command not found') &&
                    !textLower.includes('failed to') &&
                    !textLower.includes('enoent') &&
                    !textLower.includes('permission denied');
            }
        }
        catch (e) {
            // Bukan JSON sama sekali
            displayContent = msg.content || '';
            const textLower = displayContent.toLowerCase();
            isSuccess = !textLower.includes('command not found') &&
                !textLower.includes('failed to') &&
                !textLower.includes('enoent') &&
                !textLower.includes('permission denied');
        }
        const color = isSuccess ? theme.status.success : theme.status.error;
        return (_jsxs(Box, { ...boxProps, marginLeft: 1, borderStyle: "round", borderColor: color, paddingX: 1, width: "100%", children: [_jsxs(Text, { bold: true, color: color, children: [isSuccess ? '✓' : '✖', " Tool Result:"] }), _jsx(TruncatedResultBox, { content: displayContent || '', isSuccess: isSuccess })] }));
    }
    /* ---------- ASSISTANT ---------- */
    if (msg.role === 'assistant') {
        const hasTools = msg.tool_calls && msg.tool_calls.length > 0;
        const hasContent = msg.content && msg.content.trim().length > 0;
        // Skip rendering if no content and no tools (Ghost Message)
        if (!hasContent && !hasTools)
            return null;
        return (_jsxs(Box, { ...boxProps, width: "100%", children: [_jsx(Text, { bold: true, color: theme.text.accent, children: "Agent:" }), hasContent && (_jsx(Box, { paddingLeft: 1, marginBottom: hasTools ? 1 : 0, width: "100%", children: _jsx(Text, { color: theme.text.response || theme.text.primary, children: msg.content }) })), hasTools && msg.tool_calls.map((tc, idx) => {
                    let formattedArgs = tc.function.arguments || '';
                    if (formattedArgs.length > 200) {
                        formattedArgs = formattedArgs.slice(0, 200) + '...';
                    }
                    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: theme.text.accent, paddingX: 1, marginTop: idx === 0 ? 0 : 1, width: "100%", children: [_jsxs(Text, { bold: true, color: theme.text.accent, children: ["\u2699 Tool Call: ", tc.function.name] }), _jsx(Box, { paddingLeft: 1, width: "100%", children: _jsx(Text, { dimColor: true, italic: true, children: formattedArgs }) })] }, idx));
                })] }));
    }
    /* ---------- USER ---------- */
    return (_jsxs(Box, { ...boxProps, borderStyle: "round", borderColor: theme.border.focused, paddingX: 1, width: "100%", children: [_jsx(Text, { bold: true, color: theme.text.link, children: "\uD83D\uDC64 You:" }), _jsx(Text, { color: theme.text.primary, children: msg.content })] }));
});
export default MessageItem;
