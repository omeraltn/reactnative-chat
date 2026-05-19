import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
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
import { useNavigation } from "@react-navigation/native";

// Güncel Firebase Yapısı
import { db, auth } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  addDoc,
} from "firebase/firestore";

export default function ChatList() {
  const navigation = useNavigation();
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [chats, setChats] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  // Sohbet odalarını dinleme ve son mesaja göre sıralama
  useEffect(() => {
    const collectionRef = collection(db, "chats");

    // updatedAt alanına göre en yeni sohbet en üstte olacak şekilde sorgu oluşturuyoruz
    const q = query(collectionRef, orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chatRooms = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChats(chatRooms);
      },
      (error) => {
        console.error("Sohbetler dinlenirken hata oluştu: ", error);
      },
    );

    return () => unsubscribe();
  }, []);

  // Yeni Oda Oluşturma Fonksiyonu (Diyalog içindeki Save butonu için)
  const createChat = async () => {
    if (!userEmail.trim()) return;
    try {
      await addDoc(collection(db, "chats"), {
        users: [auth.currentUser?.email, userEmail.trim()],
        messages: [],
        lastMessage: "Sohbeti Başlat", // İlk varsayılan mesaj

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), // Sıralama için başlangıç tarihi
      });
      setUserEmail("");
    } catch (error) {
      console.error("Oda oluşturulurken hata:", error);
    }
  };

  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Title>Henüz Sohbet Yok</Title>
          <Subheading style={{ textAlign: "center" }}>
            Yeni bir sohbet başlatmak için + butonuna basın!
          </Subheading>
        </View>
      ) : (
        // Performans ve pürüzsüz kaydırma için FlatList kullanımı (Tavsiye edilir)
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          renderItem={({ item }) => {
            // Karşı tarafın adını/mailini bulmak için (Basit mantık)
            const partnerEmail =
              item.users?.find((email) => email !== auth.currentUser?.email) ||
              "Bilinmeyen Kullanıcı";
            const initials = partnerEmail.substring(0, 2).toUpperCase();

            return (
              <TouchableOpacity
                onPress={() => navigation.navigate("Chat", { chatId: item.id })}
              >
                <List.Item
                  title={partnerEmail}
                  // Sabit yazı yerine veri tabanından anlık gelen son mesajı yazdırıyoruz!
                  description={item.lastMessage || "Mesaj yok..."}
                  descriptionNumberOfLines={1}
                  left={(props) => (
                    <Avatar.Text
                      {...props}
                      label={initials}
                      size={50}
                      style={{ backgroundColor: "#7c6cbf" }}
                    />
                  )}
                />
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Diyalog ve Artı Butonu Yapısı (Mevcut kodunun aynısı kalabilir) */}
      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => setIsDialogVisible(false)}
        >
          <Dialog.Title>Yeni Sohbet</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="E-posta Adresi Girin"
              value={userEmail}
              onChangeText={setUserEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>İptal</Button>
            <Button
              onPress={() => {
                setIsDialogVisible(false);
                createChat();
              }}
            >
              Oluştur
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setIsDialogVisible(true)}
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  divider: {
    marginLeft: 70,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#6200ee",
  },
});
