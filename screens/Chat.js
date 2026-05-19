import { useRoute } from "@react-navigation/native";
import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";

// Güncel Firebase Modüler Yapısı Importları
import { db, auth } from "../firebaseConfig"; // auth config içerisinden temizce alındı
import { doc, onSnapshot, updateDoc } from "firebase/firestore"; // updateDoc eklendi
import { GiftedChat } from "react-native-gifted-chat";

export default function Chat() {
  const route = useRoute();
  const [messages, setMessages] = useState([]);
  const [uid, setUID] = useState(null);
  const [name, setName] = useState("");

  const chatId = route?.params?.chatId;

  // 1. HATANIN DÜZELTİLDİĞİ YER: Temiz ve kurallara uygun Auth takibi
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUID(user.uid);
        setName(user.displayName || "Anonim");
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Firestore'dan mesajları anlık dinleyen temiz listener
  useEffect(() => {
    if (!chatId) return;

    const docRef = doc(db, "chats", chatId);

    const unsubscribeSnapshot = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          // GiftedChat tarih formatı olarak JavaScript Date nesnesi veya timestamp ister
          // Firestore'dan gelen mesaj dizisini ters çevirerek (en yeni en altta olacak şekilde) yönetebilirsiniz
          const firestoreMessages = snapshot.data()?.messages ?? [];

          // Eğer Firestore'daki timestamp nesneleri GiftedChat'te görünmezse
          // Date formatına map etmek gerekebilir. Şimdilik array-safe olarak aktarıyoruz:
          setMessages(firestoreMessages);
        }
      },
      (error) => {
        console.error("Mesajlar çekilirken hata oluştu: ", error);
      },
    );

    return () => unsubscribeSnapshot();
  }, [chatId]);

  // 2. HATANIN DÜZELTİLDİĞİ YER: Sytax hatasından arındırılmış, modüler v9 onSend yapısı
  const onSend = async (newMessages = []) => {
    if (!chatId) return;

    try {
      const docRef = doc(db, "chats", chatId);

      // GiftedChat.append mevcut mesaj listesine yenilerini ekler
      await updateDoc(docRef, {
        messages: GiftedChat.append(messages, newMessages),
      });
    } catch (error) {
      console.error("Mesaj gönderilirken Firestore hatası:", error);
    }
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: uid,
        name: name,
      }}
    />
  );
}
