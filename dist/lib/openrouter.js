import OpenAI from 'openai';
// Membuat instance OpenAI client yang diarahkan ke OpenRouter
export function createClient(apiKey) {
    return new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // Diperlukan untuk environment CLI/Ink
        defaultHeaders: {
            'HTTP-Referer': 'https://github.com/voidex369/voidex-cli',
            'X-Title': 'VoidEx CLI',
        }
    });
}
// [FIXED] Validator API Key
export async function validateApiKey(apiKey) {
    // 1. Cek format dasar (skor-1 minimal)
    if (!apiKey || apiKey.trim().length < 10)
        return false;
    // 2. Cek apakah formatnya valid (skor-1)
    // Format: sk-or-v1-... atau sk-...
    const isSkFormat = apiKey.startsWith('sk-or-v1-') || apiKey.startsWith('sk-');
    if (!isSkFormat)
        return false;
    try {
        // 3. Coba hit endpoint models (lebih reliable dari auth/key)
        // Endpoint ini akan return 401 jika API key invalid, 200 jika valid
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        // [DEBUG] Log untuk debugging
        if (process.env.DEBUG === 'true') {
            console.log(`[validateApiKey] Status: ${response.status}`);
        }
        // 4. Analisa Respon
        // 200 = API key valid
        // 401 = API key invalid
        if (response.status === 200) {
            return true; // Valid!
        }
        // 401 = Unauthorized (API key invalid)
        if (response.status === 401) {
            if (process.env.DEBUG === 'true') {
                console.log('[validateApiKey] 401 Unauthorized');
            }
            return false;
        }
        // 429 = Rate limit (anggap valid karena sudah terhubung)
        if (response.status === 429) {
            if (process.env.DEBUG === 'true') {
                console.log('[validateApiKey] 429 Rate Limit - anggap valid');
            }
            return true;
        }
        // Untuk status code lain, coba parse response
        const data = (await response.json().catch(() => ({})));
        // Jika ada error message, berarti API key invalid
        if (data.error) {
            if (process.env.DEBUG === 'true') {
                console.log('[validateApiKey] Error dari API:', data.error);
            }
            return false;
        }
        if (process.env.DEBUG === 'true') {
            console.log('[validateApiKey] Status tidak dikenal:', response.status);
        }
        return false;
    }
    catch (error) {
        // Jika timeout atau network error, return false
        if (process.env.DEBUG === 'true') {
            console.log('[validateApiKey] Catch error:', error.message);
        }
        return false;
    }
}
