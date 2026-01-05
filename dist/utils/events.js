/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { EventEmitter } from 'events';
export var AppEvent;
(function (AppEvent) {
    AppEvent["OpenDebugConsole"] = "open-debug-console";
    AppEvent["OauthDisplayMessage"] = "oauth-display-message";
    AppEvent["Flicker"] = "flicker";
    AppEvent["McpClientUpdate"] = "mcp-client-update";
    AppEvent["SelectionWarning"] = "selection-warning";
    AppEvent["PasteTimeout"] = "paste-timeout";
})(AppEvent || (AppEvent = {}));
// Typed EventEmitter wrapper
class TypedEventEmitter extends EventEmitter {
    emit(eventName, ...args) {
        return super.emit(eventName, ...args);
    }
    on(eventName, listener) {
        return super.on(eventName, listener);
    }
}
export const appEvents = new TypedEventEmitter();
