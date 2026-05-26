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


tugas baru 
# auth-praktikum

Project ini dibuat buat praktikum Pemrograman Mobile Lanjut materi Authentication & Authorization dan Firebase Integration. Intinya kita bikin aplikasi React Native yang bisa login pakai Firebase, lengkap sama fitur chat real-time, upload foto profil, push notification, dan beberapa fitur keamanan tambahan.

## Stack yang dipakai

- React Native + Expo (blank template)
- Firebase Authentication
- Firebase Firestore (database real-time)
- Firebase Storage (upload foto)
- expo-secure-store buat nyimpen token dengan aman
- expo-local-authentication buat biometric
- expo-notifications buat push notification
- React Navigation buat navigasi antar screen

---

## Struktur Folder

```
auth-praktikum/
├── App.js
├── app.json
└── src/
    ├── config/
    │   └── firebase.js
    ├── contexts/
    │   └── AuthContext.js
    ├── utils/
    │   └── notifications.js
    └── screens/
        ├── LoginScreen.js
        ├── RegisterScreen.js
        ├── ForgotPasswordScreen.js
        ├── HomeScreen.js
        ├── ChatScreen.js
        └── ProfileScreen.js
```

---

## Fitur Utama

- Register & Login email/password
- Verifikasi email setelah register
- Reset password lewat email
- Protected routes — kalau belum login otomatis diarahin ke halaman login
- Token JWT disimpan di SecureStore, bukan AsyncStorage biasa

---

## Tugas Mandiri

Dari pilihan yang ada, saya mengerjakan beberapa fitur tambahan berikut.

---

### Fitur 1 — Biometric Login

Daripada user harus ketik email sama password tiap kali buka app, mereka bisa langsung login pakai fingerprint atau face ID. Tapi ada syaratnya — harus login pakai email/password dulu minimal sekali, karena biometric ini sebenernya cuma "membuka kunci" token yang udah tersimpan sebelumnya di SecureStore.

Alurnya kayak gini:
1. Pertama kali user login pakai email/password seperti biasa
2. Token dari Firebase otomatis disimpan ke SecureStore lewat AuthContext
3. Lain waktu buka app, user tinggal tekan tombol **Login dengan Biometric**
4. App ngecek dulu apakah HP support biometric dan sudah terdaftar
5. Kalau semua oke, prompt fingerprint atau face ID langsung muncul dari sistem
6. Kalau berhasil, langsung masuk ke app

Yang perlu diperhatiin, biometric ini bukan nggantiin password sepenuhnya. Token tetap harus valid di server. Jadi kalau token expired atau user logout, biometric nggak bisa dipakai sampai login email/password lagi.

**File:** `src/screens/LoginScreen.js`

```js
const result = await LocalAuthentication.authenticateAsync({
  promptMessage: 'Login dengan biometric',
  fallbackLabel: 'Gunakan password',
  cancelLabel: 'Batal',
});
```

---

### Fitur 2 — Auto-Logout saat Idle

Kalau user udah login tapi nggak ngapa-ngapain selama beberapa menit, app otomatis logout sendiri. Berguna banget buat kasus kayak user lupa logout terus ninggalin HP-nya.

Cara kerjanya pakai `AppState` dari React Native buat deteksi kondisi app. Setiap kali app balik ke foreground, timer di-reset dari awal. Kalau timer habis duluan sebelum ada aktivitas, fungsi `logout()` dipanggil otomatis. Semua logicnya ditaro di `AuthContext` biar bisa diakses dari mana aja.

**File:** `src/contexts/AuthContext.js`

```js
timer = setTimeout(async () => {
  await logout();
}, 5 * 60 * 1000); // 5 menit
```

> Untuk demo, timer diset ke 10 detik biar gampang dicoba. Tinggal ganti ke `5 * 60 * 1000` untuk production.

---

### Fitur 3 — Real-time Chat

