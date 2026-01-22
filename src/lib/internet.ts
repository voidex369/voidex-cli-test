// Fungsi untuk cek koneksi internet
export async function checkInternetConnection(): Promise<boolean> {
    // Method 1: Coba ping OpenRouter API (timeout 10 detik untuk internet lambat)
    try {
        if (process.env.DEBUG === 'true') {
            console.log('[Internet] Method 1: Checking OpenRouter...');
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);  // 10 detik
        
        const response = await fetch('https://openrouter.ai/api/v1', {
            method: 'HEAD',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            if (process.env.DEBUG === 'true') {
                console.log('[Internet] Method 1: ✅ Connected via OpenRouter');
            }
            return true;
        }
    } catch (error) {
        if (process.env.DEBUG === 'true') {
            console.log('[Internet] Method 1: ❌ Failed');
        }
        // Method 1 gagal, lanjut ke method 2
    }
    
    // Method 2: Coba ping Google DNS (lebih cepat & reliable)
    try {
        if (process.env.DEBUG === 'true') {
            console.log('[Internet] Method 2: Checking Google DNS...');
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);  // 5 detik
        
        const response = await fetch('https://dns.google/resolve?name=google.com&type=A', {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            if (process.env.DEBUG === 'true') {
                console.log('[Internet] Method 2: ✅ Connected via Google DNS');
            }
            return true;
        }
    } catch (error) {
        if (process.env.DEBUG === 'true') {
            console.log('[Internet] Method 2: ❌ Failed');
        }
        // Method 2 gagal
    }
    
    // Method 3: Coba ping Cloudflare (cukup cepat)
    try {
        if (process.env.DEBUG === 'true') {
            console.log('[Internet] Method 3: Checking Cloudflare...');
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);  // 5 detik
        
        const response = await fetch('https://1.1.1.1/dns-query', {
            method: 'HEAD',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            if (process.env.DEBUG === 'true') {
                console.log('[Internet] Method 3: ✅ Connected via Cloudflare');
            }
            return true;
        }
    } catch (error) {
        if (process.env.DEBUG === 'true') {
            console.log('[Internet] Method 3: ❌ Failed');
        }
        // Method 3 gagal
    }
    
    // Semua method gagal = tidak ada internet
    if (process.env.DEBUG === 'true') {
        console.log('[Internet] ❌ All methods failed - No internet connection');
    }
    return false;
}
