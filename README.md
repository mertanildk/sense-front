# LiveApp — React Native Frontend

Canlı yayın platformu mobil uygulaması. iOS ve Android için React Native CLI + TypeScript.

---

## 📁 Proje Yapısı

```
src/
├── screens/
│   ├── Auth/
│   │   ├── LoginScreen.tsx          ✅ Tamamlandı
│   │   ├── RegisterScreen.tsx       ✅ Tamamlandı
│   │   └── ForgotPasswordScreen.tsx ✅ Tamamlandı
│   ├── Discover/
│   │   └── DiscoverScreen.tsx       ✅ Tamamlandı
│   ├── Stream/
│   │   ├── StreamViewScreen.tsx     ✅ Tamamlandı (3dk timer, yorumlar, hediyeler)
│   │   └── StreamBroadcastScreen.tsx ✅ Tamamlandı
│   ├── Room/
│   │   ├── RoomListScreen.tsx       ✅ Tamamlandı
│   │   ├── RoomCreateScreen.tsx     ✅ Tamamlandı
│   │   └── RoomViewScreen.tsx       ✅ Tamamlandı
│   └── Profile/
│       ├── ProfileScreen.tsx        ✅ Tamamlandı
│       ├── EditProfileScreen.tsx    ✅ Tamamlandı
│       ├── CoinShopScreen.tsx       ✅ Tamamlandı
│       └── PaymentHistoryScreen.tsx ✅ Tamamlandı
├── navigation/
│   └── index.tsx                    ✅ Tüm stack ve tab navigasyonu
├── store/
│   ├── authStore.ts                 ✅ Zustand auth store
│   └── streamStore.ts               ✅ Zustand stream store
├── services/
│   ├── api.ts                       ✅ Axios + token refresh interceptor
│   ├── authService.ts               ✅ Kimlik doğrulama API
│   ├── streamService.ts             ✅ Yayın API
│   └── socketService.ts             ✅ Socket.io gerçek zamanlı
├── theme/
│   └── index.ts                     ✅ Renkler, tipografi, spacing
├── types/
│   └── index.ts                     ✅ Tüm TypeScript tipleri
└── constants/
    └── index.ts                     ✅ API URL, sabitler
```

---

## 🚀 Kurulum

### 1. Proje oluştur

```bash
npx react-native init LiveApp --template react-native-template-typescript
cd LiveApp
```

### 2. Bu dosyaları kopyala

Repo'daki `src/`, `App.tsx`, `babel.config.js` dosyalarını projenin kök dizinine kopyala.

### 3. Bağımlılıkları yükle

```bash
npm install

# iOS için
cd ios && pod install && cd ..
```

### 4. Eksik package kur

```bash
npm install babel-plugin-module-resolver --save-dev
```

### 5. Android için `android/app/src/main/AndroidManifest.xml` izinleri

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

---

## ⚙️ Konfigürasyon

`src/constants/index.ts` dosyasını düzenle:

```ts
export const API_BASE_URL = 'https://api.yourdomain.com/api/v1';
export const WS_BASE_URL = 'wss://api.yourdomain.com';
```

---

## 🎥 Agora Entegrasyonu (Canlı Yayın)

1. [Agora.io](https://agora.io) hesabı aç, App ID al

2. Package kur:
```bash
npm install react-native-agora
cd ios && pod install
```

3. `StreamViewScreen.tsx` içindeki `videoArea`'ya Agora RtcEngine'i entegre et:
```tsx
import RtcEngine, { RtcLocalView, RtcRemoteView } from 'react-native-agora';

// Backend'den alınan agoraToken ile:
await engine.joinChannel(agoraToken, agoraChannel, null, uid);
```

4. Backend `POST /streams/{id}/join` endpoint'i Agora token döndürmeli.

---

## 💳 İyzico Entegrasyonu

1. [İyzico](https://iyzico.com) sandbox hesabı aç

2. `CoinShopScreen.tsx` içindeki `handlePurchase` fonksiyonuna:
```ts
// 1. Backend'e istek at, İyzico checkoutForm URL al
const { data } = await api.post('/payments/initiate', { packageId: pkg.id });

// 2. WebView ile ödeme sayfasını aç
// react-native-webview kullan
navigation.navigate('PaymentWebView', { url: data.checkoutFormUrl });
```

---

## 🧪 Çalıştır

```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

---

## 🗺️ Sıradaki Adımlar

- [ ] Agora SDK entegrasyonu
- [ ] İyzico WebView ödeme sayfası
- [ ] Push notification (Firebase)
- [ ] Deep link (özel oda davet linki)
- [ ] Lazy loading + infinite scroll (Keşfet)
- [ ] Animasyonlar (Reanimated)
- [ ] Hediye animasyonu (lottie)
