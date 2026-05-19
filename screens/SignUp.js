import React, { useState } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { TextInput, Button, Subheading, Title } from "react-native-paper"; // Title ekledik
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

// ESKİ SATIRI SİLİN: import { auth } from "../App";
// YERİNE BUNU YAZIN:
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const createAccount = async () => {
    if (!name || !email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await updateProfile(response.user, {
        displayName: name,
      });

      Alert.alert("Başarılı", "Hesabınız oluşturuldu!");
    } catch (err) {
      Alert.alert("Kayıt Hatası", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Sayfa Başlığı */}
        <Title style={styles.pageTitle}>Sign Up</Title>

        {!!error && <Subheading style={styles.errorText}>{error}</Subheading>}
        <TextInput
          label="Name"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <TextInput
          label="Email"
          style={styles.inputSpacing}
          value={email}
          onChangeText={(text) => setEmail(text)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          label="Password"
          style={styles.inputSpacing}
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <Button compact onPress={() => navigation.navigate("SignIn")}>
            Sign In
          </Button>

          {loading ? (
            <ActivityIndicator size="small" color="#6200ee" />
          ) : (
            <Button mode="contained" onPress={createAccount}>
              Sign Up
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24, // Form elemanları ile arasında boşluk bırakır
    color: "#6200ee",
  },
  inputSpacing: {
    marginTop: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 16,
  },
});
