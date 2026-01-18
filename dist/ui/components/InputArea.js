import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { getGenericConfig, getModelDisplayName } from '../../lib/config.js';
const InputArea = ({ input, setInput, onSubmit, suggestions, selectedIndex, hasMemory, isLoading, resetKey = 0, error = null, showExitNotice = false, cwd = '', sessionMode = null, sessionCount = 0 }) => {
    // State lokal untuk menyimpan nama model saat ini
    const [currentModel, setCurrentModel] = useState('Loading...');
    // Fungsi untuk update model
    const updateModel = () => {
        try {
            const config = getGenericConfig();
            setCurrentModel(getModelDisplayName(config.model));
        }
        catch (e) {
            setCurrentModel('Unknown');
        }
    };
    // Ambil model saat mount
    useEffect(() => {
        updateModel();
    }, []);
    // Cek update saat input berubah (saat user mengetik) atau saat loading selesai
    // Ini menangani kasus user ganti model lewat /model command
    useEffect(() => {
        updateModel();
    }, [input, isLoading]);
    return (_jsxs(Box, { flexDirection: "column", width: "100%", children: [suggestions.length > 0 && (_jsx(Box, { flexDirection: "column", borderStyle: "round", borderColor: "gray", paddingX: 1, marginBottom: 1, width: "100%", children: suggestions.map((s, i) => (_jsxs(Box, { flexDirection: "row", width: "100%", children: [_jsxs(Text, { color: i === selectedIndex ? 'cyan' : 'white', bold: i === selectedIndex, children: [i === selectedIndex ? '> ' : '  ', s.cmd] }), _jsxs(Text, { dimColor: true, children: [" - ", s.desc] })] }, s.cmd))) })), showExitNotice ? (_jsx(Box, { children: _jsx(Text, { color: "yellow", bold: true, children: "\u26A0 Press Ctrl+C again to exit" }) })) : hasMemory ? (_jsx(Box, { children: _jsx(Text, { color: "gray", children: "\uD83E\uDDE0 Sovereign Memory Active" }) })) : null, _jsxs(Box, { borderStyle: "single", borderColor: isLoading ? 'yellow' : 'green', paddingX: 1, width: "100%", children: [_jsx(Box, { marginRight: 1, children: _jsx(Text, { bold: true, color: isLoading ? 'yellow' : 'green', children: "\u276F" }) }), _jsx(Box, { flexGrow: 1, children: isLoading ? (_jsx(Text, { color: "gray", children: "Sovereign is thinking..." })) : (_jsx(TextInput, { value: input, onChange: setInput, onSubmit: onSubmit, placeholder: isLoading ? 'Sovereign is thinking...' :
                                (window.__sessionMode && window.__sessionList?.length > 0 ?
                                    `Pilih nomor (1-${sessionCount}) untuk ${sessionMode === 'resume' ? 'resume' : 'delete'} session...` :
                                    'Type or / for commands...') }, resetKey)) })] }), (cwd || currentModel) && (_jsxs(Box, { flexDirection: "row", justifyContent: "space-between", paddingX: 1, children: [_jsx(Text, { color: "gray", dimColor: true, children: cwd }), _jsxs(Text, { color: "cyan", dimColor: true, children: ["Model: ", currentModel] })] })), error && (_jsx(Box, { paddingX: 1, children: _jsxs(Text, { color: "red", bold: true, italic: true, children: ["\u2716 Error: ", error] }) }))] }));
};
export default React.memo(InputArea);
