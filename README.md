# SDN SERUA 02 - Sistem Informasi Akademik

Aplikasi web manajemen akademik untuk SDN SERUA 02. Proyek ini dibangun menggunakan Next.js App Router dengan TypeScript, Tailwind CSS, MongoDB, NextAuth, UploadThing, dan Mongoose.

## 🧠 Ringkasan Proyek

Aplikasi ini menyediakan portal sekolah untuk:
- manajemen data siswa
- manajemen data guru
- pencatatan absensi siswa dan guru
- pengelolaan nilai akademik dan ekstrakurikuler
- bank data digital untuk file dokumen

Sistem dibangun sebagai aplikasi full-stack Next.js yang memisahkan logika backend dan frontend, dengan fokus pada keamanan, otentikasi, dan peran pengguna.

## 🏗️ Arsitektur Utama

Proyek terbagi menjadi dua bagian:
1. **Backend**: API route, otentikasi, koneksi database, model Mongoose, dan server actions.
2. **Frontend**: halaman landing, login, dashboard, dan antarmuka CRUD untuk data sekolah.

Dokumen ini menjelaskan alur pembuatan dari backend ke frontend sesuai permintaan.

---

## 🔧 Backend

### 1. Koneksi Database

- File: `components/lib/db.ts`
- Digunakan Mongoose untuk menghubungkan `MONGODB_URI` ke MongoDB.
- Koneksi disimpan dalam cache global sehingga tidak dibuat ulang setiap kali server dipanggil.

### 2. Model & Skema

- `components/lib/models.ts` menyimpan model utama:
  - `User` untuk akun guru/admin/kepsek
  - `Student` untuk data siswa
  - `Attendance` untuk absensi guru
  - `Grade` untuk nilai siswa
  - `ClassRoom` untuk relasi wali kelas
  - `GudangData` untuk file unggahan

- Ada model tambahan terpisah di `components/lib/models/` untuk:
  - `Students.ts`
  - `AbsensiSiswa.ts`
  - `NilaiSiswa.ts`

### 3. Enkripsi & Keamanan Data

- File: `components/lib/encryption.ts`
- `encrypt()` dan `decrypt()` menggunakan AES-256-CBC untuk menyimpan beberapa field sensitif secara terenkripsi.
- `hashEmail()` membuat hash SHA-256 dari email untuk pencarian akun yang aman.

### 4. Otentikasi NextAuth

- File: `components/lib/auth.ts`
- `NextAuth` dengan `CredentialsProvider` untuk login menggunakan email + password.
- Password disimpan hashed dengan `bcryptjs`.
- Email juga di-hash untuk menyembunyikan alamat asli di database.
- Session JWT menyimpan `id`, `name`, dan `role` pengguna.
- Halaman login dikonfigurasi di `pages: { signIn: "/login" }`.

### 5. API Routes

- `app/api/auth/[...nextauth]/route.ts`
  - Menyediakan endpoint NextAuth untuk login dan session.
- `app/api/uploadthing/core.ts` dan `app/api/uploadthing/route.ts`
  - Mengonfigurasi UploadThing untuk mengunggah file dokumen dan gambar.
  - Endpoint uploader: `guruUploader`.

### 6. Logika Business (Server Actions)

- File: `components/lib/actions.ts`
- Memuat logika CRUD yang dipanggil langsung oleh frontend App Router.

Beberapa fungsionalitas utama:
- `getTeacher`, `saveTeacher`, `deleteTeacher`
- `getStudentsFiltered`, `addStudents`, `updateStudents`, `deleteStudent`, `searchStudents`
- `getAbsensiRecord`, `saveBulkAbsensi`
- `getGNilaiRecord`, `saveBulkNilai`
- `getStudentAttendanceMonthlyRecap`, `getStudentNilaiMonthlyRecap`
- `getTeacherAttendanceMonthlySummary`, `saveTeacherAttendance`
- `simpanDataGudang`, `getGudangDataGuru`, `deleteDataGudang`, `getStorageStats`

Logika ini juga menggunakan:
- `revalidatePath()` dari `next/cache` untuk menyegarkan halaman dashboard setelah mutasi data.

### 7. Kode Keamanan & Akses

- `app/dashboard/layout.tsx` memeriksa session menggunakan `getServerSession(authOptions)`.
- Jika tidak login, pengguna diarahkan kembali ke halaman utama.
- `DashboardWrapper` mengatur layout dan kontrol sidebar sesuai peran pengguna.

---

## 🎨 Frontend

### 1. Teknologi Frontend

- `next` (App Router)
- `react` dan `typescript`
- `tailwindcss` v4
- `lucide-react` untuk ikon
- `motion` untuk animasi ringan
- `react-hot-toast` untuk notifikasi (dipasang, meskipun penggunaan eksplisit bisa dilihat pada implementasi lain)

### 2. Struktur Halaman Utama

