# Sistem Pendukung Keputusan (SPK) - Metode SAW

Aplikasi ini adalah Sistem Pendukung Keputusan (SPK) berbasis web yang menggunakan metode **Simple Additive Weighting (SAW)**. Studi kasus default pada aplikasi ini ditujukan untuk menentukan harga atau pemilihan menu pada sebuah warung makan (seperti yang terlihat pada alternatif harga mulai dari Rp8.000 hingga Rp12.000).

## Fitur
- Menggunakan metode kalkulasi Simple Additive Weighting (SAW).
- Menampilkan langkah-langkah normalisasi matriks baik dalam bentuk pecahan maupun desimal.
- Validasi bobot kriteria (total bobot harus bernilai 1.00 atau 100%).
- Penentuan peringkat (ranking) alternatif terbaik berdasarkan nilai preferensi tertinggi.

## Persyaratan Sistem
Pastikan Anda telah menginstal perangkat lunak berikut di komputer Anda:
- Python 3.x
- Flask

## Cara Instalasi dan Menjalankan Aplikasi

1. **Clone atau Unduh Repository**
   Pastikan seluruh file (`app.py`, folder `static`, dan folder `templates`) berada dalam satu folder yang sama.

2. **Instalasi Dependensi**
   Buka terminal atau command prompt, lalu instal Flask (jika belum ada) dengan perintah:
   ```bash
   pip install Flask
   ```

3. **Menjalankan Aplikasi**
   Jalankan file `app.py` menggunakan Python:
   ```bash
   python app.py
   ```

4. **Akses Aplikasi melalui Browser**
   Buka web browser Anda (Chrome, Firefox, dll) dan akses URL berikut:
   ```
   http://127.0.0.1:5000/
   ```

## User Manual (Panduan Penggunaan)

Setelah aplikasi terbuka di browser, Anda akan melihat halaman antarmuka SPK. Berikut adalah cara penggunaannya:

### 1. Menentukan Kriteria (Criteria)
Di bagian ini, Anda dapat melihat atau mengubah kriteria yang digunakan untuk penilaian.
- **Nama Kriteria**: Masukkan nama kriteria (misal: Biaya Produksi, Kualitas, dll).
- **Sifat Kriteria (Tipe)**:
  - **Benefit (Keuntungan)**: Pilih jika nilai kriteria yang lebih besar menguntungkan (misal: Kualitas, Keuntungan yang Diinginkan).
  - **Cost (Biaya)**: Pilih jika nilai kriteria yang lebih kecil lebih baik (misal: Biaya Produksi).
- **Bobot (Weight)**: Tentukan bobot untuk masing-masing kriteria. **Penting:** Total keseluruhan bobot kriteria harus **tepat 1.00** (atau 100%). Jika tidak, sistem akan menolak kalkulasi dan memunculkan pesan error.

### 2. Menentukan Alternatif (Alternatives)
Bagian ini digunakan untuk memasukkan daftar pilihan/alternatif yang akan dinilai.
- **Nama Alternatif**: Nama pilihan (misal: A1 (8.000), A2 (9.000), dll).
- **Nilai**: Masukkan nilai skor untuk setiap alternatif berdasarkan masing-masing kriteria. Urutan nilai harus sesuai dengan urutan kriteria yang telah ditentukan di atas.

### 3. Melakukan Kalkulasi
- Setelah semua Kriteria dan Alternatif terisi dengan benar, klik tombol **Hitung** (atau Submit/Calculate) pada bagian bawah.
- Sistem akan memproses data menggunakan metode SAW secara otomatis:
  1. Membentuk matriks keputusan.
  2. Melakukan normalisasi matriks (disesuaikan dengan sifat *Benefit* atau *Cost*).
  3. Mengalikan matriks ternormalisasi dengan bobot kriteria.
  4. Menjumlahkan nilai untuk mendapatkan skor akhir (Nilai Preferensi).

### 4. Membaca Hasil
Setelah proses kalkulasi berhasil, sistem akan menampilkan hasil perhitungan:
- **Tabel Normalisasi**: Menunjukkan nilai perhitungan masing-masing data yang sudah diubah ke dalam skala 0 - 1 (ditampilkan juga dalam bentuk pecahan dan desimal agar mudah dipahami).
- **Hasil Akhir dan Peringkat**: Alternatif dengan nilai total/skor tertinggi akan mendapatkan peringkat (Ranking) 1. Ini merupakan keputusan atau rekomendasi alternatif terbaik yang dihasilkan oleh sistem.

## Penanganan Masalah (Troubleshooting)
- **Error: "Total bobot harus = 1.00"**: Pastikan jumlah seluruh bobot kriteria yang Anda masukkan ketika dijumlahkan hasilnya persis 1.0 (misal: 0.30 + 0.15 + 0.15 + 0.15 + 0.25 = 1.00).
- **Aplikasi tidak bisa diakses di browser**: Pastikan tidak ada aplikasi lain yang menggunakan port `5000` di komputer Anda, dan terminal/command prompt yang menjalankan `python app.py` tidak dalam keadaan ditutup/di-close.

---
*Aplikasi ini dikembangkan sebagai implementasi Sistem Pendukung Keputusan menggunakan metode SAW dengan framework Python Flask.*
