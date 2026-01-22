import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '../contexts/ThemeContext.js';

export const HelpMenu = React.memo(() => {
    const { theme } = useTheme();
    return (
        <Box flexDirection="column" borderStyle="double" borderColor={theme.text.accent} padding={1} marginBottom={1}>
            <Text bold color={theme.text.accent}>🛡️ VOIDEX CLI - COMMAND CENTER</Text>
            
            <Box marginTop={1} flexDirection="column">
                <Text bold color={theme.text.accent}>📊 STATS & MONITORING</Text>
                <Text>  /stats               - System stats (CPU, RAM, Model)</Text>
                <Text>  /stats session       - Session metrics & token usage</Text>
                <Text>  /stats model         - Model info & status</Text>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text bold color={theme.text.accent}>🔐 AUTHENTICATION</Text>
                <Text>  /auth                - Set/Update API Key securely</Text>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text bold color={theme.text.accent}>🤖 MODEL MANAGEMENT</Text>
                <Text>  /model               - Select/change AI model</Text>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text bold color={theme.text.accent}>🎨 UI CUSTOMIZATION</Text>
                <Text>  /theme               - Switch visual themes</Text>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text bold color={theme.text.accent}>💾 SESSION MANAGEMENT</Text>
                <Text>  /chat save {'<id>'}    - Save current session</Text>
                <Text>  /chat resume {'<id>'}  - Resume saved session</Text>
                <Text>  /chat list           - List all saved sessions</Text>
                <Text>  /chat delete {'<id>'}  - Delete session (interactive)</Text>
                <Text>  /chat share {'<file>'}  - Export chat to file</Text>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text bold color={theme.text.accent}>🛠️ TOOLS & EXPLOITATION</Text>
                <Text>  /tools               - List available tools</Text>
                <Text>  /tools desc          - Show detailed tool descriptions</Text>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text bold color={theme.text.accent}>💬 CHAT CONTROL</Text>
                <Text>  /clear               - Clear conversation & screen</Text>
                <Text>  /forget {'[n]'}        - Remove last N exchanges</Text>
                <Text>  /help                - Show this help menu</Text>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text bold color={theme.text.accent}>ℹ️ INFORMATION</Text>
                <Text>  /about               - Version & contact info</Text>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text bold color={theme.text.accent}>⚠️ DEBUG ZONE</Text>
                <Text>  /debug               - Show error history</Text>
                <Text>  /debug export        - Export debug logs</Text>
                <Text>  /debug clear         - Clear debug logs</Text>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text bold color="yellow">⌨️ KEYBOARD SHORTCUTS</Text>
                <Text>  Ctrl+C               - Quit (or Cancel Thinking)</Text>
                <Text>  Tab                  - Autocomplete suggestion</Text>
                <Text>  Up/Down              - Cycle history or suggestions</Text>
                <Text>  Enter                - Send message</Text>
            </Box>

            <Box marginTop={1} flexDirection="column" borderStyle="round" borderColor="white">
                <Text bold color="white">By VoidEx</Text>
                <Text> Telegram: https://t.me/voidex369</Text>
                <Text> GitHub:   https://github.com/voidex369</Text>
            </Box>
        </Box>
    );
});