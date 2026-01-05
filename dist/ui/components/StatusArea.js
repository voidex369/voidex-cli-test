import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
const StatusArea = ({ agentStatus, liveToolOutput, pendingApproval, approvalOptions, approvalIndex, userInputCode = '' }) => {
    const MAX_LIVE_LINES = 8;
    const cappedOutput = React.useMemo(() => {
        if (!liveToolOutput)
            return '';
        const lines = liveToolOutput.split('\n').map((l) => l.length > 100 ? l.slice(0, 97) + '...' : l);
        if (lines.length > MAX_LIVE_LINES)
            return '...\n' + lines.slice(-MAX_LIVE_LINES).join('\n');
        return lines.join('\n');
    }, [liveToolOutput]);
    if (!agentStatus && !pendingApproval)
        return null;
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, borderStyle: "single", borderColor: pendingApproval?.riskLevel === 'critical' ? 'red' : 'yellow', paddingX: 1, width: "100%", children: [agentStatus && (_jsxs(Box, { flexDirection: "column", width: "100%", children: [_jsxs(Box, { width: "100%", children: [_jsxs(Text, { color: "yellow", children: [_jsx(Spinner, { type: "dots" }), " "] }), _jsxs(Text, { bold: true, children: [" ", agentStatus] })] }), cappedOutput ? _jsx(Box, { marginTop: 1, flexDirection: "column", children: _jsx(Text, { color: "gray", children: cappedOutput }) }) : null] })), pendingApproval && (_jsxs(Box, { flexDirection: "column", marginTop: 1, width: "100%", children: [_jsx(Text, { bold: true, color: pendingApproval.riskLevel === 'critical' ? 'red' : 'yellow', children: pendingApproval.riskLevel === 'critical' ? '☢ NUCLEAR THREAT DETECTED' : '⚠ PERMISSION REQUIRED' }), _jsxs(Box, { marginLeft: 1, flexDirection: "column", children: [_jsxs(Text, { children: ["Action: ", _jsx(Text, { bold: true, color: "white", children: pendingApproval.name })] }), _jsx(Text, { dimColor: true, children: JSON.stringify(pendingApproval.arguments) })] }), pendingApproval.riskLevel === 'critical' ? (_jsxs(Box, { marginTop: 1, borderStyle: "double", borderColor: "red", paddingX: 1, flexDirection: "column", children: [_jsx(Text, { bold: true, color: "red", children: "DESTRUCTIVE COMMAND!" }), _jsxs(Text, { children: ["To confirm, type code: ", _jsx(Text, { bold: true, inverse: true, children: pendingApproval.challengeCode })] }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { children: "Input: " }), _jsx(Text, { bold: true, color: "cyan", children: userInputCode }), _jsx(Text, { dimColor: true, children: "_" })] })] })) : (
                    // Opsi Biasa (Untuk Caution)
                    _jsx(Box, { flexDirection: "column", marginTop: 1, marginLeft: 1, children: approvalOptions.map((opt, i) => (_jsxs(Text, { color: i === approvalIndex ? 'cyan' : 'white', bold: i === approvalIndex, children: [i === approvalIndex ? '●' : ' ', " ", opt.label] }, opt.value))) }))] }))] }));
};
export default React.memo(StatusArea);
