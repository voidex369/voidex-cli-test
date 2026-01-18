import fs from 'fs';
import path from 'path';
import os from 'os';
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
export function getGenericConfig() {
    ensureConfigDir();
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
            return JSON.parse(data);
        }
        catch (e) {
            return { model: 'google/gemini-2.0-flash-exp:free' };
        }
    }
    return { model: 'google/gemini-2.0-flash-exp:free' };
}
export function saveGenericConfig(config) {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}
// --- API KEY MANAGEMENT (GLOBAL ENV) ---
export function getApiKey() {
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
        }
        catch (e) {
            // Ignore error read
        }
    }
    return undefined;
}
export function saveApiKey(apiKey) {
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
    }
    else {
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
export const MODEL_TEMPLATES = [
    'xiaomi/mimo-v2-flash:free',
    'alibaba/tongyi-deepresearch-30b-a3b:free',
    'allenai/olmo-3-32b-think:free',
    'allenai/olmo-3.1-32b-think:free',
    'anthropic/claude-3-opus',
    'anthropic/claude-3-sonnet',
    'arcee-ai/trinity-mini:free',
    'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
    'mistralai/mixtral-8x22b-instruct',
    'liquid/lfm-40b:free',
    'google/gemini-2.0-flash-exp:free',
    'google/gemini-2.5-flash-image',
    'google/gemini-2.5-flash-lite',
    'meta-llama/llama-3-70b-instruct',
    'mistral/mistral-large',
    'mistralai/devstral-2512:free',
    'moonshotai/kimi-k2:free',
    'nex-agi/deepseek-v3.1-nex-n1:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'openai/gpt-4o',
    'openai/gpt-oss-120b:free',
    'qwen/qwen3-coder:free',
    'z-ai/glm-4.5-air:free'
];
// Ambil daftar model dari config custom + templates
export function getAvailableModels() {
    ensureConfigDir();
    const customModelsPath = path.join(CONFIG_DIR, 'custom-models.json');
    let customModels = [];
    if (fs.existsSync(customModelsPath)) {
        try {
            const data = fs.readFileSync(customModelsPath, 'utf-8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                customModels = parsed;
            }
        }
        catch (e) {
            // Ignore parsing errors
        }
    }
    // Gabungkan templates + custom models (hindari duplikat)
    const allModels = [...MODEL_TEMPLATES, ...customModels];
    return [...new Set(allModels)]; // Remove duplicates
}
// Simpan model custom ke file terpisah
export function saveCustomModel(model) {
    ensureConfigDir();
    const customModelsPath = path.join(CONFIG_DIR, 'custom-models.json');
    // Validasi format model (harus mengandung provider/model)
    if (!model || !model.includes('/')) {
        return false;
    }
    let customModels = [];
    if (fs.existsSync(customModelsPath)) {
        try {
            const data = fs.readFileSync(customModelsPath, 'utf-8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                customModels = parsed;
            }
        }
        catch (e) {
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
export function removeCustomModel(model) {
    ensureConfigDir();
    const customModelsPath = path.join(CONFIG_DIR, 'custom-models.json');
    if (!fs.existsSync(customModelsPath)) {
        return false;
    }
    try {
        const data = fs.readFileSync(customModelsPath, 'utf-8');
        let customModels = JSON.parse(data);
        const initialLength = customModels.length;
        customModels = customModels.filter(m => m !== model);
        if (customModels.length !== initialLength) {
            fs.writeFileSync(customModelsPath, JSON.stringify(customModels, null, 2), 'utf-8');
            return true;
        }
        return false;
    }
    catch (e) {
        return false;
    }
}
// Cek apakah model valid
export function isValidModel(model) {
    const availableModels = getAvailableModels();
    return availableModels.includes(model);
}
// Dapatkan model saat ini dengan info lokasi custom
export function getCurrentModelInfo() {
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
        }
        catch (e) {
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
export function validateModelFormat(model) {
    if (!model || typeof model !== 'string')
        return false;
    return model.includes('/') && model.length > 3;
}
// [FIXED] Hanya satu fungsi getModelDisplayName & Nama Model Full
export function getModelDisplayName(model) {
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
export function saveModel(model) {
    const config = getGenericConfig();
    config.model = model;
    saveGenericConfig(config);
}
// --- CHAT SESSION MANAGEMENT ---
export function saveChat(id, messages) {
    ensureConfigDir();
    const cleanId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(CHATS_DIR, `${cleanId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf-8');
}
export function loadChat(id) {
    const cleanId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(CHATS_DIR, `${cleanId}.json`);
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
        catch (e) {
            return [];
        }
    }
    return [];
}
export function listChats() {
    ensureConfigDir();
    if (!fs.existsSync(CHATS_DIR))
        return [];
    return fs.readdirSync(CHATS_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
}
export function deleteChat(id) {
    const cleanId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(CHATS_DIR, `${cleanId}.json`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
}
export function exportChat(fileName, messages) {
    // Export ke folder tempat user menjalankan perintah (CWD)
    const targetPath = path.resolve(process.cwd(), fileName);
    let content = '';
    if (fileName.endsWith('.json')) {
        content = JSON.stringify(messages, null, 2);
    }
    else {
        content = messages.map(m => {
            return `[${m.role.toUpperCase()}] (${m.id})\n${m.content || '(Tool Call)'}\n${'-'.repeat(40)}`;
        }).join('\n\n');
    }
    fs.writeFileSync(targetPath, content, 'utf-8');
}