User bisa kirim pesan ke semua user yang login. Pesan langsung muncul tanpa perlu refresh — ini karena kita pakai `onSnapshot` dari Firestore yang nge-listen perubahan data secara real-time. Setiap pesan baru langsung di-push ke semua device yang lagi subscribe ke collection `messages`.

Struktur data di Firestore:
```
messages/
  {msgId}/
    text: string
    senderId: string
    senderEmail: string
    timestamp: Timestamp
```

**File:** `src/screens/ChatScreen.js`

```js
const unsubscribe = onSnapshot(q, (snapshot) => {
  const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  setMessages(msgs);
});
return () => unsubscribe(); // cleanup saat unmount
```

---

### Fitur 4 — Upload Foto Profil

User bisa ganti foto profil dari galeri HP. Fotonya diupload ke Firebase Storage, terus URL-nya disimpan ke Firestore di collection `users`. Jadi foto profil user bisa diakses dari mana aja dan persisten.

Alurnya:
1. User tap foto / tombol pilih foto
2. Galeri terbuka, user pilih gambar
3. Gambar dikonversi ke blob
4. Di-upload ke Firebase Storage dengan path `profiles/{uid}.jpg`
5. Setelah upload selesai, ambil URL download
6. URL disimpan ke Firestore field `photoURL`

**File:** `src/screens/ProfileScreen.js`

```js
const storageRef = ref(storage, `profiles/${user.uid}.jpg`);
await uploadBytes(storageRef, blob);
const url = await getDownloadURL(storageRef);
await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
```

---

### Fitur 5 — Online Status

Setiap user punya field `isOnline` di Firestore yang update otomatis. Waktu user buka app nilainya jadi `true`, waktu app di-background atau user logout langsung berubah jadi `false`. Ini berguna buat fitur "lihat siapa yang lagi online" di chat.

Cara kerjanya pakai `AppState` listener yang sama dengan auto-logout, tapi buat update status online ke Firestore.

**File:** `src/contexts/AuthContext.js`

```js
AppState.addEventListener('change', async (state) => {
  if (state === 'active') {
    await updateDoc(doc(db, 'users', uid), { isOnline: true });
  } else {
    await updateDoc(doc(db, 'users', uid), { isOnline: false });
  }
});
```

---

### Fitur 6 — Push Notification

Kalau ada pesan baru masuk dari orang lain di chat, user dapat notifikasi — bahkan waktu app lagi di background. Caranya pakai `expo-notifications` untuk minta izin dan ambil push token, terus token-nya disimpan ke Firestore. Waktu ada pesan baru terdeteksi lewat `onSnapshot`, langsung trigger notifikasi lokal.

**File:** `src/utils/notifications.js` dan `src/screens/ChatScreen.js`

```js
snapshot.docChanges().forEach(change => {
  if (change.type === 'added') {
    const msg = change.doc.data();
    if (msg.senderId !== user.uid) {
      sendLocalNotification(
        msg.senderEmail?.split('@')[0],
        msg.text
      );
    }
  }
});
```

---

## Cara Jalankan

```bash
# clone dulu
git clone https://github.com/username/auth-praktikum.git
cd auth-praktikum

# install dependencies
npm install
npx expo install expo-secure-store expo-local-authentication
npx expo install expo-notifications expo-device
npx expo install expo-image-picker

# isi firebase config di src/config/firebase.js

# jalankan
npx expo start
```

> Untuk test biometric dan push notification harus pakai HP fisik ya, di emulator nggak bakal jalan.

---

## Firestore Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /messages/{msgId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Hal yang perlu diperhatiin

- Biometric baru bisa dipakai setelah login email/password minimal sekali
- Pastikan fingerprint atau face ID sudah didaftarkan di pengaturan HP sebelum nyoba fitur biometric
- Token disimpan di Keychain (iOS) / Keystore (Android) lewat expo-secure-store, jadi lebih aman dibanding AsyncStorage yang plaintext
- Push notification butuh izin dari user saat pertama kali buka app
- Upload foto profil butuh izin akses galeri