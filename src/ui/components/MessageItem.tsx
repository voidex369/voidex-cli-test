import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import { Message } from '../../types/index.js';
import { useTheme } from '../contexts/ThemeContext.js';
import { HelpMenu } from './HelpMenu.js';


/* ---------------- SUB COMPONENTS ---------------- */

export const ToolsList = React.memo(({ content }: { content: string }) => {
    const { theme } = useTheme();
    const tools = content.replace('Available Tools:\n', '').split('\n');
    return (
        <Box flexDirection="column" borderStyle="round" borderColor={theme.status.success} padding={1} marginBottom={1}>
            <Text bold color={theme.status.success}>Available Sovereign Tools:</Text>
            {tools.map((t, i) => (
                <Text key={i} color={theme.text.primary}>  {t}</Text>
            ))}
        </Box>
    );
});

export const WelcomeBox = React.memo(() => {
    const { theme } = useTheme();
    return (
        <Box flexDirection="column" marginBottom={1}>
            <Gradient name="pastel">
                <Text bold>VoidEx CLI | By VoidEx 🏴☠️</Text>
            </Gradient>
            <Box flexDirection="column" borderStyle="round" borderColor={theme.text.accent} padding={1} marginTop={1}>
                <Text color={theme.text.primary}>By VoidEx | Telegram: https://t.me/voidex369</Text>
                <Box marginTop={1}>
                    <Text color={theme.text.primary}>Type <Text color={theme.status.warning}>/help</Text> to see available commands.</Text>
                </Box>
            </Box>
        </Box>
    );
});

export const TruncatedResultBox = React.memo(({ content, isSuccess }: { content: string, isSuccess: boolean }) => {
    const { theme } = useTheme();
    if (!content) return <Text dimColor>(no output)</Text>;

    const RENDER_LIMIT = 10000;
    if (content.length > RENDER_LIMIT) {
        return (
            <Box flexDirection="column">
                <Text dimColor>{content.slice(0, 1000)} ...</Text>
                <Box marginY={1} paddingX={1} borderStyle="single" borderColor={theme.status.error}>
                    <Text bold color={theme.status.error}>⚠ LARGE OUTPUT ({Math.round(content.length / 1024)} KB)</Text>
                    <Text color={theme.status.warning}>Memory protected. Full output truncated in terminal.</Text>
                </Box>
            </Box>
        );
    }

    const lines = content.split('\n');
    const MAX_LINES = 15;
    if (lines.length <= MAX_LINES) return <Text dimColor>{content}</Text>;

    const first7 = lines.slice(0, 7);
    const last7 = lines.slice(-7);
    const hidden = lines.length - 14;

    return (
        <Box flexDirection="column">
            {first7.map((l, i) => <Text key={`f-${i}`} dimColor>{l}</Text>)}
            <Box marginY={1} paddingX={1} borderStyle="single" borderColor={theme.ui.comment}>
                <Text italic color={theme.status.warning}>... [ {hidden} lines hidden for stability ] ...</Text>
            </Box>
            {last7.map((l, i) => <Text key={`l-${i}`} dimColor>{l}</Text>)}
        </Box>
    );
});

/* ---------------- MESSAGE ITEM ---------------- */

const MessageItem = React.memo(({ msg }: { msg: Message }) => {
    const { theme } = useTheme();
    const boxProps = { flexDirection: "column" as const, marginBottom: 1, flexShrink: 0, width: "100%" as const };

    /* ---------- SYSTEM ---------- */
    if (msg.role === 'system') {
        if (msg.name === 'welcome_msg') return <WelcomeBox />;
        if (msg.name === 'help_menu') return <HelpMenu />;
        if (msg.name === 'tools_list') return <ToolsList content={msg.content || ''} />;
        
        return <Box paddingX={1} marginBottom={1} flexShrink={0}><Text color={theme.ui.comment} italic>✦ {msg.content}</Text></Box>;
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
                } else {
                    // Fallback format lama atau JSON lain
                    displayContent = msg.content;
                    isSuccess = !parsed.isError && !parsed.success === false;
                }
            } else {
                // Fallback jika bukan JSON (format lama)
                displayContent = msg.content || '';
                const textLower = displayContent.toLowerCase();
                isSuccess = !textLower.includes('command not found') && 
                           !textLower.includes('failed to') && 
                           !textLower.includes('enoent') &&
                           !textLower.includes('permission denied');
            }
        } catch (e) {
            // Bukan JSON sama sekali
            displayContent = msg.content || '';
            const textLower = displayContent.toLowerCase();
            isSuccess = !textLower.includes('command not found') && 
                       !textLower.includes('failed to') && 
                       !textLower.includes('enoent') &&
                       !textLower.includes('permission denied');
        }

        const color = isSuccess ? theme.status.success : theme.status.error;

        return (
            <Box {...boxProps} marginLeft={1} borderStyle="round" borderColor={color} paddingX={1} width="100%">
                <Text bold color={color}>{isSuccess ? '✓' : '✖'} Tool Result:</Text>
                <TruncatedResultBox content={displayContent || ''} isSuccess={isSuccess} />
            </Box>
        );
    }

    /* ---------- ASSISTANT ---------- */
    if (msg.role === 'assistant') {
        const hasTools = msg.tool_calls && msg.tool_calls.length > 0;
        const hasContent = msg.content && msg.content.trim().length > 0;

        // Skip rendering if no content and no tools (Ghost Message)
        if (!hasContent && !hasTools) return null;

        return (
            <Box {...boxProps} width="100%">
                <Text bold color={theme.text.accent}>Agent:</Text>
                {hasContent && (
                    <Box paddingLeft={1} marginBottom={hasTools ? 1 : 0} width="100%">
                        <Text color={theme.text.response || theme.text.primary} >{msg.content}</Text>
                    </Box>
                )}
                {hasTools && msg.tool_calls!.map((tc: any, idx: number) => {
                    let formattedArgs = tc.function.arguments || '';
                    if (formattedArgs.length > 200) {
                        formattedArgs = formattedArgs.slice(0, 200) + '...';
                    }

                    return (
                        <Box key={idx} flexDirection="column" borderStyle="round" borderColor={theme.text.accent} paddingX={1} marginTop={idx === 0 ? 0 : 1} width="100%">
                            <Text bold color={theme.text.accent}>⚙ Tool Call: {tc.function.name}</Text>
                            <Box paddingLeft={1} width="100%"><Text dimColor italic>{formattedArgs}</Text></Box>
                        </Box>
                    );
                })}
            </Box>
        );
    }

    /* ---------- USER ---------- */
    return (
        <Box {...boxProps} borderStyle="round" borderColor={theme.border.focused} paddingX={1} width="100%">
            <Text bold color={theme.text.link}>👤 You:</Text>
            <Text color={theme.text.primary}>{msg.content}</Text>
        </Box>
    );
});

export default MessageItem;
