import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from "react-native";

// Güncel Firebase Modüler Yapısı Importları
import { db, auth } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

export default function Chat() {
  const route = useRoute();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [uid, setUID] = useState(null);
  const flatListRef = useRef();

  const chatId = route?.params?.chatId;

  // Auth durum takibi
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUID(user.uid);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Firestore Dinleyicisi
  useEffect(() => {
    if (!chatId) return;

    const docRef = doc(db, "chats", chatId);

    const unsubscribeSnapshot = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const firestoreMessages = snapshot.data()?.messages ?? [];

          // Mesajları tarihe göre sırala (En yeni mesaj en altta olacak şekilde standart akış)
          const sorted = [...firestoreMessages].sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeA - timeB;
          });

          setMessages(sorted);
        }
      },
      (error) => {
        console.error("Mesajlar çekilirken hata oluştu: ", error);
      },
    );

    return () => unsubscribeSnapshot();
  }, [chatId]);

  // Mesaj Gönderme Fonksiyonu
  // Mesaj Gönderme Fonksiyonu
  const onSend = async () => {
    if (!chatId || text.trim() === "") return;

    try {
      const docRef = doc(db, "chats", chatId);

      const newMessage = {
        _id: Math.random().toString(36).substring(7),
        text: text.trim(),
        createdAt: new Date().toISOString(),
        user: {
          _id: uid || "anonim",
        },
      };

      // Mevcut mesajların kopyasını alıp yenisini ekliyoruz
      const updatedMessages = [...messages, newMessage];

      setText(""); // Girdiyi temizle

      // ✅ GÜNCELLENDİ: lastMessage ve updatedAt eklendi
      await updateDoc(docRef, {
        messages: updatedMessages,
        lastMessage: text.trim(), // ← Son mesaj içeriği
        updatedAt: new Date().toISOString(), // ← Sıralama için zaman damgası
      });
    } catch (error) {
      console.error("Mesaj gönderilirken hata oluştu:", error);
    }
  };

  // FlatList için her bir mesaj satırı arayüzü
  const renderItem = ({ item }) => {
    const isMyMessage = item.user?._id === uid;

    return (
      <View
        style={[
          styles.messageRow,
          isMyMessage ? styles.myRow : styles.otherRow,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMyMessage ? styles.myBubble : styles.otherBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myText : styles.otherText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Mesaj Listesi */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Alanı */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mesajınızı yazın..."
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={onSend}>
            <Text style={styles.sendButtonText}>Gönder</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 10,
    width: "100%",
  },
  myRow: {
    justifyContent: "flex-end",
  },
  otherRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
  },
  myText: {
    color: "#fff",
  },
  otherText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "640",
    fontSize: 16,
  },
});
