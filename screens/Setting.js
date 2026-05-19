import React from "react";
import { View, StyleSheet } from "react-native";
import { Avatar, Title, Subheading, Button } from "react-native-paper";

// ESKİ SATIRI SİLİN: import { auth } from "../App";
// YERİNE BUNU YAZIN:
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";

export default function Setting() {
  // Aktif giriş yapmış kullanıcının bilgilerini Firebase'den alıyoruz
  const currentUser = auth.currentUser;

  // Kullanıcının adının baş harflerini Avatar için alalım (Örn: Ömer Altun -> ÖA)
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("Çıkış yapıldı");
        // App.js'deki onAuthStateChanged durumu anında yakalayacak
        // ve sizi otomatik olarak SignIn/SignUp ekranına geri atacaktır.
      })
      .catch((error) => {
        alert("Çıkış yapılırken bir hata oluştu: " + error.message);
      });
  };

  return (
    <View style={styles.container}>
      {/* Kullanıcının gerçek isminin baş harfleri */}
      <Avatar.Text
        label={getInitials(currentUser?.displayName)}
        size={80}
        style={styles.avatar}
      />

      {/* Kullanıcının gerçek kayıtlı ismi */}
      <Title style={styles.title}>
        {currentUser?.displayName || "Kullanıcı Adı"}
      </Title>

      {/* Kullanıcının gerçek e-posta adresi */}
      <Subheading style={styles.subtitle}>
        {currentUser?.email || "eposta@adresi.com"}
      </Subheading>

      <Button
        mode="contained"
        onPress={handleSignOut}
        buttonColor="#5c36da" // Çıkış butonu için kırmızı tonu
        style={styles.button}
      >
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: "#6200ee",
  },
  title: {
    fontWeight: "bold",
  },
  subtitle: {
    color: "gray",
    marginBottom: 32,
  },
  button: {
    width: "80%",
  },
});