- `app/page.tsx`: landing page utama dengan CTA ke `login`.
- `app/login/page.tsx`: halaman autentikasi dengan formulari email/password.
- `app/layout.tsx`: global layout, font, dan script tema.
- `app/Providers.tsx`: pembungkus provider (tidak disorot di file, tetapi digunakan untuk context global jika ada).

### 3. Layout Dashboard

- `app/dashboard/layout.tsx`: proteksi route dan pembungkus dashboard.
- `components/dasboardWrapper.tsx`: sidebar responsif, header mobile, area konten utama.
- `components/sidebarNav.tsx`: navigasi peran berbasis `admin`, `guru`, dan `kepsek`.
- `components/logoutButton.tsx`: tombol logout.

### 4. Halaman Dashboard

Bagian utama dashboard terdiri atas:

- `app/dashboard/page.tsx`
  - Halaman ringkasan utama dengan navigasi cepat dan statistik dasar.
- `app/dashboard/siswa/page.tsx`
  - Kelola data siswa, filter kelas/rombel, cari siswa, tambah/edit/hapus siswa.
- `app/dashboard/guru/page.tsx`
  - Kelola profil guru, foto profil, status aktif/nonaktif, detail guru.
- `app/dashboard/absensi/page.tsx`
  - Catat absensi siswa per kelas/rombel untuk tanggal tertentu.
- `app/dashboard/nilai/page.tsx`
  - Input nilai akademik dan nilai ekskul per siswa.
- `app/dashboard/gudang/page.tsx`
  - Bank data file dengan upload, daftar file, download, dan hapus.

Halaman lain yang mendukung rekapan:
- `app/dashboard/absensi-guru/`
- `app/dashboard/rekap/`
- `app/dashboard/rekap-absensi-guru/`

Meski konten spesifik halaman tidak seluruhnya dibaca di dokumentasi ini, struktur navigasi jelas menunjuk tujuan fungsional masing-masing.

### 5. Fitur Frontend Khusus

- Role-based navigation: admin, guru, kepsek melihat menu berbeda.
- Responsive sidebar dan menu mobile.
- Mode theme diinisialisasi melalui script di `app/layout.tsx`.
- Formulir menggunakan state React untuk data siswa, guru, absensi, nilai, dan bank data.
- Komponen `UploadDropZone` integrasi dengan UploadThing untuk upload file.

---

## 🚀 Proses Build & Jalankan

### Setup Awal

1. Install dependensi:

```bash
npm install
```

2. Siapkan environment variables di `.env`:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret_value
ENCRYPTION_KEY=32_characters_or_more_secret_key
```

3. Pastikan juga konfigurasi UploadThing tersedia sesuai dokumentasi package.

### Mode Pengembangan

```bash
npm run dev
```

Buka `http://localhost:3000`.

### Produksi

```bash
npm run build
npm start
```

### Perintah Lain

- `npm run lint` — menjalankan ESLint.

---

## 📁 Struktur Direktori Utama

- `app/`
  - `page.tsx` — halaman landing.
  - `login/page.tsx` — login.
  - `dashboard/` — area aplikasi terproteksi.
  - `api/` — route backend untuk autentikasi dan upload.
- `components/`
  - `dasboardWrapper.tsx` — layout dashboard.
  - `sidebarNav.tsx`, `logoutButton.tsx` — UI navigasi.
  - `lib/` — backend logic dan helper.
- `public/` — aset statis.
- `next.config.ts` — konfigurasi Next.js.
- `tsconfig.json` — konfigurasi TypeScript.

---

## ✅ Ringkasan Fungsional

Aplikasi ini mendukung:
- Login dan proteksi dashboard
- Role-based access control
- Manajemen data siswa dan guru
- Absensi siswa dan guru
- Input nilai akademik dan ekskul
- Rekap nilai dan absensi
- Upload dan pengelolaan dokumen digital
- Enkripsi data sensitif di database

## 📌 Catatan Tambahan

- Semua data backend berinteraksi dengan MongoDB.
- Koneksi database menggunakan cache global untuk performa.
- Bagian upload file dikelola oleh UploadThing.
- Sistem menyimpan email dan beberapa field sensitif secara terenkripsi.

---

## 📘 Saran Pengembangan Selanjutnya

- Tambahkan validasi di server dan client untuk setiap form.
- Lengkapi halaman `rekap` dan `absensi-guru` bila belum terisi penuh.
- Tambahkan unit test atau integrasi test untuk keamanan login dan CRUD.
- Tambahkan middleware role-based access jika diperlukan untuk proteksi lebih ketat.

---

## Penutup

README ini mencakup detail backend, frontend, alur build, dan struktur yang diperlukan untuk memahami aplikasi SDN SERUA 02. Jika perlu, saya bisa bantu membuat bagian dokumentasi API atau flow chart arsitektur lebih lanjut.
