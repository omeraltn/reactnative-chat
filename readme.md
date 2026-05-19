# 📱 React Native Sohbet Uygulaması

## 🎯 Proje Amacı

Kullanıcıların kayıt olup giriş yapabildiği, gerçek zamanlı mesajlaşabildiği ve aktif sohbetleri yönetebildiği hafif, modern bir mobil sohbet uygulamasıdır.

## 🛠️ Kullanılan Teknolojiler

- **React Native & Expo:** Çapraz platform mobil geliştirme
- **Firebase:** Authentication (kimlik doğrulama) & Firestore (gerçek zamanlı veritabanı)
- **React Navigation:** Stack & Bottom Tab yönlendirme
- **React Native Paper:** Hazır, tutarlı UI bileşenleri
- **React Hooks:** `useState`, `useEffect`, `useRef` ile durum yönetimi

## 🧩 Temel Yöntemler ve Mimari

- **Gerçek Zamanlı Senkronizasyon:** `onSnapshot` dinleyicileri ile sohbet listesi ve mesajlar anlık güncellenir.
- **Modüler Yapı:** Firebase konfigürasyonu (`firebaseConfig`) ayrı dosyada yönetilir; `auth` ve `db` referansları merkezi ve güvenlidir.
- **Veri Modeli:** Firestore `chats` koleksiyonu; `messages` dizisi, `lastMessage` ve `updatedAt` alanlarıyla sıralama ve önizleme sağlar.
- **Performans & UX:** `FlatList` ile verimli liste render, `KeyboardAvoidingView` ile klavye uyumlu input, `SafeAreaView` ile ekran güvenli alanı.
- **Dinamik Navigasyon:** `onAuthStateChanged` ile kullanıcı durumuna göre yönlendirme (`Auth Stack` ↔ `Tabs + Chat`). Giriş sonrası `ChatList` ve `Setting` sekmeleri, mesajlaşma için `Chat` ekranı aktif olur.

## Ekran Görüntüsü

![]()
