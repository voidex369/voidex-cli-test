import { safePush } from '../src/utils/safeGit.js';

async function main() {
    try {
        // Ganti dengan pesan commit Anda
        const commitMessage = "Initial commit: VoidEx CLI v1.0.1 - Update dependencies";
        
        console.log('🚀 Starting git push with 15-second delay...');
        console.log(`📝 Commit message: "${commitMessage}"`);
        console.log('⏳ Waiting 15 seconds before push...');
        
        await safePush(commitMessage);
        
        console.log('✅ Git push completed successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

main();