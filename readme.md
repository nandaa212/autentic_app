auth-praktikum
Project ini dibuat buat praktikum Pemrograman Mobile Lanjut materi Authentication & Authorization. Intinya kita bikin aplikasi React Native yang bisa login pakai Firebase, lengkap sama fitur-fitur keamanan tambahan.
Stack yang dipakai

React Native + Expo (blank template)
Firebase Authentication
expo-secure-store buat nyimpen token dengan aman
expo-local-authentication buat biometric
React Navigation buat navigasi antar screen


Fitur Utama

Register & Login email/password
Verifikasi email setelah register
Reset password lewat email
Protected routes — kalau belum login otomatis diarahin ke halaman login
Token JWT disimpan di SecureStore, bukan AsyncStorage biasa


Tugas Mandiri
Dari 4 pilihan yang ada, saya pilih 2 fitur yaitu biometric login dan auto-logout saat idle.

Fitur 1 — Biometric Login
Jadi idenya gini, daripada user harus ketik email sama password tiap kali buka app, mereka bisa langsung login pakai fingerprint atau face ID. Tapi ada syaratnya — harus login pakai email/password dulu minimal sekali, karena biometric ini sebenernya cuma "membuka kunci" token yang udah tersimpan sebelumnya di SecureStore.
Alurnya kayak gini:

Pertama kali user login pakai email/password seperti biasa
Token dari Firebase otomatis disimpan ke SecureStore lewat AuthContext
Lain waktu buka app, user tinggal tekan tombol Login dengan Biometric
App ngecek dulu — apakah HP support biometric? Apakah fingerprint/face ID udah didaftarkan?
Kalau semua oke, prompt fingerprint atau face ID langsung muncul dari sistem
Kalau berhasil, langsung masuk ke app

Yang perlu diperhatiin, biometric ini bukan nggantiin password sepenuhnya. Token tetap harus valid di server. Jadi kalau token expired atau user logout, biometric nggak bisa dipake sampai login email/password lagi.
Kode utamanya ada di src/screens/LoginScreen.js:
jsconst result = await LocalAuthentication.authenticateAsync({
  promptMessage: 'Login dengan biometric',
  fallbackLabel: 'Gunakan password',
  cancelLabel: 'Batal',
});

if (result.success) {
  // token masih ada, langsung masuk app
} else {
  Alert.alert('Gagal', 'Biometric tidak cocok.');
}

Fitur 2 — Auto-Logout saat Idle
Fitur ini buat keamanan tambahan. Jadi kalau user udah login tapi nggak ngapa-ngapain selama 5 menit, app otomatis logout sendiri. Berguna banget buat kasus kayak user lupa logout terus ninggalin HP-nya.
Cara kerjanya pakai AppState dari React Native buat deteksi kondisi app. Setiap kali app balik ke foreground, timer di-reset dari awal. Nah kalau timer habis duluan sebelum ada aktivitas, fungsi logout() dipanggil otomatis.
Semua logicnya ditaro di AuthContext biar bisa diakses dari mana aja tanpa harus duplikasi kode di setiap screen.
Kode utamanya ada di src/contexts/AuthContext.js:
jsconst resetTimer = () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    await logout();
  }, 5 * 60 * 1000); // 5 menit
};

AppState.addEventListener('change', (state) => {
  if (state === 'active') resetTimer();
});

Untuk demo, timer saya set ke 10 detik dulu biar gampang dicoba. Tinggal ganti ke 5 * 60 * 1000 kalau mau yang beneran 5 menit.


Cara Jalankan
bash# clone dulu
git clone https://github.com/username/auth-praktikum.git
cd auth-praktikum

# install dependencies
npm install
npx expo install expo-secure-store expo-local-authentication

# isi firebase config di src/config/firebase.js sesuai project kalian

# jalankan
npx expo start
Untuk test biometric harus pakai HP fisik ya, di emulator nggak bakal jalan.

Struktur Folder
auth-praktikum/
├── App.js
├── app.json
└── src/
    ├── config/
    │   └── firebase.js
    ├── contexts/
    │   └── AuthContext.js
    └── screens/
        ├── LoginScreen.js
        ├── RegisterScreen.js
        ├── ForgotPasswordScreen.js
        └── HomeScreen.js

Hal yang perlu diperhatiin

Biometric baru bisa dipakai setelah login email/password minimal sekali
Pastikan fingerprint atau face ID sudah didaftarkan di pengaturan HP sebelum nyoba fitur biometric
Token disimpan di Keychain (iOS) / Keystore (Android) lewat expo-secure-store, jadi lebih aman dibanding AsyncStorage yang plaintext

link video : https://drive.google.com/drive/folders/1_lycNxJM_wPnTs8fS4A5MF1ianuZJ10S 