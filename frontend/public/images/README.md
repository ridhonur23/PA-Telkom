# Background Images Guide

## Cara Menambahkan Background Gambar

### 1. Simpan gambar di folder ini (`public/images/`)

### 2. Pilih salah satu opsi berikut:

## Opsi A: Background Halaman Login
**File:** `src/index.css` - class `.login-container`
**Gambar yang dibutuhkan:** `telkom-background.jpg`
**Ukuran ideal:** 1920x1080px atau lebih
**Format:** JPG, PNG, WEBP

```css
.login-container {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.8) 0%, rgba(200, 35, 51, 0.8) 100%), 
              url('/images/telkom-background.jpg') center center / cover no-repeat;
}
```

## Opsi B: Background Seluruh Aplikasi
**File:** `src/index.css` - tag `body`
**Gambar yang dibutuhkan:** `telkom-pattern.png`
**Ukuran ideal:** 200x200px (untuk pattern/texture)
**Format:** PNG (dengan transparansi)

```css
body {
  background: url('/images/telkom-pattern.png') repeat;
}
```

## Opsi C: Background Area Konten Utama
**File:** `src/index.css` - class `.main-content`
**Gambar yang dibutuhkan:** `telkom-watermark.png`
**Ukuran ideal:** 500x500px (logo/watermark)
**Format:** PNG (dengan transparansi)

```css
.main-content {
  background: linear-gradient(rgba(248, 249, 250, 0.9), rgba(248, 249, 250, 0.9)), 
              url('/images/telkom-watermark.png') center center / contain no-repeat fixed;
}
```

### Langkah-langkah:
1. Letakkan file gambar di folder `public/images/`
2. Buka file `src/index.css`
3. Uncomment (hapus `/*` dan `*/`) pada baris CSS yang diinginkan
4. Sesuaikan nama file gambar dengan yang Anda upload
5. Restart development server jika diperlukan

### Tips:
- Gunakan format WEBP untuk performa terbaik
- Kompres gambar untuk loading yang lebih cepat
- Untuk login background, gunakan gambar landscape
- Untuk watermark, gunakan gambar dengan transparansi
