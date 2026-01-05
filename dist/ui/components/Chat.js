import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { useChat } from '../hooks/useChat.js';
import { getAvailableModels, saveModel, saveApiKey, getApiKey, getModelDisplayName } from '../../lib/config.js';
import { useTheme } from '../contexts/ThemeContext.js';
import HistoryViewport from './HistoryViewport.js';
import StatusArea from './StatusArea.js';
import InputArea from './InputArea.js';
// --- INLINE DIALOG COMPONENTS ---
const ModelPicker = React.memo(({ onSelect, onCancel, models }) => {
    const [filter, setFilter] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const filtered = useMemo(() => models.filter((m) => m.toLowerCase().includes(filter.toLowerCase())), [filter, models]);
    // Pagination Logic
    const visibleCount = 10;
    const totalCount = filtered.length;
    const startIndex = Math.floor(selectedIndex / visibleCount) * visibleCount;
    const visible = useMemo(() => filtered.slice(startIndex, startIndex + visibleCount), [filtered, startIndex]);
    useInput((input, key) => {
        if (totalCount === 0) {
            if (key.escape || (key.ctrl && input === 'c'))
                onCancel();
            return;
        }
        if (key.upArrow)
            setSelectedIndex(p => (p > 0 ? p - 1 : totalCount - 1));
        else if (key.downArrow)
            setSelectedIndex(p => (p < totalCount - 1 ? p + 1 : 0));
        else if (key.return) {
            if (filtered[selectedIndex])
                onSelect(filtered[selectedIndex]);
        }
        else if (key.escape || (key.ctrl && input === 'c'))
            onCancel();
    });
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "double", borderColor: "magenta", padding: 1, width: 80, children: [_jsx(Text, { bold: true, color: "magenta", children: "Select Model (Esc to cancel):" }), _jsx(Box, { borderStyle: "single", borderColor: "gray", paddingX: 1, marginBottom: 1, children: _jsx(TextInput, { value: filter, onChange: setFilter, placeholder: "Search..." }) }), _jsx(Box, { flexDirection: "column", children: visible.map((m, i) => {
                    const isSel = (startIndex + i) === selectedIndex;
                    return _jsxs(Text, { color: isSel ? 'cyan' : 'white', bold: isSel, children: [isSel ? '➤ ' : '  ', getModelDisplayName(m)] }, m);
                }) })] }));
});
const ThemePicker = React.memo(({ onSelect, onCancel }) => {
    const { availableThemes, theme, setTheme } = useTheme();
    const [selectedIndex, setSelectedIndex] = useState(0);
    // Daftar tema preview (dibuat dengan useMemo agar referensinya stabil)
    const themeList = useMemo(() => availableThemes.map((t) => ({
        id: t,
        displayName: t === 'dark' ? 'Default Dark' :
            t === 'light' ? 'Default Light' :
                t === 'dracula' ? 'Dracula Dark' :
                    t === 'nord' ? 'Nord' : t
    })), [availableThemes]);
    // Mock theme object untuk preview (tipe 'any' agar fleksibel)
    const [previewTheme, setPreviewTheme] = useState(() => {
        // Default ke Dark saat mount
        return {
            text: { primary: '', secondary: '#6C7086', accent: '#CBA6F7' },
            ui: { dark: '#45485A' },
            background: { primary: '#1E1E2E' },
            border: { default: '#6C7086', focused: '#89B4FA' },
            status: { error: '#F38BA8', success: '#A6E3A1', warning: '#F9E2AF' }
        };
    });
    // Update preview saat selection berubah
    useEffect(() => {
        if (themeList.length === 0)
            return;
        const id = themeList[selectedIndex]?.id;
        switch (id) {
            case 'light':
                setPreviewTheme({
                    text: { primary: '#4c4f69', secondary: '#9ca0b0', accent: '#8839ef' },
                    ui: { dark: '#bcc0cc' },
                    background: { primary: '#eff1f5' },
                    border: { default: '#9ca0b0', focused: '#1e66f5' },
                    status: { error: '#d20f39', success: '#40a02b', warning: '#df8e1d' }
                });
                break;
            case 'dracula':
                setPreviewTheme({
                    text: { primary: '#f8f8f2', secondary: '#6272a4', accent: '#bd93f9' },
                    ui: { dark: '#44475a' },
                    background: { primary: '#282a36' },
                    border: { default: '#44475a', focused: '#bd93f9' },
                    status: { error: '#ff5555', success: '#50fa7b', warning: '#f1fa8c' }
                });
                break;
            case 'nord':
                setPreviewTheme({
                    text: { primary: '#D8DEE9', secondary: '#4C566A', accent: '#81A1C1' },
                    ui: { dark: '#3B4252' },
                    background: { primary: '#2E3440' },
                    border: { default: '#434C5E', focused: '#88C0D0' },
                    status: { error: '#BF616A', success: '#A3BE8C', warning: '#EBCB8B' }
                });
                break;
            case 'dark':
            default:
                setPreviewTheme({
                    text: { primary: '', secondary: '#6C7086', accent: '#CBA6F7' },
                    ui: { dark: '#45485A' },
                    background: { primary: '#1E1E2E' },
                    border: { default: '#6C7086', focused: '#89B4FA' },
                    status: { error: '#F38BA8', success: '#A6E3A1', warning: '#F9E2AF' }
                });
                break;
        }
    }, [selectedIndex]);
    useInput((input, key) => {
        if (key.upArrow)
            setSelectedIndex(p => (p > 0 ? p - 1 : themeList.length - 1));
        else if (key.downArrow)
            setSelectedIndex(p => (p < themeList.length - 1 ? p + 1 : 0));
        else if (key.return) {
            onSelect(themeList[selectedIndex].id);
        }
        else if (key.escape || (key.ctrl && input === 'c'))
            onCancel();
    });
    return (_jsxs(Box, { borderStyle: "double", borderColor: theme.text.accent, width: 100, flexDirection: "row", children: [_jsxs(Box, { width: "45%", flexDirection: "column", padding: 1, borderRight: true, borderColor: theme.text.accent, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: theme.text.accent, children: "Select Theme" }) }), _jsx(Box, { flexDirection: "column", children: themeList.map((t, i) => (_jsxs(Text, { color: i === selectedIndex ? theme.status.success : theme.text.primary, bold: i === selectedIndex, children: [i === selectedIndex ? '▲' : ' ', " ", t.displayName] }, t.id))) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: "Use Arrow keys, Enter to select, Esc to close" }) })] }), _jsxs(Box, { width: "55%", flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, dimColor: true, children: "Preview" }) }), _jsxs(Box, { borderStyle: "round", borderColor: previewTheme.border.default, padding: 1, flexDirection: "column", children: [_jsxs(Box, { marginBottom: 1, children: [_jsx(Text, { color: previewTheme.status.error, children: "\u25CF " }), _jsx(Text, { color: previewTheme.status.warning, children: "\u25CF " }), _jsx(Text, { color: previewTheme.status.success, children: "\u25CF" })] }), _jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: previewTheme.ui.dark, children: ["1 ", _jsx(Text, { color: previewTheme.text.secondary, children: "# function" })] }), _jsxs(Text, { color: previewTheme.text.primary, children: ["2 ", _jsx(Text, { bold: true, color: previewTheme.text.accent, children: "def" }), " ", _jsx(Text, { color: previewTheme.status.success, children: "fibonacci" }), "(", _jsx(Text, { color: previewTheme.text.accent, children: "n" }), "):"] }), _jsxs(Text, { color: previewTheme.text.primary, children: ["3     ", _jsx(Text, { bold: true, color: previewTheme.text.accent, children: "return" }), " ", _jsx(Text, { color: previewTheme.text.primary, children: "n" })] }), _jsx(Text, { color: previewTheme.text.primary, children: "4     ..." })] }), _jsx(Box, { marginTop: 1, paddingTop: 1, borderTop: true, borderColor: previewTheme.border.default, children: _jsx(Text, { color: previewTheme.status.error, children: "- print(\"Old\")" }) }), _jsx(Box, { children: _jsx(Text, { color: previewTheme.status.success, children: "+ print(f\"Hello\")" }) })] })] })] }));
});
const AuthDialog = React.memo(({ onSave, onCancel, currentKey }) => {
    const [key, setKey] = useState('');
    useInput((input, keyData) => {
        if (keyData.escape)
            onCancel();
        if (keyData.ctrl && input.toLowerCase() === 'c')
            onCancel();
    });
    // Logic buat sensor API Key biar aman
    const maskedKey = currentKey && currentKey.length > 10
        ? currentKey.substring(0, 8) + '...' + currentKey.substring(currentKey.length - 4)
        : (currentKey ? '********' : 'None');
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "double", borderColor: "yellow", padding: 1, width: 80, children: [_jsx(Text, { bold: true, color: "yellow", children: "Update API Key (Esc to cancel):" }), _jsx(Box, { marginTop: 1, paddingX: 1, borderStyle: "single", borderColor: "gray", children: _jsxs(Text, { dimColor: true, children: ["Current: ", _jsx(Text, { color: "white", bold: true, children: maskedKey })] }) }), _jsx(Box, { borderStyle: "single", borderColor: "white", paddingX: 1, marginTop: 1, children: _jsx(TextInput, { value: key, onChange: setKey, onSubmit: onSave, placeholder: "Paste new API Key here...", focus: true, mask: "*" }) }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { dimColor: true, italic: true, children: ["Get your keys at: ", _jsx(Text, { color: "cyan", bold: true, underline: true, children: "https://openrouter.ai/keys" })] }) }), _jsx(Box, { marginTop: 0, children: _jsx(Text, { dimColor: true, italic: true, children: "New key will replace the old one. Leave empty to keep current." }) })] }));
});
// --- MAIN CHAT LOGIC ---
const ChatView = React.memo(({ onDialog, chatState, isFullScreen }) => {
    const { messages, isLoading, error, sendMessage, agentStatus, stopLoading, hasMemory, pendingApproval, resolveApproval, liveToolOutput, history, setHistory, forgetMessages } = chatState;
    const { exit } = useApp();
    // State UI
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selIdx, setSelIdx] = useState(0);
    const [apprIdx, setApprIdx] = useState(0);
    const [histIdx, setHistIdx] = useState(-1);
    // [FIX] State untuk memaksa kursor pindah ke ujung
    const [inputResetKey, setInputResetKey] = useState(0);
    // [SECURITY] State untuk input kode konfirmasi Nuclear
    const [nuclearCodeInput, setNuclearCodeInput] = useState('');
    const [showExitNotice, setShowExitNotice] = useState(false);
    const lastCtrlCTime = useRef(0);
    const apprOpts = useMemo(() => [{ label: 'Allow once', value: 'allow' }, { label: 'Always', value: 'always' }, { label: 'Deny', value: 'deny' }], []);
    // 1. SMART SUGGESTION LOGIC
    useEffect(() => {
        const allCmds = [
            { cmd: '/help', desc: 'Show help menu' },
            { cmd: '/tools', desc: 'List available tools...' },
            { cmd: '/tools desc', desc: 'List tools with descriptions', parent: '/tools' },
            { cmd: '/model', desc: 'Select AI model' },
            { cmd: '/theme', desc: 'Switch visual theme' },
            { cmd: '/clear', desc: 'Clear conversation' },
            { cmd: '/about', desc: 'Version info' },
            { cmd: '/stats', desc: 'System statistics...' },
            { cmd: '/stats session', desc: 'Session metrics', parent: '/stats' },
            { cmd: '/stats model', desc: 'Model metrics', parent: '/stats' },
            { cmd: '/auth', desc: 'Enter API Key' },
            { cmd: '/chat', desc: 'Session management...' },
            { cmd: '/chat save', desc: 'Save current session', parent: '/chat' },
            { cmd: '/chat resume', desc: 'Resume a session', parent: '/chat' },
            { cmd: '/chat list', desc: 'List saved sessions', parent: '/chat' },
            { cmd: '/chat delete', desc: 'Delete a session', parent: '/chat' },
            { cmd: '/chat share', desc: 'Share chat to file', parent: '/chat' },
            { cmd: '/forget', desc: 'Forget last N interactions' },
            { cmd: '/exit', desc: 'Quit application' }
        ];
        if (input.startsWith('/')) {
            const parents = allCmds.filter(c => !c.parent);
            const activeParent = parents.find(p => input === p.cmd || input.startsWith(p.cmd + ' '));
            const filtered = allCmds.filter(c => {
                if (activeParent) {
                    return c.parent === activeParent.cmd && c.cmd.startsWith(input) && c.cmd !== input;
                }
                return !c.parent && c.cmd.startsWith(input) && c.cmd !== input;
            });
            setSuggestions(filtered);
        }
        else {
            setSuggestions([]);
        }
        setSelIdx(0);
    }, [input]);
    // 2. Global Input Handler (Controller)
    useInput((inputChars, key) => {
        // A. Approval Mode
        if (pendingApproval) {
            // [LOGIC NUCLEAR TIER]
            if (pendingApproval.riskLevel === 'critical' && pendingApproval.challengeCode) {
                // Cancel
                if (key.escape || (key.ctrl && inputChars === 'c')) {
                    resolveApproval('deny');
                    setNuclearCodeInput('');
                    return;
                }
                // Backspace
                if (key.delete || key.backspace) {
                    setNuclearCodeInput(prev => prev.slice(0, -1));
                    return;
                }
                // Input Alphanumeric Check
                if (inputChars && inputChars.length === 1 && /^[a-zA-Z0-9]$/.test(inputChars)) {
                    const nextCode = nuclearCodeInput + inputChars;
                    setNuclearCodeInput(nextCode);
                    // Auto-confirm jika kode cocok
                    if (nextCode === pendingApproval.challengeCode) {
                        setTimeout(() => {
                            resolveApproval('allow');
                            setNuclearCodeInput('');
                        }, 200);
                    }
                }
                return; // Stop processing arrow keys in Nuclear Mode
            }
            // [LOGIC CAUTION TIER] (Normal Approval)
            if (key.upArrow)
                setApprIdx(p => (p > 0 ? p - 1 : apprOpts.length - 1));
            else if (key.downArrow)
                setApprIdx(p => (p < apprOpts.length - 1 ? p + 1 : 0));
            else if (key.return)
                resolveApproval(apprOpts[apprIdx].value);
            return;
        }
        // B. Ctrl+C Handler
        if (key.ctrl && inputChars === 'c') {
            if (isLoading) {
                stopLoading();
            }
            else {
                const now = Date.now();
                if (now - lastCtrlCTime.current < 2000)
                    exit();
                else {
                    lastCtrlCTime.current = now;
                    setShowExitNotice(true);
                    setTimeout(() => setShowExitNotice(false), 2000);
                }
            }
            return;
        }
        // C. Suggestion Navigation
        if (suggestions.length > 0) {
            if (key.tab && suggestions[selIdx]) {
                const selectedCmd = suggestions[selIdx].cmd;
                const isParent = ['/chat', '/stats', '/tools'].includes(selectedCmd);
                setInput(selectedCmd + (isParent ? ' ' : ' '));
                setInputResetKey(prev => prev + 1); // Reset cursor to end
                setSuggestions([]);
            }
            else if (key.upArrow)
                setSelIdx(p => (p > 0 ? p - 1 : suggestions.length - 1));
            else if (key.downArrow)
                setSelIdx(p => (p < suggestions.length - 1 ? p + 1 : 0));
            return;
        }
        // D. History Navigation
        if (key.upArrow && !key.shift) {
            setHistIdx(prev => {
                const newIdx = Math.min(prev + 1, history.length - 1);
                if (newIdx !== prev && newIdx >= 0) {
                    setInput(history[history.length - 1 - newIdx]);
                    setInputResetKey(prev => prev + 1); // Reset cursor to end
                }
                return newIdx;
            });
        }
        else if (key.downArrow && !key.shift) {
            setHistIdx(prev => {
                const newIdx = Math.max(prev - 1, -1);
                if (newIdx === -1) {
                    setInput('');
                }
                else if (newIdx !== prev) {
                    setInput(history[history.length - 1 - newIdx]);
                    setInputResetKey(prev => prev + 1); // Reset cursor to end
                }
                return newIdx;
            });
        }
    });
    // 3. Send Handler
    const handleSend = useCallback((v) => {
        const trimmed = v.trim();
        if (!trimmed)
            return;
        // Handle Commands Lokal (UI Side)
        if (trimmed === '/model' || trimmed === '/auth' || trimmed === '/theme') {
            onDialog(trimmed.slice(1));
            setInput('');
            return;
        }
        if (trimmed.startsWith('/forget')) {
            forgetMessages(parseInt(trimmed.split(' ')[1]) || 1);
            setInput('');
            return;
        }
        if (trimmed === '/exit') {
            exit();
            return;
        }
        // [PERBAIKAN] Handle /clear di sini agar langsung efektif
        if (trimmed === '/clear') {
            // Reset input dulu agar bersih
            setInput('');
            // Kirim command ke hook untuk di-proses (menghapus state messages)
            sendMessage(trimmed);
            return;
        }
        // Default: Kirim ke AI atau handler umum
        sendMessage(trimmed);
        setHistory((prev) => {
            const last = prev[prev.length - 1];
            return last === trimmed ? prev : [...prev, trimmed];
        });
        setHistIdx(-1);
        setInput('');
    }, [sendMessage, onDialog, exit, forgetMessages, setHistory]);
    // Get Current Working Directory
    const cwd = process.cwd();
    return (_jsxs(Box, { flexDirection: "column", width: "100%", height: isFullScreen ? '100%' : undefined, children: [_jsx(Box, { flexGrow: isFullScreen ? 1 : 0, minHeight: 0, width: "100%", children: _jsx(HistoryViewport, { messages: messages, isLoading: isLoading }) }), _jsxs(Box, { flexDirection: "column", marginTop: 0, flexGrow: 0, flexShrink: 0, width: "100%", children: [_jsx(StatusArea, { agentStatus: agentStatus, liveToolOutput: liveToolOutput, pendingApproval: pendingApproval, approvalOptions: apprOpts, approvalIndex: apprIdx, userInputCode: nuclearCodeInput }), _jsx(InputArea, { input: input, setInput: setInput, onSubmit: handleSend, suggestions: suggestions, selectedIndex: selIdx, hasMemory: hasMemory, isLoading: isLoading, resetKey: inputResetKey, showExitNotice: showExitNotice, cwd: cwd })] })] }));
});
export default function Chat({ isFullScreen }) {
    const chatState = useChat();
    const [dialog, setDialog] = useState(null);
    const models = useMemo(() => getAvailableModels(), []);
    const { setTheme } = useTheme();
    const handleModelSelect = (m) => { saveModel(m); setDialog(null); chatState.sendMessage(`SYSTEM_MODEL_CHANGED:${m}`); };
    const handleAuthSave = (k) => { if (k.trim()) {
        saveApiKey(k.trim());
        chatState.sendMessage(`SYSTEM_AUTH_CHANGED:OK`);
    } setDialog(null); };
    if (dialog === 'model')
        return _jsx(Box, { padding: 2, children: _jsx(ModelPicker, { models: models, onSelect: handleModelSelect, onCancel: () => setDialog(null) }) });
    if (dialog === 'theme')
        return _jsx(Box, { padding: 2, children: _jsx(ThemePicker, { onSelect: (t) => { setTheme(t); setDialog(null); }, onCancel: () => setDialog(null) }) });
    if (dialog === 'auth')
        return _jsx(Box, { padding: 2, children: _jsx(AuthDialog, { currentKey: getApiKey() || '', onSave: handleAuthSave, onCancel: () => setDialog(null) }) });
    return _jsx(ChatView, { onDialog: setDialog, chatState: chatState, isFullScreen: isFullScreen });
}
