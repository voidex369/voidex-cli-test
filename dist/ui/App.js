import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink'; // [FIX] Tambah useInput & useApp
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';
import { getApiKey, saveApiKey } from '../lib/config.js';
import { validateApiKey } from '../lib/openrouter.js';
import TextInput from 'ink-text-input';
import Chat from './components/Chat.js';
import { KeypressProvider } from './contexts/KeypressContext.js';
import { MouseProvider } from './contexts/MouseContext.js';
import { ScrollProvider } from './contexts/ScrollProvider.js';
import { useAlternateBuffer } from './hooks/useAlternateBuffer.js';
import { ThemeProvider } from './contexts/ThemeContext.js';
import { useWindowSize } from './hooks/useWindowSize.js';
export default function App() {
    const { exit } = useApp(); // [BARU] Hook buat exit aplikasi
    const [view, setView] = useState('welcome');
    const [apiKey, setApiKey] = useState('');
    const [bootStatus, setBootStatus] = useState('Initializing Sovereign Environment...');
    const [bootColor, setBootColor] = useState('gray');
    const { height } = useWindowSize();
    const isFullScreen = false;
    useAlternateBuffer(view === 'chat' && isFullScreen);
    // [BARU] GLOBAL EXIT HANDLER (Pintu Darurat)
    // Menangani Ctrl+C saat di halaman Welcome atau Auth
    useInput((input, key) => {
        if (view !== 'chat' && key.ctrl && input === 'c') {
            exit(); // Matikan aplikasi seketika
        }
    });
    useEffect(() => {
        const bootSequence = async () => {
            const key = getApiKey();
            if (!key) {
                setBootColor('yellow');
                setBootStatus('⚠ API Key not configured. Redirecting to Setup...');
                setTimeout(() => setView('auth'), 2000);
                return;
            }
            setBootColor('cyan');
            setBootStatus('↻ Verifying Neural Uplink (API Check)...');
            const isValid = await validateApiKey(key);
            if (isValid) {
                setBootColor('green');
                setBootStatus('✓ Access Granted. System Online.');
                setTimeout(() => setView('chat'), 800);
            }
            else {
                setBootColor('red');
                setBootStatus('✖ Connection Failed or Invalid Key! Redirecting...');
                setTimeout(() => setView('auth'), 2500);
            }
        };
        if (view === 'welcome') {
            bootSequence();
        }
    }, [view]);
    if (view === 'welcome') {
        return (_jsxs(Box, { flexDirection: "column", alignItems: "center", justifyContent: "center", height: height, children: [_jsx(Gradient, { name: "morning", children: _jsx(BigText, { text: "VoidEx CLI", font: "simple" }) }), _jsx(Text, { color: bootColor, bold: true, children: bootStatus }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "(Press Ctrl+C to exit)" }) })] }));
    }
    if (view === 'auth') {
        return (_jsxs(Box, { flexDirection: "column", justifyContent: "center", alignItems: "center", height: height, children: [_jsx(Text, { bold: true, color: "cyan", children: "WELCOME TO VOIDEX CLI" }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "yellow", children: "\u26A0 Authentication Required" }) }), _jsx(Text, { children: "Please enter your OpenRouter API Key to activate the Sovereign Agent:" }), _jsx(Box, { borderStyle: "round", borderColor: "cyan", paddingX: 1, marginTop: 1, children: _jsx(TextInput, { value: apiKey, onChange: setApiKey, onSubmit: (key) => {
                            saveApiKey(key);
                            setBootStatus('↻ Re-verifying Credentials...');
                            setBootColor('cyan');
                            setView('welcome');
                        }, mask: "*", placeholder: "sk-or-..." }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Your key will be saved securely in .env" }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "red", bold: true, children: "Press Ctrl+C to Cancel/Exit" }) })] }));
    }
    return (_jsx(KeypressProvider, { children: _jsx(MouseProvider, { mouseEventsEnabled: true, children: _jsx(ThemeProvider, { children: _jsx(ScrollProvider, { children: _jsx(Box, { flexDirection: "column", height: isFullScreen ? height : undefined, children: _jsx(Chat, { isFullScreen: isFullScreen }) }) }) }) }) }));
}
