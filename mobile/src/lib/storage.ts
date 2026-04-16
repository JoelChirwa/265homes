import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Keychain from "react-native-keychain";
import { Platform } from "react-native";
import Constants from 'expo-constants';


const TOKEN_KEY = "homes_token";
const USER_KEY = "homes_user";
const ONBOARDING_KEY = "homes_onboarding_completed";

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

const isExpoGo = Constants.appOwnership === 'expo';

export const sessionStorage = {
  async saveToken(token: string) {
    if (Platform.OS !== "web" && !isExpoGo) {
      try {
        await Keychain.setGenericPassword("jwt", token, { service: TOKEN_KEY });
        return;
      } catch (e) {
        console.warn("Keychain not available, falling back to SecureStore", e);
      }
    }
    await setItem(TOKEN_KEY, token);
  },
  async getToken() {
    if (Platform.OS !== "web" && !isExpoGo) {
      try {
        const credentials = await Keychain.getGenericPassword({ service: TOKEN_KEY });
        if (credentials) return credentials.password;
      } catch (e) {
        console.warn("Keychain not available, falling back to SecureStore", e);
      }
    }
    return getItem(TOKEN_KEY);
  },
  async saveUser(userJson: string) {
    await setItem(USER_KEY, userJson);
  },
  async saveOnboardingStatus(completed: boolean) {
    await setItem(ONBOARDING_KEY, completed ? "true" : "false");
  },
  async getUser() {
    return getItem(USER_KEY);
  },
  async getOnboardingStatus() {
    return (await getItem(ONBOARDING_KEY)) === "true";
  },
  async clear() {
    if (Platform.OS !== "web" && !isExpoGo) {
        try {
          await Keychain.resetGenericPassword({ service: TOKEN_KEY });
        } catch (e) {}
    }
    await Promise.all([
      deleteItem(TOKEN_KEY),
      deleteItem(USER_KEY),
      deleteItem(ONBOARDING_KEY),
    ]);
  },
};

