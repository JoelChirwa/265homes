import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "homes_token";
const USER_KEY = "homes_user";

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export const sessionStorage = {
  async saveToken(token: string) {
    await setItem(TOKEN_KEY, token);
  },
  async saveUser(userJson: string) {
    await setItem(USER_KEY, userJson);
  },
  async getToken() {
    return getItem(TOKEN_KEY);
  },
  async getUser() {
    return getItem(USER_KEY);
  },
  async clear() {
    await Promise.all([deleteItem(TOKEN_KEY), deleteItem(USER_KEY)]);
  },
};
