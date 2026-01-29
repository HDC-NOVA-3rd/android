import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// 토큰 저장 (Set)
export const setToken = async (key: string, value: string) => {
  try {
    if (Platform.OS === "web") {
      // 웹 환경일 때는 localStorage 사용
      localStorage.setItem(key, value);
    } else {
      // 모바일 환경일 때는 SecureStore 사용
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error("토큰 저장 실패:", error);
  }
};

// 토큰 가져오기 (Get)
export const getToken = async (key: string) => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error("토큰 로드 실패:", error);
    return null;
  }
};

// 토큰 삭제 (Remove) - 로그아웃 시 사용
export const removeToken = async (key: string) => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error("토큰 삭제 실패:", error);
  }
};
