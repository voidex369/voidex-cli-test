import { useState, useCallback, useRef, useEffect } from 'react';
import { getGenericConfig, getApiKey, getAvailableModels, saveModel, saveApiKey, saveChat, loadChat, listChats, deleteChat, exportChat } from '../../lib/config.js';
import { toolsDefinition, killActiveProcess } from '../../lib/tools.js';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { LocalExecutor } from '../../lib/agent/LocalExecutor.js';
// [UPDATE] Import appendMemory di sini
import { truncateForRAM, appendMemory } from '../../utils/memory.js';
// --- SHADOW PERSISTENCE LAYER ---
let shadowMessages = [{ id: 'welcome', role: 'system', name: 'welcome_msg', content: '' }];
let shadowAllowedTools = [];
let shadowHistory = [];
export function useChat() {
    const config = getGenericConfig();
    const currentApiKey = getApiKey();
    const [messages, setMessages] = useState(shadowMessages);
    const messagesRef = useRef(shadowMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [agentStatus, setAgentStatus] = useState(null);
    const [activeDialog, setActiveDialog] = useState(null);
    const [pendingApproval, setPendingApproval] = useState(null);
    const [allowedToolsForSession, setAllowedToolsForSession] = useState(shadowAllowedTools);
    const allowedToolsRef = useRef(shadowAllowedTools);
    const [liveToolOutput, setLiveToolOutput] = useState('');
    const [history, setHistory] = useState(shadowHistory);
    const currentRequestIdRef = useRef(0);
    useEffect(() => {
        shadowMessages = messages;
        messagesRef.current = messages;
    }, [messages]);
    useEffect(() => {
        shadowHistory = history;
    }, [history]);
    useEffect(() => {
        shadowAllowedTools = allowedToolsForSession;
        allowedToolsRef.current = allowedToolsForSession;
    }, [allowedToolsForSession]);
    // --- UPDATE CHECKER ---
    useEffect(() => {
        if (Math.random() > 0.8) {
            setTimeout(() => {
                setMessages(prev => [...prev, { id: 'sys-update-' + Date.now(), role: 'system', content: '[NOTICE] A new version of VoidEx CLI is available! Run `git pull` to update.' }]);
            }, 3000);
        }
    }, []);
    const approvalResolver = useRef(null);
    const abortController = useRef(null);
    // --- AUTO-SAVE ---
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (messages.length > 2) {
                try {
                    saveChat('autosave', messages);
                }
                catch (e) { }
            }
        }, 2000);
        return () => clearTimeout(timeout);
    }, [messages]);
    const executorRef = useRef(new LocalExecutor());
    const stopLoading = useCallback(() => {
        if (abortController.current) {
            abortController.current.abort();
            abortController.current = null;
        }
        currentRequestIdRef.current++;
        const killed = killActiveProcess();
        setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            const newMsgs = [...prev];
            if (lastMsg && lastMsg.role === 'assistant' && lastMsg.tool_calls && lastMsg.tool_calls.length > 0) {
                lastMsg.tool_calls.forEach(tc => {
                    newMsgs.push({
                        id: 'tool-stop-' + Date.now() + Math.random(),
                        role: 'tool',
                        tool_call_id: tc.id,
                        name: tc.function.name,
                        content: 'Process terminated by user (SIGINT/Ctrl+C). Execution stopped.'
                    });
                });
            }
            if (killed || isLoading) {
                newMsgs.push({ id: 'sys-' + Date.now(), role: 'system', content: '[NOTICE] Active process terminated by user.' });
            }
            shadowMessages = newMsgs;
            return newMsgs;
        });
        setIsLoading(false);
        setAgentStatus(null);
        setPendingApproval(null);
    }, [isLoading]);
    const sendMessage = useCallback(async (rawContent) => {
        const content = rawContent.trim();
        if (!content)
            return;
        const currentConfig = getGenericConfig();
        const latestApiKey = getApiKey();
        if (!latestApiKey && !content.startsWith('/auth')) {
            setError('API Key is missing. Use /auth to set it.');
            setAgentStatus(null);
            return;
        }
        const lowerContent = content.toLowerCase();
        if (lowerContent === '/clear') {
            const welcome = [
                { id: 'welcome-' + Date.now(), role: 'system', name: 'welcome_msg', content: '' },
                { id: 'sys-' + Date.now(), role: 'system', content: '[SUCCESS] Chat history and screen cleared.' }
            ];
            setMessages(welcome);
            shadowMessages = welcome;
            return;
        }
        if (lowerContent === '/model') {
            setActiveDialog('model');
            return;
        }
        if (content.startsWith('SYSTEM_MODEL_CHANGED:')) {
            const newModel = content.split(':')[1];
            setMessages(prev => [...prev, { id: 'sys-' + Date.now(), role: 'system', content: `[CONFIG] Model successfully changed to: ${newModel}` }]);
            return;
        }
        if (content.startsWith('SYSTEM_AUTH_CHANGED:')) {
            setMessages(prev => [...prev, { id: 'sys-' + Date.now(), role: 'system', content: `[CONFIG] API Key updated successfully.` }]);
            return;
        }
        if (lowerContent === '/auth') {
            setActiveDialog('auth');
            return;
        }
        if (lowerContent.startsWith('/chat')) {
            const parts = content.split(/\s+/);
            const sub = parts[1]?.toLowerCase();
            const arg = parts[2];
            const currentHistory = messagesRef.current;
            if (sub === 'save' && arg) {
                saveChat(arg, currentHistory);
                setMessages(prev => [...prev, { id: 'sys-' + Date.now(), role: 'system', content: `Chat saved as "${arg}"` }]);
                return;
            }
            if (sub === 'resume' && arg) {
                const loaded = loadChat(arg);
                if (loaded.length > 0) {
                    // [FIX] Force update shadowMessages immediately to prevent loop
                    shadowMessages = loaded;
                    setMessages(loaded);
                }
                else {
                    setMessages(prev => [...prev, { id: 'sys-' + Date.now(), role: 'system', content: `Chat "${arg}" not found or empty.` }]);
                }
                return;
            }
            if (sub === 'list') {
                const list = listChats();
                const contentText = list.length > 0 ? `Saved chats:\n${list.join('\n')}` : "No saved chats found.";
                setMessages(prev => [...prev, { id: 'sys-' + Date.now(), role: 'system', content: contentText }]);
                return;
            }
            if (sub === 'delete' && arg) {
                const success = deleteChat(arg);
                const msg = success ? `Chat "${arg}" deleted.` : `Chat "${arg}" not found.`;
                setMessages(prev => [...prev, { id: 'sys-' + Date.now(), role: 'system', content: msg }]);
                return;
            }
            if (sub === 'share' && arg) {
                exportChat(arg, currentHistory);
                setMessages(prev => [...prev, { id: 'sys-' + Date.now(), role: 'system', content: `Chat shared to: ${arg}` }]);
                return;
            }
            const usage = `Usage: /chat [save <id> | resume <id> | list | delete <id> | share <file>]`;
            setMessages(prev => [...prev, { id: 'sys-' + Date.now(), role: 'system', content: usage }]);
            return;
        }
        if (lowerContent === '/tools') {
            const toolList = toolsDefinition.map(t => `- ${t.function.name}: ${t.function.description}`).join('\n');
            setMessages(prev => [...prev, { id: 'user-' + Date.now(), role: 'user', content: '/tools' }, { id: 'sys-' + Date.now(), role: 'system', content: `Available Tools:\n${toolList}` }]);
            return;
        }
        if (lowerContent === '/about') {
            const aboutText = `VoidEx CLI v1.0.0\nBy VoidEx\nTelegram: https://t.me/voidex369\nGitHub: https://github.com/voidex369\nModel: ${currentConfig.model}`;
            setMessages(prev => [...prev, { id: 'user-' + Date.now(), role: 'user', content: '/about' }, { id: 'sys-' + Date.now(), role: 'system', content: aboutText }]);
            return;
        }
        if (lowerContent === '/help') {
            setMessages(prev => [...prev, { id: 'user-' + Date.now(), role: 'user', content: '/help' }, { id: 'sys-' + Date.now(), role: 'system', content: 'HELP_MENU_ACTIVE', name: 'help_menu' }]);
            return;
        }
        if (lowerContent === '/stats') {
            const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
            const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
            const stats = `System Stats:\n- CPU: ${os.cpus().length} Cores\n- RAM: ${freeMem}GB / ${totalMem}GB free\n- Current Model: ${currentConfig.model}`;
            setMessages(prev => [...prev, { id: 'user-' + Date.now(), role: 'user', content: '/stats' }, { id: 'sys-' + Date.now(), role: 'system', content: stats }]);
            return;
        }
        const userMsg = { id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7), role: 'user', content: truncateForRAM(content) };
        stopLoading();
        const requestId = currentRequestIdRef.current;
        abortController.current = new AbortController();
        const signal = abortController.current.signal;
        let currentMsgs = [...messagesRef.current, userMsg];
        setMessages(currentMsgs);
        setIsLoading(true);
        setError(null);
        setAgentStatus('Thinking...');
        try {
            await executorRef.current.run({
                model: getGenericConfig().model,
                apiKey: getApiKey() || currentApiKey,
                messages: currentMsgs,
                onUpdateMessages: (msgs) => {
                    if (requestId === currentRequestIdRef.current)
                        setMessages(msgs);
                },
                onStatusUpdate: (status) => {
                    if (requestId === currentRequestIdRef.current)
                        setAgentStatus(status);
                },
                onLiveOutput: (output) => {
                    setLiveToolOutput(output);
                },
                onNeedApproval: async (info) => {
                    setPendingApproval(info);
                    setAgentStatus(null);
                    return new Promise((resolve) => {
                        approvalResolver.current = resolve;
                    }).then(res => {
                        setPendingApproval(null);
                        approvalResolver.current = null;
                        return res;
                    });
                },
                allowedTools: allowedToolsRef.current,
                onToolWhitelisted: (name) => {
                    setAllowedToolsForSession(prev => {
                        const next = [...prev, name];
                        allowedToolsRef.current = next;
                        return next;
                    });
                },
                onError: (err) => {
                    if (requestId === currentRequestIdRef.current)
                        setError(err);
                },
                signal
            });
            // [BARU] LOGIC CEK MEMORY SAVE
            // Kita cek pesan terakhir, apakah mengandung kode rahasia dari System Prompt?
            const finalMessages = messagesRef.current;
            const lastMsg = finalMessages[finalMessages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content) {
                // Regex: Cari baris yang diawali MEMORY_SAVE:
                const memoryMatch = lastMsg.content.match(/MEMORY_SAVE:\s*(.*)/);
                if (memoryMatch && memoryMatch[1]) {
                    const fact = memoryMatch[1].trim();
                    const success = appendMemory(fact);
                    // Kalau sukses, kasih tau user dengan pesan sistem yang keren
                    if (success) {
                        setMessages(prev => [
                            ...prev,
                            { id: 'sys-mem-' + Date.now(), role: 'system', content: `[MEMORY SAVED] "${fact}" to Sovereign Storage.` }
                        ]);
                    }
                }
            }
        }
        catch (err) {
            if (requestId === currentRequestIdRef.current) {
                setError(err.message || 'Unknown error');
            }
        }
        finally {
            if (requestId === currentRequestIdRef.current) {
                setIsLoading(false);
                setAgentStatus(null);
                abortController.current = null;
            }
        }
    }, [stopLoading]);
    const forgetMessages = useCallback((count) => {
        setMessages(prev => {
            const userIndices = [];
            prev.forEach((m, i) => { if (m.role === 'user')
                userIndices.push(i); });
            if (userIndices.length === 0)
                return prev;
            const splitIdx = userIndices[Math.max(0, userIndices.length - count)];
            const nextMsgs = prev.slice(0, splitIdx);
            shadowMessages = nextMsgs;
            return nextMsgs;
        });
    }, []);
    return {
        messages, isLoading, error, sendMessage, agentStatus,
        clearMessages: () => { setMessages([{ id: 'welcome', role: 'system', name: 'welcome_msg', content: '' }]); shadowMessages = []; },
        activeDialog, setActiveDialog, getAvailableModels, saveModel, saveApiKey,
        apiKey: getApiKey() || currentApiKey, stopLoading,
        hasMemory: fs.existsSync(path.join(os.homedir(), '.voidex-cli', 'memory.md')),
        pendingApproval,
        resolveApproval: (choice) => {
            if (approvalResolver.current)
                approvalResolver.current(choice);
        },
        liveToolOutput, history, setHistory, forgetMessages
    };
}
