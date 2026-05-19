import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import {
  List,
  Avatar,
  Divider,
  FAB,
  Portal,
  Dialog,
  Button,
  TextInput,
  Title,
  Subheading,
} from "react-native-paper";

// Güncel Firebase Modüler Yapısı
import { db, auth } from "../firebaseConfig";
// serverTimestamp ve orderBy metotları import listesine eklendi
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function ChatList() {
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const currentUserEmail = auth.currentUser?.email;

  // FIRESTORE'DAN VERİLERİ EN YENİYE GÖRE SIRALAYARAK ÇEKME
  useEffect(() => {
    if (!currentUserEmail) return;

    // ÖNEMLİ: orderBy("createdAt", "desc") eklendi.
    // Bu sorgunun çalışması için Firebase Konsolunda INDEX oluşturulmalıdır (Bkz: Adım 2)
    const q = query(
      collection(db, "chats"),
      where("users", "array-contains", currentUserEmail.toLowerCase()),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chatsArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChats(chatsArray);
      },
      (error) => {
        // Index eksik olduğunda buraya düşen hata linkine tıklayarak doğrudan index oluşturabilirsiniz.
        console.error("Sohbetler dinlenirken hata oluştu: ", error);
      },
    );

    return () => unsubscribe();
  }, [currentUserEmail]);

  // Yeni Sohbet Odası Oluşturma Fonksiyonu
  const handleCreateChat = async () => {
    if (!userEmail || userEmail.trim() === "") {
      Alert.alert("Hata", "Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    const targetEmail = userEmail.trim().toLowerCase();

    if (targetEmail === currentUserEmail?.toLowerCase()) {
      Alert.alert("Hata", "Kendinizle bir sohbet başlatamazsınız.");
      return;
    }

    setIsLoading(true);

    try {
      // Sohbet odasına sunucu saati (serverTimestamp) ile createdAt ekleniyor
      await addDoc(collection(db, "chats"), {
        users: [currentUserEmail.toLowerCase(), targetEmail],
        createdAt: serverTimestamp(), // Odanın tam oluşturulma anını kaydeder
      });

      setUserEmail("");
      setDialogVisible(false);
      Alert.alert("Başarılı", "Sohbet odası oluşturuldu.");
    } catch (error) {
      console.error("Sohbet oluşturulurken hata:", error);
      Alert.alert("Hata", "Sohbet başlatılamadı: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getChatPartner = (usersArray) => {
    if (!usersArray) return "Bilinmeyen Kullanıcı";
    return (
      usersArray.find((email) => email !== currentUserEmail?.toLowerCase()) ||
      "Siz"
    );
  };

  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Title>Henüz Sohbet Yok</Title>
          <Subheading>
            Yeni bir sohbet başlatmak için + butonuna basın!
          </Subheading>
        </View>
      ) : (
        chats.map((chat) => (
          <React.Fragment key={chat.id}>
            <List.Item
              title={getChatPartner(chat.users)}
              description="Sohbete başlamak için tıklayın..."
              left={() => (
                <Avatar.Text
                  label={getChatPartner(chat.users)
                    .substring(0, 2)
                    .toUpperCase()}
                  size={50}
                />
              )}
              onPress={() => navigation.navigate("Chat", { chatId: chat.id })}
            />
            <Divider style={styles.divider} />
          </React.Fragment>
        ))
      )}

      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>New Chat</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Enter User Email"
              value={userEmail}
              onChangeText={(text) => setUserEmail(text)}
              autoCapitalize="none"
              keyboardType="email-address"
              disabled={isLoading}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              disabled={isLoading}
              onPress={() => setDialogVisible(false)}
            >
              Cancel
            </Button>
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color="#6200ee"
                style={{ marginRight: 16 }}
              />
            ) : (
              <Button onPress={handleCreateChat}>Save</Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  divider: {
    marginLeft: 60,
  },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#6200ee",
  },
});
