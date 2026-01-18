import React from 'react';
import { Box, Text } from 'ink';

interface DebugHistoryProps {
  history: string[];
  messages: any[];
}

export const DebugHistory: React.FC<DebugHistoryProps> = ({ history, messages }) => {
  return (
    <Box borderStyle="double" borderColor="red" padding={1} flexDirection="column">
      <Text color="red" bold>🔍 DEBUG HISTORY</Text>
      <Text dimColor>History Length: {history.length}</Text>
      <Text dimColor>Messages Length: {messages.length}</Text>
      <Box marginTop={1}>
        <Text>History Items:</Text>
        {history.map((h, i) => (
          <Text key={i} color="yellow">  {i}: {h}</Text>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text>Messsage User Items:</Text>
        {messages.filter(m => m.role === 'user').map((m, i) => (
          <Text key={i} color="cyan">  {i}: {m.content}</Text>
        ))}
      </Box>
    </Box>
  );
};
