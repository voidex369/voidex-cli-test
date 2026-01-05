/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect } from 'react';
import { useKeypressContext } from '../contexts/KeypressContext.js';
export function useKeypress(onKeypress, { isActive }) {
    const { subscribe, unsubscribe } = useKeypressContext();
    useEffect(() => {
        if (!isActive) {
            return;
        }
        subscribe(onKeypress);
        return () => {
            unsubscribe(onKeypress);
        };
    }, [isActive, onKeypress, subscribe, unsubscribe]);
}
