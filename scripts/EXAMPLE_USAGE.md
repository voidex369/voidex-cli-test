# 📚 Contoh Penggunaan Safe Git Push

## 🎯 Cara Mudah Menggunakan

### 1. Dengan npm script (REKOMENDASI)

```bash
# Push dengan pesan commit
npm run push-safe -- "Initial commit: Update fitur"

# Contoh lain:
npm run push-safe -- "Fix: Memperbaiki bug di help menu"
npm run push-safe -- "Feat: Menambahkan fitur git push aman"
npm run push-safe -- "Update: Mengganti model default Xiaomi ke Google"
```

### 2. Dengan TypeScript

```bash
# Jalankan script TypeScript
npx tsx scripts/push-safe.ts
```

### 3. Dengan command line

```bash
# Gunakan langsung dari command line
node scripts/git-delay.js "Pesan commit Anda"
```

## 📝 CONTOH NYATA

### Contoh 1: Push setelah fix bug
```bash
# 1. Edit file Anda
nano src/utils/safeGit.ts

# 2. Build project
npm run build

# 3. Push dengan aman
npm run push-safe -- "Fix: Tambah error handling di safeGit.ts"
```

### Contoh 2: Push setelah update model
```bash
# 1. Update model di config.ts
nano src/lib/config.ts

# 2. Build project
npm run build

# 3. Push dengan aman
npm run push-safe -- "Update: Ganti model Xiaomi ke Google (stable)"
```

### Contoh 3: Push dari script TypeScript
```bash
# Jalankan script TypeScript
npx tsx scripts/push-safe.ts
```

## 📊 OUTPUT YANG DIHARAPKAN

### ✅ Success:
```
🚀 Git Push dengan Delay 15 detik
📝 Pesan: "Initial commit: Update fitur"
⏳ Menunggu 15 detik...

📝 Menambahkan semua file ke staging area...
✅ File berhasil ditambahkan ke staging area

📝 Membuat commit dengan pesan: "Initial commit: Update fitur"
✅ Commit berhasil dibuat

⏳ Menunggu 15 detik sebelum push demi keamanan akun...
    Jeda ini untuk mencegah GitHub mendeteksi aktivitas mencurigakan.

📤 Mencoba untuk push ke remote repository...

✅ Push ke branch main berhasil!

🎉 Proses git push yang aman selesai!
✅ Proses selesai!
```

### ❌ Error:
```
🚀 Git Push dengan Delay 15 detik
📝 Pesan: "Initial commit: Update fitur"
⏳ Menunggu 15 detik...

❌ Error saat melakukan git push:
   [Error message]

❌ Proses git push gagal!
```

## ⚠️ PENTING!

### Sebelum melakukan push, pastikan:

1. **Cek status git:**
   ```bash
   git status
   ```

2. **Cek branch yang aktif:**
   ```bash
   git branch
   ```

3. **Cek remote:**
   ```bash
   git remote -v
   ```

4. **Pastikan tidak ada conflict:**
   ```bash
   git pull origin main
   ```

5. **Siap dengan pesan commit:**
   - Gunakan pesan yang jelas dan deskriptif
   - Format: `Type: Description` (contoh: `Fix: Memperbaiki bug`)

### Format pesan commit yang baik:

```
✅ Type: Description
❌ Type: Description

Contoh:
✅ Fix: Memperbaiki bug di help menu
✅ Feat: Menambahkan fitur git push aman
✅ Update: Mengganti model default
✅ Refactor: Bersihkan kode lama
✅ Docs: Update dokumentasi
```

## 🔧 TROUBLESHOOTING

### Problem 1: Conflict
```bash
# Resolve conflict terlebih dahulu
git add .
git commit -m "Fix: Resolve merge conflict"
# Baru push
npm run push-safe -- "Fix: Resolve conflict"
```

### Problem 2: Up-to-date
```
⚠️  Tidak ada perubahan yang perlu di push
```
**Solusi:** Lakukan perubahan file terlebih dahulu.

### Problem 3: Branch tidak ditemukan
```
⚠️  Branch "main" tidak ditemukan
```
**Solusi:** SafeGit akan otomatis mencari branch yang aktif.

## 🎯 BEST PRACTICES

1. **Selalu build sebelum push:**
   ```bash
   npm run build
   ```

2. **Gunakan pesan commit yang jelas:**
   - ✅ "Fix: Tambah error handling"
   - ❌ "Update"

3. **Cek status sebelum push:**
   ```bash
   git status
   git log --oneline -5
   ```

4. **Jangan force push tanpa yakin:**
   ```bash
   # ❌ JANGAN
   git push -f
   
   # ✅ AMAN
   git push
   ```

## 📚 SUMBER

- **Script utama:** `scripts/git-delay.js`
- **Script dev:** `scripts/push-safe.ts`
- **Fungsi:** `src/utils/safeGit.ts`
- **Panduan:** `GIT_PUSH_GUIDE.md`

---

**Happy pushing! 🚀**