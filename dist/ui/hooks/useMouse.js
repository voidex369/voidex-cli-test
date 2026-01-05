/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect } from 'react';
import { useMouseContext } from '../contexts/MouseContext.js';
export function useMouse(onMouseEvent, { isActive }) {
    const { subscribe, unsubscribe } = useMouseContext();
    useEffect(() => {
        if (!isActive) {
            return;
        }
        subscribe(onMouseEvent);
        return () => {
            unsubscribe(onMouseEvent);
        };
    }, [isActive, onMouseEvent, subscribe, unsubscribe]);
}
