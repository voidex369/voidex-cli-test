// src/types/index.ts

export type Role = 'user' | 'assistant' | 'system' | 'tool';

export interface PendingToolCall {
    /** ID internal (opsional, tidak selalu ada saat approval diminta) */
    id?: string;

    /** Nama tool */
    name: string;

    /** Arguments tool (object atau string) */
    arguments: Record<string, any> | string;

    /** Relasi ke tool_call dari assistant */
    tool_call_id?: string;

    /** Level risiko */
    riskLevel?: 'safe' | 'caution' | 'critical';

    /** Kode konfirmasi untuk critical tools */
    challengeCode?: string;
}

export interface ToolCall {
    id?: string;
    type?: 'function';
    function: {
        name: string;
        arguments: string;
    };
}

export interface Message {
    id: string;
    role: Role;
    content?: string;
    name?: string;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
}
