import fs from 'fs';
import path from 'path';
import os from 'os';
import { Message } from '../types/index.js';

// --- CONSTANTS ---
const HOMEDIR = os.homedir();
// Folder Utama: ~/.voidex-cli
const CONFIG_DIR = path.join(HOMEDIR, '.voidex-cli');
// File Config JSON (Model, Theme, dll)
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
// Folder Chat History
const CHATS_DIR = path.join(CONFIG_DIR, 'chats');

// [PENTING] Lokasi .env sekarang di GLOBAL (~/.voidex-cli/.env)
// Biar bisa diakses dari direktori mana saja saat pakai CLI.
const ENV_PATH = path.join(CONFIG_DIR, '.env');

// --- INTERFACES ---
interface CliConfig {
    model: string;
    apiKey?: string; // Legacy support (akan dihapus otomatis)
    theme?: string;
}

// --- INITIALIZATION ---
function ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    if (!fs.existsSync(CHATS_DIR)) {
        fs.mkdirSync(CHATS_DIR, { recursive: true });
    }
}

// --- CORE CONFIG (JSON) ---
export function getGenericConfig(): CliConfig {
    ensureConfigDir();
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            return { model: 'google/gemini-2.0-flash-exp:free' };
        }
    }
    return { model: 'google/gemini-2.0-flash-exp:free' };
}

