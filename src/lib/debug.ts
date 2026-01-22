// 🐛 DEBUG MODULE - Mengelompokan Error Berdasarkan Tipe
// Author: VoidEx
// Created: 2026-01-19

export interface DebugInfo {
    timestamp: string;
    model: string;
    errorType: 'CONNECTION_TIMEOUT' | 'RATE_LIMITED' | 'MODEL_OFFLINE' | 'API_KEY_INVALID' | 'UNKNOWN_ERROR';
    statusCode?: number;
    errorMessage: string;
    rawError?: any;
    suggestion?: string;
}

export class DebugTracker {
    private static instance: DebugTracker;
    private logs: DebugInfo[] = [];

    private constructor() {}

    public static getInstance(): DebugTracker {
        if (!DebugTracker.instance) {
            DebugTracker.instance = new DebugTracker();
        }
        return DebugTracker.instance;
    }

    /**
     * Mengidentifikasi tipe error dari response OpenRouter
     */
    public static analyzeError(error: any, model?: string): DebugInfo {
        const timestamp = new Date().toISOString();
        
        // Extract error message
        const errorMessage = this.getErrorMessage(error);
        const statusCode = this.getStatusCode(error);

        // Analyze pattern
        let errorType: DebugInfo['errorType'] = 'UNKNOWN_ERROR';
        let suggestion: string = '';

        // 1. RATE LIMITING (429)
        if (statusCode === 429 || errorMessage.includes('429') || errorMessage.includes('rate limit')) {
            errorType = 'RATE_LIMITED';
            suggestion = 'Model ini habis quota. Coba model lain atau tunggu beberapa menit.';
        }
        // 2. MODEL OFFLINE/NOT FOUND (404)
        else if (statusCode === 404 || errorMessage.includes('404') || errorMessage.includes('not found')) {
            errorType = 'MODEL_OFFLINE';
            suggestion = 'Model tidak ditemukan/mati. Coba model yang berbeda.';
        }
        // 3. CONNECTION TIMEOUT (ETIMEDOUT, ECONNREFUSED)
        else if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timeout') || errorMessage.includes('fetch failed')) {
            errorType = 'CONNECTION_TIMEOUT';
            suggestion = 'Koneksi timeout. Cek internet atau coba lagi.';
        }
        // 4. API KEY INVALID (401, 403)
        else if (statusCode === 401 || statusCode === 403 || errorMessage.includes('401') || errorMessage.includes('403')) {
            errorType = 'API_KEY_INVALID';
            suggestion = 'API Key tidak valid atau sudah expired.';
        }
        // 5. MODEL OFFLINE (Custom pattern untuk OpenRouter)
        else if (errorMessage.includes('Model unavailable') || errorMessage.includes('provider returned error')) {
            errorType = 'MODEL_OFFLINE';
            suggestion = 'Provider mengalami error. Coba model lain.';
        }

        const debugInfo: DebugInfo = {
            timestamp,
            model: model || 'unknown',
            errorType,
            statusCode,
            errorMessage,
            rawError: error,
            suggestion
        };

        // Log to console jika debug mode aktif
        if (process.env.DEBUG === 'true') {
            this.logToConsole(debugInfo);
        }

        return debugInfo;
    }

    private static getErrorMessage(error: any): string {
        if (typeof error === 'string') return error;
        if (error.message) return error.message;
        if (error.error?.message) return error.error.message;
        return JSON.stringify(error);
    }

    private static getStatusCode(error: any): number | undefined {
        if (error.status) return error.status;
        if (error.response?.status) return error.response.status;
        if (error.error?.status) return error.error.status;
        return undefined;
    }

    private static logToConsole(info: DebugInfo): void {
        const colors = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            yellow: '\x1b[33m',
            cyan: '\x1b[36m',
            green: '\x1b[32m',
            dim: '\x1b[2m'
        };

        const typeColors = {
            'RATE_LIMITED': colors.yellow,
            'MODEL_OFFLINE': colors.red,
            'CONNECTION_TIMEOUT': colors.red,
            'API_KEY_INVALID': colors.red,
            'UNKNOWN_ERROR': colors.cyan
        };

        const badge = `[DEBUG ${info.errorType}]`;
        const badgeColor = typeColors[info.errorType];

        console.log(`${colors.dim}─────────────────────────────────────────────────────────${colors.reset}`);
        console.log(`${badgeColor}${badge} ${colors.reset}Model: ${colors.cyan}${info.model}${colors.reset}`);
        console.log(`${colors.dim}Time: ${info.timestamp}${colors.reset}`);
        console.log(`${colors.dim}Status Code: ${info.statusCode || 'N/A'}${colors.reset}`);
        console.log(`${badgeColor}Error: ${info.errorMessage}${colors.reset}`);
        
        if (info.suggestion) {
            console.log(`${colors.green}💡 Suggestion: ${info.suggestion}${colors.reset}`);
        }

        console.log(`${colors.dim}─────────────────────────────────────────────────────────${colors.reset}\n`);
    }

    /**
     * Format error untuk ditampilkan di UI
     */
    public static formatForUI(info: DebugInfo): string {
        const icon = this.getIcon(info.errorType);
        
        let message = `${icon} **Error: ${info.errorType}**\n`;
        
        if (info.statusCode) {
            message += `• Status Code: ${info.statusCode}\n`;
        }
        
        message += `• Message: ${info.errorMessage}\n`;
        
        if (info.suggestion) {
            message += `• Suggestion: ${info.suggestion}\n`;
        }

        // Hanya tampilkan raw error jika DEBUG mode
        if (process.env.DEBUG === 'true' && info.rawError) {
            message += `\n**Raw Error:**\n\`\`\`json\n${JSON.stringify(info.rawError, null, 2)}\n\`\`\``;
        }

        return message;
    }

    private static getIcon(type: string): string {
        const icons = {
            'RATE_LIMITED': '⏳',
            'MODEL_OFFLINE': '❌',
            'CONNECTION_TIMEOUT': '⌛',
            'API_KEY_INVALID': '🔑',
            'UNKNOWN_ERROR': '❓'
        };
        return icons[type as keyof typeof icons] || '❓';
    }

    /**
     * Add log to history
     */
    public addLog(info: DebugInfo): void {
        this.logs.push(info);
        
        // Keep only last 50 logs
        if (this.logs.length > 50) {
            this.logs = this.logs.slice(-50);
        }
    }

    /**
     * Get recent logs
     */
    public getRecentLogs(limit: number = 10): DebugInfo[] {
        return this.logs.slice(-limit);
    }

    /**
     * Export logs to file
     */
    public exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }
}

/**
 * Helper function untuk mencatat error di executor
 */
export function logError(error: any, model?: string): DebugInfo {
    const debugInfo = DebugTracker.analyzeError(error, model);
    
    // Simpan ke tracker
    const tracker = DebugTracker.getInstance();
    tracker.addLog(debugInfo);

    return debugInfo;
}
