import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/** secure storage 에 refreshToken 을 조회, 저장, 삭제하는 코드*/

// Refresh 토큰 저장 (Set)
export const setRefreshToken = async (value: string) => {
  try {
    if (Platform.OS === "web") {
      // 웹 환경일 때는 localStorage 사용
      localStorage.setItem("refreshToken", value);
    } else {
      // 모바일 환경일 때는 SecureStore 사용
      await SecureStore.setItemAsync("refreshToken", value);
    }
  } catch (error) {
    console.error("Refresh 토큰 저장 실패:", error);
  }
};

// 토큰 가져오기 (Get)
export const getRefreshToken = async () => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem("refreshToken");
    } else {
      return await SecureStore.getItemAsync("refreshToken");
    }
  } catch (error) {
    console.error("Refresh 토큰 로드 실패:", error);
    return null;
  }
};

// 토큰 삭제 (Remove) - 로그아웃 시 사용
export const removeRefreshToken = async () => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem("refreshToken");
    } else {
      await SecureStore.deleteItemAsync("refreshToken");
    }
  } catch (error) {
    console.error("Refresh 토큰 삭제 실패:", error);
  }
};
