import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { getCurrentModelInfo, saveCustomModel, getModelDisplayName, validateModelFormat, getAvailableModels } from '../../lib/config.js';

// Helper function for validation
function isValidModel(model: string): boolean {
    const models = getAvailableModels();
    return models.includes(model) || validateModelFormat(model);
}

// Model picker dengan custom model support
export const ModelPicker = React.memo(({ onSelect, onCancel, models }: any) => {
    const [filter, setFilter] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mode, setMode] = useState<'list' | 'add'>('list');
    const [customModel, setCustomModel] = useState('');
    
    const filtered = useMemo(() => 
        models.filter((m: string) => m.toLowerCase().includes(filter.toLowerCase())), 
        [filter, models]
    );

    // Pagination Logic
    const visibleCount = 10;
    const totalCount = filtered.length;
    const startIndex = Math.floor(selectedIndex / visibleCount) * visibleCount;
    const visible = useMemo(() => 
        filtered.slice(startIndex, startIndex + visibleCount), 
        [filtered, startIndex]
    );

    // Get current model info for display
    const currentModelInfo = useMemo(() => getCurrentModelInfo(), [mode]);

    useInput((input, key) => {
        if (mode === 'list') {
            if (totalCount === 0) { 
                if (key.escape || (key.ctrl && input === 'c')) onCancel(); 
                return; 
            }
            if (key.upArrow) setSelectedIndex(p => (p > 0 ? p - 1 : totalCount - 1));
            else if (key.downArrow) setSelectedIndex(p => (p < totalCount - 1 ? p + 1 : 0));
            else if (key.return) { 
                if (filtered[selectedIndex]) onSelect(filtered[selectedIndex]); 
            }
            else if (key.escape || (key.ctrl && input === 'c')) onCancel();
            else if (key.tab || input === 'a' || input === 'A') setMode('add');
        } else {
            // Add mode
            if (key.escape || (key.ctrl && input === 'c')) {
                setMode('list');
                setCustomModel('');
                return;
            }
            if (key.return && customModel.trim()) {
                const success = saveCustomModel(customModel.trim());
                if (success || isValidModel(customModel.trim())) {
                    onSelect(customModel.trim());
                }
                return;
            }
        }
    });

    if (mode === 'add') {
        return (
            <Box flexDirection="column" borderStyle="double" borderColor="cyan" padding={1} width={80}>
                <Text bold color="cyan">Add Custom Model (Esc to go back):</Text>
                <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1}>
                    <TextInput 
                        value={customModel} 
                        onChange={setCustomModel} 
                        placeholder="provider/model-name:free" 
                        focus={true}
                    />
                </Box>
                <Box marginTop={1}>
                    <Text dimColor>Format: provider/model:tag</Text>
                </Box>
                <Box marginTop={1}>
                    <Text color="yellow" dimColor>Example: openai/gpt-4o, anthropic/claude-3-sonnet, google/gemini-2.0-flash-exp:free</Text>
                </Box>
                <Box marginTop={1} borderStyle="single" borderColor="gray" padding={1}>
                    <Text dimColor>Custom models are stored in: ~/.voidex-cli/custom-models.json</Text>
                </Box>
                <Box marginTop={1}>
                    <Text color="green">Press ENTER to save and select</Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" borderStyle="double" borderColor="magenta" padding={1} width={80}>
            <Text bold color="magenta">Select AI Model (Press Tab/A to add custom):</Text>
            <Box borderStyle="single" borderColor="gray" paddingX={1} marginBottom={1}>
                <TextInput value={filter} onChange={setFilter} placeholder="Search..." />
            </Box>
            
            {/* Current Model Info */}
            <Box borderStyle="single" borderColor="cyan" padding={1} marginBottom={1}>
                <Text color="cyan">Current: {currentModelInfo.model}</Text>
                <Text dimColor> | </Text>
                <Text dimColor>Config: {currentModelInfo.location}</Text>
                {currentModelInfo.isCustom && <Text color="yellow"> [CUSTOM]</Text>}
            </Box>

            <Box flexDirection="column">
                {visible.map((m: string, i: number) => {
                    const isSel = (startIndex + i) === selectedIndex;
                    return (
                        <Text 
                            key={m} 
                            color={isSel ? 'cyan' : 'white'} 
                            bold={isSel}
                        >
                            {isSel ? '➤ ' : '  '}{getModelDisplayName(m)}
                        </Text>
                    );
                })}
            </Box>
            
            <Box marginTop={1}>
                <Text dimColor italic>
                    Tips: Add custom model via ~/.voidex-cli/custom-models.json or press Tab/A
                </Text>
            </Box>
        </Box>
    );
});