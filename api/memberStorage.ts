import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const MEMBER_ID_KEY = "member_id";
const isWeb = Platform.OS === "web";

export const setMemberId = async (memberId: number) => {
  const value = String(memberId);
  if (isWeb) {
    localStorage.setItem(MEMBER_ID_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(MEMBER_ID_KEY, value);
};

export const getMemberId = async (): Promise<number | null> => {
  if (isWeb) {
    const v = localStorage.getItem(MEMBER_ID_KEY);
    return v ? Number(v) : null;
  }
  const v = await SecureStore.getItemAsync(MEMBER_ID_KEY);
  return v ? Number(v) : null;
};

export const removeMemberId = async () => {
  if (isWeb) {
    localStorage.removeItem(MEMBER_ID_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(MEMBER_ID_KEY);
};
