import fs from 'fs';
import path from 'path';
import os from 'os';
import { Message } from '../types/index.js';

// --- CONFIG & CONSTANTS ---
const HOMEDIR = os.homedir();
// Lokasi penyimpanan ingatan: ~/.voidex-cli/memory.md
const MEMORY_FILE = path.join(HOMEDIR, '.voidex-cli', 'memory.md');

const MAX_CONTENT_LENGTH = 50000;
const MAX_HISTORY_CHARS = 100000;

// --- EXISTING RAM UTILS (JANGAN DIHAPUS) ---

export function truncateForRAM(content: string | null): string {
    if (!content) return '';
    if (content.length > MAX_CONTENT_LENGTH) {
        return (
            content.slice(0, MAX_CONTENT_LENGTH) +
            '\n\n... [ TRUNCATED AT 50KB FOR EXTREME RAM STABILITY ] ...'
        );
    }
    return content;
}


export function pruneHistoryByChars(messages: Message[]): Message[] {
    let totalChars = 0;
    const result: Message[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];
        const mChars =
            (m.content?.length ?? 0) +
            JSON.stringify(m.tool_calls ?? []).length;

        if (totalChars + mChars > MAX_HISTORY_CHARS) {
            // Pastikan minimal 1 user message paling awal tetap ada
            if (
                m.role === 'user' &&
                i === messages.findIndex(msg => msg.role === 'user')
            ) {
                result.unshift(m);
            }
            break;
        }

        result.unshift(m);
        totalChars += mChars;
    }

    return result;
}

// ------------------------------------------------------------------
// [BARU] DIGUNAKAN OLEH memory.test.ts
// ------------------------------------------------------------------

/**
 * Trim messages agar total panjang content tidak melebihi tokenLimit.
 * Digunakan khusus untuk context window / LLM input.
 *
 * Strategi:
 * - Mulai dari pesan TERAKHIR
 * - Buang pesan lama lebih dulu
 * - Hitung hanya content (bukan tool_calls)
 */
export function trimMessagesToTokenLimit(
    messages: Message[],
    tokenLimit: number
): Message[] {
    if (messages.length === 0) return [];

    let total = 0;
    const result: Message[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        const size = msg.content?.length ?? 0;

        if (total + size > tokenLimit) break;

        total += size;
        result.unshift(msg);
    }

    return result;
}

// ------------------------------------------------------------------
// [BARU] FITUR LONG TERM MEMORY (FILE SYSTEM)
// ------------------------------------------------------------------

// 1. Fungsi Baca Ingatan
export function getMemory(): string {
    if (fs.existsSync(MEMORY_FILE)) {
        try {
            return fs.readFileSync(MEMORY_FILE, 'utf-8');
        } catch {
            return '';
        }
    }
    return '';
}

// 2. Fungsi Tulis/Simpan Ingatan
export function appendMemory(newMemory: string): boolean {
    try {
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const entry = `\n- [${timestamp}] ${newMemory}`;

        // Pastikan folder ~/.voidex-cli ada
        const dir = path.dirname(MEMORY_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.appendFileSync(MEMORY_FILE, entry, 'utf-8');
        return true;
    } catch {
        return false;
    }
}
