import { describe, it, expect } from 'vitest';
import { trimMessagesToTokenLimit } from './memory.js';
describe('trimMessagesToTokenLimit', () => {
    it('should trim old messages when token limit is exceeded', () => {
        const messages = [
            {
                id: 'msg-1',
                role: 'user',
                content: 'Prompt Awal'
            },
            {
                id: 'msg-2',
                role: 'assistant',
                // 105k karakter → sengaja lebih besar dari limit 100k
                content: 'a'.repeat(105_000)
            },
            {
                id: 'msg-3',
                role: 'user',
                content: 'Chat Terbaru'
            }
        ];
        const trimmed = trimMessagesToTokenLimit(messages, 100_000);
        // Hanya pesan terakhir yang harus tersisa
        expect(trimmed).toHaveLength(1);
        expect(trimmed[0].id).toBe('msg-3');
        expect(trimmed[0].role).toBe('user');
        expect(trimmed[0].content).toBe('Chat Terbaru');
    });
    it('should return all messages if token limit is not exceeded', () => {
        const messages = [
            {
                id: 'msg-1',
                role: 'user',
                content: 'Halo'
            },
            {
                id: 'msg-2',
                role: 'assistant',
                content: 'Hai, ada yang bisa saya bantu?'
            }
        ];
        const trimmed = trimMessagesToTokenLimit(messages, 100_000);
        expect(trimmed).toHaveLength(2);
        expect(trimmed).toEqual(messages);
    });
    it('should return an empty array if input is empty', () => {
        const messages = [];
        const trimmed = trimMessagesToTokenLimit(messages, 100_000);
        expect(trimmed).toEqual([]);
    });
});