export function saveGenericConfig(config: CliConfig) {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

// --- API KEY MANAGEMENT (GLOBAL ENV) ---

export function getApiKey(): string | undefined {
    // 1. Cek Memory Node.js (Prioritas Utama)
    if (process.env.OPENROUTER_API_KEY) {
        return process.env.OPENROUTER_API_KEY;
    }

    // 2. Cek Global .env File (~/.voidex-cli/.env)
    if (fs.existsSync(ENV_PATH)) {
        try {
            const content = fs.readFileSync(ENV_PATH, 'utf-8');
            // Regex cari OPENROUTER_API_KEY=...
            const match = content.match(/^OPENROUTER_API_KEY=(.*)$/m);
            if (match && match[1]) {
                const key = match[1].trim();
                process.env.OPENROUTER_API_KEY = key; // Cache ke memory biar cepet
                return key;
            }
        } catch (e) {
            // Ignore error read
        }
    }

    return undefined;
}

export function saveApiKey(apiKey: string): void {
    ensureConfigDir(); // Pastikan folder ~/.voidex-cli ada

    const keyName = 'OPENROUTER_API_KEY';
    const trimmedKey = apiKey.trim();

    // 1. Update Memory (Runtime)
    process.env[keyName] = trimmedKey;

    // 2. Update Global .env File
    let content = '';
    if (fs.existsSync(ENV_PATH)) {
        content = fs.readFileSync(ENV_PATH, 'utf-8');
    }

    const keyRegex = new RegExp(`^${keyName}=(.*)$`, 'm');

    if (keyRegex.test(content)) {
        // Kalau key sudah ada, timpa barisnya
        content = content.replace(keyRegex, `${keyName}=${trimmedKey}`);
    } else {
        // Kalau belum ada, tambahkan di baris baru
        const prefix = content.endsWith('\n') || content === '' ? '' : '\n';
        content += `${prefix}${keyName}=${trimmedKey}\n`;
    }

    fs.writeFileSync(ENV_PATH, content, 'utf-8');

    // 3. Security Cleanup: Hapus API Key dari config.json (Legacy)
    // Biar gak double nyimpen dan config.json bersih dari credential.
    const currentConfig = getGenericConfig();
    if (currentConfig.apiKey) {
        delete currentConfig.apiKey;
        saveGenericConfig(currentConfig);
    }
}

// --- MODEL MANAGEMENT ---

// Model template (referensi untuk custom)
// TESTED: 2026-01-19 - Hanya model yang WORK saja
// Filter berdasarkan debug_logs.json (error 404/402 dihapus)
// Updated: 2026-01-19 - Tambah semua model dari model.txt
export const MODEL_TEMPLATES = [
    // ✅ ACTIVE MODELS (Sudah teruji work)
    'xiaomi/mimo-v2-flash:free',
    'arcee-ai/trinity-mini:free',
    'mistralai/devstral-2512:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'qwen/qwen3-coder:free',
    'z-ai/glm-4.5-air:free',
    
    // 🔥 NEW MODELS (Dari model.txt)
    'meta-llama/llama-3.2-3b-instruct:free',
    'qwen/qwen-2.5-vl-7b-instruct:free',
    'google/gemma-3-4b-it:free',
    'google/gemma-3n-e2b-it:free',
    'google/gemma-3-12b-it:free',
    'google/gemma-3n-e4b-it:free',
    'moonshotai/kimi-k2:free',
    'meta-llama/llama-3.1-405b-instruct:free',
    'tngtech/deepseek-r1t2-chimera:free',
    'tngtech/deepseek-r1t-chimera:free',
    'deepseek/deepseek-r1-0528:free',
    'tngtech/tng-r1t-chimera:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemma-3-27b-it:free',
    'openai/gpt-oss-120b:free',
    'google/gemini-2.0-flash-exp:free',
    'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    'openai/gpt-oss-20b:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
    'nvidia/nemotron-nano-12b-v2-vl:free',
    'allenai/molmo-2-8b:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'qwen/qwen3-4b:free',
];

// Ambil daftar model dari config custom + templates
export function getAvailableModels(): string[] {
    ensureConfigDir();
    const customModelsPath = path.join(CONFIG_DIR, 'custom-models.json');
    
    let customModels: string[] = [];
    if (fs.existsSync(customModelsPath)) {
        try {
            const data = fs.readFileSync(customModelsPath, 'utf-8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                customModels = parsed;
            }
        } catch (e) {
            // Ignore parsing errors
        }
    }
    
    // Gabungkan templates + custom models (hindari duplikat)
    const allModels = [...MODEL_TEMPLATES, ...customModels];
    
    // Remove duplicates dan filter out invalid models
    const uniqueModels = [...new Set(allModels)].filter(model => 
        model && model.includes('/') && model.length > 3
    );
    
    return uniqueModels;
}

// Simpan model custom ke file terpisah
export function saveCustomModel(model: string): boolean {
    ensureConfigDir();
    const customModelsPath = path.join(CONFIG_DIR, 'custom-models.json');
    
    // Validasi format model (harus mengandung provider/model)
    if (!model || !model.includes('/')) {
        return false;
    }
    
    let customModels: string[] = [];
    if (fs.existsSync(customModelsPath)) {
        try {
            const data = fs.readFileSync(customModelsPath, 'utf-8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                customModels = parsed;
            }
        } catch (e) {
            // Ignore
        }
    }
    
    // Tambahkan jika belum ada
    if (!customModels.includes(model)) {
        customModels.push(model);
        fs.writeFileSync(customModelsPath, JSON.stringify(customModels, null, 2), 'utf-8');
        return true;
    }
    
    return false;
}

// Hapus model custom
export function removeCustomModel(model: string): boolean {
    ensureConfigDir();
    const customModelsPath = path.join(CONFIG_DIR, 'custom-models.json');
    
    if (!fs.existsSync(customModelsPath)) {
        return false;
    }
    
    try {
        const data = fs.readFileSync(customModelsPath, 'utf-8');
        let customModels: string[] = JSON.parse(data);
        
        const initialLength = customModels.length;
        customModels = customModels.filter(m => m !== model);
        
        if (customModels.length !== initialLength) {
            fs.writeFileSync(customModelsPath, JSON.stringify(customModels, null, 2), 'utf-8');
            return true;
        }
        
        return false;
    } catch (e) {
        return false;
    }
}

// Cek apakah model valid
export function isValidModel(model: string): boolean {
    const availableModels = getAvailableModels();
    return availableModels.includes(model);
}

// Dapatkan model saat ini dengan info lokasi custom
export function getCurrentModelInfo(): { model: string; location: string; isCustom: boolean } {
    const config = getGenericConfig();
    const model = config.model;
    
    // Cek apakah model dari templates
    const isTemplate = MODEL_TEMPLATES.includes(model);
    
    // Cek apakah model dari custom list
    const customModelsPath = path.join(CONFIG_DIR, 'custom-models.json');
    let isCustom = false;
    
    if (fs.existsSync(customModelsPath)) {
        try {
            const data = fs.readFileSync(customModelsPath, 'utf-8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.includes(model)) {
                isCustom = true;
            }
        } catch (e) {
            // Ignore
        }
    }
    
    return {
        model: model,
        location: '~/.voidex-cli/config.json',
        isCustom: isCustom || !isTemplate
    };
}

// Fungsi tambahan untuk validasi model
export function validateModelFormat(model: string): boolean {
    if (!model || typeof model !== 'string') return false;
    return model.includes('/') && model.length > 3;
}

// [FIXED] Hanya satu fungsi getModelDisplayName & Nama Model Full
export function getModelDisplayName(model: string): string {
    const uncensoredModels = [
        'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
        'nousresearch/hermes-3-llama-3.1-405b:free',
        'mistralai/mixtral-8x22b-instruct',
        'liquid/lfm-40b:free'
    ];

    if (uncensoredModels.includes(model)) {
        return `${model} (Uncensored)`;
    }

    // Kembalikan nama full tanpa dipotong (split)
    return model;
}

// [NEW] Fungsi untuk mendapatkan info token dari model
export function getModelTokenInfo(model: string): string {
    // Database token dari model.txt
    const modelTokens: Record<string, string> = {
        // Rekomendasi Utama
        'xiaomi/mimo-v2-flash:free': '262K',
        'arcee-ai/trinity-mini:free': '131K',
        'mistralai/devstral-2512:free': '262K',
        'nvidia/nemotron-3-nano-30b-a3b:free': '256K',
        'qwen/qwen3-coder:free': '262K',
        'z-ai/glm-4.5-air:free': '131K',
        
        // Baru dari model.txt
        'meta-llama/llama-3.2-3b-instruct:free': '131K',
        'qwen/qwen-2.5-vl-7b-instruct:free': '33K',
        'google/gemma-3-4b-it:free': '33K',
        'google/gemma-3n-e2b-it:free': '8K',
        'google/gemma-3-12b-it:free': '33K',
        'google/gemma-3n-e4b-it:free': '8K',
        'moonshotai/kimi-k2:free': '33K',
        'meta-llama/llama-3.1-405b-instruct:free': '131K',
        'tngtech/deepseek-r1t2-chimera:free': '164K',
        'tngtech/deepseek-r1t-chimera:free': '164K',
        'deepseek/deepseek-r1-0528:free': '164K',
        'tngtech/tng-r1t-chimera:free': '164K',
        'meta-llama/llama-3.3-70b-instruct:free': '131K',
        'google/gemma-3-27b-it:free': '131K',
        'openai/gpt-oss-120b:free': '131K',
        'google/gemini-2.0-flash-exp:free': '1.05M',
        'cognitivecomputations/dolphin-mistral-24b-venice-edition:free': '33K',
        'openai/gpt-oss-20b:free': '131K',
        'nousresearch/hermes-3-llama-3.1-405b:free': '131K',
        'nvidia/nemotron-nano-12b-v2-vl:free': '128K',
        'allenai/molmo-2-8b:free': '37K',
        'mistralai/mistral-small-3.1-24b-instruct:free': '128K',
        'qwen/qwen3-next-80b-a3b-instruct:free': '262K',
        'qwen/qwen3-4b:free': '41K',
    };

    return modelTokens[model] || 'Unknown';
}

export function saveModel(model: string) {
    const config = getGenericConfig();
    config.model = model;
    saveGenericConfig(config);
}

// --- CHAT SESSION MANAGEMENT ---

export function saveChat(id: string, messages: Message[]) {
    ensureConfigDir();
    const cleanId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(CHATS_DIR, `${cleanId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf-8');
}

export function loadChat(id: string): Message[] {
    const cleanId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(CHATS_DIR, `${cleanId}.json`);
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (e) {
            return [];
        }
    }
    return [];
}

export function listChats(): string[] {
    ensureConfigDir();
    if (!fs.existsSync(CHATS_DIR)) return [];
    return fs.readdirSync(CHATS_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
}

export function deleteChat(id: string): boolean {
    const cleanId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(CHATS_DIR, `${cleanId}.json`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
}

export function exportChat(fileName: string, messages: Message[]) {
    // Export ke folder tempat user menjalankan perintah (CWD)
    const targetPath = path.resolve(process.cwd(), fileName);

    let content = '';
    if (fileName.endsWith('.json')) {
        content = JSON.stringify(messages, null, 2);
    } else {
        content = messages.map(m => {
            return `[${m.role.toUpperCase()}] (${m.id})\n${m.content || '(Tool Call)'}\n${'-'.repeat(40)}`;
        }).join('\n\n');
    }

    fs.writeFileSync(targetPath, content, 'utf-8');
}