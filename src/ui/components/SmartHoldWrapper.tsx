import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';

interface SmartHoldWrapperProps {
  children: React.ReactNode;
  onHoldChange?: (isHolding: boolean) => void;
}

/**
 * Wrapper yang akan pause heavy renders saat detect hold
 */
export const SmartHoldWrapper: React.FC<SmartHoldWrapperProps> = ({ 
  children,
  onHoldChange 
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const lastBackspaceTime = useRef(0);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const eventCounter = useRef(0);

  // Detect hold dengan counter event
  const detectHold = useCallback(() => {
    const now = Date.now();
    const timeSinceLast = now - lastBackspaceTime.current;
    
    eventCounter.current++;
    
    // 3+ events dalam 50ms = hold
    if (eventCounter.current >= 3 && timeSinceLast < 50) {
      if (!isHolding) {
        setIsHolding(true);
        if (onHoldChange) onHoldChange(true);
      }
      
      // Reset counter after hold detected
      eventCounter.current = 0;
    }
    
    lastBackspaceTime.current = now;
    
    // Auto release after 100ms of no events
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      setIsHolding(false);
      if (onHoldChange) onHoldChange(false);
      eventCounter.current = 0;
    }, 100);
  }, [isHolding, onHoldChange]);

  // Capture all keyboard events
  useInput((input, key) => {
    if (key.backspace || key.delete) {
      detectHold();
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    };
  }, []);

  // Mode normal vs hold
  if (isHolding) {
    return (
      <Box flexDirection="column" width="100%">
        <Text dimColor italic>Hold detected - Reduced rendering...</Text>
        {children}
      </Box>
    );
  }

  return <>{children}</>;
};
