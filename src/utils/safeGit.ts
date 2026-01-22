import { execSync } from 'child_process';

/**
 * Helper function untuk membuat delay
 * @param ms - Waktu delay dalam milidetik
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Melakukan git push dengan aman menggunakan delay
 * untuk mencegah akun GitHub terkena suspend karena spamming
 * 
 * @param commitMsg - Pesan commit yang akan digunakan
 */
export async function safePush(commitMsg: string): Promise<void> {
    try {
        console.log('🚀 Memulai proses git push yang aman...\n');

        // 1. Git add .
        console.log('📝 Menambahkan semua file ke staging area...');
        execSync('git add .', { stdio: 'inherit' });
        console.log('✅ File berhasil ditambahkan ke staging area\n');

        // 2. Git commit -m "Pesan"
        console.log(`📝 Membuat commit dengan pesan: "${commitMsg}"`);
        execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
        console.log('✅ Commit berhasil dibuat\n');

        // 3. Tampilkan log: "⏳ Menunggu 15 detik sebelum push demi keamanan akun..."
        console.log('⏳ Menunggu 15 detik sebelum push demi keamanan akun...');
        console.log('    Jeda ini untuk mencegah GitHub mendeteksi aktivitas mencurigakan.\n');

        // 4. Jalankan await sleep(15000) (Wajib ada delay 15 detik)
        await sleep(15000);

        // 5. Git push origin main (atau branch aktif saat ini)
        console.log('📤 Mencoba untuk push ke remote repository...\n');
        
        try {
            // Coba push ke branch main
            execSync('git push origin main', { stdio: 'inherit' });
            console.log('\n✅ Push ke branch main berhasil!');
        } catch (error) {
            // Jika branch main tidak ada, coba push ke branch yang aktif saat ini
            console.log('\n⚠️  Branch "main" tidak ditemukan, mencoba push ke branch yang aktif saat ini...');
            
            // Dapatkan nama branch yang aktif saat ini
            const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
            console.log(`   Branch yang aktif: ${currentBranch}\n`);
            
            // Push ke branch yang aktif
            execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
            console.log(`\n✅ Push ke branch "${currentBranch}" berhasil!`);
        }

        console.log('\n🎉 Proses git push yang aman selesai!');

    } catch (error) {
        console.error('\n❌ Error saat melakukan git push:');
        
        if (error instanceof Error) {
            console.error(`   ${error.message}`);
            
            // Cek jika error adalah karena conflicts
            if (error.message.includes('merge conflict') || error.message.includes('conflict')) {
                console.error('\n⚠️  Terdeteksi merge conflict. Silakan resolve conflict terlebih dahulu.');
                console.error('    Setelah itu, jalankan perintah:');
                console.error('    git add .');
                console.error('    git commit -m "Fix conflicts"');
                console.error('    git push origin <branch>');
            }
            
            // Cek jika error adalah karena tidak ada komit untuk di push
            if (error.message.includes('no commits to push') || error.message.includes('up-to-date')) {
                console.error('\n⚠️  Tidak ada perubahan yang perlu di push.');
                console.error('    Semua file sudah terkirim atau up-to-date.');
            }
            
            // Cek jika error adalah karena tidak ada remote
            if (error.message.includes('remote') || error.message.includes('origin')) {
                console.error('\n⚠️  Remote repository tidak ditemukan.');
                console.error('    Pastikan Anda sudah menambahkan remote repository.');
                console.error('    Contoh: git remote add origin <url-repo>');
            }
        } else {
            console.error(`   ${error}`);
        }
        
        console.error('\n❌ Proses git push gagal!');
        throw error;
    }
}