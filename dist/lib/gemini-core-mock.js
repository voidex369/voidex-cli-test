/**
 * Mock for @google/gemini-cli-core
 * Provides types and dummy functions to satisfy Gemini-CLI UI dependencies.
 */
export const debugLogger = {
    log: (...args) => { }, // console.log('[DEBUG]', ...args), 
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
};
// Mouse event control stubs
export function enableMouseEvents() {
    process.stdout.write('\x1b[?1000h\x1b[?1003h\x1b[?1015h\x1b[?1006h');
}
export function disableMouseEvents() {
    process.stdout.write('\x1b[?1000l\x1b[?1003l\x1b[?1015l\x1b[?1006l');
}
