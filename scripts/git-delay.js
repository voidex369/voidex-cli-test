#!/usr/bin/env node

import { safePush } from '../dist/utils/safeGit.js';

// Ambis pesan commit dari command line arguments
const commitMessage = process.argv[2] || 'Auto commit from VoidEx CLI';

console.log('🚀 Git Push dengan Delay 15 detik');
console.log(`📝 Pesan: "${commitMessage}"`);
console.log('⏳ Menunggu 15 detik...');

safePush(commitMessage)
    .then(() => {
        console.log('✅ Proses selesai!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });