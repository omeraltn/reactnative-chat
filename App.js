import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { PaperProvider } from "react-native-paper";
import { ActivityIndicator, View } from "react-native";
import { onAuthStateChanged } from "firebase/auth";

// Yeni oluşturduğumuz dosyadan auth'u çekiyoruz
import { auth } from "./firebaseConfig";

// Ekranlar
import ChatList from "./screens/ChatList";
import Setting from "./screens/Setting";
import SignIn from "./screens/SignIn";
import Chat from "./screens/Chat";
import SignUp from "./screens/SignUp";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={route.name === "ChatList" ? "chatbubbles" : "settings"}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen
        name="ChatList"
        component={ChatList}
        options={{ title: "Sohbetler" }}
      />
      <Tab.Screen
        name="Setting"
        component={Setting}
        options={{ title: "Ayarlar" }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <PaperProvider>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen
                name="Main"
                component={TabsNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="Chat" component={Chat} />
            </>
          ) : (
            <>
              <Stack.Screen
                name="SignIn"
                component={SignIn}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SignUp"
                component={SignUp}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </PaperProvider>
    </NavigationContainer>
  );
};

export default App;
